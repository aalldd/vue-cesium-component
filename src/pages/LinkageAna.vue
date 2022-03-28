<template>
  <municipal-linkage :m3dInfos3d="m3dInfos3d"
                     :m3dInfos2d="m3dInfos2d"
                     :pluginPath="pluginPath"
                     :cameraView="cameraView"
                     :libPath="libPath"
                     :radius="radius"
                     :commonConfig="commonConfig"
                     :clickQueryData="clickQueryData"
                     @on2dLoad="on2dLoad"
                     @on3dLoad="on3dLoad"
                     @clickQuery2d="clickQuery2d"
                     @clickQuery3d="clickQuery3d">
  </municipal-linkage>
</template>

<script>
import Store from "@/store/store";

export default {
  name: "linkageAna",
  data() {
    return {
      m3dInfos3d: null,
      pluginPath: null,
      libPath: null,
      m3dInfos2d: null,
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
      commonConfig: {},
      radius: 3,
      clickQueryData: []
    };
  },
  mounted() {
    //从三维的本地缓存数据中获取
    const totalData = JSON.parse(window.localStorage.getItem('linkageDataStore')) || {};
    const commonConfig = JSON.parse(window.localStorage.getItem('globalConfigStore')) || {};
    this.m3dInfos3d = totalData.m3dInfos3d;
    this.m3dInfos2d = totalData.m3dInfos2d;
    this.pluginPath = totalData.pluginPath;
    this.libPath = totalData.libPath;
    this.commonConfig = commonConfig;
    this.gdbp = this.commonConfig?.globalConfig?.gdbp || '';
  },
  methods: {
    clickQuery2d(param) {
      console.log(param);
    },
    async clickQuery3d(param) {
      const store = new Store();
      const data = await store.getGeometry(param);
      this.clickQueryData = data;
    },
    formatM3ds(type, m3ds) {
      type = `m3ds_${type}`;
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
              m3d.name = decodeURI(name);
              let pLayer = layers.find(l => l.id === layer.parentLayerId);
              if (pLayer)
                m3d.gdbp = this.gdbp + pLayer.name + '/sfcls/' + layer.name;
            }
          });
          window[type] = m3ds;
        }
      });
    },
    on2dLoad(payload) {
      const m3ds = payload.m3ds;
      this.formatM3ds('2d', m3ds);
    },
    on3dLoad(payload) {
      const m3ds = payload.m3ds;
      this.formatM3ds('3d', m3ds);
    }
  }
};
</script>

<style scoped>

</style>
