<style>
.v-tab {
	display: block !important;
	height: fit-content;
	padding: 1%;
	border-radius: 10px;
	width: 30%;
}

.v-tabs__div {
	font-size: 19px;
}

.v-tabs__item {
	display: block !important;
}

.toolLocal>.v-list__tile {
	font-size: 18px;
}

.toolLocal>.v-list__tile:hover {
	font-size: 19px;
}

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
.toolLocal{
	padding: 10px 0;
	border-bottom: 1px solid black;
}
</style>
<template>
	<v-layout column>
		<v-layout row>
			<v-btn v-if="isLocal" color="" @click="confirmShutdownDialog.shown = !confirmShutdownDialog.shown">
				<v-icon mr-1 >
					power_settings_new
				</v-icon>
				{{$t('dialog.confirmShutdown.title')}}
			</v-btn>
			<v-spacer></v-spacer>
			<div v-if="ifaces && ifaces.length > 0" style="font-size: large;position: fixed;margin: 0px 50%;z-index: 1;width: 150px;left: -75px;top: 0px;">
				<div style="border-radius: 50%; display: inline-flex; margin-left: 0; vertical-align: middle; width: 15px; height: 15px" id="state"
				v-bind:style="stateColor"></div>
				<div style="width: 130px;display: inline-block;text-align: center;">
					{{ ifaces.ip /*(ifaces.filter( iface => iface.ifname == "enp2s0" ).length > 0 ? (ifaces.filter( iface => iface.ifname == "enp1s0" ).length > 0 ? ifaces.filter( iface => iface.ifname == "enp1s0" )[0].addr_info.filter( addr => addr.family == 'inet' )[0].local : 'Disconected') : 'Booting')*/ }}
				</div>
			</div>
			<v-spacer></v-spacer>
			<emergency-btn class="hidden-xs-only"></emergency-btn>
		</v-layout>
		<img src="/img/ressources/logoLynxter-dark.png" width="200px" style="margin: 50px 50% 0px; left: -100px; position: relative;">
		<h2 class="display-1" style="text-align: center; background: #616161; font-family:'GTAmericaExpandedRegular', sans-serif !important; text-transform: uppercase;letter-spacing: 0.1rem !important; margin: 50px 0 50px;">
			{{ selectedMachine === '[default]' ? $t('dialog.connect.title') : (waited || true ? $t('loadTool.toolhead') : '')}}
		</h2>
		<v-card v-if="selectedMachine === '[default]' && waited && !waited">
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
					<v-btn color="primary darken-1" flat type="submit">{{ $t('dialog.connect.connect') }}</v-btn>
				</v-card-actions>
			</v-form>
		</v-card>
		<template v-if="!waited">
			<v-progress-linear indeterminate></v-progress-linear>
		</template>
		<template v-if="waited && !waited && lastConfig != {} && lastConfig.thead">
			<v-tooltip bottom>
				<template v-slot:activator="{ on }">
					<v-btn color="grey darken-3" :loading="loading" @click="loadLastConfig()" shrink v-on="on">
						<v-icon class="mr-1">refresh</v-icon> Load last configuration
					</v-btn>
				</template>
				<span>
					Tool: {{ lastConfig.thead.name }}<br/>
					Materials : {{ lastConfig.material.filter(val => val).map((val,index) => val ? " E" + index + ": " + val : "").toString() }}<br/>
					Nozzles : {{ lastConfig.nozzle.map((val,index) => " E" + index+": "+val).toString() }}<br/>
					Geometric : {{ lastConfig.geo.name }}<br/>
					Mesh : {{ lastConfig.mesh.name }}<br/>
				</span>
			</v-tooltip>
		</template>
		<v-list v-if="selectedMachine !== '[default]' && waited && !waited && tools.length > 0 && !loading">
			<v-list-tile v-for="(geometry, index) in geometries" :key="index" @click="geoClick(geometry)" :class="{'toolLocal': isLocal}">
				{{ geometry.name }}
			</v-list-tile>
		</v-list>
		<v-tabs v-if="selectedMachine !== '[default]' && waited && tools.length > 0" grow>
			<v-tabs-slider color="primary"></v-tabs-slider>
			<!--v-tab style="width: 0 !important; display: none"></v-tab-->
			<v-tab v-for="(material, key) in tools.filter(mater => mater.tech != 'CAL'  && mater.selected)" :key="key">
				<div style="width: 100px; height: 100px; margin: 0 auto">
					<img :src="material.ico" alt="" width="100px" height="100px">
				</div>
				{{ material.tech }}
			</v-tab>
			<v-tab-item v-for="(material, key) in tools.filter(mater => mater.tech != 'CAL' && mater.selected)" :key="key">
				<v-list v-if="!loading">
					<v-list-tile v-for="(tool, index) in material.tools.filter(tool => tool.selected)" :key="index" @click="toolClick(tool)" :class="{'toolLocal': isLocal}">
						{{ tool.name }}{{ tool.appro ? '_' + tool.appro : '' }}{{ tool.model ? '_' + tool.model : '' }}{{ tool.opt ? ('~' + tool.opt) : '' }}{{ tool.version ? '_' + tool.version : '' }}
					</v-list-tile>
				</v-list>
			</v-tab-item>
		</v-tabs>
		<v-layout column>
			<v-btn v-if="selectedMachine !== '[default]' && calibrationTool != undefined && calibrationTool != {} && waited && calibrationTool.selected" color="grey darken-3" :loading="loading" @click="toolClick(calibrationTool)">
				<v-icon class="mr-1">build</v-icon> {{ $t('loadTool.calibrationTool') }}
			</v-btn>
		</v-layout>
		<v-list v-if="selectedMachine !== '[default]' && !waited && waited && tools.length > 0 && !loading">
			<v-list-tile v-for="(mesh, index) in meshes" :key="index" @click="meshClick(mesh)" :class="{'toolLocal': isLocal}">
				{{ mesh.name }}
			</v-list-tile>
		</v-list>
		<v-btn @click="sheet = !sheet" style="position: fixed; margin: 0 50%; z-index: 1; border-top-left-radius: 88px; border-top-right-radius: 88px; width:88px; heigth:44px; left: -44px" :style="{bottom: (sheet ? '120px' : '0px')}">
			<v-icon style="transition: 0.4s" :style="{transform: sheet ? 'rotate(180deg)' : 'rotate(0deg)'}">keyboard_arrow_up</v-icon>
		</v-btn>
		<div class="text-center">
			<v-bottom-sheet v-model="sheet" :inset="inset" :hide-overlay="hideOverlay" persistent>
				<v-sheet class="text-center" height="120px" style="background-color: #212121;">
					<v-layout column style="position: absolute; bottom: 8px; width: 100%">
						<v-layout row>
							<v-layout column>
								<v-btn v-if="selectedMachine !== '[default]' && DEBUG" color="grey darken-3" :loading="loading" @click="sendCode('M550 PS600D - Debug')">
									<v-icon class="mr-1">launch</v-icon> {{ $t('loadTool.debug') }}
								</v-btn>
								<v-btn v-if="selectedMachine === '[default]' || true" color="grey darken-3"  onclick="location.href = 'http://' + location.host" >
									<v-icon>refresh</v-icon> {{ $t('loadTool.refreshIface') }}
								</v-btn>
							</v-layout>
							<v-layout column>
								<v-btn v-if="selectedMachine !== '[default]' && waited" color="grey darken-3" :loading="loading" @click="enableTool" @confirmed="loadTools">
									<v-icon class="mr-1">visibility</v-icon> {{ $t('loadTool.enableTool') }}
								</v-btn>
								<v-btn v-if="selectedMachine !== '[default]'" color="grey darken-3" :loading="loading" @click="loadTools">
									<v-icon class="mr-1">refresh</v-icon> {{ $t('loadTool.refreshTools') }}
								</v-btn>
							</v-layout>
						</v-layout>
					</v-layout>
				</v-sheet>
			</v-bottom-sheet>
		</div>
		<v-spacer></v-spacer>
		<confirm-dialog :shown.sync="confirmShutdownDialog.shown" :question="confirmShutdownDialog.title" :prompt="confirmShutdownDialog.prompt" @confirmed="shutdown"></confirm-dialog>
		<connection-dialog></connection-dialog>
		<tool-load-dialog :shown.sync="showToolDialog" @confirmed="loadTools"></tool-load-dialog>
	</v-layout>
