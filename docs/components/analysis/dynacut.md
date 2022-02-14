---
title: 'dynacut-开挖分析'
---

# 开挖分析

> municipal-dynacut 开挖分析组件，可以快速的实现挖掘地形的效果

## 基本用法

基本的开挖分析组件用法，开挖分析组件需嵌套在图层内，不传参就全使用默认值 其中draggable,title,closeable,expandable这四个属性用来控制分析面板是否可拖动，名称，可关闭，可展开

```vue

<template>
  <municipal-commonLayer>
    <municipal-dynacut title="开挖分析"
                     :draggable="true"
                     :closeable="true"
                     :expandable="true"
                     :panel-style="{width:'400px'}"
                     panel-class="flood"
    ></municipal-dynacut>
  </municipal-commonLayer>
</template>

<style scoped>
.flood {
  /*  此处可对开挖分析面板自定义样式*/
  background: #1e6ceb;
}
</style>
```

## 开挖分析控制选项与回调函数

> 其中onCutFill回调函数回传了填挖方的数据信息，包括开挖的面积，地形高度范围等
> onDynacut回调函数回传了开挖的模型信息，包括开挖的点坐标等
> drawTools用来控制开挖的绘制图形有哪几种，目前支持矩形，多边形，圆形三种
> drawTextures表示使用哪种纹理来绘制开挖的效果，此处需填入图片的url数组
> layerIndexs用来指定地面图层的id，该id将用来指定需要开挖哪些图层

```html
<template>
  <municipal-dynacut title="开挖分析" @onCutFill="getCutInfo" @onDynacut="getDynacutInfo" :drawTools="['square', 'polygon']" :drawTextures="drawTextures" :layerIndexs="[0,1]"></municipal-dynacut>
</template>

<script>
  export default {
    name: "dynacutAna",
    data(){
      return {
        drawTextures: [
          '/static/cesium/model/wall.jpg',
          '/static/cesium/model/wall1.jpg'
        ]
      }
    },
    methods:{
      getDynacutInfo(info){
        console.log(info);
      },
      getCutInfo(info){
        console.log(info);
      }
    }
  };
</script>

<style scoped>

</style>

```

## 属性

### 属性说明

属性|说明|取值类型|默认值
--|:--:|:--:|:--:
title|开挖分析功能名称|String|开挖分析
vueKey|municipal-web-scene组件的 ID，当使用多个mapgis-web-scene组件时，需要指定该值，来唯一标识mapgis-web-scene组件|String|default vueIndex|当
vueIndex|municipal-web-scene 插槽中使用了多个相同组件时，例如多个 municipal-igs-doc-layer 组件，用来区分组件的标识符|Number|空
drawTools|设置开挖分析的绘制方式有哪几种|Array<String>|['square', 'polygon'],共支持['square', 'polygon','circle']三种
drawTextures|设置开挖分析的绘制纹理有哪几种|Array<String>需填入图片的url地址|[]
layerIndexs|开挖分析需要挖掘的图层index|Array<Number>|[]
closeable|开挖分析面板是否可以关闭|Boolean|true
expandable|开挖分析面板是否可以折叠|Boolean|true
draggable|开挖分析面板是否可以拖拽|Boolean|true
panelStyle|开挖分析面板行内样式|Object|{width:'400px'}
panelClass|开挖分析面板自定义类名|String|null

## 事件

### `@onCutFill`

- **描述:** 在 开挖分析组件 挖掘完毕之后回调的填挖方信息
- **回调参数** `{ heightRange,sArea,fArea }`
- `heightRange` 地面高程的范围
- `sArea` 开挖的面积
- `fArea` 挖掘掉的土方量


### `@onDynacut`

- **描述:** 在 开挖分析组件 挖掘完毕之后回调的开挖信息
- **回调参数** `{ dynacut,minHeight,positions }`
- `dynacut` 填挖的实体对象
- `minHeight` 开挖范围中最低的地面高程
- `positions` 开挖的范围坐标


