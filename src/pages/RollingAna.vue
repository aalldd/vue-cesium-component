<template>
  <municipal-roll :offset="offset" @onClose="onClose"
                  v-if="panelVisible">
  </municipal-roll>
</template>

<script>
import funMixin from "@/pages/funMixin";
export default {
  name: "RollingAna",
  mixins:[funMixin],
  data() {
    return {
      offset: [0, 0]
    };
  }
};
</script>

<style scoped>

</style>
