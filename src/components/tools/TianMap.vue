<template>
  <div class="tool-item" @click="switchTianMap">
    <municipal-icon name="-map"></municipal-icon>
  </div>
</template>

<script>

export default {
  name: "municipal-tian",
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
      console.log(this.wmtsMap);
      this.tianMapVisible ? this.wmtsMap.show = false : this.wmtsMap.show = true;
      this.tianMapVisible = !this.tianMapVisible;
    }
  }
};
</script>

<style scoped lang="scss">

</style>
