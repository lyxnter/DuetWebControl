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
	<v-card v-if="currentTool && currentTool.extruders.length">
		<v-card-title class="pb-0" v-bind:class="{local: isLocal}">
			<v-icon small class="mr-1">opacity</v-icon> {{ $t('panel.extrude.caption') }}
		</v-card-title>

		<v-layout row class="px-3 py-1" align-center>
			<v-flex>
				<v-layout row wrap align-center>
					<v-layout v-if="currentTool && currentTool.extruders.length > 1 && mix == 'mix' && mixC"  column>
						<v-flex class="ma-1">
							<p class="mb-1" v-bind:class="{local: isLocal}">
								{{ $t('panel.extrude.mixRatio') }}
							</p>
							<v-btn-toggle v-if="false" v-model="mix" mandatory multiple>
								<v-btn flat value="mix" :disabled="uiFrozen" v-bind:class="{local: isLocal}">
									{{ $t('panel.extrude.mix') }}
								</v-btn>
								<v-btn flat v-for="extruder in currentTool.extruders" :key="extruder" :value="extruder" :disabled="uiFrozen" v-bind:class="{local: isLocal}">
									{{ `E${extruder}` }}
								</v-btn>
							</v-btn-toggle>
							<v-layout row v-for="(prct, index) in mixC.filter(() => mix == 'mix')" :key="'mix-'+index">
								<span style="vertical-align: middle; height: max-content; margin: auto;" :style="{'font-size': isLocal?'large':''}">{{ "E" + currentTool.extruders[index] }}:</span>
								<input type="number" v-if="!isLocal" :value="mixC[index]"
								placeholder="Placeholder"
								@change="setExtrusionMix(index, $event.target.value)" style="width: 35px; background: rgba(255, 255, 255, 0.15) none repeat scroll 0% 0%; height: 26px; margin: 22px 0px 5px 10px; padding: 5px" :style="{'font-size': isLocal ? 'large' : ''}" :disabled="(uiFrozen || disabled ? 'true': 'false')"/>
								<b v-if="!isLocal" style="margin: 22px 0px 5px 5px;">%</b>
								<slider style="margin: 5px" :key="Math.random()" :disabled="uiFrozen || disabled" :min="0" :max="100" v-model="mixC[index]" @input="setExtrusionMix(index, $event)" :labels="extruderMix" :fan="true" step="1"></slider><br/>
							</v-layout><br/>
							<div style="height: 5px; overflow: hidden; border-radius: 5px;" :style="{margin: isLocal ? '5px 60px 5px 90px' : '5px 60px 5px 145px', background: 'linear-gradient(to right, red, hsl(43, 98%, 50%) ' + (30/currentTool.extruders.length) + '%, hsl(43, 98%, 50%) ' + (80/currentTool.extruders.length) + '%, green ' + (90/currentTool.extruders.length) + '%, green ' + (110/currentTool.extruders.length) + '%, hsl(43, 98%, 50%) ' + (120/currentTool.extruders.length) + '%, hsl(43, 98%, 50%) ' + (170/currentTool.extruders.length) + '%, red ' + (200/currentTool.extruders.length) + '%)'}">
								<div style="height: 100%; width: 2px; border-radius: 1px; background:black; overflow: hidden" :style="{'margin-left': (extrusionSum/currentTool.extruders.length + '%')}">
								</div>
							</div>
						</v-flex>
						<v-flex class="ma-1" v-if="currentTool && currentTool.extruders.length > 1 && false">
							<p class="mb-1"  v-bind:class="{local: isLocal}">
								{{ $t('panel.extrude.mix', ['%']) }}
							</p>
							<v-flex v-for="(prct, index) in mixC.filter(() => mix == 'mix')" :key="'mix-'+index">
								<span style="vertical-align: middle;height: max-content;margin: auto;" :style="{'font-size': isLocal?'large':''}">{{ "E" + currentTool.extruders[index] }}</span>
								<v-btn-toggle mandatory v-model=" mixBtn[index]">
									<v-btn v-for="(mix) in extruderMix" :key="mix+'-'+index" :value="mix" :disabled="uiFrozen || disabled" @click="editMix(index, mix)"  v-bind:class="{local: isLocal}">
										{{ mix }}
									</v-btn>
								</v-btn-toggle>
							</v-flex>
						</v-flex>
					</v-layout>
					<v-layout :class="(currentTool && currentTool.extruders.length > 1 && mix == 'mix' && mixC) ? 'column' : 'row'">
						<v-flex class="ma-1">
							<p class="mb-1"  v-bind:class="{local: isLocal}">
								{{ $t('panel.extrude.amount', ['mm']) }}
							</p>
							<v-btn-toggle v-model="amount" mandatory>
								<v-btn v-for="(amount, index) in extruderAmounts" :key="index" :value="amount" :disabled="uiFrozen || disabled" @contextmenu.prevent="editAmount(index)"  v-bind:class="{local: isLocal}">
									{{ amount }}
								</v-btn>
							</v-btn-toggle>
						</v-flex>
						<v-flex class="ma-1">
							<p class="mb-1" v-bind:class="{local: isLocal}">
								{{ $t('panel.extrude.feedrate', ['mm/s']) }}
							</p>
							<v-btn-toggle v-model="feedrate" mandatory>
								<v-btn v-for="(feedrate, index) in extruderFeedrates" :key="index" :value="feedrate" :disabled="uiFrozen || disabled" @contextmenu.prevent="editFeedrate(index)"  v-bind:class="{local: isLocal}">
									{{ feedrate }}
								</v-btn>
							</v-btn-toggle>
						</v-flex>
					</v-layout>
				</v-layout>
			</v-flex>
			<v-flex shrink class="ml-2 mb-1"  v-bind:style="{'margin-top: 25px': isLocal}">
				<v-btn block :disabled="uiFrozen || !canRetract || disabled" :loading="busy" @click="buttonClicked(false)"  v-bind:class="{local: isLocal}">
					<v-icon>arrow_upward</v-icon> {{ $t('panel.extrude.retract') }}
				</v-btn>
				<br>
				<v-btn block :disabled="uiFrozen || !canExtrude || disabled" :loading="busy" @click="buttonClicked(true)"  v-bind:class="{local: isLocal}">
					<v-icon>arrow_downward</v-icon> {{ $t('panel.extrude.extrude') }}
				</v-btn>
			</v-flex>
		</v-layout>

		<input-dialog :shown.sync="editAmountDialog.shown" :title="$t('dialog.editExtrusionAmount.title')" :prompt="$t('dialog.editExtrusionAmount.prompt')" :preset="editAmountDialog.preset" is-numeric-value @confirmed="setAmount"></input-dialog>
		<input-dialog :shown.sync="editFeedrateDialog.shown" :title="$t('dialog.editExtrusionFeedrate.title')" :prompt="$t('dialog.editExtrusionFeedrate.prompt')" :preset="editFeedrateDialog.preset" is-numeric-value @confirmed="setFeedrate"></input-dialog>
	</v-card>
