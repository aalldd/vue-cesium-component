import emgUtil from "@/util/emgUtil";
const loadingM3ds = {
  inject: ['Cesium', 'CesiumZondy', 'webGlobe'],
  mounted() {
    //由于M3d图层数据加载慢，每秒轮询一次
    const resetChecked = () => {
      if (window.m3ds) {
        this.m3ds = window.m3ds;
        this.webGlobe.tilesetList=this.m3ds
        this.emgManager=new emgUtil(this.webGlobe)
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
    }
  }
};

export default loadingM3ds;
