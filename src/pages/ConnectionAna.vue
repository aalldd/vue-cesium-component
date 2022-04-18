<template>
  <div>
    <municipal-connection @queryConnect="queryConnect"></municipal-connection>
    <municipal-result-common title="分析剖面图" :panelPosition="panelPosition"
                             @onClose="resultVisible=false"
                             :load="load"
                             v-if="resultVisible"
                             :tabs="tabs"
    ></municipal-result-common>
  </div>
</template>

<script>
import Store from '@/store/store';

export default {
  name: "ConnectionAna",
  data() {
    return {
      panelPosition: 'bottom',
      resultVisible: false,
      load: false,
      tabs: []
    };
  },
  methods: {
    async queryConnect(param) {
      const store = new Store;
      this.resultVisible = true;
      this.load = true;
      const {mapServerName, layerId0, layerId1, objectId0, objectId1} = param;
      const {tabs} = await store.connectionJudgeNew(mapServerName, {layerId0, layerId1, objectId0, objectId1});
      if (tabs?.length) {
        this.tabs = tabs;
      } else {
        this.$message.warn('未查询到联通分析数据');
      }
      this.load = false;
    }
  }
};
</script>

<style scoped>

</style>
