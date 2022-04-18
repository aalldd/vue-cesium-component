# 快速上手

## 安装-使用前配置

### ES6 方式
```bash
安装mapgis-vue-ceisium以及对应的依赖:
npm install municipal-cesium-components vue-draggable-resizable
# 或者
yarn add municipal-cesium-components vue-draggable-resizable
```

### Ceisum 库引入

::: tip 为什么要使用@mapgis/cesium 由于 cesium 本身`涉及大量的纹理材质以及多线程Worker`， 公司内部修改版实现`M3D格式`， M3D`不是`3dtile，是中地数码自己独特的格式，与开源的
3dtile 不是一种格式。很多高级分析功能`只能作用于M3D`,而不支持 3d tile.
:::

![代码结构](./cesium_dist.png)

> 1.推荐将@mapgis/cesium资源使用静态资源服务器进行托管，因为Cesium请求的资源高达9M，使用静态资源服务器可以进行相应的优化，并且不会占用前端项目的体积<br/>
> 2.将cesium资源部署到静态资源服务后，修改vue的代理即可访问到cesium资源<br/>
> 3.如果在浏览器中 访问 `http://localhost:xxxx/$path/cesium/dist/Cesium.js` 成功则说明整个 Cesium 的环境准备已经完毕。

#### vueconfig配置
::: tip 我们在项目中使用时如果需要访问到静态资源服务器上的cesium，需要配置vue的代理
```editorconfig
module.exports = {
  ...other options,
  devServer: {
    proxy: {
      '/': {
        target: '~你的静态资源服务地址',
        changeOrigin: true,
        pathRewrite: {
          '/': ''
        }
      }
    }
  }
};
```

::: tip 为什么要拷贝@mapgis/cesium 由于原生的 Cesium 在支持 Webpack 编译的时候也是采取的 copy 插件来执行对应的文件夹拷贝操作。 因此为了统一处理，这里`统一不采取`手动修改
webpack.config 的方式，而是将 cesium 的所有文件放在 public 或者 asset 的某个目录下，自己`手动实现`静态资料的拷贝
:::

## 基本使用
### 这里以全局引入为例，首先在main.js中，我们引入组件库
```javascript
// main.js
import Vue from 'vue';
import MunicipalCesium from 'municipal-cesium-components';
import 'municipal-cesium-components/dist/municipal-vue-cesium.css';
import App from './App.vue';

Vue.use(MunicipalCesium);

Vue.config.productionTip = false;
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
```
> 然后我们使用组件库中的municipal-common-layer组件，去创建一个基于m3d模型的地图场景，
> 我们将这个地图场景组件命名为cesiumView.vue
> 最后在App中嵌入cesiumView组件，即可渲染出m3ds地图场景

```vue
// cesiumView.vue
<template>
  <municipal-common-layer
      container="cesiumWrapper"
      class="mapWrapper"
      :cameraView="cameraView"
      :plugin-path="pluginPath"
      :lib-path="libPath"
      @load="handleLoad"
      @onM3dLoad="onM3dLoad"
      :m3dInfos="m3dInfos3d"
  >
  </municipal-common-layer>
</template>

<script>
export default {
  name:'cesiumView',
  data() {
    return {
      //cesium资源地址
      pluginPath: '/static/cesium/webclient-cesium-plugin.min.js',
      libPath: '/static/cesium/Cesium.js',
      //m3d图层数据信息
      m3dInfos3d: [
        {
          maximumMemoryUsage: 1024,
          url: 'http://192.168.12.200:6163/igs/rest/g3d/lgzh0902',
          layers: '',
          vueIndex: '0'
        }
      ],
      //天地图信息
      wmtsMap: {
        url: 'http://t0.tianditu.com/DataServer?T=vec_c&X={x}&Y={y}&L={l}',
        token: '79d9c78880a541ad34a010976a244ec2',
        ptype: 'img'
      },
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
  methods:{
    //每个三维组件加载完毕之后都会发送load回调，我们可以通过load回调获取到组件的实例
    handleLoad(payload){
      const {component: {webGlobe}, Cesium, CesiumZondy} = payload;
      console.log(webGlobe)
      console.log(payload)
    },
    //m3d图层加载完毕之后，也有一个load回调，我们可以通过该回调获取到m3d图层的所有数据
    onM3dLoad(payload){
      const m3ds = payload.m3ds;
      console.log(m3ds)
    }
  }
}
</script>
```




