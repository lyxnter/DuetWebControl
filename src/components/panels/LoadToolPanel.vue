<style>

.material_btn {
	height: fit-content;
	padding: 1%;
	border-radius: 10px;
	width: 30%;
}
.material_btn .v-btn__content {
	display: inline-grid;
	font-size: large;
}
.material_btn .v-btn__content img{
	margin: 0 auto;
}
.v-tabs__wrapper, .v-tabs__container{
	height: auto !important;
}
</style>
<template>
	<v-layout column>
		<v-layout row>
			<v-btn v-if="isLocal && selectedMachine !== '[default]'" color="" @click="confirmShutdownDialog.shown = !confirmShutdownDialog.shown">
				<v-icon mr-1 >
					power_settings_new
				</v-icon>
				Shutdown printer
			</v-btn>
			<v-spacer></v-spacer>
			<emergency-btn class="hidden-xs-only"></emergency-btn>
		</v-layout>
		<img src="/img/ressources/logoLynxter-dark.png" width="200px" style="margin: 100px auto 0px auto">
		<h2 class="display-1" style="text-align: center; background: #616161; font-family:'GTAmericaExpandedRegular', sans-serif !important; text-transform: uppercase;letter-spacing: 0.1rem !important; margin: 50px 0 100px;">
			{{ selectedMachine === '[default]' ? $t('dialog.connect.title') : 'Select a toolhead' }}
		</h2>
		<v-card v-if="selectedMachine === '[default]'">
			<v-form ref="form" @submit.prevent="submit">
				<v-card-title>
					{{ $t('dialog.connect.prompt') }}
				</v-card-title>
				<v-card-text>
					<v-text-field v-if="!mustConnect" ref="hostname" v-model="hostname" :placeholder="$t('dialog.connect.hostPlaceholder')" :rules="[v => !!v || $t('dialog.connect.hostRequired')]" required></v-text-field>
					<v-text-field ref="password" type="password" :placeholder="$t(passwordRequired ? 'dialog.connect.passwordPlaceholder' : 'dialog.connect.passwordPlaceholderOptional')" v-model="password" :rules="[v => !!v || !passwordRequired || $t('dialog.connect.passwordRequired')]" :required="passwordRequired"></v-text-field>
				</v-card-text>

				<v-card-actions>
					<v-spacer></v-spacer>
					<!--v-btn v-show="!mustConnect" color="blue darken-1" flat @click="hideConnectDialog">{{ $t('generic.cancel') }}</v-btn-->
					<v-btn color="blue darken-1" flat type="submit">{{ $t('dialog.connect.connect') }}</v-btn>
				</v-card-actions>
			</v-form>
		</v-card>
		<v-tabs v-if="selectedMachine !== '[default]'" fixed-tabs>
			<v-tab style="width: 0 !important; display: none"></v-tab>
			<v-tab v-for="(material, key) in tools" :key="key" v-if="material.length > 0">
				<img :src="'/img/ressources/Medium_universe_'+key.substr(0,3).toUpperCase()+'.svg'" :alt="key" width="100px" height="100px">
			</v-tab>
			<v-tab-item></v-tab-item>
			<v-tab-item v-for="(material, key) in tools" :key="key" v-if="material.length > 0">
				{{key}}:
				<v-progress-linear indeterminate v-if="loading"></v-progress-linear>
				<v-list v-if="!loading">
					<v-list-tile v-for="(tool, index) in material" :key="index" @click="toolClick(tool)">
						<img :src="tool.ico" style="width: 40px; margin-right:15px"> {{ tool.name }}
					</v-list-tile>
				</v-list>
			</v-tab-item>
		</v-tabs>
		<v-layout column>
			<v-btn v-if="selectedMachine === '[default]'" onclick="location.href = 'http://' + location.host"><v-icon>refresh</v-icon> Refresh the interface</v-btn>
			<v-btn v-if="selectedMachine !== '[default]'" color="grey darken-3" :loading="loading" @click="loadTools">
				<v-icon class="mr-1">refresh</v-icon> Refresh tools List
			</v-btn>
		</v-layout>
		<v-spacer></v-spacer>
		<confirm-dialog :shown.sync="confirmShutdownDialog.shown" :question="confirmShutdownDialog.question" :prompt="confirmShutdownDialog.prompt" @confirmed="shutdown"></confirm-dialog>
	</v-layout>
