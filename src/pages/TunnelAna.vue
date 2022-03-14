<template>
  <div>
    <municipal-tunnel title="隧道分析" :layerIndexs="layerIndexs" @sendQueryParam="getQueryParam"></municipal-tunnel>
    <municipal-result-common title="隧道分析结果" :panelPosition="panelPosition"
                             @onClose="resultVisible=false"
                             v-if="resultVisible"
                             @onRowClick="onRowClick"
                             @onTabsChange="onTabsChange"
                             @onPageChange="onPageChange"
                             :exportFileName="exportFileName"
                             :load="load"
                             :tabs="tabs"></municipal-result-common>
  </div>
</template>

<script>
import Store from '@/store/store';

export default {
  name: "tunnelAna",
  inject: ['webGlobe'],
  data() {
    return {
      panelPosition: 'bottom',
      tabs: [],
      exportFileName: '全部数据',
      layerIndexs: [0, 1],
      resultVisible: false,
      title: '隧道分析',
      //用来区分管点和管点用来表示高程的字段名，每个项目可能都不一样，一般管点高程是地面高程，管段是起点地面高程
      defaultQueryParam: ['地面高程', '起点地面高程'],
      load: false,
    };
  },
  mounted() {
    this.store = new Store(this.webGlobe, window.m3ds);
  },
  methods: {
    async getQueryParam(param) {
      this.resultVisible = true;
      this.load = true;
      const {geometry, geometryType, range, cutLayerIndexs, m3ds, offset, mapServerName} = param;
      const store = new Store(this.webGlobe, m3ds);
      const where = {
        line: `${this.defaultQueryParam[1]}>${range[0]}and ${this.defaultQueryParam[1]}<${range[1]}`,
        point: `${this.defaultQueryParam[0]}>${range[0]}and ${this.defaultQueryParam[0]}<${range[1]}`
      };
      this.tabs = await store.queryLayers(geometry, geometryType, where, cutLayerIndexs, offset, mapServerName, this.title);
      this.load = false;
    },
    onRowClick(record) {
      console.log(record);
    },
    onTabsChange(record) {
      console.log(record);
    },
    onPageChange(pagination) {
      console.log(pagination);
    }
  }
};
</script>

<style scoped>

</style>
