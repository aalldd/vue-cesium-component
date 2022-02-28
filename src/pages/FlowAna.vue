<template>
  <municipal-flow @query="query"
                  :layerGroup="layerGroup"
                  :flowData="flowData"
                  :cacheData="cacheData"
                  @load="onLoad">
  </municipal-flow>
</template>

<script>
import Store from '@/store/store';

export default {
  name: "FlowAna",
  data() {
    return {
      //流向管网信息
      layerGroup: {
        '给水管网': {
          subLayers: ['给水_管段'],
          url: '/static/cesium/Assets/Images/arrow.png'
        }
      },
      //流向数据信息
      flowData: [],
      //是否需要浏览器缓存流向数据信息
      cacheData: true,
      outFields: '流向,起点地面高程,终点地面高程,管长,管径'
    };
  },
  methods: {
    async query(params) {
      const store = new Store();
      const data = await store.queryFlow(params.mapServerName, params.layerIds, {outFields: this.outFields});
      this.flowData = data.map(item => item.data);
    },
    onLoad(payload) {
      this.flowVm = payload;
    }
  }
};
</script>

<style scoped>

</style>
