<template>
  <municipal-dynacut :drawTools="['square', 'polygon']" :drawTextures="drawTextures"></municipal-dynacut>
</template>

<script>
export default {
  name: "dynacutAna",
  data(){
    return {
      drawTextures: [
        '/static/cesium/model/wall.jpg',
        '/static/cesium/model/wall1.jpg',
        '/static/cesium/model/wall2.jpg',
        '/static/cesium/model/wall3.jpg'
      ]
    }
  }
};
</script>

<style scoped>

</style>
