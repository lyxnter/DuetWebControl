<template>
	<v-card>
		<v-card-title class="pb-0">
			<v-icon small class="mr-1">texture</v-icon> {{ $t('panel.extrusionFactors.caption') }}
			<v-spacer></v-spacer>
			<v-menu offset-y right auto>
				<template slot="activator">
					<a v-show="!uiFrozen && move.extruders.length" href="#" @click.prevent="">
						{{ $t('panel.extrusionFactors.changeVisibility') }}
					</a>
				</template>

				<v-list>
					<v-list-tile v-for="(extruder, index) in move.extruders" :key="index" @click="toggleExtruderVisibility(index)">
						<v-icon class="mr-1">
							{{ (displayedExtruders.indexOf(index) !== -1) ? 'check_box' : 'check_box_outline_blank' }}
						</v-icon>
						{{ $t('panel.extrusionFactors.extruder', [index]) }}
					</v-list-tile>
				</v-list>
			</v-menu>
		</v-card-title>

		<v-layout v-if="!!visibleExtruders.length" column class="px-3">
			<v-flex v-for="extruder in visibleExtruders" :key="extruder">
				<v-flex class="pt-2">
					<v-layout row>
						<v-flex tag="span">
							{{ $t('panel.extrusionFactors.extruder', [extruder]) }}
						</v-flex>
						<v-spacer></v-spacer>
						<v-flex shrink>
							<a href="#" v-show="move.extruders[extruder].factor !== 1.0" flat small color="primary" @click.prevent="setExtrusionFactor(extruder, 100)">
								<v-icon small class="mr-1">settings_backup_restore</v-icon> {{ $t('generic.reset') }}
							</a>
						</v-flex>
					</v-layout>
				</v-flex>
				<v-flex>
					<slider :value="getExtrusionFactor(extruder)" @input="setExtrusionFactor(extruder, $event)" :max="getMax(extruder)" :disabled="uiFrozen"></slider>
				</v-flex>
			</v-flex>
		</v-layout>

		<v-alert type="secondary" :value="!visibleExtruders.length">
			{{ $t('panel.extrusionFactors.noExtruders') }}
		</v-alert>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

export default {
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['move']),
		...mapState('machine/settings', ['displayedExtruders']),
		visibleExtruders() {
			return this.displayedExtruders.filter(drive => drive < this.move.extruders.length, this);
		}
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		...mapMutations('machine/settings', ['toggleExtruderVisibility']),
		getMax(extruder) { return Math.max(150, this.move.extruders[extruder].factor * 100 + 50); },
		getExtrusionFactor(extruder) {
			return Math.round(this.move.extruders[extruder].factor * 100);
		},
		setExtrusionFactor(extruder, value) {
			this.sendCode(`M221 D${extruder} S${value}`);
		}
	}
}
</script>
