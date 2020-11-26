'use strict'

import { LoginError, LoadAddressesError, OperationFailedError } from '../../../utils/errors.js'

import BaseConnector from './BaseConnector.js'
import PollConnector from './PollConnector.js'
import RestConnector from './RestConnector.js'

const connectors = [PollConnector, RestConnector]
export const MachineActions = ['disconnect', 'sendCode', 'upload', 'delete', 'move', 'makeDirectory', 'download', 'getFileList', 'getCommandList',  'getFileInfo']

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
		let connector = null, lastError = null;
		for (let i = 0; i < connectors.length; i++) {
			try {
				connector = await connectors[i].connect(hostname, user, password);
				lastError = null;
				break;
			} catch (e) {
				lastError = e;
				if (e instanceof LoginError) {
					// This connector could establish a connection but the firmware refused it
					break;
				}
			}
		}

		if (lastError !== null) {
			throw lastError;
		}
		return connector;
	},

	async doLogin(user, password, hostname) {
		let connector = null, lastError = null;
		for (let i = 0; i < connectors.length; i++) {
			try {
				if(connectors[i].prototype.doLogin) {
					console.log(connectors[i].prototype.doLogin);
					connector = await connectors[i].prototype.doLogin(user, password, hostname);
					lastError = null;
					break;
				}
			} catch (e) {
				lastError = e;
				if (e instanceof LoginError) {
					// This connector could establish a connection but the firmware refused it
					break;
				}
			}
		}

		if (lastError !== null) {
			throw lastError;
		}
		return connector;
	},

	async doLogout(hostname) {
		let connector = null, lastError = null;
		for (let i = 0; i < connectors.length; i++) {
			try {
				connector = await connectors[i].prototype.doLogout(hostname);
				lastError = null;
				break;
			} catch (e) {
				lastError = e;
				if (e instanceof LoginError) {
					// This connector could establish a connection but the firmware refused it
					break;
				}
			}
		}

		if (lastError !== null) {
			throw lastError;
		}
		return connector;
	},

	async doShutdown(hostname) {
		let connector = null, lastError = null;
		for (let i = 0; i < connectors.length; i++) {
			try {
				console.log(connectors[i].prototype)
				connector = await connectors[i].prototype.doShutdown(hostname);
				lastError = null;
				break;
			} catch (e) {
				lastError = e;
				if (e instanceof OperationFailedError) {
					// This connector could establish a connection but the firmware refused it
					break;
				}
			}
		}

		if (lastError !== null) {
			throw lastError;
		}
		return connector;
	},

	async doLoadAddresses(hostname) {
		let connector = null, lastError = null;
		for (let i = 0; i < connectors.length; i++) {
			try {
				connector = await connectors[i].prototype.doLoadAddresses(hostname);
				lastError = null;
				break;
			} catch (e) {
				lastError = e;
				if (e instanceof LoadAddressesError) {
					// This connector could establish a connection but the firmware refused it
					break;
				}
			}
		}

		if (lastError !== null) {
			throw lastError;
		}
		return connector;
	},


	// Install the global Vuex store
	installStore(store) {
		BaseConnector.installStore(store);
	}
}
