<style scoped>
.sm4 {
	width: 30%;
	height: 100%;
	border-radius: 10%;
	margin: 1%;
	transition-duration: 0.25s;
}

.sm4:hover{
	transform: scale(1.1);
}

.content {
	text-align: center;
	width: 100%;
	height: 100%
}

/*
.icon {
	height: 130px !important;
	margin-right: 10px;
}*/

.local {
	font-size: large;
}

.local .list-icon {
	width: 90% !important;
	height: 90% !important;
	margin-top: 10px;
	border-radius: 10%;
	position: relative;
}

.list-icon {
	width: 32px;
	height:32px;
}

.local .v-list__tile {
	height: 70px;
}

.local .v-list__tile__title {
	text-align: center;
}

.local .v-avatar {
	height: 70px !important;
	width: 70px !important;
}

.local .material-icons {
	font-size: 24px !important;
}

.line2 {
	width: 50%;
	display: inline-block;
	font-size: large;
}

.line2:last-child {
	position: absolute;
}

.line3 {
	width: 33%;
	display: inline-block;
	font-size: large;
}

.line3:last-child {
	position: absolute;
}

.line4 {
	width: 25%;
	display: inline-block;
	font-size: medium;
}

.line4:last-child {
	position: absolute;
}
</style>

<template>
<div>
	<v-card v-bind:class="{local: isLocal}" class="card">
		<v-card-title v-if="!isLocal">
			<v-icon small class="mr-1">play_arrow</v-icon> {{ $t('list.gcode.caption') }}
			<v-spacer></v-spacer>
			<span v-show="isConnected" style="font-family: GTAmericaExpandedThin, sans-serif; text-transform: none; font-size: small;">{{ directory.replace('0:/gcodes/_' + this.getTool.substring(0, this.getTool.indexOf("_")), $t('list.gcode.root')) }}</span>
		</v-card-title>
		<v-card-title v-else>
			<v-icon small class="mr-1">play_arrow</v-icon> {{ $t('list.gcode.caption') }}
			<v-spacer></v-spacer>
			<v-btn @click="showJob">
				{{ $t('list.baseFileList.showMore') }}
			</v-btn>
		</v-card-title>

		<v-card-text class="pa-0" v-show="loading || filelist.length || !isRootDirectory" v-if="!isLocal">
			<v-progress-linear v-show="loading" :indeterminate="true" class="my-0"></v-progress-linear>

			<v-list class="pt-0" v-bind:class="{'v-list--dense': !isLocal}">
				<v-list-tile v-if="!isRootDirectory" @click="goUp" v-tab-control>
					<v-list-tile-avatar>
						<v-icon class="list-icon grey darken-1 white--text">
							keyboard_arrow_up
						</v-icon>
					</v-list-tile-avatar>

					<v-list-tile-content>
						<v-list-tile-title v-bind:class="{local: isLocal}">{{ $t('list.baseFileList.goUp') }}</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>

				<v-list-tile v-for="item in filelist" :key="item.name" @click="onItemClick(item)" v-tab-control>
					<v-list-tile-avatar v-bind:class="{'icon': item.ico}">
						<object :data="item.ico" v-if="true" class="list-icon" :class="item.isDirectory ? 'grey darken-1 white--text' : 'grey darken-2 white--text'" style="border-radius: 50%; padding: 10%">
							<img :src="item.isDirectory ? '/img/ressources/folder.svg' : '/img/ressources/file.png'" style="width: 100%; height: 100%; margin-top: 0%"/>
						</object>
						<!--v-icon class="list-icon" :class="item.isDirectory ? 'grey lighten-1 white--text' : 'blue white--text'">
							{{ item.isDirectory ? 'folder' : 'assignment' }}
						</v-icon-->
					</v-list-tile-avatar>

					<v-list-tile-content>
						<v-list-tile-title v-bind:class="{local: isLocal}">{{ item.displayName }}</v-list-tile-title>
					</v-list-tile-content>

					<v-list-tile-action v-if="!item.isDirectory && item.executing">
						<v-progress-circular class="list-icon" indeterminate color="blue"></v-progress-circular>
					</v-list-tile-action>
				</v-list-tile>
			</v-list>
		</v-card-text>

		<v-card-text class="pa-0" v-show="loading || filelist.length || !isRootDirectory" v-else>
			<v-progress-linear v-show="loading" :indeterminate="true" class="my-0"></v-progress-linear>

			<v-layout row wrap>
				<v-layout class="grey darken-2 white--text" sm4 style=" padding-top: 12%; padding-bottom: 12%;" @click="goUp" v-if="!isRootDirectory" shrink>
					<v-flex class="content">
						<v-icon>
							keyboard_arrow_up
						</v-icon>
						<v-list-tile-title v-bind:class="{local: isLocal}">
							{{ $t('list.baseFileList.goUp') }}
						</v-list-tile-title>
					</v-flex>
				</v-layout>
				<v-layout sm4 shrink v-for="(item, index) in filelist" v-if="(index < 6 && !item.isDirectory) || !isLocal" :key="item.name" @click="onItemClick(item)" @fileClicked="fileClicked" v-bind:class="{'icon': item.ico}" :class="(item.isDirectory ? 'grey darken-2 white--text' : 'grey darken-2 white--text')"
				style="cursor: pointer;">
					<v-flex class="content">
						<object :data="item.ico" v-if="item.ico || true" class="list-icon">
							<img :src="item.isDirectory ? '/img/ressources/folder.svg' : '/img/ressources/file.png'" style="width: 90%; height: 90%; margin-top: 0%"/>
						</object>
						<v-list-tile-title v-bind:class="{local: isLocal}" style="width:90%; margin: -5px 0 5px 5%;">
							{{ item.displayName }}
						</v-list-tile-title>
					</v-flex>
				</v-layout>
			</v-layout>

			<!--v-list-tile @click="showJob" v-tab-control v-if="isLocal && filelist.length > 6">
				<v-list-tile-avatar>
					<v-icon class="list-icon grey darken-1 white--text">
						add
					</v-icon>
				</v-list-tile-avatar>

				<v-list-tile-content>
					<v-list-tile-title v-bind:class="{local: isLocal}">
						{{ $t('list.baseFileList.showMore') }}
					</v-list-tile-title>
				</v-list-tile-content>
			</v-list-tile-->
		</v-card-text>

		<v-alert :value="!filelist.length" type="info">
			{{ this.getTool ? $t('list.gcode.noGcodes') : $t('panel.tools.noTool')}}
		</v-alert>
	</v-card>
	<confirm-dialog :shown.sync="startJobDialog.shown" :question="startJobDialog.question" :prompt="startJobDialog.prompt" @confirmed="start(startJobDialog.item)" :item="startJobDialog.item"></confirm-dialog>
	</div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

