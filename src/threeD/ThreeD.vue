<template>
  <igs-doc-layer :height="height"
                 class="mapWrapper"
                 :plugin-path="pluginPath"
                 :lib-path="libPath"
                 :load="handleLoad"
                 :m3dInfos="m3dInfos"
  >
    <router-view></router-view>
    <wmts-doc-layer
      :baseUrl="url"
      :wmtsLayer="wmtsLayer"
      :tileMatrixSet="tileMatrixSet"
      :tilingScheme="tilingScheme"
      :format="format"
      :token="token"
      @load="getWmtsInfo"
    ></wmts-doc-layer>
    <tools :wmtsMap="this.wmtsMap" :cameraView="this.cameraView"></tools>
  </igs-doc-layer>
</template>

<style lang="scss" scoped>
</style>

<script>
import WmtsDocLayer from "@/components/BaseMap/WmtsDocLayer";
import tools from "@/components/tools/tools";

export default {
  components: {
    'wmts-doc-layer': WmtsDocLayer,
    'tools': tools
  },
  data() {
    return {
      height: 850,
      // 天地图地址
      url: 'http://t0.tianditu.gov.cn/vec_c/wmts',
      baseUrl: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer',
      baseUrl2: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer',
      pluginPath: '/static/cesium/webclient-cesium-plugin.min.js',
      libPath: '/static/cesium/Cesium.js',
      m3dInfos: [
        {
          maximumMemoryUsage: 1024,
          url: 'http://192.168.12.200:6163/igs/rest/g3d/lgzh0902',
          layers: '',
          vueIndex: '0'
        }
      ],
      // cesium瓦片切片方式
      tilingScheme: "EPSG:4326",
      // 地图的瓦片矩阵集合
      tileMatrixSet: "c",
      //图层名称
      wmtsLayer: "vec",
      //返回格式
      format: "tiles",
      //token信息
      token: {
        key: "tk",
        value: "9c157e9585486c02edf817d2ecbc7752"
      },
      cameraView: {
        destination: {
          x: -5087907.392038159,
          y: 14207074.175879652,
          z: 3655215.2541255946
        },
        orientation: {
          heading: 6.1827568973283045,
          pitch: -1.2409374391413084,
          roll: 0.0003114284469649675
        }
      }
    };
  },
  created() {
    this.view = null;
    this.Cesium = null;
    this.CesiumZondy = null;
  },
  methods: {
    handleLoad(payload) {
      const {component: {webGlobe}, Cesium, CesiumZondy} = payload;
      window.webGlobe = webGlobe;
      window.Cesium = Cesium;
      window.CesiumZondy = CesiumZondy;
    },
    onM3dLoad(payload) {
      console.log(payload);
    },
    getWmtsInfo(payload) {
      this.wmtsMap = payload;
    }
  }
};
</script>
