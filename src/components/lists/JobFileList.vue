<template>
	<div class="component">
		<v-toolbar>
			<sd-card-btn class="hidden-sm-and-down" :directory="directory" @storageSelected="selectStorage" v-if="false"></sd-card-btn>
			<directory-breadcrumbs v-model="directory"></directory-breadcrumbs>

			<v-spacer></v-spacer>
			<search-input :path="directory" @change="filterSearch" v-if="false"></search-input>
			<v-btn class="hidden-sm-and-down mr-3" :disabled="uiFrozen" @click="showNewDirectory = true">
				<v-icon class="mr-1">create_new_folder</v-icon> {{ $t('button.newDirectory.caption') }}
			</v-btn>
			<v-btn class="hidden-sm-and-down mr-3" color="grey darken-3" :loading="loading" :disabled="uiFrozen" @click="refresh">
				<v-icon class="mr-1">refresh</v-icon> {{ $t('button.refresh.caption') }}
			</v-btn>
			<v-btn class="hidden-md-and-up" color="grey darken-3" :loading="loading" :disabled="uiFrozen" @click="refresh">
				<v-icon class="mr-1">refresh</v-icon>
			</v-btn>
			<upload-btn class="hidden-sm-and-down" :directory="directory" target="gcodes" color="primary darken-1" v-on:refreshlist="refresh" v-on:uploadComplete="refresh"></upload-btn>
		</v-toolbar>

		<base-file-list v-if="filteredList && filteredList != []" ref="filteredList" v-model="selection" :headers="headers" :filelist.sync="filteredList" :loading.sync="loading" sort-table="jobs" @directoryLoaded="directoryLoaded" @fileClicked="fileClicked" no-files-text="list.jobs.noJobs">
		<v-progress-linear slot="progress" :indeterminate="fileinfoProgress === -1" :value="(fileinfoProgress / filteredList.length) * 100"></v-progress-linear>

		<template slot="no-data">
			<v-alert :value="true" color="secondary" class="ma-0" @contextmenu.prevent="">
				{{ $t('list.jobs.noJobs') }}
			</v-alert>
		</template>

		<template slot="context-menu">
			<v-list-tile v-show="isFile && !state.isPrinting" @click="start">
				<v-icon class="mr-1">play_arrow</v-icon> {{ $t('list.jobs.start') }}
			</v-list-tile>
			<v-list-tile v-show="isFile && !state.isPrinting" @click="simulate">
				<v-icon class="mr-1">fast_forward</v-icon> {{ $t('list.jobs.simulate') }}
			</v-list-tile>
		</template>
	</base-file-list>

	<base-file-list v-if="!filteredList || filteredList == []" ref="filelist" v-model="selection" :headers="headers" :directory.sync="directory" :filelist.sync="filelist" :loading.sync="loading" sort-table="jobs" @directoryLoaded="directoryLoaded" @fileClicked="fileClicked" no-files-text="list.jobs.noJobs">
	<v-progress-linear slot="progress" :indeterminate="fileinfoProgress === -1" :value="(fileinfoProgress / filelist.length) * 100"></v-progress-linear>

	<template slot="no-data">
		<v-alert :value="true" color="secondary" class="ma-0" @contextmenu.prevent="">
			{{ $t('list.jobs.noJobs') }}
		</v-alert>
	</template>

	<template slot="context-menu">
		<v-list-tile v-show="isFile && !state.isPrinting" @click="start">
			<v-icon class="mr-1">play_arrow</v-icon> {{ $t('list.jobs.start') }}
		</v-list-tile>
		<v-list-tile v-show="isFile && !state.isPrinting" @click="simulate">
			<v-icon class="mr-1">fast_forward</v-icon> {{ $t('list.jobs.simulate') }}
		</v-list-tile>
		<v-list-tile v-if="false" v-show="isFile && !state.isPrinting" @click="sendPreview">
			<v-icon class="mr-1">cloud_upload</v-icon> {{ $t('list.jobs.sendPreview') }}
		</v-list-tile>

	</template>
</base-file-list>

<v-layout class="hidden-md-and-up mt-2" row wrap justify-space-around>
	<sd-card-btn :directory="directory" @storageSelected="selectStorage" v-if="!isLocal"></sd-card-btn>
	<v-btn :disabled="uiFrozen" @click="showNewDirectory = true" v-if="!isLocal">
		<v-icon class="mr-1">create_new_folder</v-icon> {{ $t('button.newDirectory.caption') }}
	</v-btn>
	<v-btn color="grey darken-3" :loading="loading" :disabled="uiFrozen" @click="refresh" v-if="!isLocal">
		<v-icon class="mr-1">refresh</v-icon> {{ $t('button.refresh.caption') }}
	</v-btn>
	<upload-btn :directory="directory" target="gcodes" color="primary darken-1" v-if="!isLocal || showDebug" v-on:uploadComplete="refresh"></upload-btn>
