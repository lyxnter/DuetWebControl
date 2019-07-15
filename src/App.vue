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
</style>

<template>
	<v-app :dark="darkTheme">
		<template v-if="!getTool">
			<load-tool-panel></load-tool-panel>
		</template>
		<template v-if="getTool">
			<v-navigation-drawer persistent clipped v-model="drawer" enable-resize-watcher fixed app>
				<div class="pa-2 hidden-md-and-up" v-if="isLocal">
					<v-btn icon onclick="window.history.back()"><v-icon>arrow_back</v-icon></v-btn>
					<v-btn icon onclick="location.href = 'http://' + location.host"><v-icon>refresh</v-icon></v-btn>
					<v-btn icon onclick="window.history.forward()"><v-icon>arrow_forward</v-icon></v-btn>
				</div>
				<v-list class="pt-0" :expand="$vuetify.breakpoint.mdAndUp || isLocal">
					<v-list-group v-for="(category, index) in routing" v-if="checkLynxCatCondition(category.showLocal, category.minLevel)" :key="index" :prepend-icon="category.icon" no-action :value="isExpanded(category)">
						<v-list-tile slot="activator">
							<v-list-tile-title>{{ $t(category.caption) }}</v-list-tile-title>
						</v-list-tile>

						<template v-for="(page, pageIndex) in category.pages">
							<v-list-tile v-if="checkMenuCondition(page.condition) && checkLynxCondition(page.showLocal, page.minLevel)" :key="`${index}-${pageIndex}`" v-ripple :to="page.path" @click.prevent>
								<v-list-tile-action>
									<v-icon>{{ page.icon }}</v-icon>
								</v-list-tile-action>
								<v-list-tile-title>{{ $t(page.caption) }}</v-list-tile-title>
							</v-list-tile>
						</template>
					</v-list-group>
				</v-list>

				<div class="pa-2 hidden-md-and-up">
					<connect-btn v-if="isLocal" class="mb-3" block></connect-btn>
					<login-btn v-if="!isLocal || isLocal" class="mb-3" block></login-btn>
					<emergency-btn v-if="!isLocal" block></emergency-btn>
					<v-spacer></v-spacer>
					<v-btn block v-if="isLocal" color="" @click="confirmShutdownDialog.shown = !confirmShutdownDialog.shown">
						<v-icon mr-1 >
							power_settings_new
						</v-icon>
						Shutdown printer
					</v-btn>
				</div>
			</v-navigation-drawer>

			<v-toolbar ref="appToolbar" app clipped-left>
				<v-toolbar-side-icon @click.stop="drawer = !drawer" v-tab-control v-if="!isLocal"></v-toolbar-side-icon>
				<v-toolbar-side-icon @click.stop="drawer = !drawer" v-tab-control style="transform: scale(1.75)" v-else></v-toolbar-side-icon>
				<v-toolbar-title>
					<!-- TODO: Optional OEM branding -->
					<a id="title" v-tab-control @click="$router.push('/');" style="font-size: large;">{{ (isLocal?name.substring(8):name) }}</a>
					<!--img src="/img/ressources/logoLynxter-dark.png" style="width:35px;"-->
					<a id="user" v-tab-control style="color: inherit" v-if="!isLocal">{{ username }} ({{ type }})</a>
				</v-toolbar-title>
				<connect-btn v-if="isLocal" class="hidden-sm-and-down"></connect-btn>
				<login-btn v-if="!isLocal || isLocal" class="hidden-sm-and-down"></login-btn>

				<v-spacer></v-spacer>

				<code-input class="hidden-sm-and-down" v-if="!isLocal"></code-input>

				<v-spacer></v-spacer>

				<upload-btn target="start" class="hidden-sm-and-down" v-if="!isLocal"></upload-btn>
				<emergency-btn class="hidden-xs-only"></emergency-btn>

				<v-btn v-if="!isLocal" icon class="hidden-md-and-up" :class="toggleGlobalContainerColor" @click="hideGlobalContainer = !hideGlobalContainer">
					<v-icon>aspect_ratio</v-icon>
				</v-btn>
				<!-- TODO: Add quick actions and UI designer here -->
				<!--<v-btn icon class="hidden-sm-and-down" @click="rightDrawer = !rightDrawer">
					<v-icon>menu</v-icon>
				</v-btn>-->
			</v-toolbar>

			<v-content id="content">
				<v-scroll-y-transition>
					<v-container fluid id="global-container" class="container" v-show="!hideGlobalContainer || $vuetify.breakpoint.mdAndUp" v-if="!isLocal">
						<v-layout row wrap v-if="!isLocal">
							<v-flex xs12 sm3 md4 lg4>
								<status-panel></status-panel>
							</v-flex>

							<v-flex xs12 sm9 md5 lg4>
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

			<!--<v-navigation-drawer temporary right v-model="rightDrawer" fixed app>
				TODO Add quick access / component list here in design mode
			</v-navigation-drawer>-->

			<connect-dialog v-if="selectedMachine === '[default]'"></connect-dialog>
			<connection-dialog></connection-dialog>
			<messagebox-dialog></messagebox-dialog>
			<login-dialog></login-dialog>
			<confirm-dialog :shown.sync="confirmShutdownDialog.shown" :question="confirmShutdownDialog.question" :prompt="confirmShutdownDialog.prompt" @confirmed="shutdown"></confirm-dialog>
		</template>
	</v-app>
