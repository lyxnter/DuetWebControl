<template>
	<div class="component">
		<v-toolbar>
			<directory-breadcrumbs v-model="directory"></directory-breadcrumbs>

			<v-spacer></v-spacer>

			<v-btn class="hidden-sm-and-down mr-3" color="grey darken-3" :loading="loading" :disabled="uiFrozen" @click="refresh" >
				<v-icon class="mr-1">refresh</v-icon> {{ $t('button.refresh.caption') }}
			</v-btn>
			<v-btn class="hidden-md-and-up" color="grey darken-3" :loading="loading" :disabled="uiFrozen" @click="refresh">
				<v-icon class="mr-1">refresh</v-icon>
			</v-btn>
		</v-toolbar>

		<base-file-list ref="filelist" :filelist.sync="filelist" v-model="selection" :directory.sync="directory" :loading.sync="loading" sort-table="sys" @fileClicked="fileClicked" @directoryLoaded="directoryLoaded">
			<template slot="no-data">
				<v-alert :value="true" type="secondary" class="ma-0" @contextmenu.prevent="">
					{{ $t('list.sys.noFiles') }}
				</v-alert>
			</template>
		</base-file-list>

		<v-layout class="hidden-md-and-up mt-2" row wrap justify-space-around>
			<v-btn color="secondary" :loading="loading" :disabled="uiFrozen" @click="refresh">
				<v-icon class="mr-1">refresh</v-icon> {{ $t('button.refresh.caption') }}
			</v-btn>
		</v-layout>

		<new-directory-dialog :shown.sync="showNewDirectory" :directory="directory"></new-directory-dialog>
		<new-file-dialog :shown.sync="showNewFile" :directory="directory"></new-file-dialog>

				<div id="div">
				</div>
	</div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

import Path from '../../utils/path.js'

export default {
	computed: {
		...mapState('machine/model', ['state']),
		...mapGetters(['isConnected', 'uiFrozen']),
		...mapGetters('machine/model', ['isPrinting']),
		...mapState({selectedMachine: state => state.selectedMachine}),
		isRootDirectory() { return this.directory === Path.sys; }
	},
	data() {
		return {
			directory: '0:/www/img/Timelapses'/*Path.timelapse*/,
			loading: false,
			selection: [],
			showNewDirectory: false,
			showNewFile: false,

			fileinfoDirectory: undefined,
			filelist: [],
		}
	},
	methods: {
		...mapActions('machine', ['download', 'sendCode']),
		refresh() {
			this.$refs.filelist.refresh();
		},
		fileClicked(item) {
			if (item.name.toLowerCase().endsWith('.jpg') || item.name.toLowerCase().endsWith('.mp4')) {
				this.$refs.filelist.download(item);
			} else {
				this.$refs.filelist.edit(item);
			}
		},
		async requestFileInfo(directory, fileIndex, fileCount) {
			if (this.fileinfoDirectory === directory) {
				console.log(this.isConnected, fileIndex < fileCount)
				if (this.isConnected && fileIndex < fileCount) {
					const file = this.filelist[fileIndex];
					let height = null, layerHeight = null, filament = [], generatedBy = null, printTime = null, simulatedTime = null;

					this.fileinfoProgress = fileIndex;
					/*try {
						// Request file info
						if (!file.isDirectory) {
							console.log(Path.combine(directory, file.name))
							const fileInfo = await this.getFileInfo(Path.combine(directory, file.name));
							console.log(fileInfo)
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
					*/

					// Set file info
					file.height = height;
					file.layerHeight = layerHeight;
					file.filament = filament;
					file.generatedBy = generatedBy;
					file.printTime = printTime;
					file.simulatedTime = simulatedTime;
					file.dir = directory;
					if ( file.name.substring(file.name.lastIndexOf("/")+1,file.name.lastIndexOf(".")).length > 0){
						//var dir = file.name.substring(file.name.lastIndexOf("/")+1,file.name.lastIndexOf("."));
						//console.log(file.dir.split('/').splice(4));
						//file.name =  dir;
						/*while(dir.includes(" "))
							dir = dir.replace(/ /g, "_");*/
						if (file.name.endsWith('.jpg')) {
							file.ico = "http://" + this.selectedMachine + '/' + file.dir.split('/').splice(2).join('/') + "/" + file.name
						} else if(file.name.endsWith('.mp4')) {
							file.ico = "http://" + this.selectedMachine + '/' + file.dir.split('/').splice(2).join('/') + "/" + file.name.substr(0, file.name.lastIndexOf('.')) + '.jpg'
						} else {
							// do nothing
						}
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
				this.filelist = this.filelist.filter((item) => !item.name.endsWith('.jpg'))
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
		}
	}
}
</script>
