<template>
  <div class="tool-item" @click="goHome">
    <mapgis-icon name="home"></mapgis-icon>
  </div>
</template>

<script>
import Icon from '../common/Icon';

export default {
  name: "municipal-home",
  inject: ['Cesium', 'webGlobe'],
  components: {
    'mapgis-icon': Icon
  },
  props: {
    cameraView: {
      type: Object
    }
  },
  methods: {
    goHome() {
      const Cesium = this.Cesium;
      let {destination, orientation} = this.cameraView;
      let {x, y, z} = destination;
      let {heading, pitch} = orientation;
      let center,
        range = 1.0;

      if (x > 180 || x < -180 || y > 180 || y < -180) {
        center = new Cesium.Cartesian3(x, y, z);
      } else {
        center = new Cesium.Cartesian3.fromDegrees(x, y, z);
      }

      this.webGlobe.viewer.camera.flyToEx({
        target: center,
        offset: new Cesium.HeadingPitchRange(heading, pitch, range)
      });
    }
  }
};
</script>

<style scoped lang="scss">

</style>
