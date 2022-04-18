---
title: 'measure-量测'
---
# 量测
> municipal-measure 量测组件，提供了四种不同的地图测量工具

## 基本用法

基本的量测组件用法
```vue
<template>
  <municipal-measure @measureResult="getMeasureRes"></municipal-measure>
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

## 自定义使用哪几种量测工具

```html

<template>
  <municipal-measure @measureResult="getMeasureRes" :measures="measures"></municipal-measure>
</template>

<script>

export default {
  data() {
    return {
      measures: ['length', 'area', 'triangle', 'slope', 'delete']
    }
  },
  methods: {
    getMeasureRes(result) {
      console.log('量测结果:' + result)
    }
  }
}
</script>
```

## 无量测控件模式
目前的量测控件适用于一种常见的交互模式，鼠标悬浮量测图标，显示量测菜单，如果不想要这种模式，可以自己定义量测的交互方式。

```html

<template>
  <municipal-measure @measureResult="getMeasureRes" :enableControl="false" @load="handleLoad">
    <div id="toolbar-wrapper">
      <div class="toolbar-item" v-on:click="measureLength">直线测量</div>
      <div class="toolbar-item" v-on:click="measureArea">面积测量</div>
      <div class="toolbar-item" v-on:click="measureTriangle">三角测量</div>
      <div class="toolbar-item" v-on:click="measureSlope">坡度测量</div>
      <div class="toolbar-item" v-on:click="deleteMeasure">删除</div>
    </div>
  </municipal-measure>
</template>

<script>

export default {
  methods: {
    getMeasureRes(result) {
      console.log('量测结果:' + result)
    },
    handleLoad(measure) {
      console.log("地图加初始化完毕！", measure);
      //取得测量组件对象
      this.measure = measure;
    },
    measured(result) {
      //取得测量结果
      console.log("result", result);
    },
    measureLength() {
      //激活直线测距
      this.measure && this.measure.enableMeasureLength();
    },
    measureArea() {
      //激活面积测量
      this.measure && this.measure.enableMeasureArea();
    },
    measureTriangle() {
      //激活三角测量
      this.measure && this.measure.enableMeasureTriangle();
    },
    measureSlope() {
      //激活坡度测量
      this.measure && this.measure.enableMeasureSlope();
    },
    deleteMeasure() {
      //删除测量结果
      this.measure && this.measure.deleteMeasure();
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
measures|设置需要哪些测量控件,length:长度测量,area：面积测量，triangle：三角测量，slop：坡度测量，delete：删除测量结果|Array|['length', 'area', 'triangle', 'slope', 'delete']
enableControl|是否需要默认的测量控件|Boolean|true

## 槽

### `default`

- **描述:** Measure 的自定义槽的实现，可以自定义绘制控件样式

## 事件

### `@load`

- **描述:** 在 Measure 加载完毕后发送该事件
- **回调参数** `{ Measure }`
- `Measure` Measure 对象

### `@unload`

- **描述:** 在 Measure 注销完毕后发送该事件

### `@measured`

- **描述:** 在 Measure 测量完毕后发送该事件
  > 直线测量结果：Array,[起始点（0），第一次点击距离起始点的长度，第二次点击距离起始点的长度，...，右键结束测量后，最后一个点距离起始点的长度]，
  > 单位：千米 <br/>
  > 面积测量结果：Number,测量的面积，单位：平方米 <br/>
  > 三角测量结果：Object,{horizontalDiatance（水平距离）,slantDiatance（直线距离）,verticalDiatance（高差）} <br/>
  > 坡度测量：number，坡度，单位：度
- **回调参数** `{ result }`

## 方法

### `enableMeasureLength`

- **描述:** 激活直线测量功能

### `enableMeasureArea`

- **描述:** 激活面积测量功能

### `enableMeasureTriangle`

- **描述:** 激活三角测量功能

### `enableMeasureSlope`

- **描述:** 激活坡度测量功能