</template>

<script>
'use strict'

import Piecon from 'piecon'
import { mapState, mapGetters, mapActions } from 'vuex'

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
			name: state => state.machine.model.network.name,
			level: state => state.user.level,
			type: state => state.user.type,
			username: state => state.user.username,

			darkTheme: state => state.settings.darkTheme,
			webcam: state => state.settings.webcam
		}),
		...mapGetters('machine/model', ['board', 'jobProgress']),
		toggleGlobalContainerColor() {
			if (this.hideGlobalContainer) {
				return this.darkTheme ? 'red darken-5' : 'red lighten-4';
			}
			return this.darkTheme ? 'green darken-5' : 'green lighten-4';
		}
	},
	data() {
		return {
			drawer: this.$vuetify.breakpoint.lgAndUp,
			hideGlobalContainer: false,
			rightDrawer: false,
			routing: Routing,
			wasXs: this.$vuetify.breakpoint.xsOnly,
			confirmShutdownDialog: {
				question: 'Shutdown the Printer',
				prompt: "Are you sure you want to shutdown the Printer (this operation will need a restart of the printer after)",
				shown: false
			},
		}
	},
	methods: {
		...mapActions(['connect', 'disconnectAll']),
		...mapActions('machine', ['getFileList']),
		...mapActions('settings', ['load']),
		...mapActions(['loadTool', 'shutdown']),
		checkMenuCondition(condition) {
			if (condition === 'webcam') {
				return (this.webcam.url !== '');
			}
			if (condition === 'display') {
				return this.board.hasDisplay;
			}
			return true;
		},
		checkLynxCondition(show, level) {
			return !(this.isLocal && !show) && (level === undefined || level <= this.level);
		},
		checkLynxCatCondition(show, level) {
			return !(this.isLocal && !show) && (level === undefined || level <= this.level);
		},
		isExpanded(category) {
			if (this.$vuetify.breakpoint.xsOnly) {
				const route = this.$route;
				return category.pages.some(page => page.path === route.path);
			}
			return true;
		},
		updateTitle() {
			const jobProgress = this.jobProgress;
			const title = ((jobProgress > 0 && this.isPrinting) ? `(${(jobProgress * 100).toFixed(1)}%) ` : '') + this.name;
			if (document.title !== title) {
				document.title = title;
			}
		}
	},
	mounted() {
		// Attempt to disconnect from every machine when the page is being unloaded
		window.addEventListener('unload', this.disconnectAll);

		// Connect if running on a board
		if (!this.isLocal || ((location.port === "80") || (location.port === ""))) {
			this.connect();
		}
		if(this.isLocal && ((location.port === "8080") || (location.port === "8081"))){
			this.connect({hostname: "192.168.1.243"});
		}

		// Attempt to load the settings
		this.load();

		// Validate navigation
		const that = this;
		this.$router.beforeEach((to, from, next) => {
			//console.log("Page: ");
			//console.log(Routing.some(group => group.pages.some(page => { if(page.path === to.path) console.log(that.isLocal && !page.showLocal);})));
			if (Routing.some(group => group.pages.some(page => page.path === to.path && !that.checkMenuCondition(page.condition)))) {
				next('/');
			} else {
				next();
			}
		});

		const route = this.$route;
		if (Routing.some(group => group.pages.some(page => page.path === route.path && !this.checkMenuCondition(page.condition)))) {
			this.$router.push('/');
		}

		// Set up Piecon
		Piecon.setOptions({
			color: '#FDB913',				// Pie chart color
			background: '#403E3D',		// Empty pie chart color
			shadow: '#2D4EA2',				// Outer ring color
			fallback: false				// Toggles displaying percentage in the title bar (possible values - true, false, 'force')
		});
	},
	watch: {
		isPrinting(to) {
			if (to) {
				// Go to Job Status when a print starts
				this.$router.push('/Job/Status');
			}
		},
		name() {
		this.updateTitle();
		if ((this.name).substring(0,8).includes("S600D")){
			//console.log("new name: " + this.name.substring(8))
			this.loadTool((this.name).substring(8));
		} else {
			this.loadTool();
		} },
		jobProgress(to) {
			if (to === undefined || to == 1) {
				Piecon.reset();
			} else {
				Piecon.setProgress(to * 100);
			}
			this.updateTitle();
		}
	}
}
</script>
