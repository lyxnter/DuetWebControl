<template>
	<div class="component mb-0">
		<v-layout column>
			<v-flex>
				<v-layout row wrap>
					{{ printStatus }}
					<v-spacer></v-spacer>
					<span>{{ printDetails }}</span>
				</v-layout>
			</v-flex>

			<v-flex>
				<v-progress-linear :value="jobProgress * 100" class="my-1"></v-progress-linear>
			</v-flex>
		</v-layout>
	</div>
</template>

<script>
'use strict'

import { mapState, mapGetters } from 'vuex'

import { extractFileName } from '../../utils/path.js'

export default {
	computed: {
		...mapGetters(['getTool']),
		...mapState('machine/model', ['job', 'state']),
		...mapGetters('machine/model', ['jobProgress']),
		printStatus() {
			if (this.state.isPrinting) {
				const progress = this.$display(this.jobProgress * 100, 1, '%');
				if (this.state.isSimulating) {
					return this.$t('jobProgress.simulating', [this.printFile, progress]);
				}
				if (this.state.mode === 'FFF' || this.state.mode === null) {
					return this.$t('jobProgress.printing', [this.printFile, progress]);
				}
				return this.$t('jobProgress.processing', [this.printFile, progress]);
			} else if (this.job.lastFileName) {
				if (this.job.lastFileSimulated) {
					return this.$t('jobProgress.simulated', [this.job.lastFileName]);
				}
				if (this.state.mode === 'FFF' || this.state.mode === null) {
					return this.$t('jobProgress.printed', [this.job.lastFileName]);
				}
				return this.$t('jobProgress.processed', [this.job.lastFileName]);
			}
			return this.$t('jobProgress.noJob');
		},
		printDetails() {
			if (!this.state.isPrinting) {
				return '';
			}

			let details = '';
			if (this.job.layer !== null && this.job.file.numLayers) {
				details = this.$t('jobProgress.layer', [this.job.layer, this.job.file.numLayers]);
			}
			if (this.job.extrudedRaw.length) {
				if (details !== '') { details += ', '; }
				if (this.getTool.substr(0,3) == 'LIQ') {
					details += this.$t('jobProgress.material.liquid', [this.$display(this.job.extrudedRaw.reduce((a, b) => a + b)*0.0030, 2, 'ml')]);
				} else	if (this.getTool.substr(0,3) == 'PAS') {
						details += this.$t('jobProgress.material.paste', [this.$display(this.job.extrudedRaw.reduce((a, b) => a + b)*0.0030, 2, 'ml')]);
				} else if (this.getTool.substr(0,3) == 'FIL') {
					details += this.$t('jobProgress.material.filament', [this.$display(this.job.extrudedRaw.reduce((a, b) => a + b), 1, 'mm')]);
				} else if (this.getTool.substr(0,3) == 'PEL') {
					details += this.$t('jobProgress.material.generic', [this.$display(this.job.extrudedRaw.reduce((a, b) => a + b), 1, 'mm')]);
				} else {
					details += this.$t('jobProgress.material.generic', [this.$display(this.job.extrudedRaw.reduce((a, b) => a + b), 1, '')]);
				}
				if (this.job.file.filament.length) {
					const used = this.job.extrudedRaw.reduce((a, b) => a + b);
					const needed = this.job.file.filament.reduce((a, b) => a + b);
					if (this.getTool.substr(0,3) == 'LIQ' || this.getTool.substr(0,3) == 'PAS') {
						details += ' (' + this.$t('jobProgress.filamentRemaining', [this.$display(Math.max(needed - used, 0)*0.0030, 2, 'ml')]) + ')';
					} else if (this.getTool.substr(0,3) == 'FIL' || this.getTool.substr(0,3) == 'PEL') {
						details += ' (' + this.$t('jobProgress.filamentRemaining', [this.$display(Math.max(needed - used, 0), 1, 'mm')]) + ')';
					} else {
						details += ' (' + this.$t('jobProgress.filamentRemaining', [this.$display(Math.max(needed - used, 0), 1, '')]) + ')';
					}
				}
			}
			return details;
		},
		printFile() {
			return this.job.file.fileName ? extractFileName(this.job.file.fileName) : undefined;
		}
	}
}
</script>
