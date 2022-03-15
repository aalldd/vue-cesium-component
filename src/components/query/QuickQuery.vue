<template>
  <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <municipal-draw :vueKey="vueKey" enable-menu-control="func" :drawItems="drawItems" :infinite="false"
                      @drawcreate="handleDraw"></municipal-draw>
      <municipal-layer :checkedKeys="checkedKeys"
                       :customTreeData="false"
                       :layerGroup="layerGroup"
                       @check="check"
                       @load="onLayerLoad">
      </municipal-layer>
      <div style="display: flex;justify-content: flex-end">
        <a-button type="primary" style="margin-right: 10px" @click="query">查询</a-button>
      </div>
    </template>
  </municipal-panel>
</template>

<script>
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import panelOptions from "@/util/options/panelOptions";
import {treeUtil} from "@/util/helpers/helper";

export default {
  name: "municipal-quick-query",
  mixins: [loadingM3ds],
  data() {
    return {
      checkedKeys: [],
      layerData: [],
      layerIds: [],
      layerGroup: {
        '地下图层': {}
      },
      drawItems: ['global', 'preview', 'polygon', 'rect', 'circle']
    };
  },
  props: {
    ...panelOptions,
    title: {
      type: String,
      default: '快速查询'
    }
  },
  methods: {
    check(checkedKeys, layerIds) {
      this.layerIds = layerIds;
      this.checkedKeys = checkedKeys;
    },
    onLayerLoad(payload) {
      this.layerIds = treeUtil.filter(payload.layerDataCopy, (item) => {
        return item.layerId !== null;
      }).map(item => item.layerId);
      this.checkedKeys = payload.checkedKeysCopy;
      this.layerData = payload.layerDataCopy;
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
      const params = {
        geometry,
        geometryType,
        cutLayerIndexs: this.layerIndexs,
        m3ds: this.m3ds,
        offset: this.offset,
        mapServerName: this.mapServerName,
        layerIds: this.layerIds
      };
      this.params = params;
    },
    query() {
      this.$emit('query', this.params);
    }
  }
};
</script>

<style scoped>

</style>
