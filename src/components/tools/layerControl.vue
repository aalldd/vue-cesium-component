<template>
  <div>图层控制</div>
</template>

<script>
export default {
  name: "layerControl",
  inject: ["view"],
  mounted() {
    let {view} = this;
    console.log(view);
  }
};
</script>

<style scoped>

</style>
