<style scoped>
p {
	margin-bottom: 8px;
}
p:last-child {
	margin-bottom: 0;
}
.local {
	font-size: large;
}
</style>

<template>
	<v-card>
		<v-card-title>
			<v-icon small class="mr-1">info</v-icon> {{ $t('panel.jobInfo.caption') }}
		</v-card-title>

		<v-card-text class="pt-0">
			<v-layout :class="'column'" class="list">
				<v-flex tag="p">
					<strong>{{ $t('panel.jobInfo.height') }}</strong> {{ $displayZ(jobFile.height) }}
				</v-flex>
				<v-flex tag="p" v-if="mode === 'FFF' || mode === null">
					<strong>{{ $t('panel.jobInfo.layerHeight') }} </strong> {{ $displayZ(jobFile.layerHeight) }}
				</v-flex>
				<v-flex tag="p" v-if="mode === 'FFF' || mode === null">
					<strong> {{
						getTool.substr(0,3) == 'LIQ' ? $t('panel.jobInfo.material.liquid') :
						getTool.substr(0,3) == 'PAS' ? $t('panel.jobInfo.material.paste') :
						getTool.substr(0,3) == 'FIL' ? $t('panel.jobInfo.material.filament') : $t('panel.jobInfo.material.generic') }}
					</strong>
					{{ $displayZ(((getTool.substr(0,3) == 'LIQ' || getTool.substr(0,3) == 'PAS') ? (jobFile.filament.reduce((a, b) => a + b)*0.0030).toFixed(2) : jobFile.filament), ((getTool.substr(0,3) == 'LIQ' || getTool.substr(0,3) == 'PAS') ? 'ml' :
					(getTool.substr(0,3) == 'FIL' || getTool.substr(0,3) == 'PEL') ? 'mm' : '')) }}
				</v-flex>
				<v-flex tag="p">
					<strong>{{ $t('panel.jobInfo.generatedBy') }}</strong> {{ $display(jobFile.generatedBy) }}
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
		...mapGetters(['getTool']),
		...mapState(['isLocal']),
		...mapState('machine/model', {
			mode: state => state.state.mode,
			jobFile: state => state.job.file
		})
	}
}
</script>
