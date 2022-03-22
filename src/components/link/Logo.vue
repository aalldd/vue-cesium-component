<template>
  <div style="background-color:rgba(0,0,0,0);position: absolute;left: 4em;top:4em;z-index: 5">
    <div role="button" style="font-size: 50px;color:#fff" v-if="mode==='2d'">
      <municipal-icon name="-2D"></municipal-icon>
    </div>
    <div role="button" style="font-size: 50px;color:#fff" v-else>
      <municipal-icon name="-3D"></municipal-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: "Logo",
  props: {
    mode: {
      type: String,
      require: true
    }
  }
};
</script>

<style scoped>

</style>
