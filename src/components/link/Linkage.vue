<template>
  <div style="display: flex;width: 100%;height: 100%">
    <municipal-common-layer
      container="link2d"
      class="link2d"
      :plugin-path="pluginPath"
      :lib-path="libPath"
      :vue-key="vueKeyD2"
      :m3dInfos="m3dInfos2d"
      :needState="false"
      :lockView="true"
      :cameraView="cameraViewCopy"
      @load="loadD2View"
    >
      <Logo mode="2d"></Logo>
      <municipal-tool :wmtsMap="wmtsMap" :cameraView="cameraViewCopy" :toolComponents="toolComponents"
                      v-if="need2DTools"></municipal-tool>
    </municipal-common-layer>
    <municipal-common-layer
      container="link3d"
      class="link3d"
      :plugin-path="pluginPath"
      :lib-path="libPath"
      :vue-key="vueKeyD3"
      :needState="true"
      :m3dInfos="m3dInfos3d"
      :cameraView="cameraViewCopy"
    >
      <Logo mode="3d"></Logo>
      <municipal-tool :wmtsMap="wmtsMap" :cameraView="cameraViewCopy" :toolComponents="toolComponents"
                      v-if="need3DTools"></municipal-tool>
    </municipal-common-layer>
    <municipal-link :includes="[vueKeyD3, vueKeyD2]" :enable="enable" :limitView="true"/>
    <a-button style="position:absolute; top: 4em;right: 4em" @click="enable=true">开始</a-button>
  </div>
</template>

<script>
import Vue from 'vue';
import Logo from './Logo';

export default {
  name: "municipal-linkage",
  components: {
    Logo
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
      get m3ds() {
        return window.m3ds;
      },
      commonConfig: window.commonConfig,
      eventBus: this.eventBus
    };
  },
  data() {
    return {
      enable: false,
      eventBus: new Vue(),
      cameraViewCopy: {
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
      },
      //天地图
      wmtsMap: null,
      toolComponents: ['measure', 'draw', 'fullScreen', 'tian']
    };
  },
  props: {
    libPath: [String],
    pluginPath: [String],
    m3dInfos2d: [Array],
    m3dInfos3d: [Array],
    vueKeyD2: {
      type: String,
      default: 'link-d2'
    },
    vueKeyD3: {
      type: String,
      default: 'link-d3'
    },
    cameraView: {
      type: Object
    },
    need3DTools: {
      type: Boolean,
      default: true
    },
    need2DTools: {
      type: Boolean,
      default: true
    },
    configStore: [String],
    linkageStore: [String]
  },
  methods: {
    loadD2View(payload) {
      const {component: {webGlobe}} = payload;
      webGlobe.viewer.scene.screenSpaceCameraController.enableTilt = false;
    }
  }
};
</script>

<style scoped>

</style>
