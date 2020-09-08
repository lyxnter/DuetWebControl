'use strict'

import Vue from 'vue'

import BaseFileList from './BaseFileList.vue'
import DisplayFileList from './DisplayFileList.vue'
import EventList from './EventList.vue'
import JobFileList from './JobFileList.vue'
import MacroFileList from './MacroFileList.vue'
import MacroList from './MacroList.vue'
import GcodeList from './GcodeList.vue'
import SysFileList from './SysFileList.vue'
import TimelapseFileList from './TimelapseFileList.vue'
import materials from './materials'

Vue.component('base-file-list', BaseFileList)
Vue.component('display-file-list', DisplayFileList)
Vue.component('event-list', EventList)
Vue.component('job-file-list', JobFileList)
Vue.component('macro-file-list', MacroFileList)
Vue.component('macro-list', MacroList)
Vue.component('gcode-list', GcodeList)
Vue.component('sys-file-list', SysFileList)
Vue.component('timelapse-file-list', TimelapseFileList)

export default {
	DisplayFileList,
	EventList,
	JobFileList,
	MacroFileList,
	MacroList,
	GcodeList,
	SysFileList,
	TimelapseFileList,
	materials
}
