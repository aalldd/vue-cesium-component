---
title: 'cursor-tip 鼠标工具'
---

# 鼠标工具

> 跟随鼠标移动的tips,主要用于绘制，量测组件，用于提示用户当前为绘制状态，并给出操作方法

## 引入
全局引入的情况下，直接使用即可
```vue
<template>
  <municipal-cursor-tip props>
    some slots
  </municipal-cursor-tip>
</template>
```
按需引入
```vue
<template>
  <municipal-cursor-tip props>
    some slots
  </municipal-cursor-tip>
</template>

<script>
import {MunicipalCursorTip} from 'municipal-cesium-components';
export default {
  components:{
    MunicipalCursorTip
  }
}
</script>
```

## 基本用法

> offset属性用于指定tip与鼠标的偏移间隔，具体方法见示例
```vue
<template>
  <div>
    <button @click="startMeasure">点击开始测量</button>
    <municipal-cursor-tip v-if="cursorVisible" :offset="offset">
      <span>左键点击测量，右键结束</span>
    </municipal-cursor-tip>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cursorVisible: false,
      offset:{
        x: 12,
        y: 12
      }
    };
  },
  methods:{
    startMeasure(){
      this.cursorVisible=true
    }
  }
};
</script>
```

## 属性

### 属性说明

属性|说明|取值类型|默认值
--|:--:|:--:|:--:
offset|设置tips与鼠标的偏移值|Object|{x:12,y:12}
cursorClassName|设置cursor的样式|String|null