import { getModifiedDirectories } from '../../store/machine'
import { DisconnectedError } from '../../utils/errors.js'
import Path from '../../utils/path.js'
import { Routing } from '../../routes'

export default {
	computed: {
		...mapState(['selectedMachine']),
		...mapGetters(['isConnected', 'uiFrozen']),
		...mapState('machine/model', ['state', 'storages']),
		isRootDirectory() { return this.getTool ?  (this.directory === Path.gcodes + "/_" + this.getTool.substring(0, this.getTool.indexOf("_")) || this.directory === Path.gcodes) : this.directory === Path.gcodes; },
		...mapState({selectedMachine: state => state.selectedMachine}),
		...mapState({
			isLocal: state => state.isLocal,
		}),
		...mapState({
			getTool: state => {console.log(state.user.loadedTool); return state.user.loadedTool}
		}),
	},
	data () {
		return {
			unsubscribe: undefined,
			loading: false,
			wasMounted: false,
			directory: Path.gcodes,
			filelist: [],
			startJobDialog: {
				question: '',
				prompt: '',
				item: undefined,
				shown: false
			},
			fileinfoDirectory: undefined,
			routing: Routing,
		}
	},
	methods: {
		...mapActions('machine', ['sendCode', 'getFileList', 'getFileInfo']),
		async loadDirectory(directory = Path.gcodes) {
			if (this.loading) {
				return;
			}

			this.loading = true;
			try {
				if (this.getTool !== undefined && this.getTool !== "") {
					if (directory ===  Path.gcodes) {
						directory += "/_" + this.getTool.substring(0, this.getTool.indexOf("_"))
					}
					const files = await this.getFileList({dir: directory, recursive: this.isLocal});
					if(this.isLocal) {
						files.sort((a, b) => ( b.lastModified - a.lastModified ));
					} else {
						files.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensivity: 'base' }));
					}
					files.sort((a, b) => (a.isDirectory === b.isDirectory) ? 0 : (a.isDirectory ? (this.isLocal ? 1 : -1) : (this.isLocal ? -1 : 1)));
					let that = this;
					files.forEach(function(item) {
						item.displayName = Path.stripMacroFilename(item.name);
						item.executing = false;
						//console.log(item);
						if(!item.isDirectory)
						{
							var dir = ""
							if ( item.name.substring(0,item.name.lastIndexOf(".")).length > 0){
								dir = item.name.substring(0,item.name.lastIndexOf("."));
							} else {
								dir = item.name;
							}
							dir = dir.replace(/ /g, "_");
							item.ico = "http://" + that.selectedMachine + "/img/GCodePreview/" + (item.directory.substring(10).length > 0 ? item.directory.substring(10).replace(/ /g, "_") + "/" : "") + dir + "/" + dir + "_ico.jpg";//fileIco;
							//console.log(item.name+": "+item.lastModified);
						} else {
							item.treated = false;
						}
					});
					this.directory = directory;
					this.fileinfoDirectory = directory;
					this.filelist = files;
					this.requestFileInfo(directory, 0, that.filelist.length);
				}
			} catch (e) {
				if (!(e instanceof DisconnectedError)) {
					console.warn(e);
					this.$log('error', this.$t('error.filelistRequestFailed'), e.message);
				}
			}
			this.loading = false;
			console.log(this.filelist);
		},
		async requestFileInfo(directory, fileIndex, fileCount) {
			if (this.fileinfoDirectory === directory) {
				if (this.isConnected && fileIndex < fileCount) {
					const file = this.filelist[fileIndex];
					let height = null, layerHeight = null, filament = [], generatedBy = null, printTime = null, simulatedTime = null;

					this.fileinfoProgress = fileIndex;
					try {
						// Request file info
						if (!file.isDirectory) {
							const fileInfo = await this.getFileInfo(Path.combine(file.directory, file.name));

							// Start again if the number of files has changed
							if (fileCount !== this.filelist.length) {
								this.fileinfoProgress = 0;
								this.$nextTick(() => this.requestFileInfo(file.directory, 0, this.filelist.length));
								return;
							}

							// Set file info
							height = fileInfo.height;
							layerHeight = fileInfo.layerHeight;
							filament = fileInfo.filament;
							generatedBy = fileInfo.generatedBy;
							printTime = fileInfo.printTime;
							simulatedTime = fileInfo.simulatedTime;
							//console.log(fileInfo);
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
					if ( file.name.substring(file.name.lastIndexOf("/")+1,file.name.lastIndexOf(".")).length > 0){
						var dir = ""
						if ( file.name.substring(0,file.name.lastIndexOf(".")).length > 0){
							dir = file.name.substring(0,file.name.lastIndexOf("."));
						} else {
							dir = file.name;
						}
						dir = dir.replace(/ /g, "_");
						//file.ico = "http://" + this.selectedMachine + "/img/GCodePreview/" + directory.substring(10).replace(/ /g, "_") + "/" + dir + "/" + dir + "_ico.jpg";//fileIco;
					}

					// Move on to the next item
					await this.requestFileInfo(directory, fileIndex + 1, fileCount);
				} else {
					this.fileinfoProgress = -1;
					this.fileinfoDirectory = undefined;
				}
			}
		},
		async itemClick(item) {
			if (this.uiFrozen) {
				return;
			}

			const filename = Path.combine(this.directory, item.name);
			if (item.isDirectory) {
				await this.loadDirectory(filename);
			} else if (!item.executing) {
				item.executing = true;
				try {
					await this.sendCode(`M32 "${filename}"`);
				} catch (e) {
					if (!(e instanceof DisconnectedError)) {
						console.warn(e);
					}
				}
				item.executing = false;
			}
		},
		async goUp() {
			await this.loadDirectory(Path.extractFilePath(this.directory));
		},
		async showJob() {
			this.$router.push('/Files/Jobs?path='+this.directory);
		},

		onItemClick(item) {
			if (item.isDirectory) {
				this.loadDirectory(Path.combine(this.directory, item.name));
				//this.computeRowsCols();
			} else {
				this.fileClicked(item);
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
			console.log(item);
			this.sendCode(`M32 "${Path.combine(this.directory, (item && item.name) ? item.name : this.selection[0].name)}"`);
		},
	},
	mounted() {
		// Perform initial load
		if (this.isConnected) {
			this.wasMounted = this.storages.length && this.storages[0].mounted;
			this.loadDirectory();
		}

		// Keep track of file changes
		const that = this;
		this.unsubscribe = this.$store.subscribeAction(async function(action, state) {
			if (Path.pathAffectsFilelist(getModifiedDirectories(action, state), that.directory, that.filelist)) {
				await that.loadDirectory(that.directory);
			}
		});
	},
	beforeDestroy() {
		this.unsubscribe();
	},
	watch: {
		isConnected(to) {
			if (to) {
				this.wasMounted = this.storages.length && this.storages[0].mounted;
				this.loadDirectory();
			} else {
				this.directory = Path.gcodes;
				this.filelist = [];
			}
		},
		selectedMachine() {
			// TODO store current directory per selected machine
			if (this.isConnected) {
				this.wasMounted = this.storages.length && this.storages[0].mounted;
				this.loadDirectory();
			} else {
				this.directory = Path.gcodes;
				this.filelist = [];
			}
		},
		storages: {
			deep: true,
			handler() {
				// Refresh file list when the first storage is mounted or unmounted
				if (this.isConnected && (!this.storages.length || this.wasMounted !== this.storages[0].mounted)) {
					this.wasMounted = this.storages.length && this.storages[0].mounted;
					this.loadDirectory();
				}
			}
		},
		getTool: {
			handler() {
				// Refresh file list when the first storage is mounted or unmounted
				if (this.getTool) {
					console.log("Loaded Tool")
					this.loadDirectory();
				} else {
					this.directory = Path.gcodes;
					this.filelist = [];
				}
			}
		}
	}
}
</script>
