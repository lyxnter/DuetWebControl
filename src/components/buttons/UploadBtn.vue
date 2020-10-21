<template>
	<div>
		<v-btn v-bind="$props" @click="chooseFile" :disabled="$props.disabled || !canUpload" :loading="isBusy" :title="$t(`button.upload['${target}'].title`)" :color="innerColor" @dragover="dragOver" @dragleave="dragLeave" @drop.prevent.stop="dragDrop" tabindex="0">
			<template slot="loader">
				<v-progress-circular indeterminate :size="23" :width="2" class="mr-2"></v-progress-circular>
				{{ caption }}
			</template>
			<v-icon class="mr-2">cloud_upload</v-icon> {{ caption }}
		</v-btn>

		<input ref="fileInput" type="file" :accept="accept" hidden @change="fileSelected" multiple>
		<confirm-dialog :shown.sync="confirmUpdate" :question="$t('dialog.update.title')" :prompt="$t('dialog.update.prompt')" @confirmed="startUpdate"></confirm-dialog>
	</div>
</template>

<script>
'use strict'

import JSZip from 'jszip'
import VBtn from 'vuetify/es5/components/VBtn'

import { mapState, mapGetters, mapActions } from 'vuex'
import Path from '../../utils/path.js'
let GcodeReader = require('../../lynxmod/gcode_reader.js');

const webExtensions = ['.htm', '.html', '.ico', '.xml', '.css', '.map', '.js', '.ttf', '.eot', '.svg', '.woff', '.woff2', '.jpeg', '.jpg', '.png']

