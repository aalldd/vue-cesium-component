<template>
  <municipal-section @onClose="onClose"
                     v-if="panelVisible"></municipal-section>
</template>

<script>
import funMixin from "@/pages/funMixin";
export default {
  name: "SectionAna",
  mixins:[funMixin]
};
</script>

<style scoped>

</style>
