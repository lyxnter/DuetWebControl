<style>
#title:not(:hover) {
	color: inherit;
}
#title {
	margin-right: 20px;
}

.container {
	padding: 4px;
}
.container div.component,
.container div.v-card {
	margin: 8px;
}

.empty-table-fix td {
	padding-left: 0px !important;
	padding-right: 0px !important;
}

.global-control.theme--light {
	background-color: #F5F5F5 !important;
}
#global-container .v-card.theme--light {
	background-color: #F5F5F5 !important;
}
.global-control.theme--dark {
	background-color: #515151 !important;
}
#global-container .v-card.theme--dark {
	background-color: #515151 !important;
}

input[type='number'] {
	-moz-appearance: textfield;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
	-webkit-appearance: none;
}

a:not(:hover) {
	text-decoration: none;
}

a:hover {
	color: white;
}

.theme--dark textarea {
	caret-color: #FFF;
}

.v-item-group.theme--dark .v-btn__content {
	color: #FFF !important;
}

.v-card__title {
	font-size: 1rem;
}

#clock {
	animation-duration: 10s;
	animation-direction: normal;
	animation-iteration-count: infinite;
	animation-name: addLife;
}

@keyframes addLife {
	0% {
		margin-top: 0px;
	}

	10% {
		margin-top: -21px;
	}

	50% {
		margin-top: -21px;
	}

	60% {
		margin-top: 0px;
	}

	100% {
		margin-top: 0px;
	}
}

#state {
	animation-duration: 5s;
	animation-direction: normal;
	animation-iteration-count: infinite;
	animation-timing-function: linear;
	animation-name: animateCon;
}

@keyframes animateCon {
	from {
		transform: rotate(0deg)
	}
	to {
		transform: rotate(360deg)
	}
}
</style>

