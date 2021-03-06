<style scoped>
.card {
	display: flex;
	flex-direction: column;
	width: 100%;
}

.content {
	position: relative;
	flex-grow: 1;
	min-height: 200px;
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
		<v-card-title>
			<span :class="{local: isLocal}">
				<v-icon small class="mr-1">timeline</v-icon> {{ $t('chart.layer.caption') }}
			</span>
			<v-spacer></v-spacer>
			<a v-show="job.layers.length > 30" href="#" @click.prevent="showAllLayers = !showAllLayers">
				{{ showAllLayers ? $t('chart.layer.showLastLayers', [30]) : $t('chart.layer.showAllLayers') }}
			</a>
		</v-card-title>

		<v-card-text class="content px-2 py-0">
			<canvas ref="chart"></canvas>
		</v-card-text>
	</v-card>
</template>

<script>
'use strict'

import Chart from 'chart.js'

import { mapState } from 'vuex'

import { display, displayZ, displayTime } from '../../plugins/display.js'

let layers;
var maxLayerTime = 3;
var maxLastLayerTime = 3;

export default {
	computed: {
		...mapState('machine/model', ['job']),
		...mapState('settings', ['darkTheme', 'language']),
		...mapState(['isLocal']),
	},
	data() {
		return {
			chart: null,
			showAllLayers: false
		}
	},
	methods: {
		logN: function(base, value) {
			return Math.log(value) / Math.log(base);
		},
		updateChart() {
			layers = this.job.layers;
			this.chart.data.labels = layers.map((dummy, index) => index + 1);
			this.chart.data.datasets[0].data = layers.map(layer => layer.duration);
			if (layers.length > 2) {
				layers.forEach((layer) => {
					if (layer.duration > maxLayerTime)
					maxLayerTime = layer.duration;
				});
				maxLastLayerTime = 0;
				for(var i = Math.max(0, layers.length-30); i < layers.length; i++) {
					if (layers[i].duration > maxLastLayerTime){
						maxLastLayerTime = layers[i].duration;
					}
				}
			} else {
				maxLayerTime = 0;
				layers.forEach((layer) => {
					if (layer.duration > maxLayerTime)
					maxLayerTime = layer.duration;
				});
			}
			//console.log(maxLayerTime + "s");
			//console.log(maxLastLayerTime + "s");
			if (this.showAllLayers) {
				this.chart.config.options.scales.xAxes[0].ticks.min = 1;
				this.chart.config.options.scales.xAxes[0].ticks.max = layers.length;
				this.chart.config.options.scales.xAxes[0].ticks.stepSize = 5;
				this.chart.config.options.scales.yAxes[0].ticks.max = (60*Math.ceil(maxLayerTime / Math.pow(60,Math.floor(this.logN(60, maxLayerTime)))));
				this.chart.config.options.scales.yAxes[0].ticks.stepSize = (10*Math.ceil(maxLastLayerTime / Math.pow(60,Math.floor(this.logN(60, maxLastLayerTime)))));
			} else {
				this.chart.config.options.scales.xAxes[0].ticks.min = Math.max((layers.length > 2) ? 2 : 1, layers.length - 30);
				this.chart.config.options.scales.xAxes[0].ticks.max = Math.max(30, layers.length);
				this.chart.config.options.scales.xAxes[0].ticks.stepSize = 1;
				this.chart.config.options.scales.yAxes[0].ticks.max = (60*Math.ceil(maxLastLayerTime / Math.pow(60,Math.floor(this.logN(60, maxLastLayerTime)))));
				this.chart.config.options.scales.yAxes[0].ticks.stepSize = (10*Math.ceil(maxLastLayerTime / Math.pow(60,Math.floor(this.logN(60, maxLastLayerTime)))));
			}
			this.chart.update();
		},
		applyDarkTheme(active) {
			const ticksColor = active ? '#FFF' : '#666';
			this.chart.config.options.scales.xAxes[0].ticks.minor.fontColor = ticksColor;
			this.chart.config.options.scales.xAxes[0].ticks.major.fontColor = ticksColor;
			this.chart.config.options.scales.yAxes[0].ticks.major.fontColor = ticksColor;
			this.chart.config.options.scales.yAxes[0].ticks.minor.fontColor = ticksColor;

			const gridLineColor = active ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
			this.chart.config.options.scales.xAxes[0].gridLines.color = gridLineColor;
			this.chart.config.options.scales.yAxes[0].gridLines.color = gridLineColor;
			this.chart.config.options.scales.yAxes[0].gridLines.zeroLineColor = gridLineColor;

			this.chart.update();
		}
	},
	mounted() {
		// Create new chart options. Don't use data for the following because it should not be reactive
		const that = this;
		this.options = {
			elements: {
				line: {
					tension: 0
				}
			},
			legend: {
				display: false
			},
			maintainAspectRatio: false,
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
							beginAtZero: true,
							maxRotation: 0,
							stepSize: 5
						}
					}
				],
				yAxes: [
					{
						gridLines: {
							color: 'rgba(0,0,0,0.87)',
							zeroLineColor: 'rgba(0,0,0,0.2)',
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
							beginAtZero: true,
							stepSize: 10,
							suggestedMax: 30,
							callback: function(value) {
								return displayTime(value, false);
							}
						}
					}
				]
			},
			tooltips: {
				displayColors: false,
				callbacks: {
					title: tooltipItems => that.$t('chart.layer.layer', [tooltipItems[0].index + 1]),
					label(tooltipItem) {
						const layer = layers[tooltipItem.index];
						let result = [that.$t('chart.layer.layerDuration', [displayTime(layer.duration, false)])];
						if (layer.height) { result.push(that.$t('chart.layer.layerHeight', [displayZ(layer.height)])); }
						if (layer.filament) { result.push(that.$t('chart.layer.filamentUsage', [display(layer.filament, 1, 'mm')])); }
						if (layer.fractionPrinted) { result.push(that.$t('chart.layer.fractionPrinted', [display(layer.fractionPrinted * 100, 1, '%')])); }
						return result;
					}
				}
			}
			// panning and zooming is not supported until the panning feature of chartjs-plugin-zoom is fixed
		};

		// Create the chart
		this.chart = Chart.Line(this.$refs.chart, {
			options: this.options,
			data: {
				datasets: [{
					borderColor: 'rgba(253, 189, 28, 0.8)', //'rgba(0, 129, 214, 0.8)',
					backgroundColor: 'rgba(253, 189, 28, 0.8)', //'rgba(0, 129, 214, 0.8)',
					fill: false,
					label: this.$t('chart.layer.layerTime')
				}]
			}
		});
		this.applyDarkTheme(this.darkTheme);
		this.updateChart();
	},
	watch: {
		darkTheme(to) {
			this.applyDarkTheme(to);
		},
		language() {
			this.chart.data.datasets[0].label = this.$t('chart.layer.layerTime');
		},
		'job.layers'() {
			this.updateChart();
		},
		showAllLayers() {
			this.updateChart();
		}
	}
}
</script>
