<template>
  <municipal-dynacut title="开挖分析" @load="onLoad"
                     @onDynacut="getDynacutInfo"
                     :drawTools="['square', 'polygon']"
                     :drawTextures="drawTextures"
                     :layerIndexs="[0,1]">
    <municipal-result-common title="开挖分析结果"
                             :panelPosition="panelPosition"
                             :tabs="tabs"
                             :exportFileName="exportFileName"></municipal-result-common>
  </municipal-dynacut>
</template>

<script>
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
      tabs: []
    };
  },
  methods: {
    getDynacutInfo(info) {
      console.log(info);
    },
    onLoad(payload) {
      console.log(payload);
    }
  }
};
</script>

<style scoped>

</style>
