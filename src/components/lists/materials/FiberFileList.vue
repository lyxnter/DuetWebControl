<template>
	<div class="component">
		<v-toolbar>
			<directory-breadcrumbs v-model="directory"></directory-breadcrumbs>

			<v-spacer></v-spacer>

			<v-btn class="hidden-sm-and-down" v-show="!isRootDirectory" :disabled="uiFrozen" @click="showNewFile = true">
				<v-icon class="mr-1">add</v-icon> New File
			</v-btn>
			<v-btn class="hidden-sm-and-down" v-show="isRootDirectory" :disabled="uiFrozen" @click="showNewFiber = true">
				<v-icon class="mr-1">create_new_folder</v-icon> New Fiber
			</v-btn>
			<v-btn class="hidden-sm-and-down" color="grey darken-3" :loading="loading" :disabled="uiFrozen" @click="refresh">
				<v-icon class="mr-1">refresh</v-icon> Refresh
			</v-btn>
			<upload-btn class="hidden-sm-and-down" target="fibers" color="primary darken-1"></upload-btn>
		</v-toolbar>

		<base-file-list ref="filelist" v-model="selection" :directory.sync="directory" :loading.sync="loading" :doingFileOperation="doingFileOperation" sort-table="fibers" @fileClicked="fileClicked" :no-delete="isRootDirectory" :no-rename="fiberselected" no-drag-drop>
			<template slot="no-data">
				<v-alert :value="true" type="primary darken-1" class="ma-0" @contextmenu.prevent="">{{ isRootDirectory ? 'No Fibers' : 'No Files' }}</v-alert>
			</template>

			<template slot="context-menu">
				<v-list-tile v-show="fiberselected" @click="downloadFiber">
					<v-icon class="mr-1">cloud_download</v-icon> Download
				</v-list-tile>
				<v-list-tile v-show="fiberSelected" @click="rename">
					<v-icon class="mr-1">short_text</v-icon> Rename File or Directory
				</v-list-tile>
				<v-list-tile @click="remove">
					<v-icon class="mr-1">delete</v-icon> Delete
				</v-list-tile>
			</template>
		</base-file-list>

		<v-layout class="hidden-md-and-up mt-2" row wrap justify-space-around>
			<v-btn v-show="!isRootDirectory" :disabled="uiFrozen" @click="showNewFile = true">
				<v-icon class="mr-1">add</v-icon> New File
			</v-btn>
			<v-btn v-show="isRootDirectory" :disabled="uiFrozen" @click="showNewFiber = true">
				<v-icon class="mr-1">create_new_folder</v-icon> New Fiber
			</v-btn>
			<v-btn color="grey darken-3" :loading="loading" :disabled="uiFrozen" @click="refresh">
				<v-icon class="mr-1">refresh</v-icon> Refresh
			</v-btn>
			<upload-btn target="fibers" color="primary darken-1"></upload-btn>
		</v-layout>

		<new-directory-dialog :shown.sync="showNewFiber" :directory="directory" title="New fiber" prompt="Please enter a name for the new fiber" :showSuccess="false" :showError="false" @directoryCreationFailed="directoryCreationFailed" @directoryCreated="createfiberFiles"></new-directory-dialog>
		<new-file-dialog :shown.sync="showNewFile" :directory="directory"></new-file-dialog>
	</div>
</template>

<script>
'use strict'

import JSZip from 'jszip'
import saveAs from 'file-saver'

import { mapState, mapGetters, mapActions } from 'vuex'

import { DisconnectedError, OperationCancelledError } from '../../../utils/errors.js'
import Path from '../../../utils/path.js'

