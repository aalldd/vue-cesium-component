<template>
  <div style="display: flex;width: 100%;height: 100%">
    <keep-alive>
      <municipal-common-layer
        container="link2d"
        class="link2d"
        :plugin-path="pluginPath"
        :lib-path="libPath"
        :vue-key="vueKeyD2"
        :m3dInfos="m3dInfos2d"
        :needState="false"
        :cameraView="cameraViewCopy"
        @load="loadD2View"
        @onM3dLoad="onM3dLoadD2"
      >
        <Logo mode="2d"></Logo>
        <municipal-tool-link :wmtsMap="wmtsMap" :cameraView="cameraViewCopy" :toolComponents="toolComponents2D"
                             v-if="need2DTools" @clickQuery2d="clickQuery2d" queryType="2d" :radius="radius"
                             :clickQueryData="clickQueryDataCopy"></municipal-tool-link>
      </municipal-common-layer>
    </keep-alive>
    <keep-alive>
      <municipal-common-layer
        container="link3d"
        class="link3d"
        :plugin-path="pluginPath"
        :lib-path="libPath"
        :vue-key="vueKeyD3"
        :needState="true"
        :m3dInfos="m3dInfos3d"
        :cameraView="cameraViewCopy"
        @onM3dLoad="onM3dLoadD3"
      >
        <Logo mode="3d"></Logo>
        <municipal-tool-link :wmtsMap="wmtsMap" :cameraView="cameraViewCopy" :toolComponents="toolComponents"
                             v-if="need3DTools" @clickQuery3d="clickQuery3d"
                             :clickQueryData="clickQueryDataCopy"></municipal-tool-link>
      </municipal-common-layer>
    </keep-alive>
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
      get commonConfig() {
        return window.commonConfig;
      },
      eventBus: this.eventBus,
      d2View: this.d2View,
      d3View: this.d3View
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
      toolComponents2D: ['fullScreen', 'tian', 'clickQuery'],
      toolComponents: ['fullScreen', 'tian', 'clickQuery', 'layerControl']
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
    commonConfig: {
      type: Object
    },
    //二维点击查询的缓冲范围
    radius: {
      type: Number,
      default: 3
    },
    clickQueryDataCopy: {
      type: Array
    }
  },
  watch: {
    commonConfig: {
      handler() {
        if (!_.isEmpty(this.commonConfig)) {
          window.commonConfig = this.commonConfig;
        }
      },
      immediate: true
    },
    clickQueryData: {
      handler() {
        if (this.clickQueryData) {
          this.clickQueryDataCopy = this.clickQueryData;
        }
      },
      immediate: true
    }
  },
  methods: {
    loadD2View(payload) {
      const {component: {webGlobe}} = payload;
      webGlobe.viewer.scene.screenSpaceCameraController.enableTilt = false;
    },
    onM3dLoadD2(payload) {
      this.$emit('on2dLoad', payload);
    },
    onM3dLoadD3(payload) {
      this.$emit('on3dLoad', payload);
    },
    clickQuery3d(param) {
      this.$emit('clickQuery3d', param);
    },
    clickQuery2d(param) {
      this.$emit('clickQuery2d', param);
    }
  }
};
</script>

<style scoped>

</style>
