<style>
	.local {
		font-size: large !important;
	}
</style>
<template>
	<v-card>
		<v-card-title :class="{local: isLocal}">
			<v-icon small class="mr-1">linear_scale</v-icon> {{ $t('panel.jobData.caption') }}
		</v-card-title>

		<v-card-text class="pt-0 text-xs-center">
			<v-layout :class="(isLocal?'column':'row')" wrap>
				<v-flex>
					<v-layout :class="(isLocal?'row':'column')">
						<v-flex tag="strong">
							{{ $t('panel.jobData.warmUpDuration') }}
						</v-flex>
						<v-flex tag="span">
							{{ $displayTime(job.warmUpDuration) }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex>
					<v-layout :class="(isLocal?'row':'column')">
						<v-flex tag="strong">
							{{ $t('panel.jobData.currentLayerTime') }}
						</v-flex>
						<v-flex tag="span">
							{{ $displayTime(job.layerTime) }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex>
					<v-layout :class="(isLocal?'row':'column')">
						<v-flex tag="strong">
							{{ $t('panel.jobData.lastLayerTime') }}
						</v-flex>
						<v-flex tag="span">
							{{ $displayTime(job.layers.length ? job.layers[job.layers.length - 1].duration : undefined) }}
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex>
					<v-layout :class="(isLocal?'row':'column')">
						<v-flex tag="strong">
							{{ $t('panel.jobData.jobDuration') }}
						</v-flex>
						<v-flex tag="span">
							{{ $displayTime(job.duration) }}
						</v-flex>
					</v-layout>
				</v-flex>
			</v-layout>

		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import { mapState } from 'vuex'

export default {
	computed: {
		...mapState(['isLocal']),
		...mapState('machine/model', ['job']),
		lastLayerTime() {
			if (!this.job.layers.length) {
				return undefined;
			}
			return this.job.layers[this.job.layers.length - 1].time;
		}
	}
}
</script>
