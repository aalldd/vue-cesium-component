<template>
  <mapgis-web-scene
    class="mapWrapper"
    :libPath="libPath"
    :pluginPath="pluginPath"
    :height="height"
    @load="handleLoad"
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
export default {
  name: "municipal-commonLayer",
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
  },
  methods:{
    handleLoad(payload){
      this.$emit('load',payload)
    }
  }
};
</script>

<style scoped>

</style>
