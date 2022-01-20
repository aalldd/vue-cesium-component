---
title: 'tool-工具'
---
> > municipal-tool 工具组件，整合了目前组件库中的所有工具

## 基本用法

基本的工具组件用法，用于右下角菜单，必须嵌套在basemap类型的组件内

```vue

<template>
  <municipal-commonLayer :height="mapHeight"
                         class="mapWrapper"
                         :plugin-path="pluginPath"
                         :lib-path="libPath"
                         :load="handleLoad"
                         :m3dInfos="m3dInfos"
  >
    <municipal-tool :wmtsMap="wmtsMap" :cameraView="cameraView"></municipal-tool>
  </municipal-commonLayer>
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
      wmtsMap: null,
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
  computed: {
    mapHeight() {
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

## 属性

### `toolComponents`

- **类型:** `Array`
- **侦听属性**
- **默认值:** `['measure', 'draw', 'fullScreen', 'tian', 'home']`
- **描述:**
  > 需要使用的工具，包括量测，绘制，全屏，天地图显示，复位等

### `wmtsMap`

- **类型:** `Object`
- **侦听属性**
- **默认值:** 无
- **描述:**
  > 用于控制天地图显示的天地图对象，天地图对象由组件municipal-wmtsDocLayer加载的回调事件返回

### `cameraView`

- **类型:** `Object`
- **侦听属性**
- **默认值:** 无
- **描述:**
  > 用于控制地图复位的复位坐标，
  > 数据格式{ destination: { x: -2416948.392038159, y: 5372543.175879652, z: 2444631.2541255946 },
  orientation: { heading: 0.08752, pitch: -0.689042, roll: 0.0002114284469649675 } }
  > destination用于复位坐标，orientation用于控制相机视角

### `vueKey`

- **类型:** `String`
- **可选**
- **非侦听属性**
- **默认值:** `default`
- **描述:**
  > mapgis-web-scene 组件的 ID，当使用多个 mapgis-web-scene 组件时，需要指定该值，来唯一标识 mapgis-web-scene 组件， <br/>
  > 同时 mapgis-web-scene 插槽中的组件也需要传入相同的 vueKey，让组件知道应该作用于哪一个 mapgis-web-scene。

### `vueIndex`

- **类型:** `Number`
- **可选**
- **非侦听属性**
- **描述:**
  > 当 mapgis-web-scene 插槽中使用了多个相同组件时，例如多个 mapgis-3d-igs-doc-layer 组件，用来区分组件的标识符。


## 事件

### `@drawCreate`

- **Description:** 在 Draw 绘制图形完毕后发送该事件
- **Payload** `{ cartoCoordinate ,degreeCoordinate ,webGlobe}`
- `cartoCoordinate` 笛卡尔坐标集合
- `degreeCoordinate` 经纬度坐标集合
- `webGlobe` 当前绘制组件所在的 webGlobe

### `@measured`

- **描述:** 在 Measure 测量完毕后发送该事件
  > 直线测量结果：Array,[起始点（0），第一次点击距离起始点的长度，第二次点击距离起始点的长度，...，右键结束测量后，最后一个点距离起始点的长度]，
  > 单位：千米 <br/>
  > 面积测量结果：Number,测量的面积，单位：平方米 <br/>
  > 三角测量结果：Object,{horizontalDiatance（水平距离）,slantDiatance（直线距离）,verticalDiatance（高差）} <br/>
  > 坡度测量：number，坡度，单位：度
- **回调参数** `{ result }`

