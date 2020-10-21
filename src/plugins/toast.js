'use strict'

import iziToast from 'izitoast'
import 'izitoast/dist/css/iziToast.css'

import { displaySpeed } from './display.js'

import i18n from '../i18n'
import { OperationCancelledError } from '../utils/errors.js'
import { extractFileName } from '../utils/path.js'

const defaults = {
	layout: 2,
	transitionIn: 'fadeInLeft',
	transitionOut: 'fadeOutRight'
}

let settings, openNotifications = []

export function makeNotification(type, title, message = '', timeout) {
	//console.log({type:type, title:title, message:message, timeout:timeout})
	// If there is already an equal notification, reset its time and don't display a new one
	const equalNotification = openNotifications.find(item => item.type === type && item.title == title && item.message === message);

	if (equalNotification) {
		equalNotification.resetTimeout();
		return equalNotification;
	}
	// Prepare and show new toast
	const item = {}, options = Object.assign({
		class: 'new-toast',
		title: title.replace(/\n/g, '<br>'),
		message: message ? message.replace(/\n/g, '<br>') : '',
		onClosed() {
			openNotifications = openNotifications.filter(notification => notification !== item);
		},
		timeout: (timeout !== undefined) ? timeout : ((type === 'error' && settings.errorsPersistent) ? 0 : settings.timeout)
	}, defaults);

	switch (type) {
		case 'info':
		iziToast.info(options);
		break;
		case 'success':
		iziToast.success(options);
		break;
		case 'warning':
		iziToast.warning(options);
		break;
		case 'error':
		iziToast.error(options);
		break;
	}

	// Get the new toast instance (iziToast does not return it)
	const toast = document.querySelector('.new-toast');
	toast.classList.remove('new-toast');

	// Fix layout of the created toast (by default layout 2 toasts are too wide)
	if (message) {
		const messageElement = toast.querySelector('p.iziToast-message');
		messageElement.style.width = 'auto';
		messageElement.parentNode.insertBefore(document.createElement('br'), messageElement);
	}

	item.type = type;
	item.title = title;
	item.message = message;
	item.timeout = timeout;
	item.domElement = toast;
	item.hide = function() {
		iziToast.hide({}, toast);
		openNotifications = openNotifications.filter(notification => notification !== item);
	};
	item.resetTimeout = function() {
		iziToast.progress(options, toast).reset();
	};

	openNotifications.push(item);
	return item;
}

var startTime
export function makeFileTransferNotification(type, destination, cancelSource, num, count) {
	const filename = extractFileName(destination), titlePrefix = count ? ` (${num}/${count}) ` : '';
	//console.log(destination, filename)
	// Prepare toast
	iziToast.info({
		class: 'file-transfer',
		title: titlePrefix  + i18n.t(`notification.${type}.title`, [filename, 0, 0]),
		message: i18n.t(`notification.${type}.message`),
		layout: 2,
		timeout: false,
		onClosing: () => cancelSource.cancel(new OperationCancelledError())
	});

	// Get it and fix up the layout
	const toast = document.querySelector('.file-transfer');
	toast.classList.remove('file-transfer');

	const messageElement = toast.querySelector('p.iziToast-message');
	messageElement.style.width = 'auto';
	messageElement.parentNode.insertBefore(document.createElement('br'), messageElement);

	// Get progress bar
	const title = toast.querySelector('strong.iziToast-title');
	const progressBar = toast.querySelector('div.iziToast-progressbar > div');
	progressBar.style.width = '0%';

	// Return object with enough info about it
	if (!count || num == 1 || !startTime) {
		startTime = new Date();
	}

	if (destination.startsWith("0:/gcodes")) {
		//console.log("toast", toast)
		document.getElementById("fileProgress").style.transition = '';
		document.getElementById("fileProgress").style.width = "0"
		if (document.getElementById("uploadDiv").style.display != "")
			document.getElementById("uploadDiv").style.display = ""
		if (!count || num == 1) {
			document.getElementById("fileProgress").style.transition = 'width 0.25s linear';
			document.getElementById("progress").style.transition = '';
			document.getElementById("uploadDiv").style.display = ""
			document.getElementById("progress").style.width = "0"
		}
		document.getElementById("fname").innerHTML = i18n.t('notification.parse.title',
		[filename + (count ? `(${num}/${count}) ` : '')]);
		document.getElementById("progress").style.transition = 'width 0.25s linear';
		toast.style.display = "none"
		//console.log(iziToast.hide().toString())
	}
	return {
		domElement: toast,
		onProgress(e) {
			function toHMS(delta, toStr) {
				var sec = delta % 60,
				min = (delta = (delta - sec) / 60) % 60,
				hour = (delta = (delta - min) / 60) % 24,
				day = delta = (delta - hour) / 24;
				if (toStr) {
					var strTime = day + "d "
					+ hour + "h "
					+ ( min < 10 ? "0" : "" ) + min + "m "
					+ ( sec < 10 ? "0" : "" ) + sec + "s";
					return strTime = strTime.replace(/(?:0. )+/, "")
				}
				return {
					d: day,
					h: hour,
					m: min,
					s: sec
				}
			}

			const uploadSpeed = e.loaded / (((new Date()) - startTime) / 1000);
			const progress = (count ? (((e.loaded/count) / e.total) + ((num-1)/count)) : (e.loaded/ e.total)) * 100;

			var elt
			var ert
			if (count) {
				elt = ((new Date() - startTime)/(num/count));
				ert = elt * (1-(num/count));
			} else {
				elt = ((new Date() - startTime)/(e.loaded/e.total));
				ert = elt * (1-(e.loaded/e.total));
			}


			if (destination.startsWith("0:/gcodes")) {
				//console.log("progress")

				document.getElementById("pleft").innerHTML = i18n.t('notification.parse.eta', [toHMS(Math.round(ert/1000), true)]);

				if (count) {
					document.getElementById("fileProgress").style.width = ((e.loaded/ e.total) * 100) + '%'
				}
				document.getElementById("progress").style.width = progress + '%'
				document.getElementById("pspeed").innerHTML = i18n.t('notification.parse.speed',
				[displaySpeed(uploadSpeed), ""]);
			}

			title.textContent = titlePrefix + i18n.t(`notification.${type}.title`, [filename, displaySpeed(uploadSpeed), Math.round(progress), toHMS(Math.round(ert/1000), true)]);
			progressBar.style.width = progress.toFixed(1) + '%';
		},
		hide() {
			iziToast.hide({}, toast);
			if(num && count && num == count) {
				console.log(num, count)
				document.getElementById("uploadDiv").style.display = "none";
				startTime = 0;
			}

		}
	}
}

export function showMessage(message) {
	const options = Object.assign({
		title: i18n.t('notification.message'),
		message: message.replace(/\n/g, '<br/>'),
		timeout: false
	}, defaults);

	iziToast.info(options);
}

export default {
	install(Vue) {
		Vue.prototype.$makeNotification = makeNotification;
		Vue.prototype.$makeFileTransferNotification = makeFileTransferNotification;
		Vue.prototype.$showMessage = showMessage;
	},

	installStore(store) {
		settings = store.state.settings.notifications;
	}
}
