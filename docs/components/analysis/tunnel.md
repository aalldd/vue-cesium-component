---
title: 'tunnel-隧道分析'
---

# 隧道分析

> municipal-tunnel 隧道分析组件，能够通过画线的形式，生成一条沿该路径的管道

## 基本用法

> 基本的隧道分析组件用法，隧道分析组件需嵌套在图层内，不传参就全使用默认值 其中draggable,title,closeable,expandable这四个属性用来控制隧道分析组件的面板是否可拖动，名称，可关闭，可展开
> 使用tunnelStyle参数控制隧道的样式

```vue

<template>
  <municipal-commonLayer>
    <municipal-tunnel title="隧道分析"
                      :draggable="true"
                      :closeable="true"
                      :expandable="true"
                      :panel-style="{width:'400px'}"
                      :tunnelStyle="{
                        color: '#000',
                        alpha: 0.4
                      }"
                      panel-class="tunnel"
    ></municipal-tunnel>
  </municipal-commonLayer>
</template>

<style scoped>
.tunnel {
  /*  此处可对隧道分析面板自定义样式*/
  background: #1e6ceb;
}
</style>
```

## 属性

### 属性说明

属性|说明|取值类型|默认值
--|:--:|:--:|:--:
vueKey|municipal-web-scene组件的 ID，当使用多个mapgis-web-scene组件时，需要指定该值，来唯一标识mapgis-web-scene组件|String|default vueIndex|当
vueIndex|municipal-web-scene 插槽中使用了多个相同组件时，例如多个 municipal-igs-doc-layer 组件，用来区分组件的标识符|Number|空
title|隧道分析功能名称|String|隧道分析
tunnelStyle|隧道分析隧道样式|Object|{ color: '#000', alpha: 0.4 }
closeable|隧道分析面板是否可以关闭|Boolean|true
expandable|隧道分析面板是否可以折叠|Boolean|true
draggable|隧道分析面板是否可以拖拽|Boolean|true
panelStyle|隧道分析面板行内样式|Object|{width:'400px'}
panelClass|隧道分析面板自定义类名|String|null


## 事件

### `@load`

- **描述:** 在 隧道分析组件 加载完毕后发送该事件
- **回调参数** `{ vm }`
- `vm` tunnel vue实例对象

### `@unload`

- **描述:** 在 tunnel 注销完毕后发送该事件

### `@onClose`

- **描述:** 在 隧道分析面板关闭后发送该事件


