<template>
  <div class="cesium-map-wrapper">
    <div v-once :id="container" ref="container"/>
    <slot v-if="initialized"/>
  </div>
</template>

<script>
import "./widgets.css";
import withPrivateMethods from "@/util/mixins/withPrivateMethods";
import withEvents from "@/util/mixins/withEvents";
import {flyTo, flyToEx} from "@/util/helpers/util";
import {initManager} from "@/util/helpers/manager";
import options from "./options";

export default {
  name: "municipal-web-scene",

  mixins: [withEvents, withPrivateMethods],

  props: {
    libPath: {
      type: String,
    },
    pluginPath: {
      type: String,
    },
    height: {
      type: Number
    },
    ...options
  },

  provide() {
    const self = this;
    return {
      get Cesium() {
        return self.Cesium;
      },
      get CesiumZondy() {
        return self.CesiumZondy;
      },
      get webGlobe() {
        return self.webGlobe;
      },
    };
  },

  data() {
    return {
      initialized: false,
    };
  },
  watch: {
    height: {
      handler: function () {
        //解决分屏时，cesium无限拉长的问题，要给一个固定高度
        let vm = this;
        window.CesiumZondy.getWebGlobeByInterval(function (webGlobe) {
          vm.$nextTick(function () {
            webGlobe.viewer.container.style.height = this.height + "px";
          });
        }, this.vueKey);
      }
    }
  },
  methods: {
    async loadScript() {
      await this.$_loadScript();
    },
    flyTo(globeView) {
      flyTo(globeView, this.webGlobe);
    },
    flyToEx(globeView) {
      flyToEx(globeView, this.webGlobe);
    },
  },

  created() {
    initManager();
    this.webGlobe = null;
    this.propsIsUpdating = {};

    window.webGlobe = window.webGlobe || null;
    /*     const eventNames = Object.keys(mapEvents);
    this.$_bindMapEvents(eventNames);
    this.$_registerAsyncActions(map);
    this.$_bindPropsUpdateEvents(); */
    this.initialized = false;
    // const cesiumLib = import("@mapgis/cesium");
    // Cesium.buildModuleUrl.setBaseUrl('./cesium/');

    /* console.log("cesium created", this.cesium);
    this.cesiumPromise = this.cesium
      ? Promise.resolve(this.cesium)
      : this.loadScript(); */
  },

  mounted() {
    const {vueKey, vueIndex} = this;
    const {cameraView} = this;
    let vm = this;
    this.$_loadScript().then((Cesium) => {
      this.Cesium = Cesium;
      this.CesiumZondy = window.CesiumZondy;
      let container = this.$refs.container;
      const webGlobe = new Cesium.WebSceneControl(container, {
        ...this._props,
      });

      //解决分屏时，cesium无限拉长的问题，要给一个固定高度
      if (this.height) {
        this.$nextTick(function () {
          webGlobe.viewer.container.style.height = this.height + "px";
        });
      }

      this.webGlobe = webGlobe;
      webGlobe.vueKey = vueKey;
      if (cameraView) {
        flyToEx(cameraView, webGlobe);
      }
      window.CesiumZondy.GlobesManager.addSource(vueKey, vueIndex, webGlobe, {
        ScreenSpaceEventHandler: undefined,
      });

      window.webGlobe = window.webGlobe || webGlobe;
      webGlobe.viewer.cesiumWidget.readyPromise &&
      webGlobe.viewer.cesiumWidget.readyPromise.then(function (globe) {
        vm.$emit("webGlobeLoaded", globe);
      });
      // window.webGlobe = webGlobe;
      /*     const eventNames = Object.keys(mapEvents);
      this.$_bindMapEvents(eventNames);
      this.$_registerAsyncActions(map);
      this.$_bindPropsUpdateEvents(); */
      this.initialized = true;
      const iframe = document.getElementsByClassName('cesium-infoBox-iframe')[0];
      iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');
      iframe.setAttribute('src', '');
      // 这里禁止吧cesium示例化后的webGlobe传上去，此处会发生vue劫持操作，导致内存溢出
      this.$emit("load", {
        component: this,
        Cesium: Cesium,
        CesiumZondy: window.CesiumZondy,
      });
      if (this.container) {
        let dom = document.getElementById(this.container);
        if (dom) {
          dom.style.height = "100%";
        }
      }
    });
  },

  beforeDestroy() {
    this.$nextTick(() => {
      if (this.webGlobe) {
        const {vueKey, vueIndex} = this;
        window.CesiumZondy.GlobesManager.deleteSource(vueKey, vueIndex);
        this.webGlobe.viewer.scene.primitives.removeAll();
        this.webGlobe.viewer.scene.primitives.destroy();
        this.webGlobe.viewer.entities.removeAll();
        this.webGlobe.viewer.destroy();
        // this.webGlobe = null;
        // this.viewer = null;
        this.initialized = false;
      }
    });
  }
};
</script>

<style>
.cesium-map-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}
</style>
