<template>
  <div>
    <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                     :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
      <template v-slot:content>
        <a-spin :spinning="loadingCopy">
          <div class="pipe-item">
            <div class="input-tag">统计范围：</div>
            <municipal-draw :vueKey="vueKey" enable-menu-control="func" :drawItems="drawItems" :infinite="false"
                            @drawcreate="handleDraw" style="flex: 1"></municipal-draw>
            <a-button @click="onStatistic">
              <a-icon type="pie-chart"/>
              统计
            </a-button>
          </div>
          <div class="pipe-item" style="height: 200px">
            <div class="input-tag">选择管网：</div>
            <div style="flex: 1">
              <municipal-layer :customTreeData="true"
                               :needSearch="false"
                               :layerStyle="layerStyle"
                               :cutLeaf="true"
                               :layerData="layerData"
                               :loading="loadingLayer"
                               @check="choosePipe">
              </municipal-layer>
            </div>
          </div>
          <div class="pipe-item" style="height: 200px">
            <div class="input-tag">分类字段：</div>
            <div style="flex: 1">
              <municipal-layer :customTreeData="true"
                               :needSearch="false"
                               :loading="loadingAttr"
                               :layerStyle="layerStyle"
                               :layerData="attrData"
                               @check="chooseAttr">
              </municipal-layer>
            </div>
          </div>
        </a-spin>
      </template>
    </municipal-panel>
    <slot name="chart"></slot>
  </div>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import {treeUtil} from "@/util/helpers/helper";

export default {
  name: "municipal-pipe-statistic",
  mixins: [loadingM3ds],
  data() {
    return {
      drawItems: ['global', 'preview', 'polygon', 'rect'],
      //图层树数据
      layerData: [],
      loadingLayer: false,
      loadingAttr: false,
      layerStyle: {
        height: '200px',
        overflowY: 'scroll',
        overflowX: 'hidden',
        border: '1px solid #ccc',
        flex: 1,
        pointerEvents: 'all'
      },
      //选择的图层数据
      layerValue: [],
      //选择的字段数据
      attrValue: [],
      loadingCopy: false
    };
  },
  props: {
    ...panelOptions,
    title: {
      type: String,
      default: '管线统计'
    },
    panelStyle: {
      type: Object,
      default: () => {
        return {
          width: '450px',
          position: 'absolute',
          right: '2em',
          top: '4em'
        };
      }
    },
    //分类字段的数据
    attrData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    //统计面板的等待状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  mounted() {
    this.loadingLayer = true;
    this.loadingAttr = true;
    const getLayerData = () => {
      if (this.commonConfig) {
        let layerNames = [];
        const layerGroupNamesTree = this.commonConfig?.globalConfig?.layerGroupNamesTree;
        const layerTreeData = [{
          title: layerGroupNamesTree.children[1].title,
          key: layerGroupNamesTree.children[1].title,
          children: []
        }];
        layerGroupNamesTree.children[1].children.forEach(item => {
          layerTreeData[0].children.push({title: item.title, key: item.title});
          layerNames.push(item.title);
        });
        this.layerData = layerTreeData;
        const params = {
          mapServerName: this.commonConfig.globalConfig.mapServerName,
          pipenetNames: layerNames.toString(),
          hasUNVisible: false,
        };
        this.loadingLayer = false;
        this.layerValue = layerNames;
        this.$emit('loadAttrTree', params);
        window.clearInterval(this.myInterval);
      }
    };
    this.reAsked(getLayerData);
  },
  watch: {
    attrData: {
      handler() {
        if (this.attrData) {
          this.loadingAttr = false;
          treeUtil.forEach(this.attrData, item => {
            if (!item.children) {
              this.attrValue.push(item.title);
            }
          });
        }
      }
    },
    loading: {
      handler() {
        this.loadingCopy = this.loading;
      },
      immediate: true
    }
  },
  methods: {
    handleDraw(result) {
      let geometry;
      let geometryType;
      const {payload} = result;
      //如果回传了笛卡尔3坐标，就是画多边形，矩形或者圆
      if (Array.isArray(payload)) {
        const lnglats = payload.map(item => this.emgManager.Cartesian3ToLat(item));
        const cne = lnglats[1];
        const csw = lnglats[3];
        //将区域转成模型坐标
        const modelPoint = this.emgManager.positionTransfer({lng: cne.lng, lat: cne.lat, height: 0});
        const modelPoint1 = this.emgManager.positionTransfer({lng: csw.lng, lat: csw.lat, height: 0});
        const point1 = [Number(modelPoint[0]) + Number(this.offset[0]), Number(modelPoint[1]) + Number(this.offset[1])];
        const point2 = [Number(modelPoint1[0]) + Number(this.offset[0]), Number(modelPoint1[1]) + Number(this.offset[1])];
        const geom = [point2[0], point2[1], point1[0], point1[1]];
        //如果是矩形或者当前视野
        if (result.type === 'rect' || 'preview') {
          geometryType = 'civGeometryEnvelope';
          geometry = {
            xmin: geom[0],
            ymin: geom[1],
            xmax: geom[2],
            ymax: geom[3]
          };
          //  多边形
        } else {
          //直接笛卡尔3转模型坐标
          const positions = payload.map(item => {
            const position = this.emgManager.Car3ToFv(item);
            return [position.x + this.offset[0], position.y + this.offset[1]];
          });
          geometryType = 'civGeometryPolyline';
          geometry = {rings: [positions]};
        }
        //  全局
      } else if (payload === "global") {
        geometry = '';
        geometryType = '';
        //  当前视野范围
      } else {
        //这种情况没有可能触发
        geometry = payload.geometry;
        geometryType = 'civGeometryEnvelope';
      }
      this.geometry = {
        geometry,
        geometryType
      };
    },
    choosePipe(checkedKeys) {
      this.layerValue = checkedKeys;
    },
    chooseAttr(checkedKeys) {
      this.attrValue = checkedKeys;
    },
    onStatistic() {
      if (!this.geometry) {
        this.$message.warn('请绘制查询区域');
        return;
      }

      if (!this.attrValue.length) {
        this.$message.error('请选择要统计字段');
        return;
      }

      if (!this.layerValue.length) {
        this.$message.error('请选择要统计管网');
        return;
      }

      const params = {
        ...this.geometry,
        netNames: this.layerValue.toString(),
        fields: this.attrValue.toString(),
        ...this.commonParam
      };
      this.$emit('queryStatistic', params);
    }
  }
};
</script>

<style scoped lang="scss">
.pipe-item {
  display: flex;
  align-items: center;
  margin-top: 10px;

  .input-tag {
    height: 100%;
    text-align: left;
  }
}
</style>
