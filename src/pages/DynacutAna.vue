<template>
  <municipal-dynacut title="开挖分析" @onCutFill="getCutInfo" @onDynacut="getDynacutInfo" :drawTools="['square', 'polygon']" :drawTextures="drawTextures" :layerIndexs="[0,1]"></municipal-dynacut>
</template>

<script>
export default {
  name: "dynacutAna",
  data(){
    return {
      drawTextures: [
        '/static/cesium/model/wall.jpg',
        '/static/cesium/model/wall1.jpg'
      ]
    }
  },
  methods:{
    getDynacutInfo(info){
      console.log(info);
    },
    getCutInfo(info){
      console.log(info);
    }
  }
};
</script>

<style scoped>

</style>
