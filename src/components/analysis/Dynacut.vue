<template>
  <municipal-panel title="开挖分析">
    <template v-slot:content>
      <mapgis-3d-excavate
        :vue-index="vueIndex"
        :excaveteStyle="excaveteStyle"
      ></mapgis-3d-excavate>
    </template>
  </municipal-panel>
</template>

<script>
import VueOptions from '@/util/vueOptions'
export default {
  name: "Dynacut",
  props:{
    ...VueOptions,
  },
  data(){
    return {
      excaveteStyle: {
        material: "#DB2B5A",
        edgeColor: "#DB2B5A",
        edgeWidth: 5
      }
    }
  }
};
</script>

<style scoped>

</style>
