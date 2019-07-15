'use strict'

import Vue from 'vue'

import CodeBtn from './CodeBtn.vue'
import ConnectBtn from './ConnectBtn.vue'
import EmergencyBtn from './EmergencyBtn.vue'
import LoginBtn from './LoginBtn.vue'
import LoadToolBtn from './LoadToolBtn.vue'
import SDCardBtn from './SDCardBtn.vue'
import UploadBtn from './UploadBtn.vue'

Vue.component('code-btn', CodeBtn)
Vue.component('connect-btn', ConnectBtn)
Vue.component('emergency-btn', EmergencyBtn)
Vue.component('login-btn', LoginBtn)
Vue.component('loadtool-btn', LoadToolBtn)
Vue.component('sd-card-btn', SDCardBtn)
Vue.component('upload-btn', UploadBtn)

export default {
	CodeBtn,
	ConnectBtn,
	EmergencyBtn,
	LoginBtn,
	LoadToolBtn,
	SDCardBtn,
	UploadBtn
}
