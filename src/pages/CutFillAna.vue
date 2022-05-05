<template>
  <municipal-cutfill :drawTextures="drawTextures" @onClose="onClose"
                     v-if="panelVisible">
    <municipal-cutfillresult :panelStyle="resultStyle"></municipal-cutfillresult>
  </municipal-cutfill>
</template>

<script>
import funMixin from "@/pages/funMixin";
export default {
  name: "CutFillAna",
  mixins:[funMixin],
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
        top: '4em'
      }
    };
  }
};
</script>

<style scoped>

</style>
