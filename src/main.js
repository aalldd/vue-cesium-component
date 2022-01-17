import Vue from 'vue';
import App from './App.vue';
import router from './router';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import '@mapgis/webclient-vue-ui/dist-libs/webclient-vue-ui.css';
import '@mapgis/webclient-vue-cesium/dist-libs/webclient-vue-cesium.css';
import './assets/index.scss'
import VueCesium from '@mapgis/webclient-vue-cesium'

import CommonLayer from '@/components/baseMap/CommonLayer'

import MapgisUi from '@mapgis/webclient-vue-ui';

Vue.use(MapgisUi);
Vue.use(Antd);

Vue.component('commonLayer',CommonLayer)

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
