'use strict'

import Vue from 'vue'

import FiberFileList from './FiberFileList.vue'
import FilamentFileList from './FilamentFileList.vue'
import LiquidFileList from './LiquidFileList.vue'
import MaterialFileList from './MaterialFileList.vue'
import PasteFileList from './PasteFileList.vue'
import PelletFileList from './PelletFileList.vue'

Vue.component('fiber-file-list', FiberFileList)
Vue.component('filament-file-list', FilamentFileList)
Vue.component('liquid-file-list', LiquidFileList)
Vue.component('material-file-list', MaterialFileList)
Vue.component('paste-file-list', PasteFileList)
Vue.component('pellet-file-list', PelletFileList)

export default {
	FiberFileList,
	FilamentFileList,
	LiquidFileList,
	MaterialFileList,
	PasteFileList,
	PelletFileList
}
