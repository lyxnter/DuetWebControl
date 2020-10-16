'use strict'

import Vue from 'vue'
import vuetify from './plugins/vuetify';
import Vuelidate from 'vuelidate';
import App from './App.vue'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import './components'


import plugins from './plugins'
import i18n from './i18n'
import router2 from './routes'
import router from './router'
import store from './store'

Vue.config.productionTip = false

Vue.use(plugins)

Vue.use(vuetify, {
	lang: { t: (key, ...params) => i18n.t(key, params) }
})


/* eslint-disable no-new */
new Vue({
	el: '#app',
	i18n,
	render: h => h(App),
	router,
	router2,
	vuetify,
	store
})
