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
			<v-icon class="mr-1">show_chart</v-icon> {{ $t('chart.fan.caption') }}
		</v-card-title>

		<v-card-text class="content px-2 py-0" v-show="hasData" style="min-height: 300px">
			<canvas ref="chart"></canvas>
		</v-card-text>
		<v-card style="margin-left: 2%; width: 96%; height: 100px">
			<v-card-title class="pt-2 pb-0">
				{{ $t('chart.smoothing.caption') }}
			</v-card-title>
			<div style="margin-left: 2%; width: 97%;">
				<v-slider v-model="smoothing" :min="0" :max="3" hide-details color="primary" :tick-labels="labels"></v-slider>
			</div>
		</v-card>

		<v-spacer v-show="!hasData"></v-spacer>
		<v-card-text class="pa-0" v-show="!hasData">
			<v-alert :value="true" class="mb-0">
				{{ $t('chart.fan.noData') }}
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
var maxSamples = 600				// 10min

function makeDataset(fanIndex, label) {
	const color = getRealHeaterColor(fanIndex);
	var dataset = {
		fanIndex,
		label,
		fill: false,
		backgroundColor: color,
		borderColor: color,
		borderWidth: 2,
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

var pwmSamples = {
	[defaultMachine]: {
		times: [],
		fans: []
	}
}

function pushSeriesData(machine, fanIndex, pwm) {
	//console.log(machine, fanIndex, pwm)
	// Get series from dataset
	const machineData = pwmSamples[machine];
	let dataset = machineData.fans.find(function(item) {
		if (item.fanIndex === fanIndex) {
			return item;
		}
	});
	//console.log(machineData.fans, dataset)
	let label
	if (!dataset || dataset.locale !== i18n.locale) {
		label = pwm.name;
		if (dataset) {
			dataset.label = label;
			dataset.locale = i18n.locale;
		} else {
			dataset = makeDataset(fanIndex, label);
			machineData.fans.push(dataset);
		}
	}

	// Add new sample
	//dataset.data.push(pwm.value*100);
	dataset.rawData.push(pwm.value*100);
}

function isFanConfigured(state, machine, fanIndex) {
	//console.log(state.machines[machine].model.fans[fanIndex].name)
	return state.machines[machine].model.fans[fanIndex].name != ""
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
			if(pwmSamples[this.selectedMachine].fans.length > 1){
				this.chart.data.labels = pwmSamples[this.selectedMachine].times.slice(-maxSamples);
				pwmSamples[this.selectedMachine].times = pwmSamples[this.selectedMachine].times.slice(-maxSamples);
				var customDatasets = []//iterationCopy(this.chart.data.datasets);
				//console.log(this.smoothing)
				for (var i = 0; i < pwmSamples[this.selectedMachine].fans.length; i++)
				{
					customDatasets[i] = [];
					for(var j = Math.max(0, pwmSamples[this.selectedMachine].fans[i].rawData.length - maxSamples); j < pwmSamples[this.selectedMachine].fans[i].rawData.length; j++) {
						customDatasets[i].push(pwmSamples[this.selectedMachine].fans[i].rawData[j]);
					}
					this.chart.data.datasets[i].data = this.getSmoothedData(customDatasets[i], this.smoothing*this.smoothing) //customDatasets[i];
				}
				//console.log(pwmSamples[this.selectedMachine].times.length);
			}
			this.chart.config.options.scales.xAxes[0].ticks.max = new Date();
			this.chart.config.options.scales.yAxes[0].ticks.max = 100;
			this.chart.config.options.scales.yAxes[0].ticks.stepSize = 20
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
					if(dataset[i+j] != undefined && Math.abs(dataset[i] - dataset[i+j]) < 10) {
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
					tension: 0.1				// disable bezier curves
				}
			},
			legend: {
				position: (this.isLocal ? 'right' : 'top'),
				labels: {
					filter: (legendItem, data) => data.datasets[legendItem.datasetIndex].showLine && !isNaN(data.datasets[legendItem.datasetIndex].fanIndex),
					generateLabels: (chart) => {
						var data = chart.data;
						return data.datasets.map(function(dataset, i) {
							let text = dataset.label + (this.isLocal && dataset.data[dataset.data.length -1] >= 0 ? ": " +dataset.data[dataset.data.length-1].toFixed(1) : "")
							if (text.length > dataset.label.length) {
								text += this.isLocal ? "%" : ""
							}
							return {
								text: text,
								fillStyle: dataset.backgroundColor,
								hidden: !chart.isDatasetVisible(i) || dataset.data[dataset.data.length-1] < 0,
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
							max: 100,
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
				fans: []
			}
			pwmSamples[this.selectedMachine] = dataset;
			console.log(pwmSamples[this.selectedMachine], dataset)
			dataset.times.push(new Date());
		}

		// Create the chart
		this.chart = Chart.Line(this.$refs.chart, {
			options: this.options,
			data: {
				labels: pwmSamples[this.selectedMachine ? this.selectedMachine : defaultMachine].times,
				datasets: pwmSamples[this.selectedMachine ? this.selectedMachine : defaultMachine].fans,
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
					const machine = result[1], dataset = pwmSamples[machine], now = new Date();
					//console.log(machine, dataset)
					if (dataset && now - dataset.times[dataset.times.length - 1] > sampleInterval) {
						// Record time
						dataset.times.push(now);
						// Record heater temperatures
						const usedFans = []
						//console.log(state.machines[machine].model.fans)
						state.machines[machine].model.fans.forEach(function(fan, fanIndex) {
							if (fan) {
								pushSeriesData(machine, fanIndex, fan, state.machines[machine].model.fans, that);
								if (isFanConfigured(state, machine, fanIndex)) {
									// Display it only if is mapped to at least one tool, bed or chamber
									usedFans.push({ fanIndex });
								}
							}
						});

						// Cut off oldest samples and deal with visibility
						var is_NaN = false;
						dataset.fans.forEach(function(dataset) {
							if(isNaN(dataset.data[0]))
							{
								is_NaN = true;
							}
						})
						if(is_NaN) {
							//console.log("time NaN")
							dataset.times.shift();
						}
						dataset.fans.forEach(function(dataset) {
							dataset.showLine = usedFans.some(item => ( item.fanIndex === dataset.fanIndex ));
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
						fans: []
					}
					pwmSamples[mutation.payload.hostname] = dataset;

					dataset.times.push(new Date());
					// Fill times with some dummy data
				} else {
					// Delete datasets of disconnected machines
					const result = /machines\/(.+)\/unregister/.exec(mutation.type);
					if (result) {
						const machine = result[1];
						if (pwmSamples[machine] !== undefined) {
							delete pwmSamples[machine];
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
			this.chart.config.data = {
				labels: pwmSamples[machine].times,
				datasets: pwmSamples[machine].fans
			};
			this.update();
		}
	}
}
</script>
