<template>
  <div class="tool-item" @click="switchFullScreen">
    <municipal-icon :name="expand"></municipal-icon>
  </div>
</template>

<script>

export default {
  name: "municipal-fullScreen",
  inject: ['webGlobe'],
  props: {
    initScreen: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      fullScreen: this.initScreen,
      prevHeight: ''
    };
  },
  mounted() {
    this.prevHeight = window.getComputedStyle(document.body).height;
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
      this.fullScreen = !this.fullScreen;
    },
    onfullScreen() {
      const element = document.documentElement;
      window.onresize=()=>{
        webGlobe.viewer.container.style.height = window.getComputedStyle(document.body).height;
      }
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
      window.onresize=()=>{
        webGlobe.viewer.container.style.height = window.getComputedStyle(document.body).height;
      }
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
