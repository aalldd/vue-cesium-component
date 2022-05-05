<template>
  <div>
    <municipal-quick-query @query="query" :title="title" @onClose="onClose"
                           v-if="panelVisible"></municipal-quick-query>
    <municipal-result-common :title="title+'结果'"
                             v-show="resultVisible"
                             :panelPosition="panelPosition"
                             @onClose="onResClose"
                             :tabs="tabs"
                             :load="load"
                             :exportFileName="exportFileName"></municipal-result-common>
  </div>
</template>

<script>
import Store from "@/store/store";
import funMixin from "@/pages/funMixin";

export default {
  name: "QuickQueryAna",
  mixins:[funMixin],
  data() {
    return {
      title: '快速查询',
      load: false,
      panelPosition: 'bottom',
      exportFileName: '快速查询结果',
      tabs: [],
      resultVisible: false
    };
  },
  methods: {
    onResClose() {
      const store = new Store();
      store.cancelToken;
      this.resultVisible = false;
    },
    async query(info) {
      this.load = true;
      this.resultVisible = true;
      const {geometry, geometryType, cutLayerIndexs, m3ds, offset, mapServerName, layerIds} = info;
      const store = new Store(this.webGlobe, m3ds);
      this.tabs = await store.queryLayers(geometry, geometryType, null, cutLayerIndexs, offset, mapServerName, this.title, layerIds);
      if (this.tabs) {
        this.load = false;
      }
    }
  }
};
</script>

<style scoped>

</style>
