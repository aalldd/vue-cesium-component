<template>
  <municipal-fix-roam :modelList="modelList" :fixedRoamData="fixedRoamData" title="场景漫游"></municipal-fix-roam>
</template>
<script>
const baseUrl='/static/cesium/model'
export default {
  name: "FixRoamAna",
  data() {
    return {
      modelList: [
        {
          value:`${baseUrl}/xiaofangche.gltf`,
          name:'消防车'
        },
        {
          value:`${baseUrl}/car.gltf`,
          name:'小车'
        },{
          value:`${baseUrl}/tejingche.gltf`,
          name:'特警车'
        },{
          value:`${baseUrl}/person.gltf`,
          name:'人'
        }
      ],
      fixedRoamData:[
        {
          title: '漫游方案名称',
          value: '漫游1',
          uniKey: 'title'
        }
      ]
    };
  }
};
</script>

<style scoped>

</style>
