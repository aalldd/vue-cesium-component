<template>
  <div class="tool-item" @click="switchFullScreen">
    <mapgis-icon :name="expand"></mapgis-icon>
  </div>
</template>

<script>
import Icon from '../common/Icon';

export default {
  name: "FullScreen",
  components: {
    'mapgis-icon': Icon
  },
  props: {
    initScreen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fullScreen: this.initScreen
    };
  },
  computed: {
    expand() {
      return !this.fullScreen ? '-fullscreen-shrink' : '-fullscreen-expand';
    }
  },
  watch: {
    fullScreen: {
      handler() {
        this.$emit('getScreenState', this.fullScreen);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    switchFullScreen() {
      !this.fullScreen ? this.onfullScreen() : this.exitfullScreen();
      this.fullScreen=!this.fullScreen
    },
    onfullScreen() {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      }
    },
    exitfullScreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }
};
</script>

<style scoped lang="scss">

</style>
