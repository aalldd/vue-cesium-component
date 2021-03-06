---
title: 'draw-绘制'
---
> > municipal-draw 绘制组件，提供了五种不同的绘制交互工具

## 基本用法
基本的绘制组件用法，用于右下角菜单
```vue
<template>
  <municipal-draw :enable-menu-control="true"></municipal-draw>
</template>

<script>
export default {
  methods: {
    getMeasureRes(result) {
      console.log('量测结果:' + result)
    }
  }
}
</script>
```


## 属性

### `infinite`

- **类型:** `Boolean`
- **侦听属性**
- **默认值:** `false`
- **描述:** 是否允许无限绘制。true：允许无限绘制，false：不允许

### `enableControl`

- **类型:** `Boolean`
- **非侦听属性**
- **默认值:** `false`
- **描述:** 添加一个自带的能实现基本功能的按钮控件，可通过传入的属性 position 改变其显示的位置

### `position`

- **类型:** `String`
- **非侦听属性**
- **默认值:** `top-right`
- **描述:** 传入的属性 position 改变其按钮控件的位置


### `clampToGround`

- **类型:** `Boolean`
- **侦听属性**
- **默认值:** `true`
- **描述:** 绘制在三维图层上，是否贴地贴模型，true则贴地贴模型。

### `drawStyle`

- **类型:** `Object`
- **非侦听属性**
- **默认值:**
```
  {
    color: '#FF0000',
    opacity: 1,
    //点的边线宽度
    outlineWidth: 1,
    //点的边线颜色
    outlineColor: '#FFA500',
    //线宽
    width: 2,
  }
  ```
- **描述:** 绘制点、线、矩形、多边形、圆图形样式。目前不支持矩形、多边形、圆的边线样式设置。

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

## 槽

### `default`

- **Description:** Draw 的自定义槽的实现，可以自定义绘制控件样式

## 事件

### `@load`

- **Description:** 在 Draw 加载完毕后发送该事件
- **Payload** `{ Draw ,webGlobe }`
- `Draw` Draw 对象
- `webGlobe` 当前绘制组件所在的 webGlobe

### `@unload`

- **Description:** 在 Draw 注销完毕后发送该事件
- **Payload** `{ Draw }`
- `Draw` Draw 对象

### `@drawCreate`

- **Description:** 在 Draw 绘制图形完毕后发送该事件
- **Payload** `{ cartoCoordinate ,degreeCoordinate ,webGlobe}`
- `cartoCoordinate` 笛卡尔坐标集合
- `degreeCoordinate` 经纬度坐标集合
- `webGlobe` 当前绘制组件所在的 webGlobe

### `@drawcreate`

- **Description:** 使用 CDN 的方式引入，会使用全小写的方式，在 Draw 绘制图形完毕后发送该事件
- **Payload** `{ cartoCoordinate ,degreeCoordinate ,webGlobe}`
- `cartoCoordinate` 笛卡尔坐标集合
- `degreeCoordinate` 经纬度坐标集合
- `webGlobe` 当前绘制组件所在的 webGlobe

## 示例

### 简单使用

::: demo

```vue
<template>
  <div id="app">
    <municipal-web-scene>
      <municipal-igs-m3d
              :autoReset="autoReset"
              :maximumScreenSpaceError="maximumScreenSpaceError"
              :url="m3dUrl">
      </municipal-igs-m3d>
      <municipal-draw
              :enableControl="enableControl"
              :drawStyle="drawStyle"
              :clampToGround="clampToGround"
              :position="position"
              :infinite="infinite">
      </municipal-draw>
    </municipal-web-scene>
  </div>
</template>

<script>
export default {
  name: "cesiumWmtsLayer",
  data() {
    return {};
  },
  methods: {
    m3dUrl:"http://develop.smaryun.com:6163/igs/rest/g3d/DaYanTa",
    autoReset:true,
    maximumScreenSpaceError:6,
    enableControl: true,
    position:"top-right",
    drawStyle:{
      color:'#FF8C00',
      opacity:0.6,
      // outlineColor:'#FFA500',
      // width:4,
      // outlineWidth:2
    },
    clampToGround:true,
    infinite:true
  }
};
</script>
```

:::
