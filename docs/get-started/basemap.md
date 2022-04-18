# 基本地图

> 1.整个三维组件库的核心，就是webScene组件，该组件用于渲染底层三维场景，相当于html中的main标签，所有子组件都需要嵌套在webScene组件内部！<br/>

> 2.一般我们配合m3d图层组件进行使用，这样我们可以在cesium三维场景中添加m3d模型

## municipal-web-scene组件使用示例
```vue
<template>
  <municipal-web-scene
    :height="height"
    :lib-path="libPath"
    :plugin-path="pluginPath"
    :key-event-enable="keyEventEnable"
    :cameraView="cameraView"
    @load="handleLoad"
  >
    <municipal-3d-igs-m3d/>
    <municipal-3d-statebar v-if="needState"/>
    <slot></slot>
  </municipal-web-scene>
</template>

<script>
  export default {
    name: "webScene",
    data() {
      return {
        //地图场景的高度，不传默认父元素高度
        height:1000,
        //cesium资源地址
        pluginPath: '/static/cesium/webclient-cesium-plugin.min.js',
        libPath: '/static/cesium/Cesium.js',
        //是否允许键盘事件来控制视角
        keyEventEnable:true,
        //默认相机视角信息
        cameraView: {
          destination: {
            x: -2416948.392038159,
            y: 5372543.175879652,
            z: 2444631.2541255946
          },
          orientation: {
            heading: 0.08752,
            pitch: -1.57,
            roll: 0
          }
        }
      };
    },
    methods: {
      handleLoad(payload) {
        const {component: {webGlobe}} = payload;
        this.webGlobe = webGlobe;
        this.$emit('load', payload);
      }
    }
  };
</script>
```

### 通过 Props 来交互场景属性

你可以通过 props 来控制地图场景的一些参数如 viewerMode(显示模式), animation(动画播放器), timeline(时间线), cameraView(初始化视角)等.

完整的 props 列表请查看[API docs](/zh/api/#props), 注意文字描述中的字段'侦听属性'

## 场景加载

当地图场景加载完毕,即 map.on(load,callback)事件响应, `mapgis-web-scene`组件就会发送 `load` 事件. 整个事件的载荷 payload 会包含 CesiumJS `Cesium` 对象、MapGIS `CesiumZondy`对象以及发送当前事件的`mapgis-web-scene`组件。

```js
onMapLoaded(payload) {
  // in component
  const {component, Cesium, CesiumZondy } = payload;
  // component 当前场景组件
  // Cesium 标准Cesium对象
  // CesiumZondy 中地Cesium对象
}
```

所有的`mapgis-web-scene`的内部组件都会在地图完全加载完毕后才加载渲染。

::: warning Vuex 存储 Map 对象
请注意，除了基本类型和普通对象外，向 Vuex 或组件的“data”添加其他类型的对象通常都不是一个好主意。尤其是类似以下几种情况:

1.  向 vuex 的 store 中添加地图 map，以方便其他组件使用, `强烈不推荐`
    ```js
    this.$store.map = map;
    ```
2.  向组件的 data 属性添加地图 map,`强烈不推荐`
    ```js
      data(){
        return {
          map: undefined
        }
      },
      // 某处代码....
      this.map = map;
    ```
3.  向全局的对象中添加地图 map，以方便全局使用,实在没办法了可以这样使用
    ```js
    window.globalMap = window.globalMap || map;
    ```
    > 某种情况来说，采取第 3 种相对容易找到出 bug 的原因，第 1,2 种很容易导致不知名的 bug，如（更新延迟等）且短时间找不到原因 Orz...

Vue 为每个属性添加了 getter 和 setter 方法，所以如果你将 Map 对象添加到 Vuex store 或组件 data 中，可能会导致奇怪的 bug。
如果希望存储映射对象，请将其存储为非响应性属性，如下面的示例所示。
:::

```vue
<template>
  <municipal-web-scene @load="onMapLoaded" />
</template>

<script>
export default {
  // …component code…
  created() {
    this.map = null; //这里的this.map 不是指的 props/data里面的map 而是传统的js对象的属性参数
  },
  methods: {
    onMapLoaded(event) {
      // 组件内部使用，绝大部分场景都可以满足应用场景，
      // 少数场景请使用上面的方案三配合Promise的方式来全局调用
      this.webGlobe = window.webGlobe;
      // 或者只是存起来，加入全局vuex的状态存储中，以方便其他组件使用map对象，
      // 强烈禁止,应为很容易在其他地方误触this.$store.map的setter事件
      this.$store.webGlobe = window.webGlobe;
    }
  }
};
</script>
```
