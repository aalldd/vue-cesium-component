# 快速上手

``` vue
<template>
  <igs-doc-layer :height="height"
                 class="mapWrapper"
                 :plugin-path="pluginPath"
                 :lib-path="libPath"
                 :load="handleLoad"
                 :m3dInfos="m3dInfos"
                 :needState="needState"
  >
    /*此处可以嵌入组件*/
  </igs-doc-layer>
</template>

<script>
export default {
  data() {
    return {
      height: document.body.clientHeight ,
      url: 'http://t0.tianditu.com/DataServer?T=vec_w&L={z}&Y={y}&X={x}&tk=9c157e9585486c02edf817d2ecbc7752',
      baseUrl: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer',
      baseUrl2: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer',
      pluginPath: '/static/cesium/webclient-cesium-plugin.min.js',
      libPath: '/static/cesium/Cesium.js',
      m3dInfos:[
        {
          maximumMemoryUsage: 1024,
          url: 'http://192.168.12.200:6163/igs/rest/g3d/lgzh0902',
          layers: '',
          vueIndex:'0'
        }
      ],
      tilesetList: [],
      needState:true
    };
  },
  methods: {
    handleLoad(payload) {
      console.log('地图场景加载完毕')
    },
    onM3dLoad(payload) {
      console.log('m3d图层加载完毕')
    }
  }
};
</script>
```

## 安装

### ES6 方式

```bash
安装mapgis-vue-ceisium:
npm install mapgis-vue-ceisium
# 或者
yarn add mapgis-vue-ceisium
```

在 main.js 中全局引入组件

```js
import mapgisCesium from 'mapgis-cesium-components/dist/webclient-vue-cesium.umd.min'
import 'mapgis-cesium-components/dist/webclient-vue-cesium.css'

Vue.use(mapgisCesium)
```

在 组件或者main.js 中按需引入组件

```js
import {flood, IgsDocLayer} from 'mapgis-cesium-components/dist/webclient-vue-cesium.umd.min'
import 'mapgis-cesium-components/dist/webclient-vue-cesium.css'

Vue.component('flood', flood)
Vue.component('igs-doc-layer', IgsDocLayer)
```

### Ceisum 库引入

mapgis-cesium-components 是基于webclient-vue-cesium的一层封装，底层依赖 `@mapgis/cesium`。 除了本身需要安装以外，你还需要拷贝@mapgis/cesium

::: tip 为什么要使用@mapgis/cesium 由于 cesium 本身`涉及大量的纹理材质以及多线程Worker`， 公司内部修改版实现`M3D格式`， M3D`不是`3dtile，是中地数码自己独特的格式，与开源的
3dtile 不是一种格式。很多高级分析功能`只能作用于M3D`,而不支持 3d tile.
:::

安装`mapgis-cesium-components`的时候会自动安装依赖`@mapgis/cesium`，`@mapgis/cesium`的包结构展示如下：

![代码结构](./cesium_dist.png)

请将上述 cesium 文件夹统一拷贝到你的 vue 工程对应的 public 文件夹下的某个目录中，记录对应的路径为

```sh
# quasar 的静态资源目录为src/static
# 常见的静态资源目录为 public
# 主Cesium主体路径
$path/cesium/dist/Cesium.js # public/cesium/dist/Cesium.js
# Cesium拓展插件路径
$path/cesium/dist/webclient-cesium-plugins.js # public/cesium/dist/webclient-cesium-plugins.js
```

mapgis-vue-cesium 组件使用以上两个文件的方式如下所示:

```vue

<template>
  <igs-doc-layer
    ref="webgloberef"
    libPath="$path/cesium/dist/Cesium.js"
    pluginPath="$path/cesium/dist/webclient-cesium-plugins.js"
  >
    <!--    children-->
  </igs-doc-layer>
</template>
```

> 如果在浏览器中 访问 `http://localhost:xxxx/$path/cesium/dist/Cesium.js` 成功则说明整个 Cesium 的环境准备已经完毕。

::: tip 为什么要拷贝@mapgis/cesium 由于原生的 Cesium 在支持 Webpack 编译的时候也是采取的 copy 插件来执行对应的文件夹拷贝操作。 因此为了统一处理，这里`统一不采取`手动修改
webpack.config 的方式，而是将 cesium 的所有文件放在 public 或者 asset 的某个目录下，自己`手动实现`静态资料的拷贝
:::

### vueconfig配置
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

::: warning
~ 纯浏览器端建议还是使用 Cesium 原生的方式，而不是 Vue 组件的方式，真心建议
:::
