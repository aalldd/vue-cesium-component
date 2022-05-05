<template>
  <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <municipal-draw :vueKey="vueKey" enable-menu-control="func" :drawItems="drawItems" :infinite="false"
                      @drawcreate="handleDraw" style="margin-bottom:10px"></municipal-draw>
      <municipal-layer :customTreeData="false"
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
      layerIds: [],
      drawItems: ['global', 'preview', 'polygon', 'rect', 'circle'],
      params: {}
    };
  },
  props: {
    ...panelOptions,
    title: {
      type: String,
      default: '快速查询'
    },
    layerGroup:{
      type:Object,
      default:()=>{
        return {
          '地下管线': {}
        }
      }
    }
  },
  methods: {
    check(checkedKeys, layerIds) {
      this.params.layerIds = layerIds;
    },
    onLayerLoad(payload) {
      this.params.layerIds = treeUtil.filter(payload.layerDataCopy, (item) => {
        return item.layerId !== null;
      }).map(item => item.layerId);
    },
    handleDraw(result) {
      let geometry;
      //圆形类型的按照多边形传参
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
      this.params.geometry = geometry;
      this.params.geometryType = geometryType;
    },
    query() {
      if (!this.params.geometry) {
        this.$message.warn('请绘制查询区域！');
        return;
      }
      this.$emit('query', {...this.commonParam, ...this.params});
    }
  }
};
</script>

<style scoped>

</style>
