'use strict'

import Vue from 'vue'
import Vuex from 'vuex'

import machine, { defaultMachine } from './machine'
import connector from './machine/connector'
import observer from './observer.js'
import settings from './settings.js'

import i18n from '../i18n'
import Plugins from '../plugins'
import { logGlobal } from '../plugins/logging.js'

import { InvalidPasswordError } from '../utils/errors.js'

Vue.use(Vuex)

const defaultUsername = ''
const defaultPassword = 'reprap'

const machines = {
	[defaultMachine]: machine(defaultMachine)
}

const store = new Vuex.Store({
	state: {
		isConnecting: false,
		isDisconnecting: false,
		isLoggingIn: false,
		isLoggingOut: false,
		isLoadingTool: false,
		isUnloadingTool: false,
		isLocal: ((location.hostname === 'localhost') || (location.hostname === '127.0.0.1') || (location.hostname === '[::1]')),
		connectDialogShown: ((location.hostname === 'localhost') || (location.hostname === '127.0.0.1') || (location.hostname === '[::1]')) && ((location.port !== "80") && (location.port !== "")),
		loginDialogShown: false,
		passwordRequired: false,
		selectedMachine: defaultMachine,
		user: {},
		lastConfig: {},
	},
	getters: {
		connectedMachines: () => Object.keys(machines).filter(machine => machine !== defaultMachine),
		isConnected: state => state.selectedMachine !== defaultMachine && !state.machine.isReconnecting,
		isLogedIn: state => state.user.username != undefined && state.user.username != "",
		uiFrozen: (state, getters) => state.isConnecting || state.isDisconnecting || !getters.isConnected,
		getUser: state => state.user,
		getTool: state => state.user.loadedTool,
	},
	actions: {
		// Connect to the given hostname using the specified credentials
		async connect({ state, commit, dispatch }, { hostname = location.host, username = defaultUsername, password = defaultPassword } = {}) {
			if (!hostname || hostname === defaultMachine) {
				throw new Error('Invalid hostname');
			}
			if (state.machines.hasOwnProperty(hostname)) {
				throw new Error(`Host ${hostname} is already connected!`);
			}
			if (state.isConnecting) {
				throw new Error('Already connecting');
			}

			commit('setConnecting', true);
			try {
				const connectorInstance = await connector.connect(hostname, username, password);
				const moduleInstance = machine(hostname, connectorInstance);
				commit('addMachine', { hostname, moduleInstance });
				connectorInstance.register(moduleInstance);

				commit('setSelectedMachine', hostname);
				logGlobal('success', i18n.t('events.connected', [hostname]));

				if (state.isLocal) {
					commit('settings/setLastHostname', hostname);
				}
				await dispatch('machine/settings/load');
				await dispatch('machine/cache/load');
			} catch (e) {
				if (!(e instanceof InvalidPasswordError) || password !== defaultPassword) {
					logGlobal('error', i18n.t('error.connect', [hostname]), e.message);
				}
				if (e instanceof InvalidPasswordError) {
					commit('askForPassword');
				}
			}
			commit('setConnecting', false);
		},

		// Disconnect from the given hostname
		async disconnect({ state, commit, dispatch }, { hostname = state.selectedMachine, doDisconnect = true } = {}) {
			if (!hostname || hostname === defaultMachine) {
				throw new Error('Invalid hostname');
			}
			if (!state.machines.hasOwnProperty(hostname)) {
				throw new Error(`Host ${hostname} is already disconnected!`);
			}
			if (state.isDisconnecting) {
				throw new Error('Already disconnecting');
			}

			if (doDisconnect) {
				commit('setDisconnecting', true);
				try {
					commit('setTool', undefined)
					await dispatch(`machines/${hostname}/disconnect`);
					logGlobal('success', i18n.t('events.disconnected', [hostname]));
					// Disconnecting must always work - even if it does not always happen cleanly
				} catch (e) {
					logGlobal('warning', i18n.t('error.disconnect', [hostname]), e.message);
					console.warn(e);
				}
				commit('setDisconnecting', false);
			}
			commit(`machines/${hostname}/unregister`);

			if (state.selectedMachine === hostname) {
				commit('setSelectedMachine', defaultMachine);
			}
			commit('removeMachine', hostname);
		},

		// Disconnect from every host
		async disconnectAll({ dispatch }) {
			for (let hostname in machines) {
				if (hostname !== defaultMachine) {
					// Don't do this via await because we don't have much time...
					dispatch('disconnect', { hostname });
				}
			}
		},

		// Called when a machine cannot stay connected
		async onConnectionError({ state, dispatch, commit }, { hostname, error }) {
			if (error instanceof InvalidPasswordError) {
				logGlobal('error', i18n.t('events.connectionLost', [hostname]), error.message);
				await dispatch('disconnect', { hostname, doDisconnect: false });
				commit('askForPassword');
			} else if (state.isLocal) {
				logGlobal('error', i18n.t('events.connectionLost', [hostname]), error.message);
				commit('setTool', undefined)
				await dispatch('disconnect', { hostname, doDisconnect: false });
			} else {
				logGlobal('warning', i18n.t('events.reconnecting', [hostname]), error.message);
				dispatch(`machines/${hostname}/reconnect`);
				commit('setSelectedMachine', defaultMachine);
			}
		},

		async login({ state, commit}, {usrLogin, usrPasswd}) {
			//console.log("logging in");
			//console.log(usrLogin + ": " + usrPasswd);
			if (state.machines.hasOwnProperty(usrLogin)) {
				throw new Error(`User ${usrLogin} is already connected!`);
			}
			if (state.isLoggingIn) {
				throw new Error('Already logging in');
			}
			commit('setLoggingin', true);
			try {
				let hostname;
				if (hostname == undefined)
				hostname = state.selectedMachine; //Object.keys(machines)[1];
				let result = await connector.doLogin(usrLogin, usrPasswd, hostname);
				commit('setLoggingin', false);
				commit(`setUser`, result.data);

			} catch (e) {
				/*if (!(e instanceof InvalidPasswordError) || password !== defaultPassword) {
					logGlobal('error', i18n.t('error.connect', [hostname]), e.message);
				}
				if (e instanceof InvalidPasswordError) {
					commit('askForPassword');
				}*/
				commit('setLoggingin', false);
				//commit('setLogedin', false);
				state.loginDialogShown = true;
				console.error(e);
			}
		},

		async logout({ state, commit}) {
			console.log("logging out");
			if (state.username == "") {
				throw new Error('Already loged out');
			}
			if (state.isLoggingOut) {
				throw new Error('Already logging out');
			}
			commit('setLoggingout', true);

			try {
				let hostname;
				if (hostname == undefined)
				hostname = state.selectedMachine; //location.host;
				await connector.doLogout();
				//console.log(result.data);
				commit('setLoggingout', false);
				commit(`setUser`, {});

			} catch (e) {
				commit('setLoggingout', false);
				console.error(e);
			}
		},

		async loadTool({state, commit}, name){
			commit('setTool', name)
			commit('setLoadingTool', false);
		},

		async shutdown({state, commit}) {
			console.log('Shutting down');
			try {
				let hostname;
				if (hostname == undefined)
				hostname = state.selectedMachine; //location.host;
				await connector.doShutdown(hostname);
				//console.log(result.data);
			} catch (e) {
				console.error(e);
			}
		},


		async setToolLoading({state, commit}, loading){
			console.log('loading Tool ' + loading);
			commit('setLoadingTool', loading);
		},

		async loadAddresses({state, commit}) {
			//console.log('Loading addresses');
			try {
				let hostname;
				if (hostname == undefined)
				hostname = (state.selectedMachine !== defaultMachine ? state.selectedMachine: (location.hostname != 'localhost' ? location.host : '192.168.1.243'));

				let result = await connector.doLoadAddresses(hostname);
				var ifaces = null;
				if (Array.isArray(result.data.cfg)) {
					var ifaces = result.data.cfg.filter(iface => (iface.ifname == "enp1s0" || iface.ifname == "enp2s0"));
				} else {
					var ifaces = result.data.cfg;
				}

				ifaces.ip = result.data.ip.substr(0, result.data.ip.indexOf('/'))
				//console.log(this.state.user.ifaces)
				//console.log(ifaces)
				let diff = false;
				if(this.state.user.ifaces){
					for (var i = 0; i < ifaces.length; i++) {
						let keyI = ifaces[i]
						let keysI = Object.keys(keyI);
						for (var j = 0; j < keysI.length; j++) {
							if (typeof(keyI[keysI[j]]) == "string") {
								if (keyI[keysI[j]] !== this.state.user.ifaces[i][keysI[j]]) {
									diff = true
									//console.log(keysI[j])
									//console.log(keyI[keysI[j]])
									//console.log(this.state.user.ifaces[i][keysI[j]])
								}
							} else if (typeof(keyI[keysI[j]]) == "object") {
								let keyJ = keyI[keysI[j]]
								let keysJ = Object.keys(keyJ);
								for (var k = 0; k < keysJ.length; k++) {
									if (typeof(keyJ[keysJ[k]]) == "string") {
										if (keyJ[keysJ[k]] !== this.state.user.ifaces[i][keysI[j]][keysJ[k]]) {
											diff = true
											//console.log(keysJ[k])
											//console.log(keyJ[keysJ[k]])
											//console.log(this.state.user.ifaces[i][keysI[j]][keysJ[k]])
										}
									} else if (typeof(keyJ[keysJ[k]]) == "object"){
										let keyK = keyJ[keysJ[k]];
										let keysK = Object.keys(keyK);
										for (var l = 0; l < keysK.length; l++) {
											if (typeof(keyK[keysK[l]]) == "string") {
												if (keyK[keysK[l]] !== this.state.user.ifaces[i][keysI[j]][keysJ[k]][keysK[l]]) {
													diff = true
													//console.log(keysK[l])
													//console.log(keyK[keysK[l]])
													//console.log(this.state.user.ifaces[i][keysI[j]][keysJ[k]][keysK[l]])
												}
											}
										}
									} else {
										console.log(typeof(keyJ[keysJ[k]]))
									}
								}
							} else {
								console.log(typeof(keyJ))
							}
						}
					}
				} else {
					diff = true;
				}
				//console.log(diff);
				if (diff) {
					commit(`setIfaces`, result.data);
				}
			} catch (e) {
				console.error(e);
			}
		}
	},
	mutations: {
		showConnectDialog: state => state.connectDialogShown = true,
		showLoginDialog: state => state.loginDialogShown = true,
		hideConnectDialog(state) {
			state.connectDialogShown = false;
			state.passwordRequired = false;
		},
		hideLoginDialog(state) {
			state.loginDialogShown = false;
		},
		askForPassword(state) {
			state.connectDialogShown = true;
			state.passwordRequired = true;
		},

		setConnecting: (state, connecting) => state.isConnecting = connecting,
		addMachine(state, { hostname, moduleInstance }) {
			machines[hostname] = moduleInstance;
			this.registerModule(['machines', hostname], moduleInstance);
		},
		setDisconnecting: (state, disconnecting) => state.isDisconnecting = disconnecting,
		removeMachine(state, hostname) {
			this.unregisterModule(['machines', hostname]);
			delete machines[hostname];
		},

		setLoggingin: (state, loggingin) => state.isLoggingIn = loggingin,
		setLoggingout: (state, loggingout) => state.isLoggingOut = loggingout,

		setLoadingTool: (state, loadingtool) => state.isLoadingTool = loadingtool,
		setUnloadingTool: (state, unloadingtool) => state.isUnloadingTool = unloadingtool,

		setSelectedMachine(state, selectedMachine) {
			this.unregisterModule('machine');
			this.registerModule('machine', machines[selectedMachine]);
			state.selectedMachine = selectedMachine;
		},

		setUser(state, user) {
			let tmpUser = state.user;
			state.user = {};
			tmpUser.username = user.username;
			tmpUser.level = user.level;
			tmpUser.last_connect = user.date;
			tmpUser.type = user.type;
			//console.log(state.user);
			state.user = tmpUser;
			if (state.user.username) {
				console.log("Welcome back " + state.user.username);
				console.log("you're " + state.user.type +"(" + state.user.level + ")")
				console.log("last connection " + state.user.last_connect);
			}

			//console.log(state.user);
		},

		setTool(state, tool) {
			let tmpUser = state.user;
			state.user = {};
			tmpUser.loadedTool = tool
			state.user = tmpUser;
		},

		setIfaces(state, iface) {
			let tmpUser = state.user;
			state.user = {};
			if (Array.isArray(iface.cfg)) {
				tmpUser.ifaces = iface.cfg.filter(iface => iface.ifname == "enp1s0" || iface.ifname == "enp2s0");
			} else {
				tmpUser.ifaces = iface;
			}

			tmpUser.ifaces.ip = iface.ip.substr(0, iface.ip.indexOf('/'))
			state.user = tmpUser;
			//console.log(tmpUser);
		},
	},

	modules: {
		// machine will provide the currently selected machine
		machines: {
			namespaced: true,
			modules: {
				[defaultMachine]: machines[defaultMachine]				// This represents the factory defaults
				// ... other machines are added as sub-modules to this object
			}
		},
		settings
	},
	plugins: [
		connector.installStore,
		observer,
		Plugins.installStore
	],
	strict: process.env.NODE_ENV !== 'production'
})

// This has to be registered dynamically, else unregisterModule will not work cleanly
store.registerModule('machine', machines[defaultMachine])

export default store
