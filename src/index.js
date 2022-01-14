import Vue from 'vue';
import MapgisUi from '@mapgis/webclient-vue-ui';
import '@mapgis/webclient-vue-ui/dist-libs/webclient-vue-ui.css';
import '@mapgis/webclient-vue-cesium/dist-libs/webclient-vue-cesium.css';
import VueCesium from '@mapgis/webclient-vue-cesium';
import flood from "./components/analysis/flood";
import IgsDocLayer from './components/BaseMap/IgsDocLayer';
import Measure from './components/tools/Mesure';
import Draw from './components/tools/Draw'

Vue.use(MapgisUi);
Vue.use(VueCesium);

export {flood, IgsDocLayer,Measure,Draw};
