'use strict'

import { makeNotification } from './toast.js'

import i18n from '../i18n'
import { defaultMachine } from '../store/machine'

let store

export function log(type, title, message, hostname = store.state.selectedMachine) {
	makeNotification(type, title, message);
	store.commit(`machines/${hostname}/log`, { date: new Date(), type, title, message });
}

// eslint-disable-next-line
export function logCode(code = '', response, hostname = store.state.selectedMachine, fromInput = false) {
	if (!code && !response) {
		// Make sure there is something to log...
		return;
	}

	let seq = 0;
	response = response.split(/([0-9]+: )/gm).map((item, index) => {
		if (index%2) {
			if (item == seq+1 || seq == 0) {
				//console.log(seq, parseInt(item))
				seq = parseInt(item)
				return ""
			} else if (item.includes(seq+1)) {
				let out = item.substr(0,item.indexOf((seq+1).toFixed(0)))
				//console.log(seq, parseInt(item.substr(item.indexOf(seq+1))))
				seq = parseInt(parseInt(item.substr(item.indexOf(seq+1))))
				console.log(out)
				return out
			} else {
				return item
			}
		} else {
			return item
		}
	}
	).join('')
	if (response.startsWith('{')) {
		try {
		  response = JSON.parse(response)
			//{"prefix": "Progress:" , "bar" : "██████▏-------------------------------------------",  "percent": 12.26, "suffix" : "Complete"}
			console.log(response)
			code = response.prefix
			response = " |" + response.bar + "| " + response.percent + "% " + response.suffix
		} catch (e) {
		  console.error("Parsing error:", e);
		}
	}

// Determine type
let type = 'info', toLog = response;
if (response.startsWith('Error: ')) {
	type = 'error';
	toLog = response.substr(7);
} else if (response.startsWith('Warning: ')) {
	type = 'warning';
	toLog = response.substr(9);
} else if (response === '') {
	type = 'success';
}

// Log it
const responseLines = toLog.split("\n")
if (hostname === store.state.selectedMachine) {
	let title = code, message = responseLines.join('<br>');
	if (responseLines.length > 3) {
		title = (code === '') ? i18n.t('notification.responseTooLong') : code;
		message = (code === '') ? '' : i18n.t('notification.responseTooLong');
	} else if (code === '') {
		title = responseLines[0];
		message = responseLines.slice(1).join('<br>');
	}

	makeNotification(type, title, message);
}
store.commit(`machines/${hostname}/log`, { date: new Date(), type, title: code, message: response });
}

export function logGlobal(type, title, message) {
	if (store.state.selectedMachine !== defaultMachine) {
		log(type, title, message);
	} else {
		makeNotification(type, title, message);
	}
	store.commit(`machines/${defaultMachine}/log`, { date: new Date(), type, title, message });
}

export default {
	install(Vue) {
		Vue.prototype.$log = log;
		Vue.prototype.$logCode = logCode;
		Vue.prototype.$logGlobal = logGlobal;
	},

	installStore(storeInstance) {
		store = storeInstance;
	}
}
