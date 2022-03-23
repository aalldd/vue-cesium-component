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
          <a-button>查询</a-button>
        </a-col>
      </a-row>
    </template>
  </municipal-panel>
</template>

<script>
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import panelOptions from "@/util/options/panelOptions";
import {TreeSelect} from 'ant-design-vue';

const SHOW_PARENT = TreeSelect.SHOW_PARENT;

export default {
  name: "municipal-overburden",
  mixins: [loadingM3ds],
  data() {
    return {
      drawItems: ['preview', 'polygon', 'rect'],
      layerDataCopy: [],
      value: [],
      SHOW_PARENT
    };
  },
  props: {
    ...panelOptions,
    layerData: [Array],
    title: {
      type: String,
      default: '覆土埋深分析'
    }
  },
  watch: {
    layerData: {
      handler() {
        if (this.layerData?.length) {
          this.layerDataCopy = this.layerData;
        }
      }
    }
  },
  methods: {
    onDrawLoad(payload) {
      this.drawOper = payload;
    },
    handleDraw(drawRes) {
      const {payload} = drawRes;
      this.drawRange = [...payload, payload[0]];
    }
  }
};
</script>

<style scoped>

</style>
