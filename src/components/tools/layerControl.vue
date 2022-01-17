<template>
  <div>图层控制</div>
</template>

<script>
export default {
  name: "municipal-layerControl",
  inject: ["view"],
  mounted() {
    let {view} = this;
    console.log(view);
  }
};
</script>

<style scoped>

</style>
