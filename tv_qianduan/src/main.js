import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './common/style/reset.css';
import Ajax from './common/js/ajax';
Vue.use(Ajax);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
