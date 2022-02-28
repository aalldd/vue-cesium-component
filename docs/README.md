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
import {MunicipalCommonLayer} from 'municipal-cesium-components/dist/webclient-vue-cesium.umd.min'
import 'mapgis-cesium-components/dist/webclient-vue-cesium.css'
import 'municipal-cesium-components/dist/municipal-vue-cesium.css';
import 'ant-design-vue/dist/antd.css';
import '@mapgis/webclient-vue-ui/dist-libs/webclient-vue-ui.css';
import '@mapgis/webclient-vue-cesium/dist-libs/webclient-vue-cesium.css';
import VueCesium from '@mapgis/webclient-vue-cesium';
import MapgisUi from '@mapgis/webclient-vue-ui';
import Antd from 'ant-design-vue';
Vue.component('municipal-commonLayer',MunicipalCommonLayer)
Vue.use(VueCesium);
Vue.use(Antd);
Vue.use(MapgisUi);
```

# 全局引入
```javascript
// main.js
import MunicipalCesium from 'municipal-cesium-components'
import 'municipal-cesium-components/dist/municipal-vue-cesium.css';
import 'ant-design-vue/dist/antd.css';
import '@mapgis/webclient-vue-ui/dist-libs/webclient-vue-ui.css';
import '@mapgis/webclient-vue-cesium/dist-libs/webclient-vue-cesium.css';
import VueCesium from '@mapgis/webclient-vue-cesium';
import MapgisUi from '@mapgis/webclient-vue-ui';
import Antd from 'ant-design-vue';
import App from './App.vue';

Vue.use(MunicipalCesium)
Vue.use(VueCesium);
Vue.use(Antd);
Vue.use(MapgisUi);
```

```vue
<template>
  <municipal-common-layer :height="mapHeight"
                         class="mapWrapper"
                         :plugin-path="pluginPath"
                         :lib-path="libPath"
                         :load="handleLoad"
                         :m3dInfos="m3dInfos"
  >
    <municipal-tool :wmtsMap="wmtsMap" :cameraView="cameraView"></municipal-tool>
    <municipal-flood></municipal-flood>
  </municipal-common-layer>
</template>

<script>
export default {
  data() {
    return {
      // 天地图地址
      pluginPath: '/static/cesium/webclient-cesium-plugin.min.js',
      libPath: '/static/cesium/Cesium.js',
      m3dInfos: [
        {
          maximumMemoryUsage: 1024,
          url: 'http://192.168.12.200:6163/igs/rest/g3d/lgzh0902',
          layers: '',
          vueIndex: '0'
        }
      ],
      wmtsMap:null,
      cameraView: {
        destination: {
          x: -2416948.392038159,
          y: 5372543.175879652,
          z: 2444631.2541255946
        },
        orientation: {
          heading: 0.08752,
          pitch: -0.689042,
          roll: 0.0002114284469649675
        }
      }
    };
  },
  computed:{
    mapHeight(){
      return document.body.clientHeight
    }
  },
  methods: {
    handleLoad(payload) {
      const {component: {webGlobe}, Cesium, CesiumZondy} = payload;
      window.webGlobe = webGlobe;
      window.Cesium = Cesium;
      window.CesiumZondy = CesiumZondy;
    },
    onM3dLoad(payload) {
      console.log(payload);
    },
    getWmtsInfo(payload) {
      this.wmtsMap = payload;
    }
  }
};
</script>
```

::: tip 依赖
[Vue.js 2.5+](https://github.com/vuejs/vue)
[MapGIS/Ui 1.0+](https://github.com/vuejs/vue)
[Ant-design-vue 1.7+](https://github.com/vuejs/vue)
[Vue-draggable-resizable 2.3+](https://github.com/vuejs/vue)
[MapGIS/Cesium 1.0+](https://www.npmjs.com/package/@mapgis/cesium)
:::

::: tip 目的

> 用于开发 Vue 版本的 Cesium 组件
> :::
