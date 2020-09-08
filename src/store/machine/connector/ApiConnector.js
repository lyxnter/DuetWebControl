// Polling connector for old-style status updates
'use strict'

import axios from 'axios'
import crc32 from 'turbo-crc32/crc32'
import LineReader from '../../../lynxmod/ChunkReader.js'

import i18n from '../../../i18n'
import { displaySpeed } from '../../../plugins/display.js'

import BaseConnector from './BaseConnector.js'
import { FileInfo } from '../modelItems.js'
import { FileHistory } from '../modelItems.js'
import {
	NetworkError, DisconnectedError, TimeoutError, OperationCancelledError, OperationFailedError,
	DirectoryNotFoundError, FileNotFoundError, DriveUnmountedError,
	LoginError, InvalidPasswordError, NoFreeSessionError,
	CodeResponseError, CodeBufferError
} from '../../../utils/errors.js'
import { quickPatch } from '../../../utils/patch.js'
import { bitmapToArray } from '../../../utils/numbers.js'
import { strToTime, timeToStr } from '../../../utils/time.js'

const urlAPI = 'https://192.168.1.243:8000'

export default class ApiConnector extends BaseConnector {
	static async connect(hostname, username, password) {
		let response;
		try {
			let protocol = location.protocol;
			response = await axios.get(`${urlAPI}/api/duet/action/rr_connect`, {
				params: {
					password,
					time: timeToStr(new Date())
				}
			});
		} catch (e) {
			if (e.response) {
				throw e;
			}
			throw new NetworkError();
		}

		switch (response.data.err) {
			case 0: return new ApiConnector(hostname, password, response.data);
			case 1: throw new InvalidPasswordError();
			case 2: throw new NoFreeSessionError();
			default: throw new LoginError(`Unknown err value: ${response.data.err}`)
		}
	}

	axios = null
	cancelSource = BaseConnector.getCancelSource()

	justConnected = true
	isReconnecting = false
	name = null
	password = null
	protocol = 'https'
	port = '80'
	boardType = null
	sessionTimeout = null

	updateLoopTimer = null
	updateLoopCounter = 1
	lastStatusResponse = { seq: 0 }

	pendingCodes = []
	fileTransfers = []
	layers = []
	currentFileInfo = new FileInfo()
	printStats = {}
	messageBoxShown = false;

	constructor(hostname, password,responseData) {
		super('api', hostname);
		this.password = password;
		this.boardType = responseData.boardType;
		this.sessionTimeout = responseData.sessionTimeout || 8000;	/// default timeout in RRF is 8000ms
		this.axios = axios.create({
			baseURL: `${urlAPI}/`,
			cancelToken: this.cancelSource.token,
			timeout: this.sessionTimeout,
			withCredentials: true,
		});
	}

	async reconnect() {
		// Cancel pending requests
		this.cancelSource.cancel(new DisconnectedError());
		this.fileTransfers.forEach(transfer => transfer.cancel(new DisconnectedError()));
		this.fileTransfers = [];
		this.pendingCodes.forEach(code => code.reject(new DisconnectedError()));
		this.pendingCodes = [];

		// Attempt to reconnect
		try {
			let protocol = location.protocol;
			const response = await axios.get(`${urlAPI}/api/duet/action/rr_connect`, {
				params: {
					password: this.password,
					time: timeToStr(new Date())
				},
				timeout: 2000
			});

			switch (response.data.err) {
				case 0:
				this.justConnected = true;
				this.boardType = response.data.boardType;
				this.sessionTimeout = response.data.sessionTimeout;
				this.cancelSource = BaseConnector.getCancelSource()
				this.axios.defaults.cancelToken = this.cancelSource.token;
				this.axios.defaults.timeout = response.data.sessionTimeout / (this.settings.ajaxRetries + 1)
				this.scheduleUpdate();
				break;
				case 1:
				this.dispatch('onConnectionError', new InvalidPasswordError());
				break;
				case 2:
				this.dispatch('onConnectionError', new NoFreeSessionError());
				break;
				default:
				this.dispatch('onConnectionError', new LoginError(`Unknown err value: ${response.data.err}`))
				break;
			}
		} catch (e) {
			const that = this;
			setTimeout(async function() {
				await that.reconnect();
			}, 1000);
		}
	}