</template>
<script>
'use strict'

import { mapState, /*mapGetters,*/ mapActions } from 'vuex'

import { DisconnectedError } from '../../utils/errors.js'
import Path from '../../utils/path.js'

export default {
	data() {
		return {
			shown: false,
			hostname: '',
			password: '',
			buffer: 0,
			bufferValue: 0,
			curVideo: 0,
			load: true,
			loading: false,
			playIcon: 'pause',
			playing: false,
			noTool: undefined,
			tools: {
				Filament: [],
				Liquid: [],
			},
			videoPlaylist: [{
				src: "/img/ressources/Lynxter - Impression 3D hautes performances.mp4",
				poster: "/img/ressources/Lynxter_wallpaper_1920_1080_detail_grey.png"
			}],
			confirmShutdownDialog: {
				question: 'Shutdown the Printer',
				prompt: "Are you sure you want to shutdown the Printer (this operation will need a restart of the printer after)",
				shown: false
			},
		}
	},
	computed: {
		...mapState(['isLocal', 'connectDialogShown', 'passwordRequired', 'selectedMachine']),
		...mapState('settings', ['lastHostname']),
		...mapState({
			name: state => state.machine.model.network.name,
		}),
		mustConnect() { return !this.isLocal && !this.isConnected; }
	},
	methods: {
		...mapActions(['connect','shutdown']),
		...mapActions('machine', ['sendCode', 'getFileList']),
		async loadTools() {
			if (this.loading) {
				return;
			}

			//this.loading = true;
			try {
				const response = await this.getFileList(Path.macros+"/_Tools");
				let tools = response.filter(item => item.isDirectory).map(item => item.name);
				//console.log(tools);
				let len = tools.length;
				let that = this;
				let trou = true;
				for (var i = 0; i < len; i++){
					if (!tools[i].includes("Calibration") || trou) {
						let response = await this.getFileList(Path.macros+"/_Tools/"+tools[i]);
						response.forEach(
							function (tool) {
								if (tool.name.includes("Filament")) {
									tool.ico = "/img/ressources/Medium_universe_FIL.svg"
								} else if (tool.name.includes("Liquid")) {
									tool.ico = "/img/ressources/Medium_universe_LIQ.svg"
								}	else if (tool.name.includes("Paste")) {
									tool.ico = "/img/ressources/Medium_universe_PAS.svg"
								} else {
									tool.ico = "/img/ressources/file.png"
								}
								var material = (tools[i].substring(0,tools[i].indexOf('_')));
								if (that.tools[material] === undefined)
								that.tools[material] = [];
								var name = tools[i].substring(0,3).toUpperCase();
								name += tools[i].substr(tools[i].indexOf("in-")-1,1);
								name += tools[i].substr(tools[i].indexOf("out_")-1,1);
								name += name.includes("FIL") ? tool.name.substr(-5,3) : ""
								if (tool.name.includes("_Load") && that.tools[material].filter(item => item.name == name).length == 0) {
									//console.log(name);
									that.tools[material].push({
										'path': Path.macros+"/_Tools/"+tools[i]+"/"+tool.name,
										'name': name,//tool.name,
										'ico' : tool.ico,
									});
								}
							});
						}
					}
				} catch (e) {
					if (!(e instanceof DisconnectedError)) {
						console.warn(e);
						this.$log('error', this.$t('error.toolsLoadFailed'), e.message);
					}
					this.hide();
				}
				//console.log(this.tools);
				this.loading = false;
			},
			async submit() {
				if (this.shown && this.$refs.form.validate()) {
					//this.hideConnectDialog();

					await this.connect({ hostname: this.hostname, password: this.password });
					this.password = '';
				}
			},
			toolClick(tool) {
				this.hide();
				//console.log(tool);
				let code = 'M98 P"' + tool.path + '"';
				//console.log(code);
				this.sendCode(code);
				let myTool = tool.path.substring(tool.path.lastIndexOf("/")+1);
				if (myTool.lastIndexOf(".") > 0){
					myTool = myTool.substring(this.load?6:8,myTool.lastIndexOf("."));
					//console.log(myTool);
				} else {
					myTool = myTool.substring(this.load?6:8);
					//console.log(myTool)
				}
				//this.$store.commit('setTool', this.load ? myTool : '');

				//this.$emit('tool_loaded', tool)
			},
			hide() {
				this.$emit('update:shown', false);
			},
			attachListener(){
				var fullscreen = document.getElementById('full-screen');
				var video = document.getElementsByTagName('video')[0];
				fullscreen.addEventListener("click", function() {
					if (video.requestFullscreen) {
						video.requestFullscreen();
					}
				});
			},
			playPause() {
				if (!document.getElementsByTagName('video')[0].paused) {
					document.getElementsByTagName('video')[0].pause();
					this.playIcon = 'play_arrow';
					this.playing = false;
				} else {
					document.getElementsByTagName('video')[0].play();
					this.playIcon = 'pause';
					this.playing = true;
				}
			},

			seekChange(e) {
				var video = document.getElementsByTagName('video')[0];
				// Calculate the new time
				var time = video.duration * (e / 100);
				// Update the video time
				video.currentTime = time;
			},
			seekMouseDown(){
				var video = document.getElementsByTagName('video')[0];
				video.pause();
			},
			seekMouseUp() {
				var video = document.getElementsByTagName('video')[0];
				//console.log(this.playing);
				if(this.playing) {
					video.play();
				}
			},

			videoBuffer() {
				var video = document.getElementsByTagName('video')[0];
				var duration = video.duration;
				if (duration > 0) {
					for (var i = 0; i < video.buffered.length; i++) {
						if (video.buffered.start(video.buffered.length - 1 - i) <= video.currentTime) {
							this.bufferValue = (video.buffered.end(video.buffered.length - 1 - i) / duration) * 100;
							break;
						}
					}
				}
			},
			videoUpdate() {
				var video = document.getElementsByTagName('video')[0];
				// Calculate the slider value
				var value = (100 / video.duration) * video.currentTime;

				// Update the slider value
				this.buffer = value;
			},
			videoEnded(){
				this.curVideo++
				document.getElementsByTagName('video')[0].load();
				/*this.playIcon = 'play_arrow';
				this.playing = false;
				if(Document.fullscreenElement) {
				console.log('Document')
				Document.exitFullscreen();
			} else if(document.fullscreenElement){
			console.log('document')
			document.exitFullscreen();
		}*/
	},
	previousTrack() {
		this.curVideo--;
		document.getElementsByTagName('video')[0].load();
	},
	nextTrack(){
		this.curVideo++;
		document.getElementsByTagName('video')[0].load();
	},
	async updatePlaylist(){
		//console.log(this.selectedMachine);
		const files = await this.getFileList({dir: "0:/www/img/", recursive: this.isLocal});
		files.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensivity: 'base' }));
		files.sort((a, b) => (a.isDirectory === b.isDirectory) ? 0 : (a.isDirectory ? (this.isLocal ? 1 : -1) : (this.isLocal ? -1 : 1)));
		var videos = files.filter(file => file.name.endsWith('.mp4'));
		var posters = files.filter(file => file.name.endsWith('_ico.jpg'));
		if(videos.length > posters.length) {
			this.videoPlaylist = [];
			let that = this;
			//console.log(videos);
			posters.forEach((poster) => that.videoPlaylist.push({src: "http://"+that.selectedMachine + '/img'+poster.directory.substring(11) + "/" + poster.name.substr(0, poster.name.length -4)+'.mp4', poster: "http://"+that.selectedMachine +'/img'+posters.directory.substring(11) + "/" + posters.name}));
		} else {
			this.videoPlaylist = [];
			let that = this;
			//console.log(videos);
			videos.forEach((video) => that.videoPlaylist.push({src: "http://"+that.selectedMachine + '/img'+video.directory.substring(11) + "/" + video.name, poster: "http://"+that.selectedMachine +'/img'+video.directory.substring(11) + "/" + video.name.substr(0, video.name.length -4)+'_ico.jpg'}));
		}
		this.curVideo = 0;
		document.getElementsByTagName('video')[0].load();
	},
},
mounted() {
	this.hostname = this.lastHostname;
	this.shown = this.connectDialogShown;
},
watch: {
	name() {
		//console.log(this.name);
		this.tools = {
			Filament: [],
			Liquid: [],
		},
		this.loadTools();
	}
}
}
</script>
