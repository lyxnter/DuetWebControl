<style scoped>
.v-btn-toggle {
	display: flex;
}
.v-btn-toggle > button {
	display: flex;
	flex: 1 1 auto;
}
.local {
	font-size: large;
}
</style>
<template>
	<v-layout row wrap >
		<v-flex xs12 sm12 md8 lg12 xl12>
			<v-layout v-bind:class="{'row': $vuetify.breakpoint.smAndUp, 'column': $vuetify.breakpoint.smAndDown}">
				<v-flex v-if="isLocal" xs12 sm12 md6 lg4>
					<status-panel></status-panel>
					<temperature-chart style="min-height: 300px"></temperature-chart>
				</v-flex>
				<v-flex xs12 sm12 md6 lg6>
					<tools-panel v-if="isLocal" :shown=true></tools-panel>
					<fan-chart style="min-height: 300px"></fan-chart>
				</v-flex>
				<v-flex md6 lg2>
					<settings-endstops-panel></settings-endstops-panel>
					<v-card v-if="isLocal">
						<v-card-title class="pb-0" v-bind:class="{local: isLocal}">
							<v-icon small class="mr-1">ac_unit</v-icon> Debug parameters
						</v-card-title>

						<v-layout :class="isLocal?'row':'row'" wrap align-start class="px-3 py-1">
						<v-layout :class="isLocal?'row':'row'" wrap align-start class="px-3 py-1" sm-6 style="padding: 0 !important">
							<v-card sm-6>
								<v-card-title class="pb-0">
									Debug buttons
								</v-card-title>
								<v-btn @click="doTheSwitch" block>
									Passer les axes en indépendant
								</v-btn><br>
								<v-btn @click="showHeaters" block>
									{{ heatersShown ? 'Cacher' : 'Afficher' }} toutes les Résistances
								</v-btn><br>
								<v-btn @click="showDrives" block>
									{{ drivesShown ? 'Cacher' : 'Afficher' }} tous les Extruders
								</v-btn><br><br>
								<code-btn code='M98 P"0:/macros/_Toolheads/CAL_v1.2.0/Sensor/Self test"' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									test palpeur
								</code-btn>
								<code-btn code='M98 P"0:/macros/_Toolheads/CAL_v1.2.0/Sensor/Alarm release & Retract"' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									reset alarme
								</code-btn>
							</v-card>

							<v-card sm-6 md-12 lg-6>
								<v-card-title class="pb-0">
									Test LED
								</v-card-title>
								<code-btn block code='M969 S5 R255 V0 B0 W0 L100' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									Test LED : Rouge
								</code-btn><br>
								<code-btn block code='M969 S5 R0 V255 B0 W0 L010' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									Test LED : Vert
								</code-btn><br>
								<code-btn block code='M969 S5 R0 V0 B255 W0 L001' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									Test LED : Bleu
								</code-btn><br>
								<code-btn block code='M969 S5 R0 V0 B0 W255 L000' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									Test LED : Blanc
								</code-btn><br>
								<code-btn block code='M969 S5 R255 V255 B255 W255 L111' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									Test LED : Tous
								</code-btn>
							</v-card>
						</v-layout>
							<v-layout :class="isLocal?'column':'row'" wrap align-start class="px-3 py-1" sm-6 style="padding: 0 !important">
								<v-card>
									<v-card-title class="pb-0">
										<v-icon small class="mr-1">ac_unit</v-icon> Servo Angle
									</v-card-title>
									<v-flex order-sm1 order-md2 class="ma-1" :style="{width:(isLocal?'100%':'')}">
										<slider v-model="servoValue" :min="0" :max="200" :step="1"></slider>
									</v-flex>
								</v-card>
							</v-layout>
						</v-layout>
					</v-card>
				</v-flex>
				<v-flex v-if="!isLocal">
					<v-card>
						<v-card-title class="pb-0" v-bind:class="{local: isLocal}">
							<v-icon small class="mr-1">ac_unit</v-icon> Debug parameters
						</v-card-title>

						<v-layout :class="isLocal?'column':'row'" wrap align-start class="px-3 py-1">
							<v-card style="width: 100%;" sm-6 md-12>
								<v-card-title class="pb-0">
									<v-icon small class="mr-1">ac_unit</v-icon> Servo Angle
								</v-card-title>
								<v-flex order-sm1 order-md2 class="ma-1" :style="{width:(isLocal?'100%':'')}">
									<slider v-model="servoValue" :min="0" :max="200" :step="1"></slider>
								</v-flex>
							</v-card>
							<v-card sm-6 md-12 lg-6>
								<v-card-title class="pb-0">
									Debug buttons
								</v-card-title>
								<v-btn @click="doTheSwitch" block>
									Passer les axes en indépendant
								</v-btn><br>
								<v-btn @click="showHeaters" block>
									{{ heatersShown ? 'Cacher' : 'Afficher' }} toutes les Résistances
								</v-btn><br>
								<v-btn @click="showDrives" block>
									{{ drivesShown ? 'Cacher' : 'Afficher' }} tous les Extruders
								</v-btn><br><br>
								<code-btn code='M98 P"0:/macros/_Toolheads/CAL_v1.2.0/Sensor/Self test"' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									test palpeur
								</code-btn>
								<code-btn code='M98 P"0:/macros/_Toolheads/CAL_v1.2.0/Sensor/Alarm release & Retract"' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									reset alarme
								</code-btn>
							</v-card>
							<v-card sm-6 md-12 lg-6>
								<v-card-title class="pb-0">
									Test LED
								</v-card-title>
								<code-btn block code='M969 S5 R255 V0 B0 W0 L100' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									Test LED : Rouge
								</code-btn><br>
								<code-btn block code='M969 S5 R0 V255 B0 W0 L010' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									Test LED : Vert
								</code-btn><br>
								<code-btn block code='M969 S5 R0 V0 B255 W0 L001' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									Test LED : Bleu
								</code-btn><br>
								<code-btn block code='M969 S5 R0 V0 B0 W255 L000' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									Test LED : Blanc
								</code-btn><br>
								<code-btn block code='M969 S5 R255 V255 B255 W255 L111' :title="$t('button.home.titleAll')" class="ml-0" :disabled="disabled">
									Test LED : Tous
								</code-btn>
							</v-card>
						</v-layout>
					</v-card>
				</v-flex>
			</v-layout>
			<v-layout column>
				<v-flex>
					<v-layout row wrap>
						<v-flex sm12 md12 lg12 xl6>
							<movement-panel></movement-panel>
						</v-flex>
						<v-flex sm12 md12 lg12 xl6>
							<extrude-panel></extrude-panel>
						</v-flex>
					</v-layout>
				</v-flex>

				<v-flex md9>
					<v-card v-show="canControlFans">
						<v-card-title class="pb-0" v-bind:class="{local: isLocal}">
							<v-icon small class="mr-1">ac_unit</v-icon> {{ $t('panel.fan.caption') }}
						</v-card-title>

						<v-layout :class="isLocal?'column':'column'" wrap align-start class="px-3 py-1">
							<v-flex order-sm1 order-md1 class="ma-1" :style="{width:(isLocal?'100%':'')}">
								<p class="mb-1" v-bind:class="{local: isLocal}">
									{{ $t('panel.fan.selection') }}
								</p>
								<v-select v-if="isLocal" v-model="fan"
								:items="fans.map((key, index) => key.name ? {index, name: key.name} : {index, name: $t('panel.fan.fan', [index])})"
								:label="$t('panel.fan.fan', [])"
								item-value="index"
								item-text="name"
								></v-select>
								<v-btn-toggle v-if="!isLocal" v-model="fan" mandatory wrap>
									<template v-for="(fan, index) in fans.filter((fan, index) => !isLocal || (index < fans.length/2))">
										<v-btn flat :key="index" :value="index" :disabled="uiFrozen" v-bind:class="{local: isLocal}">
											{{ fan.name ? fan.name : $t('panel.fan.fan', [index]) }}
										</v-btn>
									</template>
								</v-btn-toggle>
							</v-flex>
							<v-flex order-sm2 order-md2 class="ma-1" :style="{width:(isLocal?'100%':'100%')}">
								<slider v-model="fanValue" :disabled="!canControlFans || fans[fan].thermostatic.control || fan == 1" :fan="fans[fan].thermostatic.control" :labels="fanLabel"></slider><br>
								<h3> {{ fans[fan].name }} </h3>
								<b>Vitesse:</b> {{ Math.round(fans[fan].value*100) }}% {{ fans[fan].rpm ? '@ ' + fans[fan].rpm + ' rpm' : '' }} <br>
								<b>Frequence:</b> {{ fans[fan].frequency }}Hz<br>
								<b>Broche:</b> {{ fans[fan].pin }}<br>
								<b>Inversé:</b> {{ fans[fan].inverted ? 'Oui' : 'Non' }}<br>
								<b>Impulsion:</b> {{ fans[fan].blip < 1 ? (fans[fan].blip * 1000) + 'ms' : fans[fan].blip + 's' }}<br>
								<b>Mode:</b> {{ fans[fan].thermostatic.control ? 'Automatique' : 'Mannuel' }} <br>
								<span v-if="fans[fan].thermostatic.control">
									&nbsp;&nbsp;<b>Résistances:</b> {{ fans[fan].thermostatic.heaters }} <br>
								</span>
								<span v-if="fans[fan].thermostatic.control">
									&nbsp;&nbsp;<b>PWM Min/Max:</b> {{ parseInt(fans[fan].min*100) }}% / {{ parseInt(fans[fan].max*100) }} %<br>
								</span>
								<span v-if="fans[fan].thermostatic.control">
									&nbsp;&nbsp;<b>Temp Min/Max:</b> {{ fans[fan].thermostatic.temperature ? fans[fan].thermostatic.temperature.min : '' }}°C / {{ fans[fan].thermostatic.temperature ? fans[fan].thermostatic.temperature.max : '' }}°C<br>
								</span><br>
								<code-btn v-if="fans[fan].thermostatic.control" :code="'M106 P'+fan+' S0 H-1'" title="set manual" class="ml-0">
									Passer en mannuel
								</code-btn>
							</v-flex>
						</v-layout>
					</v-card>
				</v-flex>
			</v-layout>
		</v-flex>
	</v-layout>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions } from 'vuex'

