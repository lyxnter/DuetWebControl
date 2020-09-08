<style scoped>
.card {
	display: flex;
	flex-direction: column;
	width: 97%;
	min-height: 250px;
}

.content {
	position: relative;
	flex-grow: 1;
}

.content > canvas {
	position: absolute;
}

.local {
	font-size: large;
}
</style>

<template>
	<v-card class="card">
		<v-card-title class="pt-2 pb-0" :class="{local: isLocal}">
			<v-icon class="mr-1">show_chart</v-icon> {{ $t('chart.temperature.caption') }}

			<v-spacer></v-spacer>

		</v-card-title>

		<v-card-text class="content px-2 py-0" v-show="hasData">
			<canvas ref="chart"></canvas>
		</v-card-text>
		<v-card v-if="false" style="margin-left: 2%; width: 96%; height: 100px">
			<v-card-title class="pt-2 pb-0">
				{{ $t('chart.smoothing.caption') }}
			</v-card-title>
			<div style="margin-left: 2%; width: 97%;">
				<v-slider v-model="smoothing" :min="0" :max="3" hide-details color="primary" :tick-labels="labels"></v-slider>
			</div>
		</v-card>

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
	let trueHeater = isNaN(parseInt(heaterIndex)) ? parseInt(heaterIndex.substr(1)) : heaterIndex
	const color = getRealHeaterColor(trueHeater, extra);
	var dataset = {
		heaterIndex,
		extra,
		label,
		fill: false,
		backgroundColor: color,
		borderColor: color,
		borderDash: extra ? [10, 5] : isNaN(parseInt(heaterIndex)) ? [5, 5] : undefined,
		borderWidth: extra ? 1 : 2,
		data: [],
		rawData: [],
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

function pushSeriesData(machine, heaterIndex, heater, extra, tools, that) {
	// Get series from dataset
	const machineData = tempSamples[machine];
	let dataset = machineData.temps.find(function(item) {
		if (item.heaterIndex === heaterIndex && item.extra === extra) {
			return item;
		}
	});
	const tool = (tools.filter((tool) => tool.heaters.includes(heaterIndex)))[0]
	let label
	if (!dataset || dataset.locale !== i18n.locale) {
		if (extra) {
			label = heater.name;
		} else {
			if (tool) {
				label = (heater.name ? heater.name : (tool.name ? tool.name : (tool.number ? tool.number : i18n.t('chart.temperature.heater', [heaterIndex]))))
			} else {
				label = heaterIndex == 0 ?
				(i18n.t('panel.tools.bed', [''])) :
				heaterIndex == 4 ?
				(i18n.t('panel.tools.chamber', [''])) :
				(heater.name ?
					heater.name :
					i18n.t('chart.temperature.heater', [heaterIndex]));
				}
			}
			if (dataset) {
				dataset.label = label;
				dataset.locale = i18n.locale;
			} else {
				dataset = makeDataset(heaterIndex, extra, label);
				machineData.temps.push(dataset);
			}
		}

		// Add new sample
		dataset.rawData.push(heater.current);

		if (!extra && heaterIndex <= 4) {
			dataset = machineData.temps.find(function(item) {
				if (item.heaterIndex === "t"+heaterIndex) {
					return item;
				}
			});
			let target = -1;
			if (tool) {
				target = (heater.state == 2 ? tool.active : (heater.state == 1 ? tool.standby : [-1]))[tool.heaters.indexOf(heaterIndex)]
			} else if (heaterIndex == 0) { // Bed Heater
				let bed = that.heat.beds.filter(bed => bed.heaters.includes(heaterIndex))[0]
				target = (heater.state == 2 ? bed.active : (heater.state == 1 ? bed.standby : [-1]))[bed.heaters.indexOf(heaterIndex)]
			} else if (heaterIndex == 4){ // Chamber Heater
				let chamber = that.heat.chambers.filter(chamber => chamber.heaters.includes(heaterIndex))[0]
				target = (heater.state == 2 ?chamber.active : (heater.state == 1 ? chamber.standby : [-1]))[chamber.heaters.indexOf(heaterIndex)]
			}
			if (!dataset || dataset.locale !== i18n.locale) {
				if (dataset) {
					dataset.label = ("Tgt " + label).substr(0,8);
					dataset.locale = i18n.locale;
				} else {
					dataset = makeDataset( "t"+heaterIndex, false, ("Tgt " + label).substr(0,8));
					machineData.temps.push(dataset);
				}
			}
			// Add new sample
			dataset.rawData.push(target);
		}
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
			...mapState(['selectedMachine', 'isLocal']),
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
				pauseUpdate: false,
				smoothing: 1,
				labels: [],
			}
		},
		methods: {
			update() {
				if(tempSamples[this.selectedMachine].temps.length > 1){
					this.chart.data.labels = tempSamples[this.selectedMachine].times.slice(-maxSamples);
					tempSamples[this.selectedMachine].times = tempSamples[this.selectedMachine].times.slice(-maxSamples);
					var customDatasets = []//iterationCopy(this.chart.data.datasets);
					for (var i = 0; i < tempSamples[this.selectedMachine].temps.length; i++)
					{
						customDatasets[i] = [];
						for(var j = Math.max(0, tempSamples[this.selectedMachine].temps[i].rawData.length - maxSamples); j < tempSamples[this.selectedMachine].temps[i].rawData.length; j++) {
							customDatasets[i].push(tempSamples[this.selectedMachine].temps[i].rawData[j]);
						}
						this.chart.data.datasets[i].data = this.getSmoothedData(customDatasets[i], this.smoothing*this.smoothing) //customDatasets[i];
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
			},
			getSmoothedData(dataset, smoothing) {
				let outputData = []
				for (var i = 0; i < dataset.length; i++)
				{
					let step = 0
					outputData[i] = 0
					for (var j = -smoothing; j <= smoothing; j++) {
						if(dataset[i+j] != undefined) {
							outputData[i] += dataset[i+j]
							step++
						}
					}
					outputData[i] /= step
				}
				//console.log(dataset, outputData)
				return outputData;
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
					position: (this.isLocal ? 'right' : 'top'),
					labels: {
						filter: (legendItem, data) => data.datasets[legendItem.datasetIndex].showLine && !isNaN(data.datasets[legendItem.datasetIndex].heaterIndex),
						generateLabels: (chart) => {
							var data = chart.data;
							return data.datasets.map(function(dataset, i) {
								let target = data.datasets.filter((data) => data.heaterIndex == "t"+dataset.heaterIndex && data.extra == dataset.extra && data.data[data.data.length -1] > 0);
								let text = dataset.label + (this.isLocal && (dataset.data[dataset.data.length -1] > 0 && dataset.data[dataset.data.length -1] < 1000) ? ": " +dataset.data[dataset.data.length-1].toFixed(1) : "")
								if (text.length > dataset.label.length && target.length > 0) {
									target = target[0];
									text += (target.data[dataset.data.length -1] > 0 && target.data[dataset.data.length -1] < 1000) ?
									" / " + target.data[dataset.data.length-1].toFixed(1) : ""
								}
								if (text.length > dataset.label.length) {
									text += this.isLocal ? "°C" : ""
								}
								return {
									text: text,
									fillStyle: dataset.backgroundColor,
									hidden: !chart.isDatasetVisible(i) || dataset.data[dataset.data.length -1] <= 0 || dataset.data[dataset.data.length -1] > 1000,
									lineCap: dataset.borderCapStyle,
									lineDash: dataset.borderDash,
									lineDashOffset: dataset.borderDashOffset,
									lineJoin: dataset.borderJoinStyle,
									lineWidth: dataset.borderWidth,
									strokeStyle: dataset.borderColor,
									pointStyle: dataset.pointStyle,
									// Below is extra data used for toggling the datasets
									datasetIndex: i
								};
							}, this);
						},
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
							type: 'time',
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

			//console.log(this.selectedMachine);
			if(this.selectedMachine && this.selectedMachine !== "[default]") {
				// Add new dataset for added machines
				const dataset = {
					times: [],
					temps: []
				}
				tempSamples[this.selectedMachine] = dataset;

				dataset.times.push(new Date());
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
									if (Math.floor(heater.current) > maxTemperature && heater.current < heater.max) {
										maxTemperature += (maxTemperature < 50 ? 10 : (maxTemperature < 150 ? 25 : (maxTemperature < 300 ? 50 : 100)));
									}
									pushSeriesData(machine, heaterIndex, heater, false, that.tools, that);
									if (isHeaterConfigured(state, machine, heaterIndex)) {
										// Display it only if is mapped to at least one tool, bed or chamber
										usedHeaters.push({ heaterIndex, extra: false });
									}
								}
							});

							state.machines[machine].model.heat.extra.forEach(function(heater, heaterIndex) {
								pushSeriesData(machine, heaterIndex, heater, true, that.tools, that);
								if (state.machines[state.selectedMachine].settings.displayedExtraTemperatures.indexOf(heaterIndex) !== -1) {
									if (Math.floor(heater.current) > maxTemperature && heater.current < 1000) {
										maxTemperature += 25;
										//console.log(heater.current);
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
								//console.log("time NaN")
								dataset.times.shift();
							}
							dataset.temps.forEach(function(dataset) {
								dataset.showLine = usedHeaters.some(item => ( item.heaterIndex === dataset.heaterIndex || "t"+item.heaterIndex  === dataset.heaterIndex ) && item.extra === dataset.extra);
								if(is_NaN) {
									dataset.data.shift();
									//console.log("temp NaN");
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

			this.labels = [this.$t('chart.smoothing.off'),this.$t('chart.smoothing.low'),this.$t('chart.smoothing.med'),this.$t('chart.smoothing.high')]
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
				//console.log(machine);
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