<template>
	<v-app :dark="darkTheme">
		<template v-if="!getTool">
			<load-tool-panel></load-tool-panel>
		</template>
		<template v-if="getTool">
			<v-navigation-drawer v-model="drawer" persistent clipped fixed app enable-resize-watcher >
				<v-list class="pt-0" :expand="$vuetify.breakpoint.mdAndUp || isLocal">
					<v-list-group v-for="(category, index) in routing.filter((category, index) => checkMenuCondition(category.condition) && checkLynxCatCondition(category.showLocal, category.minLevel, category.showDist))" :key="index" :prepend-icon="category.icon" no-action :value="isExpanded(category)">
						<v-list-tile slot="activator">
							<v-list-tile-title>{{ $t(category.caption) }}</v-list-tile-title>
						</v-list-tile>

						<template v-for="(page, pageIndex) in category.pages">
							<v-list-tile v-if="checkMenuCondition(page.condition) && checkLynxCondition(page.showLocal, page.minLevel, page.showDist)" :key="`${index}-${pageIndex}`" v-ripple :to="page.path" @click.prevent>
								<v-list-tile-action>
									<img  v-if="page.img" :src="page.img" width="24" height="24">
									<v-icon v-else>{{ page.icon }}</v-icon>
								</v-list-tile-action>
								<v-list-tile-title>{{ $t(page.caption) }}</v-list-tile-title>
							</v-list-tile>
						</template>
					</v-list-group>
					<div class="hidden-sm-and-up" style="margin-top: 25%"></div>
					<v-list-tile v-if="isLocal && false">
						<connect-btn class="mb-3" block></connect-btn>
					</v-list-tile>
					<v-list-tile v-if="!isLocal && isLocal">
						<login-btn class="mb-3" block></login-btn>
					</v-list-tile>
					<v-list-tile class="hidden-sm-and-up">
						<emergency-btn block></emergency-btn>
					</v-list-tile>
					<v-list-tile>
						<v-btn block v-if="isLocal" color="" @click="confirmShutdownDialog.shown = !confirmShutdownDialog.shown">
							<v-icon mr-1 >
								power_settings_new
							</v-icon>
							{{$t('dialog.confirmShutdown.title')}}
						</v-btn>
					</v-list-tile>
					<v-list-tile class="pa-2" v-if="isLocal" >
						<div style="width: max-content; margin: auto" :style="isLocal?'font-size: large':''">
							<v-btn icon onclick="window.history.back()"><v-icon>arrow_back</v-icon></v-btn>
							<v-btn icon onclick="location.href = 'http://' + location.host"><v-icon>refresh</v-icon></v-btn>
							<v-btn icon onclick="window.history.forward()"><v-icon>arrow_forward</v-icon></v-btn>
						</div>
					</v-list-tile>
				</v-list>

				<div class="hidden-sm-and-up" v-if="true==false">
					<connect-btn v-if="isLocal && false" class="mb-3" block></connect-btn>
					<emergency-btn class="hidden-sm-and-up" block></emergency-btn>
				</div>
			</v-navigation-drawer>

			<v-toolbar ref="appToolbar" app clipped-left>
				<v-toolbar-side-icon @click.stop="drawer = !drawer" v-tab-control :style="{transform: (isLocal? 'scale(1.75)':'')}"></v-toolbar-side-icon>
				<v-toolbar-title :style="isLocal ? 'margin-left: 10px' : ''">
					<!-- TODO: Optional OEM branding -->
					<div @click="$router.push('/');" style="cursor:pointer; padding:10px 15px;margin: 0 10px 0 0;">
						<a id="title" v-tab-control style="width: max-content; margin: 0px auto;position: relative;"> {{ /*isLocal ?*/ (name.substr(0, 8) + name.substr(8).split('-').map(tname => tname.substr(0,tname.indexOf('_'))).join('_')) /*: name*/	}}</a>
					</div>
					<a id="user" v-tab-control style="color: inherit" v-if="!isLocal && isLocal">{{ username }} ({{ type }})</a>
				</v-toolbar-title>
				<status-label v-if="state.status && isLocal" style="font-size: large; letter-spacing: 0.1rem;"></status-label>
				<connect-btn v-if="isLocal && false" class="hidden-sm-and-down"></connect-btn>
				<!--login-btn v-if="!isLocal || isLocal" class="hidden-sm-and-down"></login-btn-->

				<v-spacer></v-spacer>

				<code-input class="mx-3 hidden-sm-and-down" v-if="!isLocal"></code-input>

				<v-spacer></v-spacer>

				<emergency-btn class="hidden-xs-only"></emergency-btn>

				<v-btn icon class="hidden-md-and-up ml-3" :class="toggleGlobalContainerColor" @click="hideGlobalContainer = !hideGlobalContainer" v-if="!isLocal">
					<v-icon>aspect_ratio</v-icon>
				</v-btn>
				<!-- TODO: Add quick actions and UI designer here -->
				<!--v-btn icon class="hidden-sm-and-down" @click="rightDrawer = !rightDrawer">
					<v-icon>menu</v-icon>
				</v-btn-->
			</v-toolbar>

			<v-content id="content">
				<v-scroll-y-transition>
					<v-container v-show="!hideGlobalContainer || $vuetify.breakpoint.mdAndUp" id="global-container" fluid v-if="!isLocal" class="container">
						<v-layout row wrap v-if="!isLocal">
							<v-flex xs12 sm4 md4 lg4>
								<status-panel></status-panel>
							</v-flex>

							<v-flex xs12 sm8 md5 lg4>
								<tools-panel></tools-panel>
							</v-flex>

							<v-flex v-if="$vuetify.breakpoint.mdAndUp" d-flex md3 lg4>
								<temperature-chart></temperature-chart>
							</v-flex>
						</v-layout>
					</v-container>
				</v-scroll-y-transition>

				<v-divider v-show="!hideGlobalContainer || $vuetify.breakpoint.mdAndUp"></v-divider>

				<v-container fluid id="page-container" class="container">
					<keep-alive>
						<router-view></router-view>
					</keep-alive>
				</v-container>
			</v-content>
			<template v-if="showDebug">
				{{$route.path}}
			</template>

			<div :style="{'bottom': ((this.$route.path=='/Console'||this.$route.path=='/Settings/Machine') && isLocal?'40px':'10px')}" style="position: fixed;left: -75px; color: white; margin-left: 50%; padding:0 15px; height: 20px; overflow: hidden; width: 150px">
				<div id="clock" style="height: 20px; margin: 0 auto; width: max-content; background: #323232; border-radius: 2px; padding: 0 10px">12:00</div>
				<div v-if="ifaces && ifaces.length > 0" style="width: max-content; margin: 0px auto 10px auto;	background: #323232; border-radius: 2px; padding: 0 10px">
					<div style="border-radius: 50%; display: inline-flex; margin-left: 0; vertical-align: middle; width: 15px; height: 15px" id="state"
					v-bind:style="stateColor"></div>&nbsp;
					{{ ifaces.ip /*(ifaces.filter( iface => iface.ifname == "enp2s0" ).length > 0 ? (ifaces.filter( iface => iface.ifname == "enp1s0" ).length > 0 ? ifaces.filter( iface => iface.ifname == "enp1s0" )[0].addr_info.filter( addr => addr.family == 'inet' )[0].local : 'Disconected') : 'Booting')*/ }}
				</div>
			</div>

			<!--<v-navigation-drawer temporary right v-model="rightDrawer" fixed app>
				TODO Add quick access / component list here in design mode
			</v-navigation-drawer>-->

		<connect-dialog v-if="selectedMachine === '[default]'"></connect-dialog>
		<connection-dialog></connection-dialog>
		<messagebox-dialog></messagebox-dialog>
		<!--login-dialog></login-dialog-->
		<confirm-dialog :shown.sync="confirmShutdownDialog.shown" :question="confirmShutdownDialog.title" :prompt="confirmShutdownDialog.prompt" @confirmed="shutdown"></confirm-dialog>
	</template>
