<template>
  <mapgis-web-scene
    class="mapWrapper"
    :libPath="libPath"
    :pluginPath="pluginPath"
    :height="height"
    :keyEventEnable="keyEventEnable"
    @load="handleLoad"
  >
    <mapgis-3d-igs-m3d v-for="item in m3dInfos"
                       :url="item.url"
                       :layers="item.layers"
                       :offset="item.offset"
                       :key="item.vueIndex"
                       :vueIndex="item.vueIndex"
                       @loaded="handleM3dload"
                       :maximumMemoryUsage="item.maximumMemoryUsage"/>
    <mapgis-3d-statebar v-if="needState"/>
    <slot></slot>
  </mapgis-web-scene>
</template>

<script>
import Vue from 'vue';

export default {
  name: "municipal-common-layer",
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
      get m3ds() {
        return window.m3ds;
      },
      commonConfig: window.commonConfig,
      eventBus: this.eventBus
    };
  },
  data() {
    return {
      m3dLoadCount: 0,
      eventBus: new Vue()
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
    },
    commonConfig: {
      type: Object
    },
    keyEventEnable: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    commonConfig: {
      handler() {
        if (this.commonConfig) {
          window.commonConfig = this.commonConfig;
        }
      }
    }
  },
  methods: {
    handleLoad(payload) {
      this.$emit('load', payload);
    },
    handleM3dload(payload) {
      if (payload.m3ds.length > 0 && this.m3dLoadCount === 0) {
        this.m3ds = payload.m3ds;
        this.$nextTick(() => {
          this.m3dLoadCount++;
          window.m3ds = payload.m3ds;
          this.$emit('onM3dLoad', payload);
        });
      }

    }
  }
};
</script>

<style scoped>

</style>
