<style scoped>
.card {
	display: flex;
	flex-direction: column;
	width: 97%;
	min-height: 200px;
}

.content {
	position: relative;
	flex-grow: 1;
}

.content > canvas {
	position: absolute;
}
</style>

<template>
	<v-card class="card">
		<v-card-title class="pt-2 pb-0">
			<v-icon class="mr-1">show_chart</v-icon> {{ $t('chart.temperature.caption') }}

			<v-spacer></v-spacer>

			<!--v-menu v-model="dropdownShown" offset-y left :close-on-content-click="false" :disabled="uiFrozen">
				<a slot="activator" ref="dropdownActivator" href="#" @click.prevent tabindex="0" @keyup.enter="showDropdown">
					<v-icon small>more_vert</v-icon> {{ $t('panel.tools.controlAll') }}
				</a>
				<v-card>
					<v-layout justify-center column class="pt-2 px-2">
						<v-flex d-flex>
							<v-text-field label="Show last" ></v-text-field>
							<v-select :items="['hour','min','sec']""></v-select>
							<v-btn @click="setMaxSamples()">Submit</v-btn>
						</v-flex>
						<v-btn @click="setMaxSamples(10, 60)"> show last 10 min </v-btn>
						<v-btn @click="setMaxSamples(30, 60)"> show last 30 min </v-btn>
						<v-btn @click="setMaxSamples(1,3600)"> show last 1 hour </v-btn>
						<v-btn @click="setMaxSamples(0,0)"> show since startup </v-btn>
					</v-layout>
				</v-card>
			</v-menu-->
		</v-card-title>

		<v-card-text class="content px-2 py-0" v-show="hasData">
			<canvas ref="chart"></canvas>
		</v-card-text>

		<v-spacer v-show="!hasData"></v-spacer>
		<v-card-text class="pa-0" v-show="!hasData">
			<v-alert :value="true" type="info" class="mb-0">
				{{ $t('chart.temperature.noData') }}
			</v-alert>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import Chart from 'chart.js'
import { mapState, mapGetters } from 'vuex'

import i18n from '../../i18n'
import { defaultMachine } from '../../store/machine'
import { getRealHeaterColor } from '../../utils/colors.js'

const sampleInterval = 1000			// ms
const defaultMaxTemperature = 50	// degC
var maxSamples = 600				// 10min
var maxTemperature = defaultMaxTemperature; // Maximum observed temp rounded

function makeDataset(heaterIndex, extra, label) {
	const color = getRealHeaterColor(heaterIndex, extra);
	var dataset = {
		heaterIndex,
		extra,
		label,
		fill: false,
		backgroundColor: color,
		borderColor: color,
		borderDash: extra ? [10, 5] : undefined,
		borderWidth: 2,
		data: [],
		locale: i18n.locale,
		pointRadius: 0,
		pointHitRadius: 0,
		showLine: true
	};
	dataset.data = (new Array(1)).fill(NaN);
	return dataset;
}

var tempSamples = {
	[defaultMachine]: {
		times: [],
		temps: []
	}
}

function pushSeriesData(machine, heaterIndex, heater, extra) {
	// Get series from dataset
	const machineData = tempSamples[machine];
	let dataset = machineData.temps.find(function(item) {
		if (item.heaterIndex === heaterIndex && item.extra === extra) {
			return item;
		}
	});

	if (!dataset || dataset.locale !== i18n.locale) {
		const label = heater.name ? heater.name : i18n.t('chart.temperature.heater', [heaterIndex]);
		if (dataset) {
			dataset.label = label;
			dataset.locale = i18n.locale;
		} else {
			dataset = makeDataset(heaterIndex, extra, label);
			machineData.temps.push(dataset);
		}
	}

	// Add new sample
	dataset.data.push(heater.current);

}

function isHeaterConfigured(state, machine, heaterIndex) {
	if (state.machines[machine].model.tools.some(tool => tool.heaters.indexOf(heaterIndex) !== -1)) { return true; }
	if (state.machines[machine].model.heat.beds.some(bed => bed && bed.heaters.indexOf(heaterIndex) !== -1)) { return true; }
	if (state.machines[machine].model.heat.chambers.some(chamber => chamber && chamber.heaters.indexOf(heaterIndex) !== -1)) { return true; }
	return false;
}

let storeSubscribed = false, instances = []

