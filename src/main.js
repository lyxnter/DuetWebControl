import Vue from 'vue';
import Vuelidate from 'vuelidate';
import App from './App.vue';
import vuetify from './plugins/vuetify';
import VueCookie from 'vue-cookie';
import store from './store';
import router from './routes';
import router2 from './router';
import i18n from './i18n';
import VueBreadcrumbs from 'vue-breadcrumbs';
import 'vuetify/dist/vuetify.min.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import './components';
import Plugins from './plugins';

Vue.config.productionTip = false;

Vue.use(Vuelidate);
Vue.use(VueCookie);
Vue.use(VueBreadcrumbs);
Vue.use(Plugins);
var vm= new Vue({
  i18n,
  router,
	router2,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app');

//regarde la derniere session pour y mettre le language
if (vm.$cookie.get('LANGUAGE')) {
  i18n.locale = vm.$cookie.get('LANGUAGE');
}
