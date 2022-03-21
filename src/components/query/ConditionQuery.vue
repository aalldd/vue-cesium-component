<template>
  <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <div style="display: flex;margin-bottom: 10px;align-items: center">
        <municipal-draw :vueKey="vueKey" enable-menu-control="func" :drawItems="drawItems" :infinite="false"
                        @drawcreate="handleDraw"></municipal-draw>
        <div style="flex: 1;margin-left: 10px">
          <municipal-layer-select :layerGroup="layerGroup" :customTreeData="false"
                                  @onLayerChange="onLayerChange"></municipal-layer-select>
        </div>
      </div>
      <slot name="filter"></slot>
      <div style="display: flex;justify-content: flex-end;margin-top: 10px">
        <a-button @click="reset" style="margin-right: 10px">重置</a-button>
        <a-button type="primary" @click="queryCondition">查询</a-button>
      </div>
    </template>
  </municipal-panel>
</template>

<script>
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import panelOptions from "@/util/options/panelOptions";
import {treeUtil} from "@/util/helpers/helper";

export default {
  name: "municipal-condition-query",
  mixins: [loadingM3ds],
  data() {
    return {
      drawItems: ['global', 'preview', 'polygon', 'rect', 'circle'],
      layerInfoCopy: {},
      fldName: [],
      fieldArr: [],
      condition: '',
      layerGroup: {
        '地下图层': {}
      }
    }
  },
  props: {
    ...panelOptions,
    panelStyle: {
      type: Object,
      default: () => {
        return {
          width: '600px',
          position: 'absolute',
          right: '2em',
          top: '2em'
        };
      }
    },
    layerInfo: {
      type: Object
    },
  },
  watch: {
    layerInfo: {
      handler() {
        if (this.layerInfo && Object.keys(this.layerInfo).length > 0) {
          this.layerInfoCopy = this.layerInfo;
          this.formatLayerInfo();
        }
      }, immediate: true
    }
  },
  mounted() {
    this.eventBus.$on('sendSql', sql => {
      this.condition = sql;
    });
  },
  methods: {
    reset() {
      this.$emit('reset');
    },
    handleDraw(result) {
      let geometry;
      let geometryType = result.type === 'circle' ? 'polygon' : result.type;
      const {payload} = result;
      //如果回传了笛卡尔3坐标
      if (Array.isArray(payload)) {
        geometry = payload.map(item => {
          const position = this.emgManager.Car3ToFv(item);
          return [position.x, position.y];
        }).reduce((a, b) => a.concat(b), []).join();
      } else if (payload === "global") {
        geometry = '';
        geometryType = '';
      } else {
        geometry = payload.geometry;
        geometryType = 'rect';
      }
      this.geometry = {
        geometry,
        geometryType
      };
    },
    onLayerChange(targetLayer) {
      const tile = this.m3ds.find(item => item.layerId === targetLayer.layerId);
      this.layerId = tile.layerId;
      //选择了图层之后，要去服务请求到该图层下的字段值
      const params = {
        gdbp: tile.gdbp,
        f: 'json',
        pageCount: Number(1),
        page: 0,
        layerId: tile.layerId,
        returnIdsOnly: true,
        returnGeometry: false,
        mapServerName: this.mapServerName,
        tile: tile
      };
      this.$emit('queryLayerInfo', params);
    },
    formatLayerInfo() {
      let fldName = [];
      let fieldArr = [];
      if (this.layerInfo?.features?.length) {
        this.layerInfo.fields.forEach((item) => {
          if (item.visible) {
            fieldArr.push({
              fldName: item.name,
              fldType: item.type,
              fldVal: this.layerInfo.features.map(feature => feature.attributes[item.name])
            });
            fldName.push(item.name);
          }
        });
      }
      this.fldName = fldName;
      this.fieldArr = fieldArr;
    },
    queryCondition() {
      if (!this.geometry) {
        this.$message.warn('请先绘制查询范围');
        return;
      }
      if (!this.layerId) {
        this.$message.warn('请先选择查询图层');
        return;
      }

      const standardParam = {
        cutLayerIndexs: this.layerIndexs,
        m3ds: this.m3ds,
        offset: this.offset,
        mapServerName: this.mapServerName
      };
      const params = {...standardParam, ...this.geometry, where: this.condition, layerIds: [this.layerId]};
      this.$emit('queryCondition', params);
    }
  }
};
</script>

<style scoped>

</style>