export default {
	computed: {
		...mapState(['isLocal', 'selectedMachine']),
		...mapState('machine/model', ['electronics']),
		...mapGetters(['isConnected', 'uiFrozen']),
		...mapGetters('machine/model', ['board']),
		caption() {
			if (this.extracting) {
				return this.$t('generic.extracting');
			}
			if (this.uploading) {
				return this.$t('generic.uploading');
			}
			return this.$t(`button.upload['${this.target}'].caption`);
		},
		canUpload() {
			return this.isConnected && !this.uiFrozen;
		},
		accept() {
			switch (this.target) {
				case 'gcodes': return '.g,.gcode,.gc,.gco,.nc,.ngc,.tap';
				case 'start': return '.g,.gcode,.gc,.gco,.nc,.ngc,.tap';
				case 'macros': return '*';
				case 'filaments': return '.zip';
				case 'display': return '*';
				case 'sys': return '.zip,.bin,.json,.g,.csv';
				case 'www': return '.zip,.csv,.json,.htm,.html,.ico,.xml,.css,.map,.js,.ttf,.eot,.svg,.woff,.woff2,.jpeg,.jpg,.png,.gz';
				case 'update': return '.zip,.bin';
			}
			return undefined;
		},
		destinationDirectory() {
			if (this.directory) {
				return this.directory;
			}

			switch (this.target) {
				case 'gcodes': return Path.gcodes;
				case 'start': return Path.gcodes;
				case 'macros': return Path.macros;
				case 'filaments': return Path.filaments;
				case 'display': return Path.display;
				case 'sys': return Path.sys;
				case 'www': return Path.www;
				case 'update': return Path.sys;
			}
			return undefined;
		},
		isBusy() {
			return this.extracting || this.uploading;
		}
	},
	data() {
		return {
			innerColor: this.color,
			extracting: false,
			uploading: false,
			gcodeReader: Object.assign(GcodeReader.default.methods, GcodeReader.default.data),

			confirmUpdate: false,
			updates: {
				webInterface: false,
				firmware: false,
				wifiServer: false,
				wifiServerSpiffs: false,

				codeSent: false
			},
			files: [],
			renameDialog: {
				shown: false,
				directory: '',
				item: null
			}
		}
	},
	extends: VBtn,
	props: {
		directory: String,
		target: {
			type: String,
			required: true
		},
		uploadPrint: Boolean
	},
	methods: {
		...mapActions('machine', ['sendCode', 'upload', 'getFileList']),
		isUnique(name) {
			if (this.files && this.files.length && name && name.length) {
				let input = name
				let ext = ''
				let num
				if (input.indexOf('.') > 0) {
					ext = input.substr(input.lastIndexOf('.')+1)
					input = input.substr(0, input.lastIndexOf('.'))
				}
				if ((/ - Copy(\(\d+\))?/gm).test(input)) {
					num = parseInt(input.substr( input.lastIndexOf('(')+1))
					input = input.substr(0, input.lastIndexOf('-Copy'))
				}
				let maxnum = 0;
				let files = this.files.filter(file => {
					let fname = file.name
					let fext = ''
					let fnum
					if (fname.indexOf('.') > 0) {
						fext = fname.substr(fname.lastIndexOf('.')+1)
						fname = fname.substr(0, fname.lastIndexOf('.'))
					}
					if ((/ - Copy(\(\d+\))?/gm).test(fname)) {
						fnum = parseInt(fname.substr( fname.lastIndexOf('(')+1))
						fname = fname.substr(0, fname.lastIndexOf('-Copy'))
						if (fname == name && fnum > maxnum) {
							maxnum = fnum
						}
					}
					return fname == input && fext == ext && (fnum == num)
				})
				console.log(files.length == 0 ? 'unique' : 'NOT UNIQUE');
				return files.length == 0
			}
			return true;
		},
		chooseFile() {
			if (!this.isBusy) {
				this.$refs.fileInput.click();
			}
		},
		async fileSelected(e) {
			await this.doUpload(e.target.files);
			this.$refs.fileInput.value = "";
		},
		isWebFile(filename) {
			if (webExtensions.some(extension => filename.toLowerCase().endsWith(extension))) {
				return true;
			}

			const matches = /(\.[^.]+).gz$/i.exec(filename);
			if (matches && webExtensions.indexOf(matches[1].toLowerCase()) !== -1) {
				return true;
			}
			return false;
		},
		renameFile(name){
			let bakname = name;
			if (this.files.length > 0) {
				let ext = ''
				let num
				if (name.indexOf('.') > 0) {
					ext = name.substr(name.lastIndexOf('.')+1)
					name = name.substr(0, name.lastIndexOf('.'))
				}
				if ((/ - Copy(\(\d+\))?/gm).test(name)) {
					num = parseInt(name.substr( name.lastIndexOf('(')+1))
					name = name.substr(0, name.lastIndexOf('-Copy'))
				}
				let maxnum = 0;
				let files = this.files.filter(file => {
					let fname = file.name
					let fext = ''
					let fnum
					if (fname.indexOf('.') > 0) {
						fext = fname.substr(fname.lastIndexOf('.')+1)
						fname = fname.substr(0, fname.lastIndexOf('.'))
					}
					if ((/ - Copy(\(\d+\))?/gm).test(fname)) {
						fnum = parseInt(fname.substr( fname.lastIndexOf('(')+1))
						fname = fname.substr(0, fname.lastIndexOf(' - Copy'))
						if (name == fname && fnum > maxnum){
							maxnum = fnum
						}
					}
					return fname == name && fext == ext && (fnum == num)
				})
				console.log(files)
				files = files.sort((a, b) => { if (a.name < b.name) return -1; if (a.name > b.name) return 1; return 0})
				if(!this.isUnique(bakname))
				{
					name = name + ' - Copy(' + (maxnum+1) + ')' + (ext.length ? '.' + ext : '')
					console.log(name)
					return name
				}
			}
		},
		async doUpload(files, zipName, startTime) {
			if (!files.length) {
				return;
			}

			if (this.target === 'start' && files.length !== 1) {
				this.$makeNotification('error', this.$t(`button.upload['${this.target}'].caption`), this.$t('error.uploadStartWrongFileCount'));
				return;
			}

			if (!zipName) {
				if (files.length > 1 && files[0].name.toLowerCase().endsWith('.zip')) {
					this.$makeNotification('error', this.$t(`button.upload['${this.target}'].caption`), this.$t('error.uploadNoSingleZIP'));
					return;
				}

				if (files[0].name.toLowerCase().endsWith('.zip')) {
					const zip = new JSZip(), zipFiles = [], target = this.target;
					this.extracting = true;
					try {
						// Open the ZIP file and read its content
						await zip.loadAsync(files[0], { checkCRC32: true });
						zip.forEach(function(file) {
							if (!file.endsWith('/') && (file.split('/').length === 2 || target !== 'filaments')) {
								zipFiles.push(file);
							}
						});

						// Could we get anything useful?
						if (!zipFiles.length) {
							this.extracting = false;
							this.$makeNotification('error', this.$t(`button.upload['${this.target}'].caption`), this.$t('error.uploadNoFiles'));
							return;
						}

						// Extract everything and start the upload
						for (let i = 0; i < zipFiles.length; i++) {
							const name = zipFiles[i];
							zipFiles[i] = await zip.file(name).async('blob');
							zipFiles[i].name = name;
						}
						this.doUpload(zipFiles, files[0].name, new Date());
					} catch (e) {
						console.warn(e);
						this.$makeNotification('error', this.$t('error.uploadDecompressionFailed'), e.message);
					}
					this.extracting = false;
					return;
				}
			}

			this.updates.webInterface = false;
			this.updates.firmware = false;
			this.updates.wifiServer = false;
			this.updates.wifiServerSpiffs = false;

			let success = true;
			this.uploading = true;
			for (let i = 0; i < files.length; i++) {

				await this.loadDirectory(this.destinationDirectory)
				let content = files[i];

				if (!await this.isUnique(content.name))
				{
					content = new File([files[i].slice(0, files[i].size, files[i].type)], this.renameFile(files[i].name))
				}

				// Adjust filename if an update is being uploaded
				let filename = Path.combine(this.destinationDirectory, content.name);
				if (this.target === 'sys' || this.target === 'update') {
					if (this.isWebFile(content.name)) {
						filename = Path.combine(Path.www, content.name);
						this.updates.webInterface |= /index.html(\.gz)?/i.test(content.name);
					} else if (this.board.firmwareFileRegEx.test(content.name)) {
						filename = Path.combine(Path.sys, this.board.firmwareFile);
						this.updates.firmware = true;
					} else if (this.board.hasWiFi) {
						if ((/DuetWiFiSocketServer(.*)\.bin/i.test(content.name) || /DuetWiFiServer(.*)\.bin/i.test(content.name))) {
							filename = Path.combine(Path.sys, 'DuetWiFiServer.bin');
							this.updates.wifiServer = true;
						} else if (/DuetWebControl(.*)\.bin/i.test(content.name)) {
							filename = Path.combine(Path.sys, 'DuetWebControl.bin');
							this.updates.wifiServerSpiffs = true;
						}
					}
				}

				try {
					// Start uploading
					if (files.length > 1) {
						if(document.getElementById("previewDisplay"))
						document.getElementById('previewDisplay').style.display = 'none'

						if (content.size <= 4*1024*1024) {
							await this.upload({ filename, content, showSuccess: !zipName, num: i + 1, count: files.length, showProgress: true });
						} else {
							this.$makeNotification('warning',
							"File skipped",
							filename.substring(filename.lastIndexOf('/')+1) + " is too big to be reliably uploaded. Please upload it alone",
							10000);
						}
					} else {
						if(this.target === 'gcodes')
						{
							if (content.size > 2*1024*1024) {
								if(document.getElementById("previewDisplay")) {
									document.getElementById('previewDisplay').style.display = 'none'
								}
								await this.upload({ filename, content });
								if (content.size <= 4*1024*1024) {
									console.log("medium file")
									document.getElementById("uploadDiv").style.display = "none";
								}
							}
							else {
								this.upload({ filename, content });
							}
							filename = filename.substring(10,filename.lastIndexOf("."));
							console.log(filename);
							if(content.size <= 2*1024*1024) {
								if(document.getElementById("uploadDiv"))
								document.getElementById("uploadDiv").style.display = ""
								if(document.getElementById("threeDisplay"))
								document.getElementById('threeDisplay').style.display = ''
								if(document.getElementById("previewDisplay"))
								document.getElementById('previewDisplay').style.display = ''
								this.gcodeReader.lectDonnees(content, filename, this)
							}
						} else {
							await this.upload({ filename, content });
						}
						if (content.size > 4*1024*1024) {
							setTimeout(function(caller){
								console.log('big file timeout')
								caller.$emit('refreshlist');
								document.getElementById("uploadDiv").style.display = "none";
							}, Math.max(Math.floor(content.size/(650*1024)), 10)*1000, this);
						}
					}
					// Run it (if required)
					if (this.target === 'start') {
						await this.sendCode(`M32 "${filename}"`);
					}
				} catch (e) {
					success = false;
					this.$emit('uploadFailed', { filename, reason: e });
					break;
				}
			}
			this.uploading = false;

			if (success) {
				if (zipName) {
					const secondsPassed = Math.round((new Date() - startTime) / 1000);
					this.$makeNotification('success', this.$t('notification.upload.success', [zipName, this.$displayTime(secondsPassed)]));
				}
				this.$emit('uploadComplete', files);
				if (files.length > 1) {
					console.log('upload-btn')
					document.getElementById("uploadDiv").style.display = "none";
				}

				if (this.updates.firmware || this.updates.wifiServer || this.updates.wifiServerSpiffs) {
					// Ask user to perform an update
					this.confirmUpdate = true;
				} else if (!this.isLocal && this.updates.webInterface) {
					// Reload the web interface immediately if it was the only update
					location.reload();
				}
			}
		},
		async startUpdate() {
			// Start firmware update
			let modules = [];
			if (this.updates.firmware) {
				modules.push('0');
			}
			if (this.updates.wifiServer) {
				modules.push('1');
			}
			if (this.updates.wifiServerSpiffs) {
				modules.push('2');
			}

			this.updates.codeSent = true;
			try {
				await this.sendCode(`M997 S${modules.reduce((a, b) => `${a}:${b}`)}`);
			} catch (e) {
				// this is expected
			}
		},
		dragOver(e) {
			e.preventDefault();
			e.stopPropagation();
			if (!this.isBusy) {
				this.innerColor = 'success';
			}
		},
		dragLeave(e) {
			e.preventDefault();
			e.stopPropagation();
			this.innerColor = this.color;
		},
		async dragDrop(e) {
			this.innerColor = this.color;
			if (!this.isBusy && e.dataTransfer.files.length) {
				await this.doUpload(e.dataTransfer.files);
			}
		},
		async loadDirectory(directory) {
			this.files = await this.getFileList(directory);
			//console.log(this.files)
		},
		async renameCallback(newFilename){
			console.log(newFilename)
		}
	},
	watch: {
		isConnected(to) {
			if (to && !this.isLocal && this.updates.codeSent && this.updates.webInterface) {
				// Reload the web interface when the connection could be established again
				location.reload();
			}
		}
	}
}
</script>
