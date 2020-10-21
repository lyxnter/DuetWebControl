<template>
	<div class="component">
		<v-toolbar>
			<directory-breadcrumbs v-model="directory"></directory-breadcrumbs>

			<v-spacer></v-spacer>

			<v-btn class="hidden-sm-and-down" v-show="!isRootDirectory" :disabled="uiFrozen" @click="showNewFile = true">
				<v-icon class="mr-1">add</v-icon> New File
			</v-btn>
			<v-btn class="hidden-sm-and-down" v-show="isRootDirectory" :disabled="uiFrozen" @click="showNewPellet = true">
				<v-icon class="mr-1">create_new_folder</v-icon> New Pellet
			</v-btn>
			<v-btn class="hidden-sm-and-down" color="grey darken-3" :loading="loading" :disabled="uiFrozen" @click="refresh">
				<v-icon class="mr-1">refresh</v-icon> Refresh
			</v-btn>
			<upload-btn class="hidden-sm-and-down" target="pellets" color="primary darken-1"></upload-btn>
		</v-toolbar>

		<base-file-list ref="filelist" v-model="selection" :directory.sync="directory" :loading.sync="loading" :doingFileOperation="doingFileOperation" sort-table="pellets" @fileClicked="fileClicked" :no-delete="isRootDirectory" :no-rename="pelletselected" no-drag-drop>
			<template slot="no-data">
				<v-alert :value="true" type="primary darken-1" class="ma-0" @contextmenu.prevent="">{{ isRootDirectory ? 'No Pellets' : 'No Files' }}</v-alert>
			</template>

			<template slot="context-menu">
				<v-list-item v-show="pelletSelected" @click="downloadPellet">
					<v-icon class="mr-1">cloud_download</v-icon> Download
				</v-list-item>
				<v-list-item v-show="pelletSelected" @click="rename">
					<v-icon class="mr-1">short_text</v-icon> Rename File or Directory
				</v-list-item>
				<v-list-item @click="remove">
					<v-icon class="mr-1">delete</v-icon> Delete
				</v-list-item>
			</template>
		</base-file-list>

		<v-layout class="hidden-md-and-up mt-2" row wrap justify-space-around>
			<v-btn v-show="!isRootDirectory" :disabled="uiFrozen" @click="showNewFile = true">
				<v-icon class="mr-1">add</v-icon> New File
			</v-btn>
			<v-btn v-show="isRootDirectory" :disabled="uiFrozen" @click="showNewPellet = true">
				<v-icon class="mr-1">create_new_folder</v-icon> New Pellet
			</v-btn>
			<v-btn color="grey darken-3" :loading="loading" :disabled="uiFrozen" @click="refresh">
				<v-icon class="mr-1">refresh</v-icon> Refresh
			</v-btn>
			<upload-btn target="pellets" color="primary darken-1"></upload-btn>
		</v-layout>

		<new-directory-dialog :shown.sync="showNewPellet" :directory="directory" title="New pellet" prompt="Please enter a name for the new pellet" :showSuccess="false" :showError="false" @directoryCreationFailed="directoryCreationFailed" @directoryCreated="createpelletFiles"></new-directory-dialog>
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
		isRootDirectory() { return this.directory === Path.pellets; },
		pelletSelected() { return (this.directory === Path.pellets) && (this.selection.length === 1) && this.selection[0].isDirectory; }
	},
	data() {
		return {
			directory: Path.pellets,
			selection: [],
			loading: false,
			doingFileOperation: false,
			showNewFile: false,
			showNewPellet: false
		}
	},
	methods: {
		...mapActions('machine', ['sendCode', 'upload', 'download', 'delete', 'getFileList']),
		directoryCreationFailed(error) {
			this.$makeNotification('error', 'Failed to create pellet', error.message);
		},
		async createPelletFiles(path) {
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
				this.$makeNotification('success', 'Pellet created', `Successfully created pellet ${Path.extractFileName(path)}`);
			} catch (e) {
				console.warn(e);
				this.$makeNotification('error', 'Failed to create pellet macros', e.message);
			}
			this.doingFileOperation = false;
		},
		refresh() {
			this.$refs.filelist.refresh();
		},
		async downloadPellet() {
			const pellet = this.selection[0].name;

			let loadG, configG, unloadG;
			try {
				loadG = await this.download({ filename: Path.combine(Path.pellets, pellet, 'load.g'), showSuccess: false, showError: false });
			} catch (e) {
				if (!(e instanceof DisconnectedError) && !(e instanceof OperationCancelledError)) {
					this.$makeNotification('error', 'Failed to download load.g', e.message);
				}
				return;
			}
			try {
				unloadG = await this.download({ filename: Path.combine(Path.pellets, pellet, 'unload.g'), showSuccess: false, showError: false });
			} catch (e) {
				if (!(e instanceof DisconnectedError) && !(e instanceof OperationCancelledError)) {
					this.$makeNotification('error', 'Failed to download unload.g', e.message);
				}
				return;
			}
			try {
				configG = await this.download({ filename: Path.combine(Path.pellets, pellet, 'config.g'), showSuccess: false, showError: false });
			} catch (e) {
				// config.g may not exist
			}

			const zip = new JSZip();
			zip.file(`${pellet}/load.g`, loadG);
			zip.file(`${pellet}/unload.g`, unloadG);
			if (configG) {
				zip.file(`${pellet}/config.g`, configG);
			}

			try {
				const zipBlob = await zip.generateAsync({ type: 'blob' });
				saveAs(zipBlob, `${pellet}.zip`);
			} catch (e) {
				console.warn(e);
				this.$makeNotification('error', 'Failed to compress files', e.message);
			}
		},
		async rename() {
			const pellet = this.selection[0].name;
			if (this.tools.some(tool => tool.pellet === pellet)) {
				this.$makeNotification('error', 'Cannot rename pellet', 'This pellet is still loaded. Please unload it before you proceed');
				return;
			}

			this.$refs.filelist.rename(this.selection[0]);
		},
		async remove(items) {
			if (!items || !(items instanceof Array)) {
				items = this.selection.slice();
			}

			if (items.some(item => item.isDirectory && this.tools.some(tool => tool.pellet === item.name))) {
				this.$makeNotification('error', 'Could not delete pellet', 'At least one of these pellets is still loaded. Please unload them before you proceed');
				return;
			}

			if (this.doingFileOperation) {
				return;
			}

			this.doingFileOperation = true;
			for (let i = 0; i < items.length; i++) {
				try {
					if (items[i].isDirectory) {
						// Get files from the pellet directory
						const files = await this.getFileList(Path.combine(Path.pellets, items[i].name));
						if (files.some(item => item.isDirectory)) {
							this.$makeNotification('error', 'Cannot delete pellet', `The pellet ${items[i].name} contains sub-directories. Please delete them manually.`);
							break;
						}

						// Delete each file from the directory
						for (let k = 0; k < files.length; k++) {
							await this.delete(Path.combine(Path.pellets, items[i].name, files[k].name));
						}
					}

					// Delete the item
					await this.$refs.filelist.remove(items[i]);
				} catch (e) {
					if (!(e instanceof DisconnectedError)) {
						console.warn(e);
						this.$makeNotification('error', 'Could not delete pellet', e.message);
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
			this.directory = Path.pellets;
		}
	}
}
</script>
