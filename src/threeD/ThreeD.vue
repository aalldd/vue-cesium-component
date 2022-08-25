<template>
  <keep-alive>
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
      <municipal-tool
        :wmtsMap="wmtsMap"
        :popupOffset="popupOffset"
        :cameraView="cameraView"
        @clickQuery="clickQuery"
        :clickQueryData="clickQueryData"
        :clampToGround="true"
      ></municipal-tool>
    </municipal-common-layer>
  </keep-alive>
</template>

<style lang="scss" scoped></style>

<script>
import { mapState, mapGetters } from "vuex";
import Store from "@/store/store";
import Menu from "@/threeD/Menu/Menu";

export default {
  components: {
    Menu,
  },
  data() {
    return {
      pluginPath: "/static/cesium/webclient-cesium-plugin.min.js",
      libPath: "/static/cesium/Cesium.js",
      m3dInfos3d: null,
      m3dInfos2d: [
        {
          maximumMemoryUsage: 1024,
          url: "http://192.168.12.200:6163/igs/rest/g3d/lg2d20220224",
          layers: "",
          vueIndex: "0",
        },
      ],
      wmtsMap: {
        url: "http://t0.tianditu.com/DataServer?T=vec_c&X={x}&Y={y}&L={l}",
        token: "79d9c78880a541ad34a010976a244ec2",
        ptype: "img",
      },
      cameraView: null,
      clickQueryData: null,
      popupOffset: [0, 0],
      globalConfigStore: "globalConfigStore",
      linkageDataStore: "linkageDataStore",
    };
  },
  computed: {
    ...mapState({
      globalConfig: (state) => state.configs.globalConfig,
      systemConfig: (state) => state.configs.systemConfig,
      mapSolution: (state) => state.configs.mapSolution,
      threeDUrls: (state) => state.configs.threeDUrls,
    }),
    ...mapGetters("configs", {
      viewParam: "viewParam",
    }),
  },
  created() {
    this.$store.dispatch("configs/getSystemConfig");
  },
  methods: {
    handleLoad() {
      this.m3dInfos3d = this.threeDUrls.map((item, index) => {
        return {
          maximumMemoryUsage: 1024,
          url: item,
          layers: "",
          vueIndex: index.toString(),
        };
      });
    },
    onM3dLoad(payload) {
      const m3ds = payload.m3ds;
      const { gdbp, mapServerName } = this.globalConfig;
      const { heading, pitch, roll, position } = this.viewParam;
      this.cameraView = {
        destination: position,
        orientation: {
          heading,
          pitch,
          roll,
        },
      };
      this.$nextTick(async () => {
        const mapServer = this.$serve.City.Plugin("MapServer");
        const {
          data: { layers },
        } = await mapServer.get(`/${mapServerName}?f=json`, {
          params: { udt: Date.now() },
        });
        if (m3ds.length) {
          m3ds.forEach((m3d) => {
            let gdbpUrl = m3d.gdbpUrl.split("\\");
            let name = gdbpUrl[gdbpUrl.length - 1].split(".")[0];
            //获取二维对应的图层ID 管子类型：civFeatureType
            let layer = layers.find(
              (l) => l.name.indexOf(name) > -1 || name.indexOf(l) > -1
            );
            if (layer) {
              m3d.layerId = layer.id;
              m3d.civFeatureType = layer.civFeatureType;
              m3d.name = decodeURI(name);
              let pLayer = layers.find((l) => l.id === layer.parentLayerId);
              if (pLayer)
                m3d.gdbp = gdbp + pLayer.name + "/sfcls/" + layer.name;
            }
          });
          window.m3ds = m3ds;
        }
      });
    },
    getWmtsInfo(payload) {
      this.wmtsMap = payload;
    },
    async clickQuery(param) {
      const store = new Store();
      const data = await store.getGeometry(param);
      this.clickQueryData = data;
    },
  },
};
</script>