export default {
	computed: {
		...mapState(['selectedMachine']),
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['tools']),
		isRootDirectory() { return this.directory === Path.fibers; },
		fiberSelected() { return (this.directory === Path.fibers) && (this.selection.length === 1) && this.selection[0].isDirectory; }
	},
	data() {
		return {
			directory: Path.fibers,
			selection: [],
			loading: false,
			doingFileOperation: false,
			showNewFile: false,
			showNewFiber: false
		}
	},
	methods: {
		...mapActions('machine', ['sendCode', 'upload', 'download', 'delete', 'getFileList']),
		directoryCreationFailed(error) {
			this.$makeNotification('error', 'Failed to create fiber', error.message);
		},
		async createFiberFiles(path) {
			if (this.doingFileOperation) {
				return;
			}

			this.doingFileOperation = true;
			try {
				console.log(path);
				const emptyFile = new Blob();
				await this.upload({ filename: Path.combine(path, 'load.g'), content: emptyFile, showSuccess: false });
				await this.upload({ filename: Path.combine(path, 'config.g'), content: emptyFile, showSuccess: false });
				await this.upload({ filename: Path.combine(path, 'unload.g'), content: emptyFile, showSuccess: false });
				this.$makeNotification('success', 'Fiber created', `Successfully created fiber ${Path.extractFileName(path)}`);
			} catch (e) {
				console.warn(e);
				this.$makeNotification('error', 'Failed to create fiber macros', e.message);
			}
			this.doingFileOperation = false;
		},
		refresh() {
			this.$refs.filelist.refresh();
		},
		async downloadFiber() {
			const fiber = this.selection[0].name;

			let loadG, configG, unloadG;
			try {
				loadG = await this.download({ filename: Path.combine(Path.fibers, fiber, 'load.g'), showSuccess: false, showError: false });
			} catch (e) {
				if (!(e instanceof DisconnectedError) && !(e instanceof OperationCancelledError)) {
					this.$makeNotification('error', 'Failed to download load.g', e.message);
				}
				return;
			}
			try {
				unloadG = await this.download({ filename: Path.combine(Path.fibers, fiber, 'unload.g'), showSuccess: false, showError: false });
			} catch (e) {
				if (!(e instanceof DisconnectedError) && !(e instanceof OperationCancelledError)) {
					this.$makeNotification('error', 'Failed to download unload.g', e.message);
				}
				return;
			}
			try {
				configG = await this.download({ filename: Path.combine(Path.fibers, fiber, 'config.g'), showSuccess: false, showError: false });
			} catch (e) {
				// config.g may not exist
			}

			const zip = new JSZip();
			zip.file(`${fiber}/load.g`, loadG);
			zip.file(`${fiber}/unload.g`, unloadG);
			if (configG) {
				zip.file(`${fiber}/config.g`, configG);
			}

			try {
				const zipBlob = await zip.generateAsync({ type: 'blob' });
				saveAs(zipBlob, `${fiber}.zip`);
			} catch (e) {
				console.warn(e);
				this.$makeNotification('error', 'Failed to compress files', e.message);
			}
		},
		async rename() {
			const fiber = this.selection[0].name;
			if (this.tools.some(tool => tool.fiber === fiber)) {
				this.$makeNotification('error', 'Cannot rename fiber', 'This fiber is still loaded. Please unload it before you proceed');
				return;
			}

			this.$refs.filelist.rename(this.selection[0]);
		},
		async remove(items) {
			if (!items || !(items instanceof Array)) {
				items = this.selection.slice();
			}

			if (items.some(item => item.isDirectory && this.tools.some(tool => tool.fiber === item.name))) {
				this.$makeNotification('error', 'Could not delete fiber', 'At least one of these fibers is still loaded. Please unload them before you proceed');
				return;
			}

			if (this.doingFileOperation) {
				return;
			}

			this.doingFileOperation = true;
			for (let i = 0; i < items.length; i++) {
				try {
					if (items[i].isDirectory) {
						// Get files from the fiber directory
						const files = await this.getFileList(Path.combine(Path.fibers, items[i].name));
						if (files.some(item => item.isDirectory)) {
							this.$makeNotification('error', 'Cannot delete fiber', `The fiber ${items[i].name} contains sub-directories. Please delete them manually.`);
							break;
						}

						// Delete each file from the directory
						for (let k = 0; k < files.length; k++) {
							await this.delete(Path.combine(Path.fibers, items[i].name, files[k].name));
						}
					}

					// Delete the item
					await this.$refs.filelist.remove(items[i]);
				} catch (e) {
					if (!(e instanceof DisconnectedError)) {
						console.warn(e);
						this.$makeNotification('error', 'Could not delete fiber', e.message);
					}
					break;
				}
			}
			this.doingFileOperation = false;
		},
		fileClicked(item) {
			this.$refs.filelist.edit(item);
		}
	},
	watch: {
		selectedMachine() {
			this.directory = Path.fibers;
		}
	}
}
</script>
