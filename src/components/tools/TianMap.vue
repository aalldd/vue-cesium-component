<template>
  <div class="tool-item" @click="switchTianMap">
    <mapgis-icon name="-map"></mapgis-icon>
  </div>
</template>

<script>
import Icon from '../common/Icon';

export default {
  name: "FullScreen",
  components: {
    'mapgis-icon': Icon
  },
  data() {
    return {
      tianMapVisible: true
    };
  },
  props: {
    wmtsMap: {
      type: Object
    }
  },
  methods: {
    switchTianMap() {
      if (!this.wmtsMap) {
        this.$message.warn('请传入天地图对象');
        return;
      }

      this.tianMapVisible ? this.wmtsMap.show = false : this.wmtsMap.show = true;
      this.tianMapVisible = !this.tianMapVisible;
    }
  }
};
</script>

<style scoped lang="scss">

</style>
