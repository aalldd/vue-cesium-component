<template>
  <mapgis-web-scene
    class="mapWrapper"
    :libPath="libPath"
    :pluginPath="pluginPath"
    :height="height"
    @load="load"
  >
    <mapgis-3d-igs-m3d v-for="item in m3dInfos"
                       :url="item.url"
                       :layers="item.layers"
                       :offset="item.offset"
                       :key="item.vueIndex"
                       :vueIndex="item.vueIndex"
                       :maximumMemoryUsage="item.maximumMemoryUsage"/>
    <mapgis-3d-statebar v-if="needState"/>
    <slot></slot>
  </mapgis-web-scene>
</template>

<script>
const {MapgisWebScene, Mapgis3dIgsM3d, Mapgis3dStatebar} = window.Mapgis3d;
export default {
  name: "municipal-commonLayer",
  components: {
    'mapgis-web-scene': MapgisWebScene,
    'mapgis-3d-igs-m3d': Mapgis3dIgsM3d,
    'mapgis-3d-statebar': Mapgis3dStatebar
  },
  provide() {
    return {
      get Cesium() {
        return window.Cesium;
      },
      get CesiumZondy() {
        return window.CesiumZondy;
      },
      get webGlobe() {
        return window.webGlobe;
      },
    };
  },
  props: {
    libPath: {
      type: String,
      require: true
    },
    pluginPath: {
      type: String,
      require: true
    },
    load: {
      type: Function
    },
    height: {
      type: Number,
      default: 1000
    },
    m3dInfos: {
      type: Array
    },
    needState: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style scoped>

</style>
