import BaseConnector from './BaseConnector.js';
import ApiConnector from './ApiConnector.js';


export const MachineActions = ['disconnect', 'sendCode', 'upload', 'delete', 'move', 'makeDirectory', 'download', 'getFileList', 'getFileInfo', 'getFileHistory', 'getConfigTools']

export function mapConnectorActions(connector, toIgnore = []) {
	let actions = {}
	if (connector) {
		MachineActions.filter(action => toIgnore.indexOf(action) === -1).forEach(function(action) {
			// Map action to the connector
			actions[action] = function handler(context, payload) { return connector[action](payload); }
		});
	}
	return actions;
}

export default {
	// Connect asynchronously and return the connector that worked.
	// If no connector can be found, an error will be thrown.
	async connect(hostname, user, password) {
		let connector = null;
		try {
				connector = await ApiConnector.connect(hostname, user, password);
		} catch (e) {
				throw e;
		}
		return connector;
	},

	async doLogin(user, password) {
		let connector = null;
		try {
				connector = await ApiConnector.prototype.doLogin(user, password);
		} catch (e) {
				throw e;
		}
		return connector;
	},

	async doLogout() {
		let connector = null;
		try {
				connector = await ApiConnector.prototype.doLogout();
		} catch (e) {
				throw e;
		}
		return connector;
	},

	async doShutdown() {
		let connector = null;
		try {
				connector = await ApiConnector.prototype.doShutdown();
		} catch (e) {
				throw e;
		}
		return connector;
	},

	async doLoadAddresses() {
		let connector = null;
		try {
				connector = await ApiConnector.prototype.doLoadAddresses();
		} catch (e) {
				throw e;
		}
		return connector;
	},
	// Install the global Vuex store
	installStore(store) {
		BaseConnector.installStore(store);
	}
}
