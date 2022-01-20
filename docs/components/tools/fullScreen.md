---
title: 'measure-全屏显示'
---
# 全屏显示
> municipal-fullScreen 全屏显示组件

## 基本用法

基本的全屏组件用法
```vue
<template>
  <municipal-fullScreen :initScreen="false" @getScreenState="getScreenStat"></municipal-fullScreen>
</template>

<script>
export default {
  methods: {
    getScreenStat(result) {
      console.log('全屏状态:' + result)
    }
  }
}
</script>
```

## 属性

### 属性说明

属性|说明|取值类型|默认值
--|:--:|:--:|:--:
vueKey|mapgis-web-scene组件的 ID，当使用多个mapgis-web-scene组件时，需要指定该值，来唯一标识mapgis-web-scene组件|String|default
vueIndex|当 mapgis-web-scene 插槽中使用了多个相同组件时，例如多个 mapgis-3d-igs-doc-layer 组件，用来区分组件的标识符|Number|空
initScreen|设置初始的全屏状态|Boolean|false

## 事件

### `@getScreenState`

- **描述:** 开启，关闭全屏时的触发事件
- **回调参数** `boolean`


