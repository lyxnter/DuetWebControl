'use strict'

import Vue from 'vue'

import CodeInput from './CodeInput.vue'
import ToolInput from './ToolInput.vue'
import KeyboardInput from './KeyboardInput.vue'

Vue.component('code-input', CodeInput)
Vue.component('tool-input', ToolInput)
Vue.component('keyboard-input', KeyboardInput)

export default { CodeInput }
