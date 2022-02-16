<template>
  <municipal-dynacut title="开挖分析" @load="onLoad" @onDynacut="getDynacutInfo" :drawTools="['square', 'polygon']" :drawTextures="drawTextures" :layerIndexs="[0,1]"></municipal-dynacut>
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
    onLoad(payload){
      console.log(payload);
    }
  }
};
</script>

<style scoped>

</style>