export default {
	computed: {
		...mapState('machine/model', ['fans', 'tools']),
		...mapGetters(['uiFrozen']),
		...mapGetters('machine/model', ['currentTool']),
		...mapState({
			isLocal: state => state.isLocal,
		}),
		canControlFans() {
			return !this.uiFrozen && ((this.currentTool && this.currentTool.fans.length > 0) || (this.fans.some(fan => fan && !fan.thermostatic.control)));
		},
		fanValue: {
			get() {
				if (this.canControlFans) {
					if (this.fan === -1) {
						let toolFan = 0;
						if (this.currentTool && this.currentTool.fans.length) {
							// Even though RRF allows multiple fans to be assigned to a tool,
							// we assume they all share the same fan value if such a config is set
							toolFan = this.currentTool.fans[0];
						}
						return Math.round(this.fans[toolFan].value * 100);
					}
					if (this.fan < this.fans.length && this.fans[this.fan]) {
						return Math.round(this.fans[this.fan].value * 100);
					}
				}
				return 0;
			},
			set(value) {
				value = Math.min(100, Math.max(0, value)) / 100;
				if (this.fan === -1) {
					this.sendCode(`M106 S${value.toFixed(2)}`);
				} else {
					this.sendCode(`M106 P${this.fan} S${value.toFixed(2)}`);
				}
			}
		},
		servoValue: {
			get() {
				if (this.servo == -1)
				this.servo = 40
				return this.servo
			},
			set(value) {
				this.servo = value
				this.sendCode('M280 P7 S' + value)
			}
		}
	},
	data() {
		return {
			fan: 0,
			mFan: undefined,
			servo: 40,
			fanLabel: {},
			heatersShown: false,
			drivesShown: false,
		}
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		updateFanSelection() {
			if ((this.fan === -1 && !this.currentTool) ||
			(this.fan !== -1 && (this.fans.length < this.fan || this.fans[this.fan].thermostatic.control))) {
				this.fan = this.fans.findIndex(fan => fan && !fan.thermostatic.control);
			}
		},
		decodeAnswer(response) {
			let fanProps = {}
			console.log(response)
			response.match(/([a-zA-Z]|[0-9])+: ([a-zA-Z]|[0-9]|\.|%|:| )+/gm).forEach((item) => {
				let myItem = item.split(': ');
				if (myItem[1].split(/:| /).filter(item => item.length).length > 1)
				myItem[1] = myItem[1].split(/:| /).filter(item => item.length)
				fanProps[myItem.shift()] = myItem.length > 1 ? myItem : myItem[0]
			})
			fanProps.frequency = parseFloat(fanProps.frequency)
			console.log(fanProps.heaters)
			if(fanProps.heaters.length > 1) {
				fanProps.heaters.forEach((item, i) => fanProps.heaters[i] = parseInt(item));
			} else {
				fanProps.heaters = parseInt(fanProps.heaters)
			}

			this.fans[this.fan].pin = fanProps.pin
			this.fans[this.fan].frequency = fanProps.frequency
			this.fans[this.fan].thermostatic.heaters = fanProps.heaters
			this.fans[this.fan].min = (parseFloat(fanProps.min)/100)
			this.fans[this.fan].max = (parseFloat(fanProps.max)/100)
			this.fans[this.fan].thermostatic.temperature = {
				min: parseFloat(fanProps.temperature[0]),
				max: parseFloat(fanProps.temperature[1])
			}
			console.log(this.fans[this.fan], fanProps)
			return fanProps
		},
		doTheSwitch() {
			this.sendCode("M667 S0\nM208 X0 Y0 Z0 S1\nM208 X710 Y710 Z710 S0\nM574 X2 Y2 Z2 S1\nG91\nG1 H1 X715 Y715 Z715 F3600\nG4 S1\nG1 H2 X-10 Y-10 Z-10 F6000\nG4 S1\nG1 H1 X715 Y715 Z715 F360\nG1 H2 X-20 Y-20 Z-20 F6000\nG90\nG1 X300 Y300 Z300")
		},
		async showHeaters() {
			this.heatersShown = !this.heatersShown
			for (let i = 0; i < 4; i++) {
				if (this.heatersShown) {
					await this.sendCode('M305 P' + (i+1) + ' X20' + i + '\nM143 H' + (i+1) + ' S200\n' + 'M563 P90' + i + ' S"D_H' + i + '" H' + (i+1) +'\nG10 P90' + i +' R0 S0')
				} else {
					await this.sendCode('M563 P90' + i + ' H-1 D-1')
				}
			}
		},
		async showDrives() {
			this.drivesShown = !this.drivesShown
			for (let i = 0; i < 4; i++) {
				if (this.drivesShown) {
					await this.sendCode('M569 P3 S0\nM569 P4 S0\nM569 P5 S0\nM350 E16:16:16 I1\nM92 E415:415:415\nM566 E500:500:500\nM203 E9000:9000:9000\nM201 E1000:1000:1000\nM906 E1330:1330:1330')
					await this.sendCode('M302 P1\nM563 P91' + i + ' S"D_E' + i + '" D' + i)
				} else {
					await this.sendCode('M302 P0\nM563 P91' + i + ' H-1 D-1')
				}
			}
		},
	},
	watch: {
		currentTool() {
			this.updateFanSelection();
		},
		fans() {
			this.updateFanSelection();
		},
		async fan() {
			//console.log(this.fans[this.fan])
			if(this.fans[this.fan].thermostatic.control && (this.fans[this.fan].thermostatic.heaters.length == 0 || this.fans[this.fan].thermostatic.temperature == null)) {
				let myFan = this.fan
				this.decodeAnswer(await this.sendCode('M106 P' + this.fan))
				this.updateFanSelection();
				this.fan = myFan
			}
			this.fanLabel = {},
			this.fanLabel[parseInt(this.fans[this.fan].min*100)] = this.fans[this.fan].thermostatic.temperature.min + '°C'
			this.fanLabel[parseInt(this.fans[this.fan].max*100)] = this.fans[this.fan].thermostatic.temperature.max + '°C'
		}
	}
}
</script>
