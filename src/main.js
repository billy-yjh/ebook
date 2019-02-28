import Vue from 'vue'
import App from './App.vue'
import router from './router'
import i18n from './lang'
import store from './store/store'
/*
 *引入字体图标
 */
import './assets/styles/icon.css'
/**
 * 引入自定义字体
 */
// import './assets/fonts/daysOne.css'

import './assets/styles/global.scss'

Vue.config.productionTip = false

new Vue({
  router,
  i18n,
  store,
  render: h => h(App)
}).$mount('#app')
