<template>
  <div>
    <municipal-panel  v-if="state==='init'" :title="title" :draggable="draggable" @close="$emit('onClose')" :closable="closable"
                     :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
      <template v-slot:content>
        <div class="initContent">
          <a-spin :spinning="loading">
            <div style="display: flex;margin-left: 10px;align-items: center">
              <div class="icons" @click="pickPipe">
                <municipal-icon name="-vector-point" style="cursor: pointer"></municipal-icon>
              </div>
              <span>
            点击地图选取爆管点
            </span>
            </div>
            <hr style="margin-top: 10px;margin-bottom: 10px"/>
            <div style="width: 100%;display: flex;justify-content: flex-end">
              <a-checkbox @change="onToggle" :default-checked="true">
                允许开启已关闭阀门
              </a-checkbox>
            </div>
          </a-spin>
          <municipal-cursor-tip v-if="tipVisible">
            左键选择设备，右键取消
          </municipal-cursor-tip>
        </div>
      </template>
    </municipal-panel>
    <municipal-squibres v-if="state==='res'" :title="title" :draggable="draggable" @close="$emit('onClose')"
                        :closable="closable"
                        :need-expand="expandable"
                        :panel-style="panelStyle"
                        :panel-class-name="panelClassName"
                        :squibResults="squibResults"
                        :SQUIB_ICONS="SQUIB_ICONS"
                        @goBack="goBack"
    >

    </municipal-squibres>
  </div>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

const SQUIB_RESULT_TYPES = {
  SQUIBPOINT: "civFeatureMetaTypeIncidentPoint", //爆管发生点
  SHOULDCLOSEDSWITCH: "civFeatureMetaTypeSwitch", //需关断设备
  CLOSEDSWITCH: "civFeatureMetaTypeClosedSwitch", //已关断设备
  SHOULDOPENSWITCH: "civFeatureMetaTypeShouldOpenSwitch", //需开启设备
  INVALIDATESWITCH: "civFeatureMetaTypeInvalidateSwitch", //失效关断设备
  ASSISTSWITCH: "civFeatureMetaTypeAssistSwitch", //辅助关断设备
  EFFECTEDUSER: "civFeatureMetaTypeSwieffect", //受影响用户
  EFFECTEDPIPELINE: "civFeatureMetaTypePipeLine", //受影响管段
  EFFECTEDREGION: "civFeatureMetaTypeRegionResult", //受影响区域
  EFFECTEDRECENTER: "civFeatureMetaTypeRescenter", //受影响水源
  RESSTOP: "civFeatureMetaTypeResstop" //资源装卸点
};
const DEFUALT_SELECTED_TYPES = [ //默认显示的类型
  "civFeatureMetaTypeIncidentPoint",
  "civFeatureMetaTypeSwitch",
  "civFeatureMetaTypeSwieffect",
  "civFeatureMetaTypePipeLine",
  "civFeatureMetaTypeRegionResult"
];
const EXLUDE_TYPES = [ //排除在外的类型
  "civFeatureMetaTypeRescenter",
  "civFeatureMetaTypeResstop"
];

