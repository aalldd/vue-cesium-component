<template>
  <municipal-commonLayer :height="height"
                         class="mapWrapper"
                         :plugin-path="pluginPath"
                         :lib-path="libPath"
                         @load="handleLoad"
                         @onM3dLoad="onM3dLoad"
                         :m3dInfos="m3dInfos"
                         :commonConfig="globalConfig"
  >
    <router-view></router-view>
    <municipal-tool :wmtsMap="wmtsMap" :cameraView="cameraView"></municipal-tool>
  </municipal-commonLayer>
</template>

<style lang="scss" scoped>
</style>

<script>
export default {
  data() {
    return {
      height: 870,
      // 天地图地址
      url: 'http://t0.tianditu.gov.cn/vec_c/wmts',
      baseUrl: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer',
      baseUrl2: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer',
      pluginPath: '/static/cesium/webclient-cesium-plugin.min.js',
      libPath: '/static/cesium/Cesium.js',
      m3dInfos: [
        {
          maximumMemoryUsage: 1024,
          url: 'http://192.168.12.200:6163/igs/rest/g3d/lgzh0701',
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
      wmtsMap: null,
      cameraView: {
        destination: {
          x: -2416948.392038159,
          y: 5372543.175879652,
          z: 2444631.2541255946
        },
        orientation: {
          heading: 0.08752,
          pitch: -0.689042,
          roll: 0.0002114284469649675
        }
      },
      globalConfig:null
    };
  },
  async mounted() {
    const sysConfig = await this.getSystemConfig('threeD');
    let mapSolution
    //获取地图配置
    if (sysConfig) {
      if (sysConfig.mapConfigID >= 0) {
        const ms = await this.getMapSolution(sysConfig.mapConfigID);
        mapSolution = ms;
      }
      this.globalConfig=mapSolution?.configJSON?.config3d
    }
  },
  methods: {
    handleLoad(payload) {
      const {component: {webGlobe}, Cesium, CesiumZondy} = payload;
    },
    onM3dLoad(payload) {
      const m3ds = payload.m3ds;
      const gdbp = 'gdbp://sa:sasa@192.168.12.200/龙城街道/ds/';
      this.$nextTick(async () => {
        const mapServer = this.$serve.City.Plugin("MapServer");
        const {data: {layers}} = await mapServer.get(`/lgzh?f=json`, {params: {udt: Date.now()}});
        if (m3ds.length) {
          m3ds.forEach(m3d => {
            let gdbpUrl = m3d.gdbpUrl.split('\\');
            let name = gdbpUrl[gdbpUrl.length - 1].split('.')[0];
            //获取二维对应的图层ID 管子类型：civFeatureType
            let layer = layers.find(l => l.name.indexOf(name) > -1 || name.indexOf(l) > -1);
            if (layer) {
              m3d.layerId = layer.id;
              m3d.civFeatureType = layer.civFeatureType;

              let pLayer = layers.find(l => l.id === layer.parentLayerId);
              if (pLayer)
                m3d.gdbp = gdbp + pLayer.name + '/sfcls/' + layer.name;
            }
          });
        }
      });
    },
    getWmtsInfo(payload) {
      this.wmtsMap = payload;
    },
    async getMapSolution(id){
      try {
        const {
          data
        } = await this.$serve.City.Plugin("Services").get("mapsolution", {
          params: {
            id
          }
        });
        if (data && data.length) {
          data[0].configJSON = JSON.parse(data[0].configJSON);
          return data[0];
        }
        return null;
      } catch (e) {
        console.error(e);
        return null;
      }
    },
    async getSystemConfig(client) {
      try {
        const {
          data
        } = await this.$serve.City.Plugin("Services").get("systemconfig", {
          params: {
            client,
            _ts: Date.now()
          }
        });
        return data;
      } catch (e) {
        console.error(e);
        return null;
      }
    }
  }
};
</script>
