<style>
	.local {
		font-size: large !important;
	}
</style>
<template>
	<v-card>
		<v-card-title :class="{local: isLocal}">
			<v-icon small class="mr-1">watch_later</v-icon> {{ $t('panel.jobEstimations.caption') }}
		</v-card-title>

		<v-card-text class="pt-0 text-xs-center">
			<v-layout :class="(isLocal?'column':'row')" wrap>
				<v-flex order-sm2>
					<v-layout :class="isLocal?'row':'column'">
						<v-flex tag="strong">
							{{ $t('panel.jobEstimations.filament') }}
						</v-flex>
						<v-flex>
							{{ $displayTime(job.timesLeft.filament, true) }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex order-sm2>
					<v-layout :class="isLocal?'row':'column'">
						<v-flex tag="strong">
							{{ $t('panel.jobEstimations.file') }}
						</v-flex>
						<v-flex>
							{{ $displayTime(job.timesLeft.file, true) }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex order-sm2>
					<v-layout :class="isLocal?'row':'column'">
						<v-flex tag="strong">
							{{ $t('panel.jobEstimations.layer') }}
						</v-flex>
						<v-flex>
							{{ $displayTime(job.timesLeft.layer, true) }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex v-show="job.file.printTime && !state.isSimulating" :class="isLocal?'order-sm1':'order-sm2'" :style="{width: isLocal?'100%':''}">
					<v-layout :class="isLocal?'row':'column'" :style="{'font-size': isLocal?'larger':''}">
						<v-flex tag="strong">
							{{ $t('panel.jobEstimations.slicer') }}
						</v-flex>
						<v-flex>
							{{ $displayTime(state.isPrinting ? Math.max(0, job.file.printTime - job.duration, true) : job.file.printTime) }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex v-show="job.file.simulatedTime && !state.isSimulating" class="order-sm2">
					<v-layout column>
						<v-flex tag="strong">
							{{ $t('panel.jobEstimations.simulation') }}
						</v-flex>
						<v-flex>
							{{ $displayTime(state.isPrinting ? Math.max(0, job.file.simulatedTime - job.duration, true) : job.file.simulatedTime) }}
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters } from 'vuex'

export default {
	computed: {
		...mapState(['isLocal']),
		...mapState('machine/model', ['job', 'state']),
		...mapGetters('machine/model', ['isPrinting', 'isSimulating'])
	}
}
</script>
