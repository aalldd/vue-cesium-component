<template>
  <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">

  </municipal-panel>
  >
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

export default {
  name: "CutFill",
  mixins: [loadingM3ds],
  props: {
    ...panelOptions
  }
};
</script>

<style scoped>

</style>
