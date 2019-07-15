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

.card {
	/*height: 100%;*/
}

.list-icon {
	width: 32px !important;
	height: 32px !important;
}

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

.content {
	text-align: center;
	width: 100%;
	height: 100%
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
	<v-card v-bind:class="{local: isLocal}" class="card" v-bind:style="isLocal?'height:700px':''">
		<v-card-title v-if="!isLocal">
			<v-icon small class="mr-1">polymer</v-icon> {{ $t('list.macro.caption') }}
			<v-spacer></v-spacer>
			<span v-show="isConnected" style="font-family: GTAmericaExpandedThin, sans-serif; text-transform: none; font-size: small;">{{ directory.replace('0:/macros', $t('list.macro.root')) }}</span>
		</v-card-title>

		<v-card-title v-else>
			<v-icon small class="mr-1">polymer</v-icon> {{ $t('list.macro.caption') }}
			<v-spacer></v-spacer>
			<v-btn> <!--@click="showJob"-->
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

				<v-list-tile v-for="item in filelist" :key="item.name" @click="fileClicked(item)" v-tab-control>
					<v-list-tile-avatar v-bind:class="{'icon': item.ico}">
						<!-- object :data="item.ico" v-if="true" class="list-icon" :class="(item.isDirectory ? 'grey darken-1 white--text' : 'grey darken-2 white--text')" style="border-radius: 50%; padding: 10%">
							<img :src="item.isDirectory ? '/img/ressources/folder.svg' : '/img/ressources/file.png'" style="width: 100%; height: 100%; margin-top: 0%"/>
						</object-->
						<v-icon class="list-icon" :class="item.isDirectory ? 'grey darken-1 white--text' : 'grey darken-2 white--text'">
							{{ item.isDirectory ? 'folder' : 'assignment' }}
						</v-icon>
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
				<!-- @fileClicked="fileClicked"-->
				<v-layout sm4 shrink v-for="(item, index) in filelist" v-if="(index < 9 && (!item.isDirectory || true)) || !isLocal" :key="item.name" @click="fileClicked(item)" v-bind:class="{'icon': item.ico}" :class="(item.isDirectory ? 'grey darken-1 white--text' : 'grey darken-2 white--text')" style="cursor: pointer;">
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

			<v-list-tile v-tab-control v-if="false && isLocal && filelist.length > 6"> <!-- @click="showJob" -->
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
			</v-list-tile>
		</v-card-text>

		<v-alert :value="!filelist.length" type="info">
			{{ $t('list.macro.noMacros') }}
		</v-alert>
		</v-card>
		<confirm-dialog :shown.sync="runMacroDialog.shown" :question="runMacroDialog.question" :prompt="runMacroDialog.prompt" @confirmed="itemClick(runMacroDialog.file)"></confirm-dialog>
</div>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

import { getModifiedDirectories } from '../../store/machine'
import { DisconnectedError } from '../../utils/errors.js'
import Path from '../../utils/path.js'

export default {
	computed: {
		...mapState(['selectedMachine']),
		...mapGetters(['isConnected', 'uiFrozen']),
		...mapState('machine/model', ['storages']),
		isRootDirectory() { return this.directory === Path.macros + (this.isLocal ? "/_Machine": ""); },
		...mapState({isLocal: state => state.isLocal,}),
	},
	data () {
		return {
			unsubscribe: undefined,
			loading: false,
			wasMounted: false,
			directory: Path.macros,
			filelist: [],
			runMacroDialog: {
				question: '',
				prompt: '',
				filename: '',
				file: undefined,
				shown: false
			},
		}
	},
	methods: {
		...mapActions('machine', ['sendCode', 'getFileList']),
		async loadDirectory(directory = Path.macros  + (this.isLocal ? "/_Machine": "")) {
			if (this.loading) {
				return;
			}

			this.loading = true;
			try {
				const files = await this.getFileList(directory);
				if(this.isLocal) {
					files.sort((a, b) => ( b.lastModified - a.lastModified ));
				} else {
					files.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensivity: 'base' }));
				}
				files.sort((a, b) => (a.isDirectory === b.isDirectory) ? 0 : (a.isDirectory ? (this.isLocal ? 1 : -1) : (this.isLocal ? -1 : 1)));
				files.forEach(function(item) {
					item.displayName = Path.stripMacroFilename(item.name);
					item.executing = false;
				});

				this.directory = directory;
				this.filelist = files;
			} catch (e) {
				if (!(e instanceof DisconnectedError)) {
					console.warn(e);
					this.$log('error', this.$t('error.filelistRequestFailed'), e.message);
				}
			}
			this.loading = false;
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
					await this.sendCode(`M98 P"${filename}"`);
				} catch (e) {
					if (!(e instanceof DisconnectedError)) {
						console.warn(e);
					}
				}
				item.executing = false;
			}
		},
		fileClicked(item) {
			if(item.isDirectory)
				this.itemClick(item);
			else {
				this.runMacroDialog.question = this.$t('dialog.runMacro.title', [item.name]);
				this.runMacroDialog.prompt = this.$t('dialog.runMacro.prompt', [item.name]);
				this.runMacroDialog.filename = item.name;
				this.runMacroDialog.file = item;
				this.runMacroDialog.shown = true;
			}
		},
		async goUp() {
			await this.loadDirectory(Path.extractFilePath(this.directory));
		},
		async showJob() {
			this.$router.push('/Files/Macros?path='+this.directory);
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
				this.directory = Path.macros;
				this.filelist = [];
			}
		},
		selectedMachine() {
			// TODO store current directory per selected machine
			if (this.isConnected) {
				this.wasMounted = this.storages.length && this.storages[0].mounted;
				this.loadDirectory();
			} else {
				this.directory = Path.macros;
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
		}
	}
}
</script>
