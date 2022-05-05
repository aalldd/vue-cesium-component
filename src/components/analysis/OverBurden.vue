<template>
  <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <a-row>
        <a-col :span="6">
          <municipal-draw :vueKey="vueKey" enable-menu-control="func" :drawItems="drawItems" @load="onDrawLoad"
                          @drawcreate="handleDraw">
          </municipal-draw>
        </a-col>
        <a-col :span="12">
          <a-tree-select
            v-model="value"
            style="width: 100%"
            :tree-data="layerDataCopy"
            :maxTagCount="6"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            tree-checkable
            :show-checked-strategy="SHOW_PARENT"
            search-placeholder="请选择覆土埋深规则"
          />
        </a-col>
        <a-col :span="6" style="display: flex;justify-content: center">
          <a-button type="primary" @click="query">查询</a-button>
        </a-col>
      </a-row>
    </template>
  </municipal-panel>
</template>

<script>
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import panelOptions from "@/util/options/panelOptions";
import {TreeSelect} from 'ant-design-vue';
import {treeUtil} from "@/util/helpers/helper";

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

export default {
  name: "municipal-overburden",
  mixins: [loadingM3ds],
  data() {
    return {
      drawItems: ['preview', 'polygon', 'rect'],
      layerDataCopy: [],
      value: [],
      SHOW_PARENT,
    };
  },
  props: {
    ...panelOptions,
    layerData: [Array],
    title: {
      type: String,
      default: '覆土埋深分析'
    },
    defaultCheckedKeys: {
      type: Array
    }
  },
  watch: {
    layerData: {
      handler() {
        if (this.layerData?.length) {
          this.layerDataCopy = this.layerData;
        }
      }
    },
    defaultCheckedKeys: {
      handler() {
        if (this.defaultCheckedKeys?.length) {
          this.value = this.defaultCheckedKeys;
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.params = {};
  },
  methods: {
    onDrawLoad(payload) {
      this.drawOper = payload;
    },
    handleDraw(result) {
      let geometry;
      //圆形类型的按照多边形传参
      let geometryType = result.type === 'circle' ? 'polygon' : result.type;
      const {payload} = result;
      //如果回传了笛卡尔3坐标
      if (Array.isArray(payload)) {
        const positionXYs = payload.map(item => {
          const position = this.emgManager.Car3ToFv(item);
          return [position.x, position.y];
        });
        const positions=positionXYs.reduce((a,b)=>a.concat(b),[])
        const xList = positionXYs.map(item => item[0]);
        const yList = positionXYs.map(item => item[1]);
        const xMax = _.max(xList);
        const xMin = _.min(xList);
        const yMin = _.min(yList);
        const yMax = _.max(yList);
        //对于矩形，我们传对象
        if(geometryType==='rect'){
          geometry = [xMin, yMin, xMax, yMax];
        }else{
          //对于多边形，我们传xy坐标的数组
          geometry=positions
        }
      } else if (payload === "global") {
        geometry = '';
        geometryType = '';
      } else {
        geometry = payload.geometry.split(',');
        geometryType = 'rect';
      }
      this.params.geometry = geometry;
      this.params.geometryType = geometryType;
    },
    query() {
      if (!this.value || this.value.length === 0) {
        this.$message.warn("请先选择查询规则！");
        return;
      }

      if (!this.params.geometry || !this.params.geometryType) {
        this.$message.warn("请先选择绘制查询范围！");
        return;
      }

      //组件内只回传字符串类型的坐标'x,y,x,y'，外面自己吧这些数据整理为{xmin,ymin}的类型
      const ruleName = [];
      treeUtil.forEach(this.layerDataCopy, (item, index) => {
        if (this.value.indexOf(item.key) >= 0) {
          ruleName.push(item.title);
        }
      });
      this.params.ruleName = ruleName;

      this.$emit('query', {...this.commonParam, ...this.params});
    }
  }
};
</script>

<style scoped>

</style>