</v-app>
</template>

<script>
'use strict'

import Piecon from 'piecon'
import axios from 'axios'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

import { Routing } from './routes'

export default {
	computed: {
		...mapState({
			isLocal: state => state.isLocal,
			selectedMachine: state => state.selectedMachine,
			getTool: state => state.user.loadedTool,

			globalShowConnectDialog: state => state.showConnectDialog,
			globalShowLoginDialog: state => state.showLoginDialog,

			isPrinting: state => state.machine.model.state.isPrinting,
			connectStatus: state => state,
			name: state => state.machine.model.network.name,
			level: state => state.user.level,
			type: state => state.user.type,
			username: state => state.user.username,
			darkTheme: state => state.settings.darkTheme,
			webcam: state => state.settings.webcam,
			stateColor() {
				//console.log(this.ifaces);

				function GetNavigatorInfo() {
					var ua= navigator.userAgent, tem,
					M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
					if(/trident/i.test(M[1])){
						tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
						return 'IE '+(tem[1] || '');
					}
					if(M[1]=== 'Chrome'){
						tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
						if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
					}
					M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
					if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
					return M.join(' ');
				}
				function CanonicalGradientSupported() {
					var navInfo = GetNavigatorInfo().split(' ')
					switch (navInfo[0]) {
						case 'Edge':
						return navInfo[1] >= 79;
						case 'Chrome':
						return navInfo[1] >= 69;
						default:
						return false;
					}
				}


				if(this.ifaces.filter(iface => iface.ifname == 'enp1s0')[0] &&
				this.ifaces.filter(iface => iface.ifname == 'enp1s0')[0].operstate == 'UP' &&
				this.ifaces.filter(iface => iface.ifname == 'enp2s0')[0] &&
				this.ifaces.filter(iface => iface.ifname == 'enp2s0')[0].operstate == 'UP' ) {
					return 'background: green;'
				} else if( this.ifaces.filter(iface => iface.ifname == 'enp1s0')[0] &&
				this.ifaces.filter(iface => iface.ifname == 'enp1s0')[0].operstate == 'UP' ||
				this.ifaces.filter(iface => iface.ifname == 'enp2s0')[0] &&
				this.ifaces.filter(iface => iface.ifname == 'enp2s0')[0].operstate == 'UP' ) {
					return CanonicalGradientSupported() ? 'background: conic-gradient(yellow, orange 10% 90%, yellow);':'background: orange;'
				} else if (this.ifaces.filter(iface => iface.ifname == 'enp1s0')[0] &&
				this.ifaces.filter(iface => iface.ifname == 'enp1s0')[0].operstate == 'DOWN' ||
				this.ifaces.filter(iface => iface.ifname == 'enp2s0')[0] &&
				this.ifaces.filter(iface => iface.ifname == 'enp2s0')[0].operstate == 'DOWN' ) {
					return CanonicalGradientSupported() ? 'background: conic-gradient(red, darkred 10% 40%, red, darkred 60% 90%, red);animation-duration: 2s' : 'background: red;'
				} else {
					return 'background: GRAY'
				}
			}
		}),
		...mapState(['user', 'lastConfig']),
		...mapGetters('machine', ['hasTemperaturesToDisplay']),
		...mapGetters('machine/model', ['board', 'isPrinting', 'jobProgress']),
		...mapState('machine/model', ['state']),
		toggleGlobalContainerColor() {
			if (this.hideGlobalContainer) {
				return this.darkTheme ? 'red darken-5' : 'red lighten-4';
			}
			return this.darkTheme ? 'green darken-5' : 'green lighten-4';
		},
		showDebug() {
			return this.isLocal && ((location.port === "8080") || (location.port === "8081"))
		},
		lastConfig:
		{
			get() { return this.state.lastConfig },
			set(value) {
				this.update({ lastConfig: value });
			}
		},
	},
	data() {
		return {
			drawer: this.$vuetify.breakpoint.lgAndUp,
			hideGlobalContainer: false,
			rightDrawer: false,
			routing: Routing,
			wasXs: this.$vuetify.breakpoint.xsOnly,
			confirmShutdownDialog: {
				title: this.$t('dialog.confirmShutdown.title'),
				prompt: this.$t('dialog.confirmShutdown.prompt'),
				shown: false
			},
			timeout: -1,
			times: [],
			ifaces:[],
			fps: 0,
			framerate: undefined,
			axios: undefined,
		}
	},
	methods: {
		...mapActions(['connect', 'disconnect', 'disconnectAll']),
		...mapActions('machine', ['getFileList']),
		...mapActions('settings', ['load']),
		...mapActions(['loadTool', 'shutdown','loadAddresses']),
		...mapMutations('settings', ['update']),
		checkMenuCondition(condition) {
			if (condition === 'webcam') {
				return (this.webcam.url !== '');
			}
			if (condition === 'display') {
				return this.board.hasDisplay;
			}
			if (condition === 'debug'){
				return this.getTool === "Debug"
			}
			return true;
		},
		checkLynxCondition(showLocal, level, showDist) {
			//console.log(showLocal, showDist);
			return !(this.isLocal && !showLocal) &&
			(level === undefined || level <= this.level) &&
			(this.isLocal || (showDist == undefined || showDist));
		},
		checkLynxCatCondition(showLocal, level, showDist) {
			//console.log(showLocal, showDist);
			return  !(this.isLocal && !showLocal) &&
			(level === undefined || level <= this.level) &&
			(this.isLocal || (showDist == undefined || showDist));
		},
		isExpanded(category) {
			if (this.$vuetify.breakpoint.xsOnly && category) {
				const route = this.$route;
				return category.pages.some(page => page.path === route.path);
			}
			if (category && category.defaultClosed) {
				return false
			} else {
				return true;
			}
		},
		updateTitle() {
			const jobProgress = this.jobProgress;
			const title = ((jobProgress > 0 && this.isPrinting) ? `(${(jobProgress * 100).toFixed(1)}%) ` : '') + this.name;
			if (document.title !== title) {
				document.title = title;
			}
		},
		updateClock: function()
		{
			var now = new Date()
			if(document.getElementById("clock"))
			{
				document.getElementById("clock").innerHTML = (now.getHours()<10?"0":"") + now.getHours() + (now.getSeconds()%2?":":" ") + (now.getMinutes()<10?"0":"") + now.getMinutes() /* + (now.getSeconds()%2?":":" ") + (now.getSeconds()<10?"0":"") + now.getSeconds() + "." + now.getMilliseconds(); */
			}
			setTimeout(this.updateClock, (1000 - now.getMilliseconds()))
		},
		refreshLoop: function() {
			window.requestAnimationFrame(() => {
				const now = performance.now();
				while (this.times.length > 0 && this.times[0] <= now - 1000) {
					this.times.shift();
				}
				this.times.push(now);
				this.fps = this.times.length;
				this.refreshLoop();
				this.framerate.innerText = this.fps + ' fps';
			});
		}
	},
	mounted() {
		// Attempt to disconnect from every machine when the page is being unloaded
		window.addEventListener('unload', this.disconnectAll);

		if(((location.port === "8080") || (location.port === "8081") || (location.port === "8082"))){
			this.connect({hostname: "192.168.1.54"});
		} else if (!this.isLocal || (location.port === "80") || (location.port === "")) {
			this.connect();
		}

		setInterval(async function(that) {
			// Connect if running on a board
			if ( that.selectedMachine == "[default]" && that.selectedMachine != "[default]") {
				if (!that.connectStatus.isDisconnecting) {
					console.log(that.selectedMachine)
					await that.disconnectAll()
				}

				if (!that.connectStatus.isConnecting) {
					setTimeout(() => {
						console.log(location.host)
						if(((location.port === "8080") || (location.port === "8081") || (location.port === "8082"))){
							that.connect({hostname: "192.168.1.54"});
						} else if (!that.isLocal || (location.port === "80") || (location.port === "")) {
							that.connect();
						}
					}, 2000)
				}
			}
		}, 5000, this)


		setTimeout(async function(that){
			if (!that.axios) {
				//let protocol = location.protocol;
				that.axios = await axios.create({
					baseURL:`http://`+that.selectedMachine+`/`,
					//cancelToken: BaseConnector.getCancelSource().token,
					timeout: 8000,	// default session timeout in RepRapFirmware
					withCredentials: true,
				});
			}

			let result = await that.axios.get('/pc_configmachine', {
				withCredentials: true,
			});

			that.lastConfig = result.data
		}, 1000, this)

		// Attempt to load the settings
		this.load();

		// Validate navigation
		const that = this;
		this.$router.beforeEach((to, from, next) => {
			if (Routing.some(group => group.pages.some(page => page.path === to.path && !that.checkMenuCondition(page.condition)))) {
				next('/');
			} else {
				next();
			}
		});

		const route = this.$route;
		const router = this.$router;
		if (Routing.some(group => group.pages.some(page => page.path === route.path && !this.checkMenuCondition(page.condition)))) {
			this.$router.push('/');
		}
		window.onclick = function() {
			clearTimeout(that.timeout);
			//console.log("click")
			that.timeout = setTimeout(function(){
				if (document.getElementsByClassName("v-dialog--active").length == 0 || document.getElementsByClassName("v-dialog--active")[0].childNodes[0].id != "fileEditDialog")
				{
					if(['pausing', 'paused', 'resuming', 'processing', 'simulating'].indexOf(that.state.status) !== -1)
					router.push('/Job/Status');
					else
					router.push('/');
				} else {
					//console.log(document.getElementsByClassName("v-dialog--active").length == 0)
					//console.log(document.getElementsByClassName("v-dialog--active").length == 0 || document.getElementsByClassName("v-dialog--active")[0].childNodes[0].id != "fileEditDialog");
				}
			}, 1000*60*30);
		}
		//this.$router.push('/');

		// Set up Piecon
		Piecon.setOptions({
			color: '#FDB913',				// Pie chart color
			background: '#403E3D',		// Empty pie chart color
			shadow: '#2D4EA2',				// Outer ring color
			fallback: false				// Toggles displaying percentage in the title bar (possible values - true, false, 'force')
		});
		this.updateClock();


		if(this.showDebug){
			this.framerate = document.createElement('span')
			document.body.append(this.framerate)
			this.framerate.style="position: fixed; color: white; z-index: 5; bottom: 5px; right: 5px; background: #424039; padding: 2px; border-radius: 5px;"
			this.refreshLoop();
		}
	},
	watch: {
		darkTheme(to) {
			this.$vuetify.theme.dark = to;
		},
		isPrinting(to) {
			if (to) {
				// Go to Job Status when a print starts
				this.$router.push('/Job/Status');
			} else {
				Piecon.reset();
			}
		},
		name() {
			this.updateTitle();
			if ((this.name).substring(0,8).includes("S600D")){
				//console.log("new name: " + this.name.substring(8))
				this.loadTool((this.name).substring(8));
			} else {
				this.loadTool();
			}
			this.loadAddresses();
		},
		jobProgress(to) {
			if (to === undefined || to == 1) {
				Piecon.reset();
			} else if (this.isPrinting) {
				Piecon.setProgress(to * 100);
			}
			this.updateTitle();
		},
		user(as){
			//console.log(as);
			this.ifaces = as.ifaces;
		},
	},
	lastConfig: {
		deep: true,
		handler: async function(){
			if (!this.axios) {
				//let protocol = location.protocol;
				this.axios = await axios.create({
					baseURL:`http://`+this.selectedMachine+`/`,
					//cancelToken: BaseConnector.getCancelSource().token,
					timeout: 8000,	// default session timeout in RepRapFirmware
					withCredentials: true,
				});
			}

			this.axios.get('/pc_configmachine', {
				withCredentials: true,
				params: {
					params: JSON.stringify(this.lastConfig)
				},
			});
		}
	}
}
</script>
