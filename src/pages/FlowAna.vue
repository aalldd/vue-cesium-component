<template>
  <municipal-flow @checked="checked" :layerGroup="layerGroup" :flowData="flowData" :cacheData="cacheData">
    <a-button type="info" @click="query">请求数据</a-button>
    <a-button type="primary">开始分析</a-button>
  </municipal-flow>
</template>

<script>
import Store from '@/store/store';

export default {
  name: "FlowAna",
  data(){
    return {
      //流向管网信息
      layerGroup: {
        '给水管网': {
          layerIndexs:[52, 53, 54],
          textrue:''
        }
      },
      //流向数据信息
      flowData:{},
      //是否需要浏览器缓存流向数据信息
      cacheData:true
    }
  },
  methods: {
    async checked(params) {
      this.queryParam = params;
    },
    async query() {
      const store = new Store();
      const {mapServerName, layerIds, outFields} = this.queryParam;
      const {data} = await store.queryFlow(mapServerName, layerIds, {outFields});
      this.flowData=data
    }
  }
};
</script>

<style scoped>

</style>