</template>
<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

import { DisconnectedError } from '../../utils/errors.js'
import Path from '../../utils/path.js'
import axios from 'axios'

export default {
	data() {
		return {
			axios: undefined,
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
			},
			geometries: {},
			meshes: {},
			confirmShutdownDialog: {
				title: this.$t('dialog.confirmShutdown.title'),
				prompt: this.$t('dialog.confirmShutdown.prompt'),
				shown: false
			},
			waited: false,
			timeout: undefined,
			exName: "",
			calibrationTool: {},
			ifaces:[],
			DEBUG: true,
			sheet: false,
			inset: false,
			hideOverlay: true,
			showToolDialog: false,
			lastConfig: {},
			lastCode: '',
		}
	},
	computed: {
		...mapState(['isConnecting', 'isDisconnecting', 'isLoggingIn', 'isLoggingOut', 'isLoadingTool', 'isUnloadingTool', 'user']),
		...mapState('machine', ['isReconnecting']),
		...mapState(['isLocal', 'connectDialogShown', 'passwordRequired', 'selectedMachine', 'isConnecting']),
		...mapState('settings', ['lastHostname']),
		...mapGetters(['isConnected']),
		...mapState({
			name: state => state.machine.model.network.name,
		}),
		mustConnect() { return !this.isLocal && !this.isConnected; },
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
				//console.log('green');
				return 'background: green;'
			} else if( this.ifaces.filter(iface => iface.ifname == 'enp1s0')[0] &&
			this.ifaces.filter(iface => iface.ifname == 'enp1s0')[0].operstate == 'UP' ||
			this.ifaces.filter(iface => iface.ifname == 'enp2s0')[0] &&
			this.ifaces.filter(iface => iface.ifname == 'enp2s0')[0].operstate == 'UP' ) {
				//console.log('orange')
				return CanonicalGradientSupported() ? 'background: conic-gradient(yellow, orange 10% 90%, yellow);':'background: orange;'
			} else if (this.ifaces.filter(iface => iface.ifname == 'enp1s0')[0] &&
			this.ifaces.filter(iface => iface.ifname == 'enp1s0')[0].operstate == 'DOWN' ||
			this.ifaces.filter(iface => iface.ifname == 'enp2s0')[0] &&
			this.ifaces.filter(iface => iface.ifname == 'enp2s0')[0].operstate == 'DOWN' ) {
				//console.log('red')
				return CanonicalGradientSupported() ? 'background: conic-gradient(red, darkred 10% 40%, red, darkred 60% 90%, red);animation-duration: 2s' : 'background: red;'
			} else {
				return 'background: GRAY'
			}
		}
	},
	methods: {
		...mapActions(['connect','shutdown','setToolLoading','loadAddresses']),
		...mapActions('machine', ['sendCode', 'getFileList', 'download']),
		enableTool: function() {
			this.showToolDialog = true;
		},
		async loadTools() {
			if (this.loading) {
				return;
			}
			//console.log(this.tools)
			//Object.keys(this.tools).forEach(material => this.tools[material] = [])
			this.tools = {};
			this.loading = true;
			try {
				this.tools = [];
				await this.download({filename: Path.sys + "/selectedTools.json", showSuccess: false, showProgress: false}).then((result) => {
					//const json = JSON.parse(result)
					this.tools = result
					if (this.tools.length > 0) {
						this.calibrationTool = this.tools.filter(tool => tool.tech == "CAL")[0].tools[0];
						//console.log(this.calibrationTool)
					}
					//this.$forceUpdate();
				})
				//clearTimeout(this.timeout);
				this.timeout = setTimeout(() => {this.waited = true}, 1000);
			} catch (e) {
				if (!(e instanceof DisconnectedError)) {
					console.warn(e);
					//this.$log('error', this.$t('error.toolsLoadFailed'), e.message);
				}
				this.hide();
			}
			//console.log(this.tools);

			this.loading = false;
		},
		async loadCalib() {
			if (this.loading) {
				return;
			}
			//console.log(this.tools)
			//Object.keys(this.tools).forEach(material => this.tools[material] = [])
			this.geometries = {};
			this.meshes = {};
			this.loading = true;
			try {
				this.geometries = [];
				this.meshes = [];
				let files = await this.getFileList(this.calibrationTool.path.substr(0, this.calibrationTool.path.lastIndexOf('/')+1)+'Custom surfaces')
				//console.log(files)
				this.geometries = files.filter(item => item.name.startsWith('geometry'))
				this.meshes = files.filter(item => item.name.startsWith('heightmap'))
				//clearTimeout(this.timeout);
				this.timeout = setTimeout(() => {this.waited = true}, 1000);
			} catch (e) {
				if (!(e instanceof DisconnectedError)) {
					console.warn(e);
					//this.$log('error', this.$t('error.toolsLoadFailed'), e.message);
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
		toolClick: async function(tool) {
			setTimeout(function(that){that.setToolLoading(true);},0,this)

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

			console.log(this.lastConfig)

			if (this.lastConfig == null || typeof(this.lastConfig) != typeof({})) {
				this.lastConfig = {}
			}

			console.log(this.lastConfig, this.lastConfig.thead)

			if (!this.lastConfig.thead){
				this.lastConfig.thead = {}
			}

			console.log(this.lastConfig.thead)

			if (this.lastConfig != {} && this.lastConfig.thead) {
				if (typeof(this.lastConfig.thead) != {}){
					this.lastConfig.thead = {}
				}

				this.lastConfig.thead.name = myTool
				this.lastConfig.thead.path = tool.path;
				let tmpMaterial = []
				for (let i = 0; tool.io && i < parseInt(tool.io[0]); i++) {
					tmpMaterial.push(this.lastConfig.material && this.lastConfig.material[i] ? this.lastConfig.material[i] : "")
				}
				this.lastConfig.material = tmpMaterial
				let tmpNozzle = []
				for (let i = 0; tool.io && i < parseInt(tool.io[0]); i++) {
					tmpNozzle.push(this.lastConfig.nozzle && this.lastConfig.nozzle[i] ? this.lastConfig.nozzle[i] : "N040")
				}
				this.lastConfig.nozzle = tmpNozzle
			}

			if (!this.axios) {
				//let protocol = location.protocol;
				this.axios = await axios.create({
					baseURL:`http://`+this.selectedMachine+`/`,
					//cancelToken: BaseConnector.getCancelSource().token,
					timeout: 8000,	// default session timeout in RepRapFirmware
					withCredentials: true,
				});
			}
			console.log(this.lastConfig)
			this.axios.get('/pc_configmachine', {
				withCredentials: true,
				params: {
					params: JSON.stringify(this.lastConfig)
				},
			});
		},
		geoClick(geo) {
			setTimeout(function(that){that.setToolLoading(true);},0,this)
			this.sendCode('M98 P"' + geo.directory + '/' + geo.name + '"');
				setTimeout(function(that){that.setToolLoading(false);},1000,this)
		},
		meshClick(mesh) {
			setTimeout(function(that){that.setToolLoading(true);},0,this)
			console.log(mesh)
			this.sendCode('G29 S1 P"' + mesh.directory + '/' + mesh.name + '"');
				setTimeout(function(that){that.setToolLoading(false);},1000,this)
		},
		hide() {
			this.$emit('update:shown', false);
		},
		loadLastConfig: async function() {
			this.setToolLoading(true);
			await this.sendCode('M98 P"' + this.lastConfig.geo.path + '"');
			await this.sendCode('G4 S1\nG29 S1 P"' + this.lastConfig.mesh.path + '"');
			await this.sendCode('G4 S1\nM98 P"' + this.lastConfig.thead.path + '"');

		}
	},
	mounted: async function() {
		this.hostname = this.lastHostname;
		this.shown = this.connectDialogShown;
		this.timeout = setTimeout(() => {this.waited = true}, 5000);
		//console.log(this.exName);
		//console.log(this.name);
		setTimeout(async function(that){
			if (that.name != that.exName) {
				that.tools = {};
				//setInterval(
				await that.loadTools()
				await that.loadCalib()
				//, 10000, that);
				setInterval(that.loadAddresses, 5000, that)
				setInterval((that) => { that.ifaces = that.user.ifaces }, 5000, that)
				//console.log(that.waited);
				that.waited = false;
				that.exName = that.name;
			}
		}, 1000, this)

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

			if (result.data != null && typeof(result.data) == typeof({}))
				that.lastConfig = result.data
		}, 1000, this)
	},
	watch: {
		name() {
			//console.log("renamed " + from + " to " + to)
			//clearTimeout(this.timeout);
			if (this.waited) {
				this.waited = false;
				this.tools = {},
				this.loadTools();
			}
			//this.loadAddresses();
			//console.log(this.waited);
		},
		user(as){
			//console.log(as.ifaces);
			this.ifaces = as.ifaces;
		},
		selectedMachine(){
			//console.log(to)
			//this.loadAddresses();
		},
		isReconnecting(){
			//console.log(to?'reconnecting':'reconnected');
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
				console.log(this.lastConfig)
				this.axios.get('/pc_configmachine', {
					withCredentials: true,
					params: {
						params: JSON.stringify(this.lastConfig)
					},
				});
			}
		}
	}
}
</script>
