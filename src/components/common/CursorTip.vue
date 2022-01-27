<template>
  <div>
    <div class="tipContainer" :style="{left:floatLeft,top:floatTop}">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "municipal-cursor-tip",
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
    this.container = document.body;
    this.tipContainer = document.querySelector('.tipContainer');
    this.container.appendChild(this.tipContainer);
    document.body.addEventListener('mousemove', this.mouseLisenter);
  },
  destroyed() {
    this.container.removeChild(this.tipContainer);
    document.body.removeEventListener('mousemove', this.mouseLisenter);
  },
  methods: {
    mouseLisenter(e) {
      const {pageX, pageY} = e;
      const {x, y} = this.offset;

      this.floatTop = pageY + x + 'px';
      this.floatLeft = pageX + y + 'px';
      console.log(this.floatTop);
      console.log(this.floatLeft);
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
