'use strict'

import Vue from 'vue'

import MaterialFileList from './MaterialFileList.vue'
import FilamentFileList from './FilamentFileList.vue'
import LiquidFileList from './LiquidFileList.vue'
import FiberFileList from './FiberFileList.vue'
import PelletFileList from './PelletFileList.vue'

Vue.component('material-file-list', MaterialFileList)
Vue.component('filament-file-list', FilamentFileList)
Vue.component('liquid-file-list', LiquidFileList)
Vue.component('fiber-file-list', FiberFileList)
Vue.component('pellet-file-list', PelletFileList)

export default {
	MaterialFileList,
	FilamentFileList,
	LiquidFileList,
	FiberFileList,
	PelletFileList
}