	register(module) {
		super.register(module);

		// Apply axios defaults
		const that = this;
		this.axios.defaults.timeout = this.sessionTimeout / (this.settings.ajaxRetries + 1)
		this.axios.interceptors.response.use(null, error => {
			if (axios.isCancel(error)) {
				return Promise.reject(error || new OperationCancelledError());
			}

			if (error.response && error.response.status === 404) {
				console.log(error.config)
				if (!error.config.retry) {
					error.config.retry = 0;
				}

				if (error.config.retry < this.settings.ajaxRetries) {
					error.config.retry++;
					return this.axios.request(error.config);
				} else {
					return Promise.reject(new FileNotFoundError(error.config && error.config.filename));
				}
			}

			if (!that.isConnecting && !that.isReconnecting && error.config && (!error.config.isFileTransfer || error.config.data.byteLength <= this.settings.fileTransferRetryThreshold)) {
				if (!error.config.retry) {
					error.config.retry = 0;
				}

				if (error.config.retry < this.settings.ajaxRetries) {
					error.config.retry++;
					return this.axios.request(error.config);
				}
			}

			if (error.response) {
				if (error.message && error.message.startsWith('timeout')) {
					return Promise.reject(new TimeoutError());
				}
				return Promise.reject(error);
			}

			return Promise.reject(new NetworkError());
		});

		// Ideally we should be using a ServiceWorker here which would allow us to send push
		// notifications even while DWC2 is running in the background. However, we cannot do
		// this because ServiceWorkers require secured HTTP connections, which are no option
		// for standard end-users. That is also the reason why they are disabled in the build
		// script, which by default is used for improved caching
		this.scheduleUpdate();
	}

	async disconnect() {
		await this.axios.get('api/duet/action/rr_disconnect');
	}

	unregister() {
		if (this.updateLoopTimer) {
			clearTimeout(this.updateLoopTimer);
			this.updateLoopTimer = null;
		}

		this.cancelSource.cancel(new DisconnectedError());
		this.fileTransfers.forEach(transfer => transfer.cancel(new DisconnectedError()));
		this.pendingCodes.forEach(code => code.reject(new DisconnectedError()));

		super.unregister();
	}

	arraySizesDiffer(a, b) {
		if (a instanceof Array) {
			if (a.length !== b.length) {
				return true;
			}

			for (let i = 0; i < a.length; i++) {
				if (a[i] instanceof Object && b[i] instanceof Object) {
					if (this.arraySizesDiffer(a[i], b[i])) {
						return true;
					}
				}
			}
		} else if (a instanceof Object) {
			for (let key in a) {
				if (a[key] instanceof Object && b[key] instanceof Object) {
					if (this.arraySizesDiffer(a[key], b[key])) {
						return true;
					}
				}
			}
		}
		return false;
	}

