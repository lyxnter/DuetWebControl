<template>
	<v-card class="pb-2">
		<v-card-title class="pb-0">
			{{ $t('panel.settingsEndstops.caption') }}
		</v-card-title>
		<table v-show="endstops.length" :dense="endstops.length > 6" style="width: 100%">
				<thead>
					<tr>
						<th class="text-center">{{ $t('panel.settingsEndstops.index') }}</th>
						<th class="text-center">{{ $t('panel.settingsEndstops.triggered') }}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="endstop in endstops" :key="endstop.index">
						<td style="text-align: center; font-weight: bold;">{{  ['X','Y','Z'][endstop.index]  }}</td><!--{{ endstop.index < 3 ? ['X','Y','Z'][endstop.index] : 'E'+(endstop.index - 3) }}</td> !-->
						<td style="text-align: center">
							<div id="state" style="border-radius: 50%; display: inline-flex; margin-left: 0px; vertical-align: middle; width: 15px; height: 15px;" :style="{background: (endstop.triggered ? 'green' : 'red')}">
							</div>
							<span>
								{{ endstop.triggered ? $t('generic.yes') : $t('generic.no') }}
							</span>
						</td>
					</tr>
				</tbody>
		</table>

		<div v-show="!endstops.length" class="mt-1 text-center">
			{{ $t('$vuetify.noDataText') }}
		</div>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapMutations } from 'vuex'

export default {
	computed: {
		...mapState(['selectedMachine']),
		...mapState('machine/model', ['sensors']),
		endstops() {
			return this.sensors.endstops.map((endstop, index) => ({
				index,
				triggered: endstop.triggered
			}));
		}
	},
	data() {
		return {
			active: true
		}
	},
	activated() {
		this.active = true;
		this.setHighVerbosity();
	},
	deactivated() {
		this.active = false;
		this.setNormalVerbosity();
	},
	methods: mapMutations('machine', ['setHighVerbosity', 'setNormalVerbosity']),
	watchers: {
		selectedMachine() {
			if (this.active) {
				this.setHighVerbosity();
			}
		}
	}
}
</script>
