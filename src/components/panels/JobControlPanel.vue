<template>
	<v-card>
		<v-card-title class="pb-1" v-bind:style="isLocal?'font-size: large':''">
			<v-icon small class="mr-1">build</v-icon> {{ $t('panel.jobControl.caption') }}
		</v-card-title>

		<v-card-text class="pt-0">
			<code-btn color="warning" block :disabled="uiFrozen || !state.isPrinting" :code="this.isPaused ? 'M24' : 'M25'" tabindex="0">
				<v-icon class="mr-1">{{ isPaused ? "play_arrow" : "pause" }}</v-icon> {{ pauseResumeText }}
			</code-btn>

			<v-btn v-if="isPaused" color="error" block @click="confirmCancel">
				<v-icon class="mr-1">stop</v-icon> {{ cancelText }}
			</v-btn>

			<code-btn v-if="!state.isPrinting && processAnotherCode" color="success" block :code="processAnotherCode">
				<v-icon class="mr-1">refresh</v-icon> {{ processAnotherText }}
			</code-btn>

			<v-switch :label="$t('panel.jobControl.autoSleep')" v-model="autoSleepActive" :disabled="uiFrozen" hide-details v-if="!isLocal"></v-switch>
		</v-card-text>

		<confirm-dialog :shown.sync="confirmCancelDialog.shown" :question="confirmCancelDialog.question" :prompt="confirmCancelDialog.prompt" @confirmed="sendCode('M0 H1')"></confirm-dialog>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapMutations, mapActions} from 'vuex'

import { extractFileName } from '../../utils/path.js'

export default {
	data() {
		return {
			confirmCancelDialog: {
				question: this.$t('dialog.cancel.title'),
				prompt: this.$t('dialog.cancel.prompt',['']),
				shown: false
			},
		}
	},
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState(['isLocal']),
		...mapState('machine', ['autoSleep']),
		...mapState('machine/model', ['job', 'state']),
		...mapGetters('machine/model', ['isPaused']),
		autoSleepActive: {
			get() { return this.autoSleep; },
			set(value) { this.setAutoSleep(value) }
		},
		pauseResumeText() {
			if (this.state.isSimulating) {
				return this.$t(this.isPaused ? 'panel.jobControl.resumeSimulation' : 'panel.jobControl.pauseSimulation');
			}
			if (this.state.mode === 'FFF' || this.state.mode === null) {
				return this.$t(this.isPaused ? 'panel.jobControl.resumePrint' : 'panel.jobControl.pausePrint');
			}
			return this.$t(this.isPaused ? 'panel.jobControl.resumeJob' : 'panel.jobControl.pauseJob');
		},
		cancelText() {
			if (this.state.isSimulating) {
				return this.$t('panel.jobControl.cancelSimulation');
			}
			if (this.state.mode === 'FFF' || this.state.mode === null) {
				return this.$t('panel.jobControl.cancelPrint');
			}
			return this.$t('panel.jobControl.cancelJob');
		},
		processAnotherCode() {
			if (this.job.lastFileName) {
				if (this.job.lastFileSimulated) {
					return `M37 P"${this.job.lastFileName}"`;
				}
				return `M32 "${this.job.lastFileName}"`;
			}
			return undefined;
		},
		processAnotherText() {
			if (this.job.lastFileSimulated) {
				return this.$t('panel.jobControl.repeatSimulation');
			}
			if (this.state.mode === 'FFF' || this.state.mode === null) {
				return this.$t('panel.jobControl.repeatPrint');
			}
			return this.$t('panel.jobControl.repeatJob');
		},
		printFile() {
			return this.job.file.fileName ? extractFileName(this.job.file.fileName) : undefined;
		}
	},
	methods: {
		...mapMutations('machine', ['setAutoSleep']),
		...mapActions('machine', ['sendCode']),
		confirmCancel: function() {
			console.log(this.confirmCancelDialog);
			//this.confirmCancelDialog.question = this.cancelText;
			this.confirmCancelDialog.prompt =this.$t('dialog.cancel.prompt', [this.printFile?this.printFile:" l'impression"]);
			this.$nextTick(() => this.confirmCancelDialog.shown = true);
		}
	}
}
</script>