</v-layout>

<new-directory-dialog :shown.sync="showNewDirectory" :directory="directory"></new-directory-dialog>
<confirm-dialog :shown.sync="startJobDialog.shown" :question="startJobDialog.question" :prompt="startJobDialog.prompt" @confirmed="start(startJobDialog.item)" :item="startJobDialog.item"></confirm-dialog>
</div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import i18n from '../../i18n'
import { DisconnectedError } from '../../utils/errors.js'
import Path from '../../utils/path.js'

export default {
	computed: {
		...mapState('machine/cache', ['fileInfos']),
		...mapState('machine/model', ['state', 'storages']),
		...mapState('settings', ['language']),
		...mapGetters(['isConnected', 'uiFrozen']),
		...mapGetters('machine/model', ['isPrinting']),
		...mapState({selectedMachine: state => state.selectedMachine}),
		...mapState({isLocal: state => state.isLocal,}),
		isFile() {
			return (this.selection.length === 1) && !this.selection[0].isDirectory;
		},
		loading: {
			get() { return this.loadingValue || this.fileinfoProgress !== -1; },
			set(value) { this.loadingValue = value; }
		},
		showDebug() {
			return this.isLocal && ((location.port === "8080") || (location.port === "8081"))
		}
	},
	data() {
		return {
			directory: Path.gcodes,
			selection: [],
			filelist: [],
			headers: [
				{
					text: () => i18n.t('list.baseFileList.fileName'),
					value: 'name'
				},
				{
					text: () => i18n.t('list.baseFileList.fileProd'),
					value: 'fileprod'
				},
				{
					text: () => i18n.t('list.baseFileList.fileNameProd'),
					value: 'fileprod_name'
				},
				{
					text: () => i18n.t('list.baseFileList.fileNameSTL'),
					value: 'fileprod_stl'
				},
				{
					text: () => i18n.t('list.baseFileList.size'),
					value: 'size',
					unit: 'bytes'
				},
				{
					text: () => i18n.t('list.baseFileList.lastModified'),
					value: 'lastModified',
					unit: 'date'
				},
				{
					text: () => i18n.t('list.jobs.height'),
					value: 'height',
					precision: 2,
					unit: 'mm'
				},
				{
					text: () => i18n.t('list.jobs.layerHeight'),
					value: 'layerHeight',
					precision: 2,
					unit: 'mm'
				},
				{
					text: () => i18n.t('list.jobs.filament'),
					value: 'filament',
					unit: 'filaments'
				},
				{
					text: () => i18n.t('list.jobs.printTime'),
					value: 'printTime',
					unit: 'time'
				},
				{
					text: () => i18n.t('list.jobs.simulatedTime'),
					value: 'simulatedTime',
					unit: 'time'
				},
				{
					text: () => i18n.t('list.jobs.generatedBy'),
					value: 'generatedBy'
				}
			],
			loadingValue: false,
			fileinfoDirectory: undefined,
			fileinfoProgress: -1,
			startJobDialog: {
				question: '',
				prompt: '',
				item: undefined,
				shown: false
			},
			showNewDirectory: false,
			search: "",
			filteredList: undefined
		}
	},
	methods: {
		...mapActions('machine', ['sendCode', 'getFileInfo']),
		...mapMutations('machine/cache', ['clearFileInfo', 'setFileInfo']),
		async selectStorage(index) {
			const storage = this.storages[index];
			let mountSuccess = true, mountResponse;
			if (storage.mounted) {
				this.directory = (index === 0) ? Path.gcodes : `${index}:`;
			} else {
				this.loading = true;
				try {
					// Mount storage
					mountResponse = await this.sendCode({ code: `M21 P${index}`, log: false });
				} catch (e) {
					mountResponse = e.message;
					mountSuccess = false;
				}

				if (this.isConnected) {
					if (mountSuccess && mountResponse.indexOf('Error') === -1) {
						// Change directory
						this.directory = (index === 0) ? Path.gcodes : `${index}:`;
						this.$log('success', this.$t('notification.mount.successTitle'));
					} else {
						// Show mount message
						this.$log('error', this.$t('notification.mount.errorTitle'), mountResponse);
					}
				}
			}
			this.loading = false;
		},
		refresh() {
			this.clearFileInfo(this.directory);
			this.$refs.filelist.refresh();
		},
		async checkIsValidIco(fileIndex) {
			const file = this.filelist[fileIndex];
			//const that = this;
			let validateIco = new XMLHttpRequest();
			validateIco.timeout = 1000;
			validateIco.onerror = function() {
				file.ico = null;
				console.log('nope not valid')
			}
			validateIco.onload = function() {
				if (validateIco.status == 404) {
					validateIco.onerror()
				} else {
					console.log("yep it's valid")
				}
			}
			validateIco.open('GET', file.ico, true);
			validateIco.send(null);

		},
		async requestFileInfo(directory, fileIndex, fileCount) {
			if (this.fileinfoDirectory === directory) {
				if (this.isConnected && fileIndex < fileCount) {
					const file = this.filelist[fileIndex];
					let  height = null, layerHeight = null, filament = [], generatedBy = null, printTime = null, simulatedTime = null;

					this.fileinfoProgress = fileIndex;
					try {
						// Request file info
						if (!file.isDirectory) {
							console.log(Path.combine(directory, file.name))
							const fileInfo = await this.getFileInfo(Path.combine(directory, file.name));

							// Start again if the number of files has changed
							if (fileCount !== this.filelist.length) {
								this.fileinfoProgress = 0;
								this.$nextTick(() => this.requestFileInfo(directory, 0, this.filelist.length ));
								return;
							}

							// Set file info
							height = fileInfo.height;
							layerHeight = fileInfo.layerHeight;
							filament = fileInfo.filament;
							generatedBy = fileInfo.generatedBy;
							printTime = fileInfo.printTime;
							simulatedTime = fileInfo.simulatedTime;
						}
					} catch (e) {
						if (e instanceof DisconnectedError) {
							this.fileinfoProgress = -1;
							this.fileinfoDirectory = undefined;
							return;
						}

						console.warn(e);
						this.$log('error', this.$t('error.fileinfoRequestFailed', [file.name]), e.message);
					}

					// Set file info
					file.height = height;
					file.layerHeight = layerHeight;
					file.filament = filament;
					file.generatedBy = generatedBy;
					file.printTime = printTime;
					file.simulatedTime = simulatedTime;
					file.dir = directory;
					if ( file.name.substring(file.name.lastIndexOf("/")+1,file.name.lastIndexOf(".")).length > 0){
						var dir = file.name.substring(file.name.lastIndexOf("/")+1,file.name.lastIndexOf("."));
						//console.log(file.dir);
						//file.name =  dir;
						while(dir.includes(" "))
						dir = dir.replace(/ /g, "_");
						file.ico = "http://" + this.selectedMachine + "/img/GCodePreview/"+directory.substring(10).replace(/ /g, "_") + "/" + dir + "/" + dir + "_ico.jpg";//fileIco;
						this.checkIsValidIco(fileIndex)
					} else {
						file.dir += '/'+file.name
						//console.log(file.dir);
					}

					// Move on to the next item
					await this.requestFileInfo(directory, fileIndex + 1, fileCount);
				} else {
					this.fileinfoProgress = -1;
					this.fileinfoDirectory = undefined;
				}
			}
		},
		directoryLoaded(directory) {
			if (this.fileinfoDirectory !== directory) {
				this.fileinfoDirectory = directory;
				this.filelist.forEach(function(item) {
					if (item.isDirectory) {
						item.height = null;
						item.layerHeight = null;
						item.filament = null;
						item.generatedBy = null;
						item.printTime = null;
						item.simulatedTime = null;
					}
				});
				this.requestFileInfo(directory, 0, this.filelist.length);
			}
		},
		fileClicked(item) {
			if (!this.state.isPrinting) {
				this.startJobDialog.question = this.$t('dialog.startJob.title', [item.name.substring(0, item.name.lastIndexOf('.'))]);
				this.startJobDialog.prompt = this.$t('dialog.startJob.prompt', [item.name]);
				this.startJobDialog.item = item;
				this.startJobDialog.shown = true;
			}
		},
		start(item) {
			this.sendCode(`M32 "${Path.combine(this.directory, (item && item.name) ? item.name : this.selection[0].name)}"`);
		},
		simulate(item) {
			this.sendCode(`M37 P"${Path.combine(this.directory, (item && item.name) ? item.name : this.selection[0].name)}"`);
		},
		sendPreview(item) {
			let file = (item && item.name) ? item : this.selection[0]
			const directory = file.directory
			console.log(file);
			if ( file.name.substring(file.name.lastIndexOf("/")+1,file.name.lastIndexOf(".")).length > 0){
				var dir = file.name.substring(file.name.lastIndexOf("/")+1,file.name.lastIndexOf("."));
				//console.log(file.dir);
				//file.name =  dir;
				while(dir.includes(" "))
				dir = dir.replace(/ /g, "_");
				file.ico = "http://" + this.selectedMachine + "/img/GCodePreview/"+directory.substring(10).replace(/ /g, "_") + "/" + dir + "/" + dir + "_ico.jpg";//fileIco;


			}
		},
		filterSearch(e) {
			this.filteredList = e
		}
	},
	watch: {
		filteredList () {
			console.log(this.filteredList)
		}
	}
}
</script>
