---
title: 'home-地图复位'
---

# 地图复位

> municipal-home 地图复位组件

## 基本用法

基本的地图复位用法

```vue

<template>
  <municipal-home :cameraView="cameraView"></municipal-home>
</template>

<script>
export default {
  data() {
    return {
      //天地图地址
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
cameraView|复位坐标&复位相机视角|Object|空


