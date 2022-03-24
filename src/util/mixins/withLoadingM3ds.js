import emgUtil from "@/util/helpers/emgUtil";
import vueOptions from "@/util/options/vueOptions";
import panelOptions from "@/util/options/panelOptions";

const loadingM3ds = {
  inject: ['Cesium', 'CesiumZondy', 'webGlobe', 'eventBus'],
  props: {
    ...vueOptions,
    ...panelOptions
  },
  mounted() {
    //由于M3d图层数据加载慢，每秒轮询一次
    let Cesium = this.Cesium || window.Cesium;
    let CesiumZondy = this.CesiumZondy || window.CesiumZondy;
    let webGlobe = this.webGlobe || window.webGlobe;
    this.view = webGlobe;
    const resetChecked = () => {
      if (window.m3ds && window.commonConfig && CesiumZondy && webGlobe) {
        this.m3ds = window.m3ds;
        this.view.tilesetList = this.m3ds;
        this.emgManager = new emgUtil(this.view);
        this.commonConfig = window.commonConfig;
        this.mapServerName = this.commonConfig?.globalConfig?.mapServerName;
        this.offset = this.commonConfig?.globalConfig?.offset;
        this.layerIndexs = this.commonConfig?.globalConfig?.cutLayerIndexList;
        this.sceneManager = new CesiumZondy.Manager.SceneManager({viewer: this.view.viewer});
        //初始化分析功能管理类
        this.analysisManager = new CesiumZondy.Manager.AnalysisManager({
          viewer: this.view.viewer
        });
        this.entityController = new CesiumZondy.Manager.EntityController({
          viewer: this.view.viewer
        });
        //过滤出地上模型以及地上模型的计算矩阵
        if (this.layerIndexs) {
          this.tilesetList = this.m3ds.filter(t => this.layerIndexs.includes(t.layerIndex));
          if (this.tilesetList?.length) {
            this.transform = this.tilesetList[0]?.root?.transform;
          }
        }
        this.commonParam = {
          offset: this.offset,
          mapServerName: this.mapServerName,
          cutLayerIndexs: this.layerIndexs
        };
        window.commonParam = this.commonParam;
        this.$emit('load', this);
        window.clearInterval(this.myInterval);
      }
    };
    this.reAsked(resetChecked);
  },
  methods: {
    reAsked(callback) {
      this.myInterval = window.setInterval(() => {
        setTimeout(callback);
      }, 1000);
    },
    removeAll() {
      this.emgManager.removeAll();
      this.drawElement && this.drawElement.stopDrawing();
    },
    registerMouseEvent() {
      if (!this.mouseEventManager) {
        //构造鼠标事件管理对象
        this.mouseEventManager = new CesiumZondy.Manager.MouseEventManager({
          viewer: this.view.viewer
        });
      }
      //注册鼠标左键单击事件
      this.mouseEventManager.registerMouseEvent('LEFT_CLICK', (movement) => this.leftClick(movement));
      //注册鼠标右键单击事件
      this.mouseEventManager.registerMouseEvent('RIGHT_CLICK', () => {
        this.mouseEventManager.unRegisterMouseEvent('LEFT_CLICK');
        this.mouseEventManager.unRegisterMouseEvent('RIGHT_CLICK');
        this.cursorVisible = false;
      });
    }
  },
  destroyed() {
    this.emgManager && this.emgManager.removeAll();
    this.$emit('unload', this);
  }
};

export default loadingM3ds;