export default {
	computed: {
		...mapState(['selectedMachine']),
		...mapGetters(['isConnected', 'uiFrozen']),
		...mapGetters('machine/model', ['maxHeaterTemperature']),
		...mapState('machine/model', ['heat', 'tools']),
		...mapState('machine/settings', ['displayedExtraTemperatures']),
		...mapState('settings', ['darkTheme']),
		hasData() { return this.heat.heaters.length || this.displayedExtraTemperatures.length; }
	},
	data() {
		return {
			dropdownShown: false,
			chart: null,
			pauseUpdate: false
		}
	},
	methods: {
		update() {
			if(tempSamples[this.selectedMachine].temps.length > 1){
				this.chart.data.labels = tempSamples[this.selectedMachine].times.slice(-maxSamples);
				function iterationCopy(src) {
				  let target = [];
				  for (let prop in src) {
				    if (src.hasOwnProperty(prop)) {
				      target[prop] = src[prop];
				    }
				  }
				  return target;
				}
				var customDatasets = []//iterationCopy(this.chart.data.datasets);
				for (var i = 0; i < tempSamples[this.selectedMachine].temps.length; i++)
				{
					customDatasets[i] = [];
					for(var j = Math.max(0, tempSamples[this.selectedMachine].temps[i].data.length - maxSamples);
					 				j < tempSamples[this.selectedMachine].temps[i].data.length; j++) {
						customDatasets[i].push(tempSamples[this.selectedMachine].temps[i].data[j]);
					}
					this.chart.data.datasets[i].data = customDatasets[i];
				}
				//console.log(tempSamples[this.selectedMachine].times.length);
			}
			this.chart.config.options.scales.xAxes[0].ticks.max = new Date();
			this.chart.config.options.scales.yAxes[0].ticks.max = maxTemperature;
			this.chart.config.options.scales.yAxes[0].ticks.stepSize = (maxTemperature <= 50 ? 10 : (maxTemperature <= 150 ? 25 : (maxTemperature <= 300 ? 50 : 100)))
			this.chart.update();
		},
		applyDarkTheme(active) {
			const legendColor = active ? '#FFF' : 'rgba(0,0,0,0.87)';
			this.chart.config.options.legend.labels.fontColor = legendColor;

			const ticksColor = active ? '#FFF' : '#666';
			this.chart.config.options.scales.xAxes[0].ticks.major.fontColor = ticksColor;
			this.chart.config.options.scales.xAxes[0].ticks.minor.fontColor = ticksColor;
			this.chart.config.options.scales.yAxes[0].ticks.major.fontColor = ticksColor;
			this.chart.config.options.scales.yAxes[0].ticks.minor.fontColor = ticksColor;

			const gridLineColor = active ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
			this.chart.config.options.scales.xAxes[0].gridLines.color = gridLineColor;
			this.chart.config.options.scales.yAxes[0].gridLines.color = gridLineColor;
			this.chart.config.options.scales.yAxes[0].gridLines.zeroLineColor = gridLineColor;

			this.chart.update();
		},
		setMaxSamples(duration, multiplier){
			maxSamples = duration*multiplier;
		}
	},
	mounted() {
		// Create new chart options. Don't use data for the following because it should not be reactive
		this.options = {
			animation: {
				duration: 0					// general animation time
			},
			elements: {
				line: {
					tension: 0				// disable bezier curves
				}
			},
			legend: {
				labels: {
					filter: (legendItem, data) => data.datasets[legendItem.datasetIndex].showLine,
					fontFamily: 'Roboto,sans-serif'
				}
			},
			maintainAspectRatio: false,
			responsive: true,
			responsiveAnimationDuration: 0, // animation duration after a resize
			scales: {
				xAxes: [
					{
						gridLines: {
							color: 'rgba(0,0,0,0.2)',
							display: true
						},
						ticks: {
							minor: {
								fontColor: 'rgba(0,0,0,0.87)',
								fontFamily: 'Roboto,sans-serif'
							},
							major: {
								fontColor: 'rgba(0,0,0,0.87)',
								fontFamily: 'Roboto,sans-serif'
							},
							max: new Date()
						},
						time: {
							unit: 'minute',
							displayFormats: {
								minute: 'HH:mm'
							}
						},
						type: 'time'
					}
				],
				yAxes: [
					{
						gridLines: {
							color: 'rgba(0,0,0,0.2)',
							zeroLineColor: 'rgba(0,0,0,0.2)',
							display: true
						},
						ticks: {
							minor: {
								fontColor: '#666',
								fontFamily: 'Roboto,sans-serif'
							},
							major: {
								fontColor: '#666',
								fontFamily: 'Roboto,sans-serif'
							},
							min: 0,
							max: maxTemperature,
							stepSize: 10
						}
					}
				]
			}
		};

		console.log(this.selectedMachine);
		if(this.selectedMachine && this.selectedMachine !== "[default]") {
			// Add new dataset for added machines
			const dataset = {
				times: [],
				temps: []
			}
			tempSamples[this.selectedMachine] = dataset;

			dataset.times.push(new Date());
			// Fill times with some dummy data
			/*let t = new Date() - sampleInterval * maxSamples;
			for (let i = 0; i < maxSamples; i++) {
				dataset.times.push(t);
				t += sampleInterval;
			}*/
		}

		// Create the chart
		this.chart = Chart.Line(this.$refs.chart, {
			options: this.options,
			data: {
				labels: tempSamples[this.selectedMachine ? this.selectedMachine : defaultMachine].times,
				datasets: tempSamples[this.selectedMachine ? this.selectedMachine : defaultMachine].temps,
			}
		});
		this.applyDarkTheme(this.darkTheme);
		let that = this
		// Keep track of updates
		instances.push(this);
		if (!storeSubscribed) {
			this.$store.subscribe((mutation, state) => {
				const result = /machines\/(.+)\/model\/update/.exec(mutation.type);
				if (result) {
					// Keep track of temperature updates
					const machine = result[1], dataset = tempSamples[machine], now = new Date();
					if (dataset && now - dataset.times[dataset.times.length - 1] > sampleInterval) {
						// Record time
						dataset.times.push(now);
						// Record heater temperatures
						const usedHeaters = []
						state.machines[machine].model.heat.heaters.forEach(function(heater, heaterIndex) {
							if (heater) {
								if (Math.floor(heater.current) > maxTemperature && heater.current < 1000) {
									maxTemperature += (maxTemperature < 50 ? 10 : (maxTemperature < 150 ? 25 : (maxTemperature < 300 ? 50 : 100)));
									console.log(heater.current);
								}
								pushSeriesData(machine, heaterIndex, heater, false);
								if (isHeaterConfigured(state, machine, heaterIndex)) {
									// Display it only if is mapped to at least one tool, bed or chamber
									usedHeaters.push({ heaterIndex, extra: false });
								}
							}
						});

						state.machines[machine].model.heat.extra.forEach(function(heater, heaterIndex) {
							pushSeriesData(machine, heaterIndex, heater, true);
							if (state.machines[state.selectedMachine].settings.displayedExtraTemperatures.indexOf(heaterIndex) !== -1) {
								if (Math.floor(heater.current) > maxTemperature && heater.current < 1000) {
									maxTemperature += 25;
									console.log(heater.current);
								}
								// Visibility of extra temps can be configured
								usedHeaters.push({ heaterIndex, extra: true });
							}
						});

						// Cut off oldest samples and deal with visibility
						var is_NaN = false;
						dataset.temps.forEach(function(dataset) {
							if(isNaN(dataset.data[0]))
							{
								is_NaN = true;
							}
						})
						if(is_NaN) {
							console.log("time NaN")
							dataset.times.shift();
						}
						dataset.temps.forEach(function(dataset) {
							dataset.showLine = usedHeaters.some(item => item.heaterIndex === dataset.heaterIndex && item.extra === dataset.extra);
							if(is_NaN) {
								dataset.data.shift();
								console.log("temp NaN");
							}
						});

						// Tell chart instances to update
						instances.forEach(instance => instance.update());
					}
				} else if (mutation.type === 'addMachine') {
					// Add new dataset for added machines
					const dataset = {
						times: [],
						temps: []
					}
					tempSamples[mutation.payload.hostname] = dataset;

					dataset.times.push(new Date());
					// Fill times with some dummy data
					/*let t = new Date() - sampleInterval * maxSamples;
					for (let i = 0; i < maxSamples; i++) {
						dataset.times.push(t);
						t += sampleInterval;
					}*/
				} else {
					// Delete datasets of disconnected machines
					const result = /machines\/(.+)\/unregister/.exec(mutation.type);
					if (result) {
						const machine = result[1];
						if (tempSamples[machine] !== undefined) {
							delete tempSamples[machine];
						}
					}
				}
			});

			storeSubscribed = true;
		}
	},
	beforeDestroy() {
		instances = instances.filter(instance => instance !== this, this);
	},
	watch: {
		darkTheme(to) {
			this.applyDarkTheme(to);
		},
		selectedMachine(machine) {
			// Each chart instance is fixed to the currently selected machine
			// Reassign the corresponding dataset whenever the selected machine changes
			console.log(machine);
			maxTemperature = defaultMaxTemperature;
			this.chart.config.data = {
				labels: tempSamples[machine].times,
				datasets: tempSamples[machine].temps
			};
			this.update();
		}
	}
}
</script>