export default {
  name: "municipal-squib",
  mixins: [loadingM3ds],
  data() {
    return {
      tipVisible: false,
      //失效设备
      invalidElemIDs: [],
      isOpenFlg: true,
      expbtnFlag: false,
      state: 'init',
      squibResults: []
    };
  },
  props: {
    ...panelOptions,
    title: {
      type: String,
      default: '爆管分析'
    },
    loading: {
      type: Boolean,
      default: false
    },
    //爆管的数据，需要从父组件中传入
    squibData: {
      type: Array
    },
    //最大失效设备数
    maxFeatureCount: {
      type: Number,
      default: 20000
    },
    SQUIB_ICONS: {
      type: Object
    }
  },
  mounted() {
    this.currentPicked = null;
  },
  watch: {
    squibData: {
      handler() {
        if (this.squibData?.length > 0) {
          this.afterAnalysis();
        }
      }
    }
  },
  methods: {
    pickPipe() {
      this.emgManager.removeAll();
      if (!this.mouseEventManager) {
        //构造鼠标事件管理对象
        this.mouseEventManager = new CesiumZondy.Manager.MouseEventManager({
          viewer: this.webGlobe.viewer
        });
      }
      this.tipVisible = true;
      this.mouseEventManager.registerMouseEvent('LEFT_CLICK', (movement) => this.leftClick(movement));
      //注册鼠标右键单击事件
      this.mouseEventManager.registerMouseEvent('RIGHT_CLICK', () => {
        this.mouseEventManager.unRegisterMouseEvent('LEFT_CLICK');
        this.mouseEventManager.unRegisterMouseEvent('RIGHT_CLICK');
        this.tipVisible = false;
      });
    },
    onToggle(e) {
      this.isOpenFlg = e.target.checked;
    },
    goBack(){
      this.state='init'
    },
    leftClick(movement) {
      this.mouseEventManager.unRegisterMouseEvent('LEFT_CLICK');
      const pickedFeature = this.webGlobe.scene.pick(movement.position);
      if (!Cesium.defined(pickedFeature)) {
        this.$message.warn('请点击管道！');
        this.emgManager.removeAll();
        this.tipVisible = false;
        return;
      }
      this.currentPicked && this.emgManager.stopHighlight([this.currentPicked.tileset]);
      this.emgManager.binkPipe(null, null, pickedFeature);
      // 获取经纬度
      this.position = this.emgManager.getPosition(movement);
      // 获取模型坐标
      const pos = this.emgManager.getPosition(movement);
      this.loc = this.emgManager.positionTransfer(pos);
      this.queryParam();
      this.currentPicked = pickedFeature;
      this.tipVisible = false;
    },
    queryParam() {
      let squibPoint = {
        x: Number(this.loc[0]) + Number(this.offset[0]),
        y: Number(this.loc[1]) + Number(this.offset[1])
      };
      const params = {
        isexactAcc: true,
        isOpenFlg: true === this.isOpenFlg ? 1 : 0,
        imageDisplay: [1920, 969, 96].join(),
        geometryType: 'Point',
        tolerance: 10,
        invalidateValves: this.invalidElemIDs.join(), // 失效设备
        barrier: '',
        geometry: JSON.stringify(squibPoint),
        mapExtent: JSON.stringify(this.getCurrentView()),
        cacheBust: true,
        mapServerName: this.commonConfig.globalConfig.mapServerName
      };
      this.$emit('query', params);
    },
    getCurrentView() {
      const {position1, position2} = this.emgManager.getCurrentView();

      let pos1 = this.emgManager.positionTransfer(position1);
      let pos2 = this.emgManager.positionTransfer(position2);

      return {
        "xmin": Number(pos1[0]) + Number(this.offset[0]),
        "ymin": Number(pos2[1]) + Number(this.offset[1]),
        "xmax": Number(pos2[0]) + Number(this.offset[0]),
        "ymax": Number(pos1[1]) + Number(this.offset[1])
      };
    },
    afterAnalysis() {
      this.state = 'res';
      this.squibResults = this.toSquibResults(this.squibData);//过滤掉不显示类型后的分析结果
      console.log(this.squibResults);
      //扩大关阀设备
      this.switchLayerItems = this.squibResults.map(function (item) {
        if (this.isSwitchEquip(item.type)) {
          return item.layerItems.filter(function (l) {
            return l.objectIds.length > 0;
          });
        } else {
          return [];
        }
      }, this).reduce(function (a, b) {
        return a.concat(b);
      }, []);
      this.expbtnFlag = this.switchLayerItems.length !== 0;
      //受影响用户
      this.userItems = this.squibResults.map(function (item) {
        if (item.type === SQUIB_RESULT_TYPES.EFFECTEDUSER) {
          return item.layerItems.filter(function (l) {
            return l.objectIds.length > 0;
          });
        } else {
          return [];
        }
      }, this).reduce(function (a, b) {
        return a.concat(b);
      }, []);
      //暂时没有用户数据
      if (this.userItems.length > 0) {
        this.queryRelationships();
      } else {
        this.showResultOnMap();
      }
    },
    //地图显示爆管结果
    showResultOnMap() {
      this.pendingLayerItems = [];
      this.squibResults.forEach(item => {
        if (item.type === SQUIB_RESULT_TYPES.EFFECTEDUSER) {
          item.totalUser = item.layerItems.reduce(function (a, b) {
            return a += (b.totalUser || 0);
          }, 0);
        }
      });
      this.squibResults.forEach(function (item) {
        this.pendingLayerItems = this.pendingLayerItems.concat(item.layerItems);
      }, this);

      this.queryPendingLayerItems();
    },
    queryPendingLayerItems() {

    },
    //查询附属数据关联信息
    async queryRelationships() {
      this.$emit('queryRelationships', {
        serverName: this.commonConfig.globalConfig.mapServerName,
        userItem: this.userItem
      });
    },
    //是否为可启闭设备
    isSwitchEquip(type) {
      return type === SQUIB_RESULT_TYPES.SHOULDCLOSEDSWITCH ||
        type === SQUIB_RESULT_TYPES.INVALIDATESWITCH;
    },
    //data create methods
    toSquibResults(data) {
      let results = [];
      data.forEach(function (r) {
        r.resultList == null && (r.resultList = []);
        if (EXLUDE_TYPES.indexOf(r.civFeatureMetaType) === -1) {
          let checked = DEFUALT_SELECTED_TYPES.indexOf(r.civFeatureMetaType) !== -1,
            total = r.resultList.reduce(function (a, b) {
              return a += (!!b.objectIds ? b.objectIds.length : 0);
            }, 0); //总设备数
          if (checked) {
            checked = total <= this.maxFeatureCount && total > 0;
          }
          let layerItems = this.toLayerItems(r, checked),
            result = {
              type: r.civFeatureMetaType,
              typeName: r.civFeatureMetaTypeName,
              layerItems: layerItems,
              icon: this.SQUIB_ICONS[r.civFeatureMetaType],
              count: total,
              checked: checked
            };
          results.push(result);
        }
      }, this);
      //受影响区域与受影响管段关联
      let region = results.filter(function (r) {
          return r.type === SQUIB_RESULT_TYPES.EFFECTEDREGION;
        }, this)[0],
        pipe = results.filter(function (r) {
          return r.type === SQUIB_RESULT_TYPES.EFFECTEDPIPELINE;
        }, this)[0];
      if (region) {
        region.checked = pipe ? pipe.checked : false;
      }
      return results;
    },
    toLayerItems(result, checked) {
      let layerItems = [];
      result.resultList.forEach(function (item) {
        layerItems.push({
          type: result.civFeatureMetaType,
          typeName: result.civFeatureMetaTypeName,
          layerId: item.layerId,
          layerName: item.layerName,
          objectIds: item.objectIds,
          checked: checked
        });
      });
      return layerItems;
    }
  }
};
</script>

<style scoped lang="scss">
@import "../var";

.icons {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 26px;
  height: 26px;
  margin-left: 10px;
  margin-right: 30px;
  cursor: pointer;

  &:hover {
    background-color: $active-background;
  }
}
</style>
