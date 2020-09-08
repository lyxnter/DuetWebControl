'use strict'

import Vue from 'vue'

import LayerChart from './LayerChart.vue'
import TemperatureChart from './TemperatureChart.vue'
import FanChart from './FanChart.vue'

Vue.component('layer-chart', LayerChart)
Vue.component('temperature-chart', TemperatureChart)
Vue.component('fan-chart', FanChart)

export default {
	LayerChart,
	TemperatureChart,
	FanChart
}
