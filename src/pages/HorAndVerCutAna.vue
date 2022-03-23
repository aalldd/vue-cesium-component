<template>
  <div>
    <municipal-horvercut @queryCross="queryCross" @queryVer="queryVer"></municipal-horvercut>
    <municipal-result-common title="分析剖面图" :panelPosition="panelPosition"
                             @onClose="resultVisible=false"
                             :load="load"
                             v-if="resultVisible"
                             :fileUrl="fileUrl"
                             :displayImg="true"
                             :tabs="tabs"></municipal-result-common>
  </div>
</template>

<script>
import Store from "@/store/store";

export default {
  name: "HorAndVerCutAna",
  data() {
    return {
      panelPosition: 'left',
      resultVisible: false,
      tabs: [],
      load: false,
      fileUrl: null,
    };
  },
  methods: {
    async queryCross(params) {
      const store = new Store();
      const {mapServerName, point0, point1} = params;
      this.resultVisible = true;
      this.load = true;
      const dataT = await store.getCrossSectionData(mapServerName, {point0, point1}, '横断面分析');
      if (!dataT.error) {
        this.tabs = dataT.featureSets;
        const url = store.toFileUrl(dataT.imgPath).src;
        this.fileUrl = url;
        this.load = false;
      } else {
        this.$message.warn(dataT.error.message);
        this.load = false;
      }
    },
    async queryVer(params) {
      const store = new Store();
      this.resultVisible = true;
      this.load = true;
      const {mapServerName, layerId0, layerId1, objectId0, objectId1} = params;
      const dataT = await store.connectionJudgeNew(mapServerName, {layerId0, layerId1, objectId0, objectId1});
      if (dataT.length > 0 && !dataT.error) {
        this.vertSurfaceAnly(dataT, mapServerName);
      } else {
        this.$message.info(dataT.error.message);
      }
    },
    async vertSurfaceAnly(data, mapServerName) {
      const store = new Store();
      let objectArr = [];
      const linef = data.find(d => {
        return d.geometryType === "civGeometryPolyline";
      });
      let oids = linef.features.map(f => {
        return f.attributes.OID;
      });
      objectArr.push({layerId: linef.layerId, objectIds: oids});
      const params = {
        objectInfo: JSON.stringify(objectArr)
      };
      const dataT = await store.getVerticalSectionData(mapServerName, params, '纵断面分析');
      if (!dataT.error) {
        this.tabs = dataT.featureSets;
        const url = store.toFileUrl(dataT.imgPath).src;
        this.fileUrl = url;
        this.load = false;
      } else {
        this.$message.warn(dataT.error.message);
        this.load = false;
      }
    }
  }
};
</script>

<style scoped>

</style>
