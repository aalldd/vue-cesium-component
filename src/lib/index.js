import * as MapComponents from "./components.js";
import MapgisUi from '@mapgis/webclient-vue-ui';
import Vue from 'vue'
import '@mapgis/webclient-vue-ui/dist-libs/webclient-vue-ui.css';
import '@mapgis/webclient-vue-cesium/dist-libs/webclient-vue-cesium.css';
import VueCesium from '@mapgis/webclient-vue-cesium';
Vue.use(MapgisUi);
Vue.use(VueCesium);
export * from "./components.js";

const install = function(Vue, options) {
  options = options || {};

  for (let name in MapComponents) {
    const com = MapComponents[name];
    Vue.component(com.options ? com.options.name : com.name, com);
  }
};

if (typeof window !== "undefined" && window["Vue"]) {
  install(window["Vue"], {});
}

export default {
  install
};

window.MunicipalComponents = MapComponents;
