<template>
  <municipal-common-layer
    container="cesiumWrapper"
    class="mapWrapper"
    :cameraView="cameraView"
    :plugin-path="pluginPath"
    :lib-path="libPath"
    @load="handleLoad"
    @onM3dLoad="onM3dLoad"
    :m3dInfos="m3dInfos3d"
    :commonConfig="globalConfig"
  >
    <Menu></Menu>
    <router-view></router-view>
    <municipal-tool :wmtsMap="wmtsMap" :popupOffset="popupOffset" :cameraView="cameraView" @clickQuery="clickQuery"
                    :clickQueryData="clickQueryData" :clampToGround="true"></municipal-tool>
  </municipal-common-layer>
</template>

<style lang="scss" scoped>
</style>

<script>
import Store from "@/store/store";
import Menu from "@/threeD/Menu/Menu";

export default {
  components: {
    Menu
  },
  data() {
    return {
      pluginPath: '/static/cesium/webclient-cesium-plugin.min.js',
      libPath: '/static/cesium/Cesium.js',
      m3dInfos3d: [
        {
          maximumMemoryUsage: 1024,
          url: 'http://192.168.12.200:6163/igs/rest/g3d/lgall220224',
          layers: '',
          vueIndex: '0'
        }
      ],
      m3dInfos2d: [
        {
          maximumMemoryUsage: 1024,
          url: 'http://192.168.12.200:6163/igs/rest/g3d/lg2d20220224',
          layers: '',
          vueIndex: '0'
        }
      ],
      wmtsMap: {
        url: 'http://t0.tianditu.com/DataServer?T=vec_c&X={x}&Y={y}&L={l}',
        token: '79d9c78880a541ad34a010976a244ec2',
        ptype: 'img'
      },
      cameraView: {
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
      globalConfig: null,
      clickQueryData: null,
      popupOffset: [0, 0],
      globalConfigStore: 'globalConfigStore',
      linkageDataStore: 'linkageDataStore'
    };
  },
  async mounted() {
    const sysConfig = await this.getSystemConfig('threeD');
    let mapSolution;
    //获取地图配置
    if (sysConfig) {
      if (sysConfig.mapConfigID >= 0) {
        const ms = await this.getMapSolution(sysConfig.mapConfigID);
        mapSolution = ms;
      }
      this.globalConfig = mapSolution?.configJSON?.config3d;
    }
  },
  methods: {
    handleLoad(payload) {
      const {component: {webGlobe}, Cesium, CesiumZondy} = payload;
    },
    onM3dLoad(payload) {
      const m3ds = payload.m3ds;
      const gdbp = 'gdbp://sa:sasa@192.168.12.66/龙城街道/ds/';
      this.$nextTick(async () => {
        const mapServer = this.$serve.City.Plugin("MapServer");
        const {data: {layers}} = await mapServer.get(`/lgall0224?f=json`, {params: {udt: Date.now()}});
        if (m3ds.length) {
          m3ds.forEach(m3d => {
            let gdbpUrl = m3d.gdbpUrl.split('\\');
            let name = gdbpUrl[gdbpUrl.length - 1].split('.')[0];
            //获取二维对应的图层ID 管子类型：civFeatureType
            let layer = layers.find(l => l.name.indexOf(name) > -1 || name.indexOf(l) > -1);
            if (layer) {
              m3d.layerId = layer.id;
              m3d.civFeatureType = layer.civFeatureType;
              m3d.name = decodeURI(name);
              let pLayer = layers.find(l => l.id === layer.parentLayerId);
              if (pLayer)
                m3d.gdbp = gdbp + pLayer.name + '/sfcls/' + layer.name;
            }
          });
          window.m3ds = m3ds;
        }
      });
    },
    getWmtsInfo(payload) {
      this.wmtsMap = payload;
    },
    async getMapSolution(id) {
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
    },
    async clickQuery(param) {
      const store = new Store();
      const data = await store.getGeometry(param);
      this.clickQueryData = data;
    }
  }
};
</script>

