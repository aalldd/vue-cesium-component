---
home: true
heroImage: /logo.svg
actionText: 快速上手 →
actionLink: /get-started/
features:
- title: 组件式风格
  details: 通过Vue的组件方式调用Layer, Provider, Source, M3D

- title: Vue控制
  details: 面向对象编程：地图元素拥有Vue的生命周期，将部分地图事件封装成Vue的事件

footer: MIT Licensed
---
# 按需引入
```javascript
// main.js
import Vue from 'vue';
import {MunicipalCommonLayer} from 'municipal-cesium-components';
import 'municipal-cesium-components/dist/municipal-vue-cesium.css';
import App from './App.vue';

Vue.component('municipal-commonLayer', MunicipalCommonLayer);

Vue.config.productionTip = false;
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
```

# 全局引入
```javascript
// main.js
import Vue from 'vue';
import MunicipalCesium from 'municipal-cesium-components';
import 'municipal-cesium-components/dist/municipal-vue-cesium.css';
import App from './App.vue';

Vue.use(MunicipalCesium);

Vue.config.productionTip = false;
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
```

::: tip 依赖
[Vue.js 2.5+](https://github.com/vuejs/vue)
[Ant-design-vue 1.7+](https://github.com/vuejs/vue)
[Vue-draggable-resizable 2.3+](https://github.com/vuejs/vue)
[MapGIS/Cesium 1.0+](https://www.npmjs.com/package/@mapgis/cesium)
:::

::: tip 目的

> 用于开发 Vue 版本的 Cesium 组件
> :::