	async updateLoop(requestExtendedStatus = false) {
		// Decide which type of status update to poll and request it
		const wasPrinting = ['D', 'S', 'R', 'P', 'M'].indexOf(this.lastStatusResponse.status) !== -1;
		const statusType =
		requestExtendedStatus ||
		this.justConnected ||
		(this.updateLoopCounter % this.settings.extendedUpdateEvery) === 0 ||
		(this.verbose && (this.updateLoopCounter % 2) === 0) ? 2 : (wasPrinting ? 3 : 1);
		const response = await this.axios.get(`api/duet/action/rr_status?type=${statusType}`);
		const isPrinting = ['D', 'S', 'R', 'P', 'M'].indexOf(response.data.status) !== -1;
		const newData = {};

		// Check if an extended status response needs to be polled in case machine parameters have changed
		if (statusType !== 2 && this.arraySizesDiffer(response.data, this.lastStatusResponse)) {
			await this.updateLoop(true);
			return;
		}

		// Retrieve job file information if a print has started
		if (isPrinting && (this.justConnected || !wasPrinting)) {
			this.currentFileInfo = await this.getFileInfo();
			delete this.currentFileInfo.printDuration;

			quickPatch(newData, {
				job: {
					file: this.currentFileInfo,
					layers: []
				}
			});

			this.layers = [];
			this.printStats = {
				layerHeight: this.currentFileInfo.layerHeight
			};
		}

		// Standard Status Response
		const fanRPMs = (response.data.sensors.fanRPM instanceof Array) ? response.data.sensors.fanRPM : [response.data.sensors.fanRPM];
		quickPatch(newData, {
			fans: response.data.params.fanPercent.map((fanPercent, index) => ({
				rpm: (index < fanRPMs.length && fanRPMs[index] >= 0) ? fanRPMs[index] : null,
				value: fanPercent / 100
			})),
			heat: {
				beds: [
					response.data.temps.bed ? {
						active: [response.data.temps.bed.active],
						standby: (response.data.temps.bed.standby === undefined) ? [] : [response.data.temps.bed.standby]
					} : null
				],
				chambers: [
					response.data.temps.chamber ? {
						active: [response.data.temps.chamber.active],
						standby: (response.data.temps.chamber.standby === undefined) ? [] : [response.data.temps.chamber.standby]
					} : null,
					response.data.temps.cabinet ? {
						active: [response.data.temps.cabinet.active],
						standby: (response.data.temps.cabinet.standby === undefined) ? [] : [response.data.temps.cabinet.standby]
					} : null
				],
				extra: response.data.temps.extra.map((extraHeater) => ({
					current: extraHeater.temp,
					name: extraHeater.name
				})),
				heaters: response.data.temps.current.map((current, heater) => ({
					current,
					state: response.data.temps.state[heater]
				}))
			},
			move: {
				axes: response.data.coords.xyz.map((machinePosition, drive) => ({
					homed: !!response.data.coords.axesHomed[drive],
					machinePosition
				})),
				babystepZ: response.data.params.babystep,
				currentMove: {
					requestedSpeed: (response.data.speeds !== undefined) ? response.data.speeds.requested : null,
					topSpeed: (response.data.speeds !== undefined) ? response.data.speeds.top : null
				},
				drives: [].concat(response.data.coords.xyz, response.data.coords.extr).map((xyz, drive) => ({
					position: (drive < response.data.coords.xyz.length) ? xyz : response.data.coords.extr[drive - response.data.coords.xyz.length]
				})),
				extruders: response.data.params.extrFactors.map((factor, index) => ({
					drives: [response.data.coords.xyz.length + index],
					factor: factor / 100
				})),
				speedFactor: response.data.params.speedFactor / 100
			},
			scanner: (response.data.scanner) ? {
				progress: response.data.scanner.progress,
				status: response.data.scanner.status
			} : {},
			sensors: (response.data.sensors.probeValue !== undefined) || (response.data.sensors.probeSecondary !== undefined) ? {
				probes: [
					{
						value: response.data.sensors.probeValue,
						secondaryValues: response.data.sensors.probeSecondary ? response.data.sensors.probeSecondary : []
					}
				]
			} : {},
			state: {
				atxPower: (response.data.params.atxPower === -1) ? null : (response.data.params.atxPower !== 0),
				currentTool: response.data.currentTool,
				status: this.convertStatusLetter(response.data.status)
			},
			tools: response.data.temps.tools.active.map((active, index) => ({
				active,
				standby: response.data.temps.tools.standby[index]
			}))
		});

		if (statusType === 2) {
			// Extended Status Response
			const axisNames = (response.data.axisNames !== undefined) ? response.data.axisNames.split('') : ['X', 'Y', 'Z', 'U', 'V', 'W', 'A', 'B', 'C'];
			this.name = name;
			quickPatch(newData, {
				electronics: {
					firmware: {
						name: response.data.firmwareName
					},
					mcuTemp: response.data.mcutemp ? {
						min: response.data.mcutemp.min,
						current: response.data.mcutemp.cur,
						max: response.data.mcutemp.max
					} : {},
					cpuTemp: response.data.cputemp ? {
						min: response.data.cputemp.min,
						current: response.data.cputemp.cur,
						max: response.data.cputemp.max
					} : {},
					vIn: response.data.vin ? {
						min: response.data.vin.min,
						current: response.data.vin.cur,
						max: response.data.vin.max
					} : {}
				},
				fans: newData.fans.map((fanData, index) => (
					!response.data.params.fanParameters ? {
						name: !response.data.params.fanNames ? null : response.data.params.fanNames[index],
						thermostatic: {
							control: (response.data.controllableFans & (1 << index)) === 0,
						}
					} : {
						pin: response.data.params.fanParameters[index].pin,
						frequency: response.data.params.fanParameters[index].frequency,
						inverted: response.data.params.fanParameters[index].inverted,
						min: response.data.params.fanParameters[index].min/100,
						max: response.data.params.fanParameters[index].max/100,
						blip: response.data.params.fanParameters[index].blip,
						name: response.data.params.fanNames[index],
						thermostatic: {
							control: (response.data.controllableFans & (1 << index)) === 0,
							heaters: !response.data.params.fanParameters[index].heaters ? [] : response.data.params.fanParameters[index].heaters.toString(2).split('').reverse().map((x,i) => (x == 1 ? (i >= 8 ? (100 + (i-8)) : i) : undefined)).filter((i) => i != undefined),
							temperature: response.data.params.fanParameters[index].temperature,
						}
					})),
					heat: {
						// FIXME-FW: 'heater' should not be part of the standard status response
						beds: [
							response.data.temps.bed ? {
								heaters: [response.data.temps.bed.heater]
							} : null
						],
						chambers: [
							response.data.temps.chamber ? {
								heaters: [response.data.temps.chamber.heater]
							} : null,
							response.data.temps.cabinet ? {
								heaters: [response.data.temps.cabinet.heater]
							} : null
						],
						coldExtrudeTemperature: response.data.coldExtrudeTemp,
						coldRetractTemperature: response.data.coldRetractTemp,
						heaters: response.data.temps.current.map((current, index) => ({
							max: response.data.tempLimit,
							name: (response.data.temps.names !== undefined) ? response.data.temps.names[index] : null
						}))
					},
					move: {
						axes: response.data.coords.xyz.map((position, index) => ({
							letter: axisNames[index],
							visible: (response.data.axes !== undefined) ? (index < response.data.axes) : true
						})),
						compensation: response.data.compensation,
						geometry: {
							type: response.data.geometry
						}
					},
					network: {
						name: response.data.name
					},
					sensors: {
						endstops: newData.move.drives.map((drive, index) => ({
							triggered: (response.data.endstops & (1 << index)) !== 0
						})),
						probes: (response.data.probe !== undefined) ? [
							{
								threshold: response.data.probe.threshold,
								triggerHeight: response.data.probe.height,
								type: response.data.probe.type
							}
						] : []
					},
					state: {
						mode: response.data.mode ? response.data.mode : null,
						heightmap: response.data.loadedheightmap
					},
					tools: (response.data.tools !== undefined) ? response.data.tools.map(tool => ({
						number: tool.number,
						name: tool.name ? tool.name : null,
						heaters: tool.heaters,
						extruders: tool.drives,
						axes: tool.axisMap,
						fans: bitmapToArray(tool.fans),
						filament: tool.filament,
						offsets: tool.offsets,
						mix: tool.mix
					})) : []
				});

				newData.storages = [];
				for (let i = 0; i < response.data.volumes; i++) {
					newData.storages.push({
						mounted: (response.data.mountedVolumes & (1 << i)) !== 0
					});
				}
			} else if (statusType === 3) {
				// Print Status Response
				newData.job  = {
					file: {},
					filePosition: response.data.filePosition,
					extrudedRaw: response.data.extrRaw
				}

				// Update some stats only if the print is still live
				if (isPrinting) {
					quickPatch(newData.job, {
						duration: response.data.printDuration,
						layer: response.data.currentLayer,
						layerTime: response.data.currentLayerTime,
						warmUpDuration: response.data.warmUpDuration,
						timesLeft: {
							file: response.data.timesLeft.file,
							filament: response.data.timesLeft.filament,
							layer: response.data.timesLeft.layer
						}
					});
				} else {
					quickPatch(newData.job, {
						layerTime: null,
						timesLeft: {
							file: null,
							filament: null,
							layer: null
						}
					});
				}

				// See if we need to record more layer stats
				if (response.data.currentLayer > this.layers.length) {
					let addLayers = false;
					if (!this.layers.length) {
						// Is the first layer complete?
						if (response.data.currentLayer > 1) {
							this.layers.push({
								duration: response.data.firstLayerDuration,
								height: this.currentFileInfo.firstLayerHeight,
								filament: (response.data.currentLayer === 2) ? response.data.extrRaw.filter(amount => amount > 0) : null,
								fractionPrinted: (response.data.currentLayer === 2) ? response.data.fractionPrinted / 100 : null
							});
							newData.job.layers = this.layers;

							// Keep track of the past layer
							if (response.data.currentLayer === 2) {
								this.printStats.duration = response.data.warmUpDuration + response.data.firstLayerDuration;
								this.printStats.extrRaw = response.data.extrRaw;
								this.printStats.fractionPrinted = response.data.fractionPrinted;
								this.printStats.measuredLayerHeight = response.data.coords.xyz[2] - this.currentFileInfo.firstLayerHeight;
								this.printStats.zPosition = response.data.coords.xyz[2];
							} else if (response.data.currentLayer > this.layers.length + 1) {
								addLayers = true;
							}
						}
					} else if (response.data.currentLayer > this.layers.length + 1) {
						// Another layer is complete, add it
						addLayers = true;
					}

					if (addLayers) {
						const layerJustChanged = (response.data.status === 'M') || ((response.data.currentLayer - this.layers.length) === 2);
						if (this.printStats.duration) {
							// Got info about the past layer, add what we know
							this.layers.push({
								duration: response.data.printDuration - this.printStats.duration,
								height: this.printStats.measuredLayerHeight ? this.printStats.measuredLayerHeight : this.printStats.layerHeight,
								filament: response.data.extrRaw.map((amount, index) => amount - this.printStats.extrRaw[index]).filter((dummy, index) => response.data.extrRaw[index] > 0),
								fractionPrinted: (response.data.fractionPrinted - this.printStats.fractionPrinted) / 100
							});
						} else {
							// Interpolate data...
							const avgDuration = (response.data.printDuration - response.data.warmUpDuration - response.data.firstLayerDuration - response.data.currentLayerTime) / (response.data.currentLayer - 2);
							for (let layer = this.layers.length; layer + 1 < response.data.currentLayer; layer++) {
								this.layers.push({ duration: avgDuration });
							}
							this.printStats.zPosition = response.data.coords.xyz[2];
						}
						newData.job.layers = this.layers;

						// Keep track of the past layer if the layer change just happened
						if (layerJustChanged) {
							this.printStats.duration = response.data.printDuration;
							this.printStats.extrRaw = response.data.extrRaw;
							this.printStats.fractionPrinted = response.data.fractionPrinted;
							this.printStats.measuredLayerHeight = response.data.coords.xyz[2] - this.printStats.zPosition;
							this.printStats.zPosition = response.data.coords.xyz[2];
						}
					}
				}
			}

			// Remove unused chamber heaters
			while (newData.heat.chambers.length > 0 && newData.heat.chambers[newData.heat.chambers.length - 1] === null) {
				newData.heat.chambers.pop();
			}

			// Output Utilities
			let beepFrequency = 0, beepDuration = 0, displayMessage = "", msgBoxMode = null;
			if (response.data.output) {
				// Beep
				if (response.data.output.hasOwnProperty("beepFrequency")) {
					beepFrequency = response.data.output.beepFrequency;
					beepDuration = response.data.output.beepDuration;
				}

				// Persistent Message
				if (response.data.output.hasOwnProperty("message")) {
					displayMessage = response.data.output.message;
				}

				// Message Box
				const msgBox = response.data.output.msgBox;
				if (msgBox) {
					msgBoxMode = msgBox.mode;
					quickPatch(newData, {
						messageBox: {
							title: msgBox.title,
							message: msgBox.msg,
							timeout: msgBox.timeout,
							axisControls: bitmapToArray(msgBox.controls),
							seq: msgBox.seq
						}
					});
				}
			}

			quickPatch(newData, {
				messageBox: {
					mode: msgBoxMode
				},
				state: {
					beep: {
						frequency: beepFrequency,
						duration: beepDuration
					},
					displayMessage: displayMessage
				}
			});

			// Spindles
			if (response.data.spindles) {
				quickPatch(newData, {
					spindles: response.data.spindles.map(spindle => ({
						active: spindle.active,
						current: spindle.current
					}))
				});

				response.data.spindles.forEach((spindle, index) => {
					newData.tools.find(tool => tool.number === spindle.tool).spindle = index;
				});
			}

			// See if we need to pass some info from the connect response
			if (this.justConnected) {
				quickPatch(newData, {
					electronics: {
						type: this.boardType
					},
					network: {
						password: this.password
					}
				});
			}

			// Update the data model
			await this.dispatch('update', newData);

			// Check if the G-code response needs to be polled
			if (response.data.seq !== this.lastStatusResponse.seq) {
				await this.getGCodeReply(response.data.seq);
			}

			// Check if the firmware rebooted
			if (!this.justConnected && response.data.time < this.lastStatusResponse.time) {
				this.pendingCodes.forEach(code => code.reject(new DisconnectedError()));
				this.pendingCodes = [];
			}

			// Sometimes we need to update the config as well
			if (requestExtendedStatus || this.justConnected || (this.verbose && this.updateLoopCounter % 2 === 0)) {
				await this.getConfigResponse();
			}

			// Schedule next status update
			this.lastStatusResponse = response.data;
			this.isReconnecting = (response.data.status === 'F') || (response.data.status === 'H');
			this.justConnected = false;
			this.updateLoopCounter++;
			this.scheduleUpdate();
		}
		convertStatusLetter(letter) {
			switch (letter) {
				case 'F': return 'updating';
				case 'O': return 'off';
				case 'H': return 'halted';
				case 'D': return 'pausing';
				case 'S': return 'paused';
				case 'R': return 'resuming';
				case 'P': return 'processing';
				case 'M': return 'simulating';
				case 'B': return 'busy';
				case 'T': return 'changingTool';
				case 'I': return 'idle';
			}
			return 'unknown';
		}
		async scheduleUpdate() {
			if (this.justConnected || this.updateLoopTimer) {
				const that = this;
				// Perform status update
				this.updateLoopTimer = setTimeout(async function() {
					try {
						/* eslint-disable no-useless-call */
						await that.updateLoop.call(that);
					} catch (e) {
						if (!(e instanceof DisconnectedError)) {
							if (that.isReconnecting) {
								that.updateLoopTimer = undefined;
								that.reconnect();
							} else {
								console.warn(e);
								that.dispatch('onConnectionError', e);
							}
						}
					}
				}, this.settings.updateInterval);
				//await that.updateLoop.call(that);
			}
		}
		// Call this only from updateLoop()
		async getGCodeReply(seq = this.lastStatusResponse.seq) {
			const response = await this.axios.get('api/duet/action/rr_reply', {
				responseType: 'arraybuffer' 	// responseType: 'text' is broken, see https://github.com/axios/axios/issues/907
			});
			const reply = Buffer.from(response.data).toString().trim();

			// TODO? Check for special JSON responses generated by M119, see DWC1
			// Probably makes sense only as soon as the settings update notifications are working again

			if (!this.pendingCodes.length) {
				// Just log this response
				this.dispatch('onCodeCompleted', { code: undefined, reply });
			} else {
				// Resolve pending code promises
				this.pendingCodes.forEach(function(code) {
					if (code.seq < seq) {
						code.resolve(reply);
						this.dispatch('onCodeCompleted', { code, reply });
					}
				}, this);
				this.pendingCodes = this.pendingCodes.filter(code => code.seq >= seq);
			}
		}
		// get tools configuration
		async getConfigTools() {

			let datasTools = [];
			let results;
			await this.axios
			.get('api/duet/action/pc_configtools')
			.then(response => (results = response.data))
			.catch(error => console.log(error));

			if (results) {
				for (var i = 0; i < results.length; i++) {
					datasTools.push(results[i]);
				}
			}

			return datasTools;
		}
		// Call this only from updateLoop()
		async getConfigResponse() {
			const response = await this.axios.get('api/duet/action/rr_config');
			const configData = {
				electronics: {
					name: response.data.firmwareElectronics,
					firmware: {
						name: response.data.firmwareName,
						version: response.data.firmwareVersion,
						date: response.data.firmwareDate
					}
				},
				move: {
					axes: response.data.axisMins.map((min, index) => ({
						min,
						max: response.data.axisMaxes[index]
					})),
					drives: response.data.currents.map((current, index) => ({
						current,
						acceleration: response.data.accelerations[index],
						minSpeed: response.data.minFeedrates[index],
						maxSpeed: response.data.maxFeedrates[index]
					})),
					idle: {
						factor: response.data.idleCurrentFactor,
						timeout: response.data.idleTimeout
					}
				},
				network: {
					interfaces: [
						{
							type: (response.data.dwsVersion !== undefined) ? 'wifi' : 'lan',
							firmwareVersion: response.data.dwsVersion
							// Unfortunately we cannot populate anything else here yet
						}
					]
				}
			};

			await this.dispatch('update', configData);
		}
		async sendCode(code) {
			const response = await this.axios.get('api/duet/action/rr_gcode', {
				params: { gcode: code }
			});

			if (response.data.buff === undefined) {
				console.warn(`Received bad response for rr_gcode: ${JSON.stringify(response.data)}`);
				throw new CodeResponseError();
			}
			if (response.data.buff === 0) {
				throw new CodeBufferError();
			}

			const pendingCodes = this.pendingCodes, seq = this.lastStatusResponse.seq;
			return new Promise((resolve, reject) => pendingCodes.push({ seq, resolve, reject }));
		}
		upload({ filename, content, cancelSource = axios.cancelToken.source(), onProgress }) {
			const that = this;
			return new Promise(async function(resolve, reject) {
				// Create upload options
				const payload = (content instanceof(Blob)) ? content : new Blob([content]);
				const options = {
					cancelToken: cancelSource.token,
					isFileTransfer: true,
					onUploadProgress: onProgress,
					params: {
						name: filename,
						time: timeToStr(content.lastModified ? new Date(content.lastModified) : new Date())
					},
					timeout: 0,
					transformRequest(data, headers) {
						delete headers.post['Content-Type'];
						return data;
					}
				};

				// Check if the CRC32 checksum is required
				if (that.settings.crcUploads) {
					const checksum = await new Promise(async function(resolve) {
						const fileReader = new FileReader();
						fileReader.onload = function(e){
							const result = crc32(e.target.result);
							resolve(result);
						}
						fileReader.readAsArrayBuffer(payload);
					});

					options.params.crc32 = checksum.toString(16);
				}

				if (Math.ceil(payload.size/(4*1024*1024)) > 1 && !filename.endsWith('.zip')) {
					let totalCount = 0, instructionPos = -1, startTime = new Date();
					let lineReader = Object.assign(LineReader.methods, LineReader.data);
					document.querySelector('div.iziToast-progressbar').style.height = "5px"
					document.querySelector('div.iziToast-progressbar > div').style.height = "5px"
					document.getElementById("fileProgress").style.transition = 'width 2s linear';

					options.params.parts = Math.ceil(payload.size/(4*1024*1024))
					options.onUploadProgress = function(e) {
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
						var elt = ((new Date() - startTime)/((instructionPos+e.loaded)/payload.size));
						var ert = elt * (1-((instructionPos + e.loaded)/payload.size));

						const uploadSpeed = (instructionPos + e.loaded) / (((new Date()) - startTime) / 1000), progress = ((instructionPos + e.loaded) / payload.size) * 100;
						document.querySelector('strong.iziToast-title').textContent = i18n.t(`notification.upload.title`, [filename.substring(filename.lastIndexOf('/')+1, filename.lastIndexOf('.')), displaySpeed(uploadSpeed), Math.round(progress), toHMS(Math.round(ert/1000), true)]);
						document.querySelector('div.iziToast-progressbar > div').style.width = progress.toFixed(1) + '%';

						document.getElementById("pleft").innerHTML = i18n.t('notification.parse.eta', [toHMS(Math.round(ert/1000), true)]);
						document.getElementById("fileProgress").style.width = progress + "%"
						document.getElementById("pspeed").innerHTML = i18n.t('notification.parse.speed',
						[displaySpeed(uploadSpeed), ""]);
					}
					lineReader.LineReader({chunkSize: 4*1024*1024})

					let myResponse;
					lineReader.on('line', function(line, next) {

						if (line) {
							totalCount++;
						}
						//line = send(line, self.lineReader.offset);
						const payload = (line instanceof(Blob)) ? line : new Blob([line])
						options.cancelToken = undefined;
						try {
							// Create file transfer and start it
							options.params.part = totalCount
							that.axios.post('api/duet/action/rr_upload', payload, options)
							.then(function(response) {
								instructionPos = lineReader.GetReadPos();
								myResponse = response;
								setTimeout(next);
							})
						} catch (e) {
							reject(e);
						}
						//next();
					});

					lineReader.on('abort', function(abo) {
						console.warn("read aborted");
						console.warn(abo);
					})

					lineReader.on('error', function(err) {
						console.error(err);
					});

					lineReader.on('end', function() {
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

						console.log("Read complete!\n" + totalCount + " chunks sent")
						document.querySelector('.iziToast-wrapper').innerHTML = "";

						document.getElementById("progress").style.transition = 'width ' + Math.max(Math.floor(payload.size/(750*1024)), 10) + 's linear';
						document.getElementById("progress").style.width = '100%'
						document.getElementById("pleft").innerHTML = i18n.t('notification.parse.eta', [toHMS(Math.max(Math.floor(payload.size/(750*1024)), 10), true)]);
						document.getElementById("pspeed").innerHTML = i18n.t('notification.parse.speed',
						[displaySpeed((Math.round(200*Math.random()) + 500)*1024), ""]);

						if (myResponse.data.err === 0) {
							that.dispatch('onFileUploaded', { filename, content });
							resolve(myResponse.data);
						} else {
							reject(new OperationFailedError(`err ${myResponse.data.err}`));
						}
					});

					document.getElementById("progress").style.transition = 'width 4s linear';
					lineReader.read(payload);
				} else {
					try {
						// Create file transfer and start it
						that.axios.post('api/duet/action/rr_upload', payload, options)
						.then(function(response) {
							if (response.data.err === 0) {
								//that.dispatch('onFileUploaded', { filename, content });
								resolve(response.data);
							} else {
								reject(new OperationFailedError(`err ${response.data.err}`));
							}
						})
						.catch(reject)
						.then(function() {
							that.fileTransfers = that.fileTransfers.filter(item => item !== cancelSource);
						});

						// Keep it in the list of transfers
						that.fileTransfers.push(cancelSource);
					} catch (e) {
						reject(e);
					}
				}
			});
		}
		async delete(filename) {
			const response = await this.axios.get('api/duet/action/rr_delete', {
				params: { name: filename }
			});

			if (response.data.err) {
				throw new OperationFailedError(`err ${response.data.err}`);
			}

			await this.dispatch('onFileOrDirectoryDeleted', filename);
		}
		async move({ from, to, force, silent }) {
			const response = await this.axios.get('api/duet/action/rr_move', {
				params: {
					old: from,
					new: to,
					deleteexisting: force ? 'yes' : 'no'
				}
			});

			if (!silent) {
				if (response.data.err) {
					throw new OperationFailedError(`err ${response.data.err}`);
				}

				await this.dispatch('onFileOrDirectoryMoved', { from, to, force });
			}
		}
		async makeDirectory(directory) {
			const response = await this.axios.get('api/duet/action/rr_mkdir', {
				params: { dir: directory }
			});

			if (response.data.err) {
				throw new OperationFailedError(`err ${response.data.err}`);
			}

			await this.dispatch('onDirectoryCreated', directory);
		}
		download(payload) {
			const filename = (payload instanceof Object) ? payload.filename : payload;
			const type = (payload instanceof Object) ? payload.type : undefined;
			const cancelSource = (payload instanceof Object && payload.cancelSource) ? payload.cancelSource : BaseConnector.getCancelSource();
			const onProgress = (payload instanceof Object) ? payload.onProgress : undefined;

			const that = this;
			return new Promise(function(resolve, reject) {
				// Create download options
				const options = {
					cancelToken: cancelSource.token,
					responseType: (type === 'text') ? 'arraybuffer' : type,	// responseType: 'text' is broken, see https://github.com/axios/axios/issues/907
					isFileTransfer: true,
					onDownloadProgress: onProgress,
					params: {
						name: filename
					},
					timeout: 0
				};

				try {
					// Create file transfer and start it
					that.axios.get('api/duet/action/rr_download', options)
					.then(function(response) {
						if (type === 'text') {
							// see above...
							response.data = Buffer.from(response.data).toString();
						}
						resolve(response.data);
						that.dispatch('onFileDownloaded', { filename, content: response.data });
					})
					.catch(reject)
					.then(function() {
						that.fileTransfers = that.fileTransfers.filter(item => item !== cancelSource);
					});

					// Keep it in the list of transfers and return the promise
					that.fileTransfers.push(cancelSource);
				} catch (e) {
					reject(e);
				}
			});
		}
		async getFileList(directory, recursive) {
			if (typeof(directory) === typeof({})){
				recursive = directory.recursive;
				directory = directory.dir;
			}

			let fileList = [], next = 0;
			do {
				const response = await this.axios.get('api/duet/action/rr_filelist', {
					params: {
						dir: directory,
						first: next
					}
				});

				if (response.data.err === 1) {
					throw new DriveUnmountedError();
				} else if (response.data.err === 2) {
					throw new DirectoryNotFoundError(directory);
				}

				fileList = fileList.concat(response.data.files);
				next = (response.data.next?response.data.next:0);
			} while (next !== undefined && next !== 0 || (fileList.length == 1 && fileList[0] == null));
			fileList = fileList.filter(file => file != null)
			//console.log(fileList)

			let directories = fileList.filter(file => (file.type === "d"));
			if (directories.length > 0 && recursive) {
				for (var i = 0; i < directories.length; i++){
					let item = directories[i];
					fileList = fileList.concat(await this.getFileList(directory + "/" + item.name, recursive))
				}
				//console.log(fileList);
			}

			return fileList.map(item => ({
				isDirectory: item.isDirectory || item.type === 'd',
				name: item.name,
				size: (item.type === 'd') ? null : item.size,
				directory: item.directory ? item.directory : directory,
				lastModified: item.lastModified ? item.lastModified : strToTime(item.date),
				userModified: item.userModified,
				id: item.id
			}));
		}
		async getFileInfo(filename) {
			const response = await this.axios.get('api/duet/action/rr_fileinfo', {
				params: filename ? { name: filename } : {}
			});

			if (response.data.err) {
				throw new OperationFailedError(`err ${response.data.err}`);
			}
			delete response.data.err;
			let info = new FileInfo(response.data);
			return info
		}
		async getFileHistory(id) {
			let fileHistoryList = [];
			let results;
			await this.axios
			.get('api/duet/action/rr_filehistory', {
				params: id ? { id: id } : {}
			})
			.then(response => (results = response.data))
			.catch(error => console.log(error));

			if (results) {
				for (var i = 0; i < results.length; i++) {
					fileHistoryList.push(new FileHistory(results[i]));
				}
			}
			return fileHistoryList;

		}
		async doLogin(login, password, hostname) {
			if (!this.axios){
				let protocol = location.protocol;
				this.axios = await axios.create({
					baseURL:`${protocol}//`+hostname+`/`,
					cancelToken: BaseConnector.getCancelSource().token,
					timeout: 8000,	// default session timeout in RepRapFirmware
					withCredentials: true,
				});
			}
			const response = await this.axios.get('api/duet/action/pc_login', {
				withCredentials: true,
				params: { username: login, password: password }
			});

			if (response.data.err) {
				throw new OperationFailedError(`err ${response.data.err}`);
			}
			return response;
		}
		async doLogout(hostname) {
			if (!this.axios){
				let protocol = location.protocol;
				this.axios = await axios.create({
					baseURL:`${protocol}//`+hostname+`/`,
					cancelToken: BaseConnector.getCancelSource().token,
					timeout: 8000,	// default session timeout in RepRapFirmware
					withCredentials: true,
				});
			}
			const response = await this.axios.get('api/duet/action/pc_logout', {
				withCredentials: true,
				params: {}
			});

			if (response.data.err) {
				throw new OperationFailedError(`err ${response.data.err}`);
			}
			return response;
		}
		async doShutdown(hostname) {
			if (!this.axios){
				let protocol = location.protocol;
				this.axios = await axios.create({
					baseURL:`${protocol}//`+hostname+`/`,
					cancelToken: BaseConnector.getCancelSource().token,
					timeout: 8000,	// default session timeout in RepRapFirmware
					withCredentials: true,
				});
			}
			const response = await this.axios.get('api/duet/action/pc_shutdown', {
				withCredentials: true,
				params: {}
			});

			if (response.data.err) {
				throw new OperationFailedError(`err ${response.data.err}`);
			}
			return response;
		}
		async doLoadAddresses(hostname) {

			if (!this.axios){
				let protocol = location.protocol;
				this.axios = await axios.create({
					baseURL:`${urlAPI}`,
					cancelToken: BaseConnector.getCancelSource().token,
					timeout: 8000,	// default session timeout in RepRapFirmware
					withCredentials: true,
				});
			}

			const response = await this.axios.get('api/duet/action/pc_getip', {
				withCredentials: true,
				params: {}
			});

			if (response.data.err) {
				throw new OperationFailedError(`err ${response.data.err}`);
			}
			return response;
		}
	}
