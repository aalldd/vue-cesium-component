import Vue from 'vue';
import App from './App.vue';
import router from './router';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import './assets/index.scss';
import VueDraggableResizable from 'vue-draggable-resizable';
import MincialComs from './lib/index';
import Service from '@/service/service';
import './main.scss';

Vue.use(Antd);
Vue.use(MincialComs);
Vue.component('vue-draggable-resizable', VueDraggableResizable);
Vue.config.productionTip = false;
Service.init().then(() => {
  Vue.prototype.$serve = Service;
  new Vue({
    router,
    render: h => h(App)
  }).$mount('#app');
});




