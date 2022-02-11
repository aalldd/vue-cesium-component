<template>
  <div class="draw-tool">
    <mapgis-3d-draw
      v-bind:vue-key="vueKey"
      v-bind:vue-index="vueIndex"
      :enableControl="enableControl"
      :drawStyle="drawStyle"
      :clampToGround="clampToGround"
      @load="handleLoad"
      @unload="handleUnload"
      @drawcreate="drawcreate"
      :position="position"
      :infinite="infinite">

    </mapgis-3d-draw>
    <div v-if="!enableMenuControl">
      <slot></slot>
    </div>
    <div v-if="enableMenuControl">
      <div class="toolbar-wrapper" v-show="popoverVisible" @mouseenter="activeDraw" @mouseleave="deactiveDraw">
        <div class="tool-item" v-for="item in Object.keys(drawToolmap).filter(jitem=>this.drawItems.indexOf(jitem)>=0) "
             v-on:click="drawStart(item)" :key="item">
          <mapgis-icon :name="drawToolmap[item][0]"></mapgis-icon>
        </div>
      </div>
      <div class="tool-item" @mouseenter="activeDraw" @mouseleave="deactiveDraw">
        <mapgis-icon name="draw"></mapgis-icon>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from '../common/Icon';

export default {
  name: "municipal-draw",
  inject: ['Cesium', 'CesiumZondy', 'webGlobe'],
  components: {
    'mapgis-icon': Icon,
  },
  data() {
    return {
      activeTool: true,
      cursorVisible: false,
      popoverVisible: false,
      drawToolmap: {
        'point': ['-vector-point'],
        'line': ['-vector-polyline'],
        'polygon': ['-vector-polygon'],
        'rect': ['-vector-square'],
        'circle': ['-vector-circle'],
        'delete': ['shanchu'],
      }
    };
  },
  props: {
    vueKey: {
      type: String,
      default: 'default'
    },
    vueIndex: {
      type: Number
    },
    drawItems: {
      type: Array,
      default: () => {
        return ['point', 'line', 'polygon', 'rect', 'circle', 'delete'];
      }
    },
    //是否采用mapgis-ceisum提供的原生样式
    enableControl: {
      type: Boolean,
      default: false
    },
    enableMenuControl: {
      type: Boolean,
      default: false
    },
    drawStyle: {
      type: Object,
      default: () => {
        return {
          color: '#FF8C00',
          opacity: 0.6
        };
      }
    },
    clampToGround: {
      type: Boolean,
      default: false
    },
    position: {
      type: String,
      default: 'top-right'
    },
    infinite: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    activeDraw() {
      this.popoverVisible = true;
    },
    deactiveDraw() {
      this.popoverVisible = false;
    },
    handleLoad(payload) {
      this.drawOper = payload;
      this.$emit('load', payload);
    },
    handleUnload(payload) {
      this.$emit('unload', payload);
    },
    drawStart(drawType) {
      switch (drawType) {
        case 'point':
          this.drawOper.enableDrawPoint();
          return;
        case 'line':
          this.drawOper.enableDrawLine();
          return;
        case 'polygon':
          this.drawOper.enableDrawPolygon();
          return;
        case 'rect':
          this.drawOper.enableDrawRectangle();
          return;
        case 'circle':
          this.drawOper.enableDrawCircle();
          return;
        case 'delete':
          this.drawOper.removeEntities();
          return;
        default:
          break;
          return;
      }
    },
    drawcreate(payload) {
      this.$emit('drawcreate', payload);
    }
  }
};
</script>

<style lang="scss">
.draw-tool {
  position: relative;
}
</style>
