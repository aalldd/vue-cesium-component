---
title: 'tian-天地图显示'
---

# 天地图显示

> municipal-tian 天地图显示组件

## 基本用法

基本的天地图显示用法,需要在存在ogc-wmts-layer时配合使用，先获取到wmts图层对象，传入天地图组件

```vue

<template>
  <municipal-web-scene>
    <municipal-ogc-wmts-layer
      :baseUrl="baseUrl"
      :wmtsLayer="wmtsLayer"
      :tileMatrixSet="tileMatrixSet"
      :tilingScheme="tilingScheme"
      :format="format"
      :token="token"
    />
    <municipal-tian :wmtsMap="wmtsMap"></municipal-tian>
  </municipal-web-scene>
</template>

<script>
export default {
  data() {
    return {
      //天地图地址
      baseUrl: "http://t0.tianditu.gov.cn/vec_c/wmts",
      //Cesium的瓦片切图方式
      tilingScheme: "EPSG:4326",
      //地图的瓦片矩阵集合
      tileMatrixSet: "c",
      //图层名称
      wmtsLayer: "vec",
      //返回格式
      format: "tiles",
      //token信息
      token: {
        key: "tk",
        value: "9c157e9585486c02edf817d2ecbc7752"
      },
      wmtsMap: null
    };
  },
  methods: {
    getTianMap(payload) {
      this.wmtsMap = payload ? payload : null
    }
  }
};
</script>
```

## 属性

### 属性说明

属性|说明|取值类型|默认值
--|:--:|:--:|:--:
vueKey|mapgis-web-scene组件的 ID，当使用多个mapgis-web-scene组件时，需要指定该值，来唯一标识mapgis-web-scene组件|String|default
vueIndex|当 mapgis-web-scene 插槽中使用了多个相同组件时，例如多个 mapgis-3d-igs-doc-layer 组件，用来区分组件的标识符|Number|空
wmtsMap|天地图对象|Object|空


