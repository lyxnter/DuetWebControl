<style scoped>
.sm4 {
	width: 23%;
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
		<v-card v-bind:class="{local: isLocal}" class="card" v-bind:style="isLocal?'min-height:650px':''">
			<v-card-title v-if="!isLocal">
				<v-icon small class="mr-1">polymer</v-icon> {{ $t('list.macro.caption') }}
				<v-spacer></v-spacer>
				<span v-show="isConnected" class="subtitle-2" style="font-family: GTAmericaExpandedThin, sans-serif; text-transform: none; font-size: small; width: 65%; overflow: hidden">{{ directory.replace('0:/macros', $t('list.macro.root')) }}</span>
			</v-card-title>

			<v-card-title v-else>
				<v-icon small class="mr-1">polymer</v-icon> {{ $t('list.macro.caption') }}
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

					<v-list-tile v-for="item in filelist" :key="item.name" @click="fileClicked(item)" v-tab-control>
						<v-list-tile-avatar v-bind:class="{'icon': item.ico}">
							<object :data="item.ico" v-if="true" class="list-icon" :class="item.isDirectory ? 'grey darken-1 white--text' : 'grey darken-2 white--text'" style="border-radius: 50%; padding: 10%">
								<img :src="item.isDirectory ? '/img/ressources/folder.svg' : '/img/ressources/file.png'" style="width: 80%; height: 80%; margin-top: 9%;margin-bottom: 8%;"/>
							</object>
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
					<v-layout sm4 shrink v-for="(item) in filelist.filter((item, index) => (index < 9 && (!item.isDirectory || true)) || !isLocal)" :key="item.name" @click="fileClicked(item)" :class="{'icon': item.ico, 'grey darken-1 white--text' : item.isDirectory, 'grey darken-2 white--text': !item.isDirectory}" style="cursor: pointer;">
						<v-flex class="content">
							<object :data="item.ico" v-if="item.ico || true" class="list-icon">
								<img :src="item.isDirectory ? '/img/ressources/folder.svg' : '/img/ressources/file.png'" style="width: 70%; height: 70%; margin-top: 11%;margin-bottom: 6%;"/>
							</object>
							<v-list-tile-title v-bind:class="{local: isLocal}" style="width:90%; margin: -5px 0 5px 5%;">
								{{ item.displayName }}
							</v-list-tile-title>
						</v-flex>
					</v-layout>
				</v-layout>

				<v-list-tile v-tab-control v-if="false && isLocal && filelist.length > 8"> <!-- @click="showJob" -->
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

			<v-alert :value="!filelist.length" >
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
		...mapGetters(['isConnected', 'uiFrozen', 'getTool']),
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
		async loadDirectory(directory = Path.macros + (this.isLocal ? "/_Machine": "")) {
			if (this.loading) {
				return;
			}

			if (directory.length < this.directory.length)
			{
				let path = this.directory.split("/")
				let last = path.pop()
				console.log(path, last)
				if (last.startsWith(this.getTool.substring(0,5)) && !path.join('/').includes(this.getTool.substring(0,5)))
				{
					let dir = directory.split('/')
					dir.pop()
					directory = dir.join('/');
				}
			}
			//console.log(directory)
			this.loading = true;

			let len = 0
			try {
				let files = await this.getFileList(directory);
				let tool = this.getTool.substring(0,5);
				//if (this.$route.path == "/Files/Jobs") {
				len = files.filter(item => item.name.startsWith(tool) && !item.directory.includes(tool)).length
				if(len > 0) {
					files = files.filter(item => item.name.startsWith(tool) && !item.directory.includes(tool))
				} else {
					tool = this.getTool.substring(0,3);
					len = files.filter(item => item.name.startsWith(tool) && !item.directory.includes(tool)).length
					if(len > 0) {
						files = files.filter(item => item.name.startsWith(tool) && !item.directory.includes(tool))
					}
				}
				//}*/
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

			if( len == 1 && this.filelist[0].isDirectory && this.filelist[0].name.startsWith(this.getTool.substring(0,5)) && !this.filelist[0].directory.includes(this.getTool.substring(0,5))) {
				console.log(this.filelist[0].directory + "/" + this.filelist[0].name);
				await this.loadDirectory(this.filelist[0].directory + "/" + this.filelist[0].name)
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
			console.log(Path.extractFilePath(this.directory))
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
