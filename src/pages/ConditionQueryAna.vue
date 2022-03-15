<template>
  <div>
    <municipal-condition-query :title="title" @queryLayerInfo="queryLayerInfo" @load="funcLoad">
      <!--      由于条件筛选组件需要频繁调用服务，所以需要直接写在外层-->
      <template v-slot:filter>
        <municipal-filter :fldName="fldName" :fieldArr="fieldArr" :fieldValue="fieldValue"
                          @onChangeFieldName="onChangeFieldName"></municipal-filter>
      </template>
    </municipal-condition-query>
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
      fieldValue: []
    };
  },
  methods: {
    funcLoad(vm) {
      console.log(vm);
      this.store = new Store();
      this.mapServerName = vm.mapServerName;
    },
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
    }
  }
};
</script>

<style scoped>

</style>
