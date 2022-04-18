<template>
  <municipal-dynacut :title="title" @load="onLoad"
                     @onDynacut="getDynacutInfo"
                     :drawTools="['square', 'polygon']"
                     :drawTextures="drawTextures">
    <municipal-result-common :title="title+'结果'"
                             v-show="resultVisible"
                             :panelPosition="panelPosition"
                             @onClose="resultVisible=false"
                             :tabs="tabs"
                             :load="load"
                             :exportFileName="exportFileName"></municipal-result-common>
  </municipal-dynacut>
</template>

<script>
import Store from "@/store/store";
import {dataFormatter} from '@/store/helpers';

export default {
  name: "dynacutAna",
  data() {
    return {
      drawTextures: [
        '/static/cesium/model/wall.jpg',
        '/static/cesium/model/wall1.jpg'
      ],
      panelPosition: 'bottom',
      exportFileName: '开挖分析结果',
      tabs: [],
      currentPage: 1,
      pageSize: 10,
      //用来区分管点和管点用来表示高程的字段名，每个项目可能都不一样，一般管点高程是地面高程，管段是起点地面高程
      defaultQueryParam: ['地面高程', '起点地面高程'],
      load: false,
      title: '开挖分析',
      resultVisible: false
    };
  },
  methods: {
    async getDynacutInfo(info) {
      this.resultVisible = true;
      this.load = true;
      //开挖分析需要做分页所以要先去构造tabs
      const {geometry, geometryType, minHeight, cutLayerIndexs, m3ds, offset, mapServerName} = info;
      const store = new Store(this.webGlobe, m3ds);
      const where = {
        line: `${this.defaultQueryParam[1]} > ${minHeight}`,
        point: `${this.defaultQueryParam[0]} > ${minHeight}`
      };
      this.tabs = await store.queryLayers(geometry, geometryType, where, cutLayerIndexs, offset, mapServerName, this.title);
      if (this.tabs) {
        this.load = false;
      }
    },
    onLoad(payload) {
      console.log(payload);
    }
  }
};
</script>

<style scoped>

</style>
