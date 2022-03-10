<template>
  <municipal-cutfill :drawTextures="drawTextures">
    <municipal-cutfillresult :panelStyle="resultStyle"></municipal-cutfillresult>
  </municipal-cutfill>
</template>

<script>
export default {
  name: "CutFillAna",
  data() {
    return {
      drawTextures: [
        '/static/cesium/model/wall.jpg',
        '/static/cesium/model/wall1.jpg'
      ],
      resultStyle: {
        width: '400px',
        position: 'absolute',
        left: '2em',
        top: '2em'
      }
    };
  }
};
</script>

<style scoped>

</style>
