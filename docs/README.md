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
import {IgsDocLayer} from 'mapgis-cesium-components/dist/webclient-vue-cesium.umd.min'
import 'mapgis-cesium-components/dist/webclient-vue-cesium.css'
Vue.component('igs-doc-layer',IgsDocLayer)
```

# 全局引入
```javascript
// main.js
import mapgisCesium from 'mapgis-cesium-components/dist/webclient-vue-cesium.umd.min'
import 'mapgis-cesium-components/dist/webclient-vue-cesium.css'
Vue.use(mapgisCesium)
```

```vue
<template>
  <igs-doc-layer :height="height"
                 class="mapWrapper"
                 :plugin-path="pluginPath"
                 :lib-path="libPath"
                 :load="handleLoad"
                 :m3dInfos="m3dInfos"
                 :needState="needState"
  >
    <flood></flood>
  </igs-doc-layer>
</template>

<script>

export default {
  data() {
    return {
      height: document.body.clientHeight ,
      url: 'http://t0.tianditu.com/DataServer?T=vec_w&L={z}&Y={y}&X={x}&tk=9c157e9585486c02edf817d2ecbc7752',
      baseUrl: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer',
      baseUrl2: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer',
      pluginPath: '/static/cesium/webclient-cesium-plugin.min.js',
      libPath: '/static/cesium/Cesium.js',
      m3dInfos:[
        {
          maximumMemoryUsage: 1024,
          url: 'http://192.168.12.200:6163/igs/rest/g3d/lgzh0902',
          layers: '',
          vueIndex:'0'
        }
      ],
      tilesetList: [],
      needState:true
    };
  },
  methods: {
    handleLoad(payload) {
      console.log('地图加载完毕')
    },
    onM3dLoad(payload) {
      console.log('m3d图层加载完毕')
    }
  }
};
</script>
```

::: tip 依赖
[Vue.js 2.5+](https://github.com/vuejs/vue)
[MapGIS/Cesium 1.0+](https://www.npmjs.com/package/@mapgis/cesium)
:::

::: tip 目的

> 用于开发 Vue 版本的 Cesium 组件
> :::
