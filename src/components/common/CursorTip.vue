<template>
  <div class="tipContainer" :style="{left:floatLeft,top:floatTop}">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "municipal-cursorTip",
  data() {
    return {
      floatLeft: 0,
      floatTop: 0
    };
  },
  props: {
    offset: {
      type: Object,
      default: () => {
        return {
          x: 12,
          y: 12
        };
      }
    }
  },
  mounted() {
    document.body.addEventListener('mousemove', this.mouseLisenter);
  },
  destroyed() {
    document.body.removeEventListener('mousemove', this.mouseLisenter);
  },
  methods: {
    mouseLisenter(e) {
      const {pageX, pageY} = e;
      const {x, y} = this.offset;
      this.floatTop = pageY + x + 'px';
      this.floatLeft = pageX + y + 'px';
    }
  }
};
</script>

<style scoped lang="scss">
.tipContainer {
  background: var(--background-base);
  border: 1px solid var(--border-color-base);
  color: var(--text-color);
  padding: 1px 3px;
  white-space: nowrap;
  overflow: hidden;
  font-size: 1em;
  border-radius: 6px;
  box-shadow: var(--box-shadow);
  position: fixed;
}
</style>
