---
title: municipal-common-layer
---

# M3D 模型+WebScene+StateBar的组合组件，可以直接搞定三维场景的部署

> municipal-common-layer

## 引入

全局引入的情况下，直接使用即可

```vue

<template>
  <municipal-common-layer props>slots</municipal-common-layer>
</template>
```

按需引入

```vue

<template>
  <municipal-common-layer props>
    some slots
  </municipal-common-layer>
</template>

<script>
import {MunicipalCommonLayer} from 'municipal-cesium-components';

export default {
  components: {
    MunicipalCommonLayer
  }
}
</script>
```

## 基本用法

> 最简单用法-传入必要的参数，cesium路径，m3d模型的路径等

```vue

<municipal-common-layer
  :cameraView="cameraView"
  :plugin-path="pluginPath"
  :lib-path="libPath"
  @load="handleLoad"
  @onM3dLoad="onM3dLoad"
  :m3dInfos="m3dInfos3d"
  :commonConfig="globalConfig">
</municipal-common-layer>
<script>
export default {
  data() {
    return {
      pluginPath: '/static/cesium/webclient-cesium-plugin.min.js',
      libPath: '/static/cesium/Cesium.js',
      m3dInfos3d: [
        {
          maximumMemoryUsage: 1024,
          url: 'http://192.168.12.200:6163/igs/rest/g3d/lgall220224',
          layers: '',
          vueIndex: '0'
        }
      ],
      cameraView: {
        destination: {
          x: -2416948.392038159,
          y: 5372543.175879652,
          z: 2444631.2541255946
        },
        orientation: {
          heading: 0.08752,
          pitch: -1.57,
          roll: 0
        }
      },
      globalConfig: null
    };
  },
  methods: {
    handleLoad(payload) {
      //  获取到了vm实例
      console.log(payload)
    },
    onM3dLoad(payload) {
      //  获取到了m3d的数据
      console.log(payload)
    }
  }
}
</script>
```

## 属性

包含所有的M3d组件&webScene组件的props 见[m3dProps](https://aalldd.github.io/vue-cesium-component/components/layer/m3d.html#属性)
与[webSceneProps](https://aalldd.github.io/vue-cesium-component/components/#属性)

### `needState`

- **类型**: `Boolean`
- **非侦听属性** 非 watch 属性
- **描述** 是否需要下方的状态栏（用于显示当前视角信息，坐标位置）

## 事件

### `@loaded`

- **描述** 在 M3D 加载完毕后发送该事件
- **Payload** `{ component }`
-
  - `component` 组件对象

### `@onM3dLoad`

- **描述** 在 M3D加载完毕后发送该事件
- **Payload** `{ m3d }`
-
  - `m3d` m3d图层数据
