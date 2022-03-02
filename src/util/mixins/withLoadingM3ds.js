import emgUtil from "@/util/helpers/emgUtil";

const loadingM3ds = {
  inject: ['Cesium', 'CesiumZondy', 'webGlobe'],
  mounted() {
    //由于M3d图层数据加载慢，每秒轮询一次
    this.view = this.webGlobe;
    const resetChecked = () => {
      if (window.m3ds && window.commonConfig) {
        this.m3ds = window.m3ds;
        this.view.tilesetList = this.m3ds;
        this.emgManager = new emgUtil(this.view);
        this.commonConfig = window.commonConfig;
        this.mapServerName = this.commonConfig?.globalConfig?.mapServerName;
        this.offset = this.commonConfig?.globalConfig?.offset;
        this.sceneManager = new CesiumZondy.Manager.SceneManager({viewer: this.view.viewer});
        this.$emit('load', this);
        window.clearInterval(this.myInterval);
      }
    };
    this.reAskM3ds(resetChecked);
  },
  methods: {
    reAskM3ds(callback) {
      this.myInterval = window.setInterval(() => {
        setTimeout(callback);
      }, 1000);
    },
    removeAll() {
      this.emgManager.removeAll();
      this.drawOper && this.drawOper.removeEntities();
      window.drawElement && window.drawElement.stopDrawing();
    }
  },
  destroyed() {
    this.emgManager && this.emgManager.removeAll();
    this.$emit('unload', this);
  }
};

export default loadingM3ds;
