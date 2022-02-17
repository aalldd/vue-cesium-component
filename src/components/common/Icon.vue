<template>
  <svg class="mapgis-icon" aria-hidden="true" @click="$emit('click')">
    <use :xlink:href="`#icon-${name}`"></use>
  </svg>
</template>
<script>
import './svg';

export default {
  name: 'municipal-icon',
  props: ['name']
};
</script>
<style lang="scss" scoped>
.mapgis-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
