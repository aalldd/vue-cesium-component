<template>
  <municipal-auto-roam
    @onClose="onClose"
    v-if="panelVisible"
    :modelList="modelList"
    title="自主漫游"
  ></municipal-auto-roam>
</template>
<script>
import funMixin from './funMixin'
const baseUrl = "/static/cesium/model";
export default {
  name: "AutoRoamAna",
  mixins:[funMixin],
  data() {
    return {
      modelList: [
        {
          value: `${baseUrl}/xiaofangche.gltf`,
          name: "消防车",
        },
        {
          value: `${baseUrl}/car.gltf`,
          name: "小车",
        },
        {
          value: `${baseUrl}/tejingche.gltf`,
          name: "特警车",
        },
        {
          value: `${baseUrl}/person.gltf`,
          name: "人",
        },
      ]
    };
  }
};
</script>

<style scoped>
</style>
