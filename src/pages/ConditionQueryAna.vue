<template>
  <div>
    <municipal-condition-query :title="title"
                               @reset="reset"
                               @queryLayerInfo="queryLayerInfo"
                               @queryCondition="queryCondition"
                               @load="funcLoad">
      <!--      由于条件筛选组件需要频繁调用服务，所以需要直接写在外层-->
      <template v-slot:filter>
        <municipal-filter :fldName="fldName" :fieldArr="fieldArr" :fieldValue="fieldValue" ref="filter"
                          @onChangeFieldName="onChangeFieldName"></municipal-filter>
      </template>
    </municipal-condition-query>
    <municipal-result-common :title="title+'结果'"
                             v-show="resultVisible"
                             :panelPosition="panelPosition"
                             @onClose="onClose"
                             :tabs="tabs"
                             :load="load"
                             :exportFileName="exportFileName"></municipal-result-common>
  </div>
</template>

<script>
import Store from "@/store/store";

export default {
  name: "ConditionQueryAna",
  data() {
    return {
      title: '条件查询',
      fldName: [],
      fieldArr: [],
      fieldValue: [],
      resultVisible: false,
      panelPosition: 'bottom',
      tabs: [],
      load: false,
      exportFileName: '条件查询结果'
    };
  },
  methods: {
    funcLoad(vm) {
      this.store = new Store();
      this.mapServerName = vm.mapServerName;
    },
    reset() {
      this.$refs.filter.reset();
    },
    onClose() {
      this.store && this.store.cancelToken;
      this.resultVisible = false;
    },
    //每次选择图层之后的回调，用于拿filter组件所需的数据
    async queryLayerInfo(param) {
      const {mapServerName, tile, ...rest} = param;
      this.layerId = param.layerId;
      const data = await this.store.query3d(rest, tile.url, [], mapServerName);
      this.formatLayerInfo(data);
    },
    formatLayerInfo(data) {
      let fldName = [];
      let fieldArr = [];
      if (data?.features?.length) {
        data.fields.forEach((item) => {
          if (item.visible) {
            fieldArr.push({
              fldName: item.name,
              fldType: item.type,
              fldVal: data.features.map(feature => feature.attributes[item.name])
            });
            fldName.push(item.name);
          }
        });
      }
      this.fldName = fldName;
      this.fieldArr = fieldArr;
    },
    async onChangeFieldName(fieldName) {
      if (!this.layerId) {
        this.$message.warn('请先选择图层');
        return;
      }
      const {fieldValues} = await this.store.queryFieldValues(this.mapServerName, this.layerId, fieldName);
      this.fieldValue = fieldValues;
    },
    async queryCondition(params) {
      this.load = true;
      this.resultVisible = true;
      const {geometry, geometryType, cutLayerIndexs, m3ds, offset, mapServerName, layerIds, where} = params;
      const store = new Store(this.webGlobe, m3ds);
      this.tabs = await store.queryLayers(geometry, geometryType, where, cutLayerIndexs, offset, mapServerName, this.title, layerIds);
      if (this.tabs) {
        this.load = false;
      }
    }
  }
};
</script>

<style scoped>

</style>