</template>

<script>
'use strict'

import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'

export default {
	computed: {
		...mapGetters(['uiFrozen']),
		...mapState('machine/model', ['heat', 'tools']),
		...mapGetters('machine/model', ['currentTool']),
		...mapState('machine/settings', ['extruderAmounts', 'extruderFeedrates']),
		...mapState({
			isLocal: state => state.isLocal,
		}),
		...mapState('machine/model', {
			disabled: (state) => {state = state.state; return ['updating', 'halted', 'pausing', 'resuming', 'processing', 'simulating', 'busy', 'changingTool'].indexOf(state.status) >= 0}
		}),
		canExtrude() {
			if (this.currentTool && this.currentTool.heaters.length) {
				const selectedHeaters = (this.mixValue[0] === 'mix') ? this.currentTool.heaters : this.mixValue;
				const heaters = this.heat.heaters, minTemp = this.heat.coldExtrudeTemperature;
				return !selectedHeaters.some(heater => heaters[heater].current < minTemp);
			}
			return (this.heat.coldExtrudeTemperature == 0 || this.currentTool && !this.currentTool.heaters.length);
		},
		canRetract() {
			if (this.currentTool && this.currentTool.heaters.length) {
				const selectedHeaters = (this.mixValue[0] === 'mix') ? this.currentTool.heaters : this.mixValue;
				const heaters = this.heat.heaters, minTemp = this.heat.coldRetractTemperature;
				return !selectedHeaters.some(heater => heaters[heater].current < minTemp);
			}
			return (this.heat.coldRetractTemperature == 0 || this.currentTool && !this.currentTool.heaters.length);
		},
		mix: {
			get() {
				return this.mixValue;
			},
			set(value) {
				if (value.length > 1) {
					if (this.mixValue.indexOf('mix') !== value.indexOf('mix')) {
						// Mix is being toggled
						if (value.indexOf('mix') !== -1) {
							this.mixValue = ['mix'];
						} else {
							this.mixValue = value.filter(item => item !== 'mix');
						}
					} else {
						// Selecting another E drive
						this.mixValue = value.filter(item => item !== 'mix');
					}
				} else {
					// One value - OK
					this.mixValue = value;
				}
			}
		}
	},
	data() {
		return {
			busy: false,
			mixValue: ['mix'],
			amount: 0,
			feedrate: 0,
			editAmountDialog: {
				shown: false,
				index: 0,
				preset: 0
			},
			editFeedrateDialog: {
				shown: false,
				index: 0,
				preset: 0
			},
			extrusionSum: 50,
			extruderMix: {0: '0', 25: '25', 33: '33', 50: '50', 66: '66', 75: '75', 100: '100'},
			mixC: undefined,
			mixBtn: []
		}
	},
	methods: {
		...mapActions('machine', ['sendCode']),
		...mapMutations('machine/settings', ['setExtrusionAmount', 'setExtrusionFeedrate']),
		async buttonClicked(extrude) {
			//console.log(this.currentTool);
			if (this.currentTool && !this.currentTool.extruders.length) {
				return;
			}

			let amounts;
			if (this.mix.length === 1 && this.mix[0] === 'mix') {
				// Split total amount to extrude evenly
				amounts = [this.amount];
			} else if (this.currentTool) {
				// Extrude given amount via each selected extruder drive
				amounts = this.currentTool.extruders.map(extruder => (this.mix.indexOf(extruder) !== -1) ? this.amount : 0);
			}

			this.busy = true;
			try {
				const amount = amounts.map(amount => extrude ? amount : -amount).join(':');
				await this.sendCode(`M120\nM83\nG1 E${amount} F${this.feedrate * 60}\nM121`);
			} catch (e) {
				// handled before we get here
			}
			this.busy = false;
		},
		editAmount(index) {
			this.editAmountDialog.index = index;
			this.editAmountDialog.preset = this.extruderAmounts[index];
			this.editAmountDialog.shown = true;
		},
		setAmount(value) {
			this.setExtrusionAmount({ index: this.editAmountDialog.index, value });
			this.amount = value;
		},
		editFeedrate(index) {
			this.editFeedrateDialog.index = index;
			this.editFeedrateDialog.preset = this.extruderFeedrates[index];
			this.editFeedrateDialog.shown = true;
		},
		setFeedrate(value) {
			this.setExtrusionFeedrate({ index: this.editFeedrateDialog.index, value });
			this.feedrate = value;
		},
		setExtrusionMix(index, event) {
			//console.log(index, event)
			if (!this.currentTool) {
				return;
			}
			this.currentTool.mix[index] = parseFloat(event/100)
			this.mixBtn[index] = parseFloat(event) + '%'
			this.mixC[index] = parseFloat(event).toFixed(0)
			//console.log(this.currentTool, this.currentTool.mix)
			let first = true;
			let letter = 65
			let out = ""
			if (!this.disabled && this.currentTool){
				out += "M563 P" + this.currentTool.number + ' S"'
				this.currentTool.mix.forEach(extruder => out += (first?(first = false):"+") + Math.round(extruder*100) + String.fromCharCode(letter++))
				out += '" D'
				first = true;
				this.currentTool.extruders.forEach(extruder => { out += (first?"":":") + extruder; (first = false) })
				if(this.currentTool.heaters.length > 0) {
					first = true;
					out += ' H'
					this.currentTool.heaters.forEach(heater => { out += (first?"":":") + heater; (first = false) })
				}
			}
			first = true;
			out += "\nM567 P" + this.currentTool.number + " E";
			this.currentTool.mix.forEach(extruder => { out += (first?"":":") + extruder.toFixed(2); (first = false)})
			if (!this.disabled){
				out += '\nG10 P' + this.currentTool.number + ' X' + this.currentTool.offsets[0] + ' Y' + this.currentTool.offsets[1] + ' Z' + this.currentTool.offsets[2]
				out += '\nT' + this.currentTool.number;
				if(this.currentTool.active.length > 0 || this.currentTool.standby.length > 0) {
					out += '\nG10 P'  + this.currentTool.number
					if(this.currentTool.active.length > 0) {
						first = true;
						out += ' S'
						this.currentTool.active.forEach(heater => { out += (first?"":":") + heater; (first = false) })
					}
					if(this.currentTool.standby.length > 0) {
						first = true;
						out += ' R'
						this.currentTool.standby.forEach(heater => { out += (first?"":":") + heater; (first = false) })
					}
				}
			}
			//console.log(out);
			this.sendCode(out)
			this.extrusionSum = Math.round(this.currentTool.mix.reduce((a,b) => parseFloat(a)+parseFloat(b))*100);
		},
		editMix(index, mix) {
			//console.log(index, mix);
			if (!this.currentTool) {
				return;
			}
			let first = true;
			let letter = 65;
			let newMix = []
			this.mixC.forEach(mix => newMix.push(mix))
			newMix[index] = parseFloat(mix).toFixed(0)
			this.mixC = newMix
			this.currentTool.mix[index] = (newMix[index]/100).toFixed(2)
			let out = ""
			if (!this.disabled){
				out += "M563 P" + this.currentTool.number + ' S"'
				this.mixC.forEach(extruder => out += (first?(first = false):"+") + parseFloat(extruder).toFixed(0) + String.fromCharCode(letter++))
				out += '" D'
				first = true;
				this.currentTool.extruders.forEach(extruder => { out += (first?"":":") + extruder; (first = false) })
				if(this.currentTool.heaters.length > 0) {
					first = true;
					out += ' H'
					this.currentTool.heaters.forEach(heater => { out += (first?"":":") + heater; (first = false) })
				}
			}
			first = true;
			out += "\nM567 P" + this.currentTool.number + " E";
			this.mixC.forEach(extruder => { out += (first?"":":") + (parseInt(extruder)/100).toFixed(2); (first = false)})
			if (!this.disabled){
				out += '\nT' + this.currentTool.number;
				if(this.currentTool.active.length > 0 || this.currentTool.standby.length > 0) {
					out += '\nG10 P'  + this.currentTool.number
					if(this.currentTool.active.length > 0) {
						first = true;
						out += ' S'
						this.currentTool.active.forEach(heater => { out += (first?"":":") + heater; (first = false) })
					}
					if(this.currentTool.standby.length > 0) {
						first = true;
						out += ' R'
						this.currentTool.standby.forEach(heater => { out += (first?"":":") + heater; (first = false) })
					}
				}
			}
			//console.log(out);
			this.sendCode(out)
			this.extrusionSum = Math.round(this.currentTool.mix.reduce((a,b) => (parseFloat(a)+parseFloat(b)))*100);
		}
	},
	mounted() {
		this.amount = this.extruderAmounts[3];
		this.feedrate = this.extruderFeedrates[3];
		//console.log(this.tools)
		if (this.currentTool) {
			//console.log(this.currentTool)
			if (this.mixC == undefined)
			{
				this.mixC = []
			}

			if (this.currentTool && this.currentTool.mix && this.currentTool.mix.length > 1) {
				this.currentTool.mix.forEach((mix, index) => {
					//console.log(index, mix*100);
					this.mixC[index] = (mix * 100).toFixed(0)
					this.mixBtn[index] = mix * 100 + '%'
				})
				this.extrusionSum = Math.round(this.currentTool.mix.reduce((a,b) => (parseFloat(a)+parseFloat(b)))*100);
			}
		}
	},
	watch: {
		currentTool: {
			deep: true,
			handler(to) {
				//console.log(to)
				if (!to || to.extruders.length <= 1) {
					// Switch back to mixing mode if the selection panel is hidden
					this.mix = ['mix'];
				}
				if (this.currentTool && this.currentTool.mix && this.currentTool.mix.length > 1) {
					if (this.mixC == undefined)
					{
						this.mixC = []
					}
					this.currentTool.mix.forEach((mix, index) => {
						if (this.mixC[index] != mix * 100)
						this.mixC[index] = (mix * 100).toFixed(0)
						this.mixBtn[index] = (mix * 100).toFixed(0) + '%'
					})
					//console.log(this.currentTool)
					this.extrusionSum = Math.round(this.currentTool.mix.reduce((a,b) => (parseFloat(a)+parseFloat(b)))*100);
				}
			}
		},
		extruderAmounts() {
			this.amount = this.extruderAmounts[0];
		},
		extruderFeedrates() {
			this.feedrate = this.extruderFeedrates[0];
		},
		extrusionSum() {
			if (!this.currentTool) {
				return;
			}
			Math.round(this.currentTool.mix.reduce((a,b) => (parseFloat(a)+parseFloat(b)))*100)
			//console.log(this.extrusionSum, sumMix)
		}
	}
}
</script>
