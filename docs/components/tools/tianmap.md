---
title: 'tian-天地图显示'
---

# 天地图显示

> municipal-tian 天地图显示组件

## 基本用法

基本的天地图显示用法,需要在存在ogc-wmts-layer时配合使用，先获取到wmts图层对象，传入天地图组件

```vue

<template>
  <municipal-tian :wmtsMap="wmtsMap"></municipal-tian>
</template>

<script>
export default {
  data() {
    return {
      wmtsMap: {
        url: 'http://t0.tianditu.com/DataServer?T=vec_c&X={x}&Y={y}&L={l}',
        token: '79d9c78880a541ad34a010976a244ec2',
        ptype: 'img'
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
wmtsMap|天地图对象|Object|空

## 事件

### `@onChangeTianMap`
- **Description:** 打开或者关闭天地图发送的事件
- **Payload** `{ tianMapVisible ,tianLayer }`
- `tianMapVisible` 天地图的显隐状态
- `tianLayer` 天地图的图层数据


