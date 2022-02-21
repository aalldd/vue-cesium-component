<template>
  <div>
    <municipal-tunnel title="隧道分析"></municipal-tunnel>
    <municipal-result title="隧道分析结果" :panelPosition="panelPosition"></municipal-result>
  </div>
</template>

<script>
export default {
  name: "tunnelAna",
  data(){
    return {
      panelPosition:'left'
    }
  }
};
</script>

<style scoped>

</style>
