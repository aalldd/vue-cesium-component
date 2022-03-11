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
      const store = new Store();
      //所有地下图层
      const layers = m3ds.filter(item => !cutLayerIndexs.includes(item.layerIndex));
      const promises = layers.map(t => {
        if (t.gdbp) {
          let params = {
            gdbp: t.gdbp,
            f: 'json',
            geometry: geometry,
            geometryType: geometryType,
            layerId: t.layerId,
            returnIdsOnly: true,
            returnGeometry: false
          };
          if (t.civFeatureType.endsWith('Line')) {
            params.where = `${this.defaultQueryParam[1]} > ${minHeight}`;
          } else {
            params.where = `${this.defaultQueryParam[0]} > ${minHeight}`;
          }
          return store.query3d(params, t.url, offset, mapServerName);
        }
      });
      //第一次查询，吧所有符合条件的图层数据都查出来，合并成tabs，之后如果切tabs，或者切page，就只调当前tabs，当前page下的数据和当前数据合并
      let data = await Promise.all(promises);
      data = data.filter((d, ind) => d?.features?.length);
      this.tabs = dataFormatter(data, this.title);
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
