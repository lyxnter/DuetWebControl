<template>
	<div>
		<v-btn v-bind="$props" @click="chooseFile" :disabled="$props.disabled || !canUpload" :loading="isBusy" :title="title" :color="innerColor" @dragover="dragOver" @dragleave="dragLeave" @drop.prevent.stop="dragDrop" tabindex="0">
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

import { VBtn } from 'vuetify/lib'

import { mapState, mapGetters, mapActions } from 'vuex'
import Path from '../../utils/path.js'

export default {
	computed: {
		...mapState(['isLocal','selectedMachine']),
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
			return '.zip';
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

			confirmUpdate: false,
			updates: {
				webInterface: false,
				firmware: false,
				wifiServer: false,
				wifiServerSpiffs: false,

				codeSent: false
			},
			title: "Upload update"
		}
	},
	extends: VBtn,
	props: {
		directory: String,
		uploadPrint: Boolean
	},
	methods: {
		...mapActions('machine', ['sendCode', 'upload']),
		chooseFile() {
			if (!this.isBusy) {
				this.$refs.fileInput.click();
			}
		},
		async fileSelected(e) {
			await this.doUpload(e.target.files);
			this.$refs.fileInput.value = "";
		},
		async doUpload(files, zipName, startTime) {
			if (!files.length) {
				return;
			}

			if (!zipName) {
				if (files.length > 1 && files[0].name.toLowerCase().endsWith('.zip')) {
					this.$makeNotification('error', this.$t(`button.upload['${this.target}'].caption`), this.$t('error.uploadNoSingleZIP'));
					return;
				}
			}

			let success = true;
			this.uploading = true;
			for (let i = 0; i < files.length; i++) {
				const content = files[i];

				// Adjust filename if an update is being uploaded
				let filename = Path.combine(this.destinationDirectory, content.name);

				try {
					// Start uploading
					if (files.length > 1) {
						await this.upload({ filename, content, showSuccess: !zipName, num: i + 1, count: files.length });
					} else {
						this.upload({ filename, content });
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
