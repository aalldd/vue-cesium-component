<template>
  <div class="measure-tool">
    <mapgis-3d-measure
      v-show="popoverVisible"
      @load="handleLoad"
      @measured="measured"
      v-bind:vue-key="vueKey"
      v-bind:vue-index="vueIndex"
    >
      <!--      是否需要组件提供的控件，如果不需要就使用自己传入的children-->
      <div v-if="!enableControl">
        <slot></slot>
      </div>
    </mapgis-3d-measure>
    <div v-if="enableControl">
      <div class="tool-item" @mouseenter="activeMeasure" @mouseleave="deactiveMeasure">
        <mapgis-icon name="ruler"></mapgis-icon>
      </div>
      <div class="toolbar-wrapper" v-show="popoverVisible" @mouseenter="activeMeasure" @mouseleave="deactiveMeasure">
        <div class="tool-item"
             v-for="item in Object.keys(measureToolmap).filter(jitem=>this.measures.indexOf(jitem)>=0) "
             v-on:click="measureStart(item)" :key="item">
          <mapgis-icon :name="measureToolmap[item][0]"></mapgis-icon>
        </div>
      </div>
      <mapgis-cursorTip v-if="cursorVisible">
        <span>左键点击测量，右键结束</span>
      </mapgis-cursorTip>
    </div>
  </div>
</template>

<script>
import Icon from '../common/Icon';
import CursorTip from '../common/CursorTip';
export default {
  name: 'municipal-measure',
  components: {
    'mapgis-icon': Icon,
    'mapgis-cursorTip': CursorTip
  },
  data() {
    return {
      vueKeyOne: 'sceneOne',
      popoverVisible: false,
      cursorVisible: false,
      measureToolmap: {
        'length': ['-vector-polyline'],
        'area': ['-vector-polygon'],
        'triangle': ['sanjiaochi'],
        'slope': ['podufenxi'],
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
    measures: {
      type: Array,
      default: () => {
        return ['length', 'area', 'triangle', 'slope', 'delete'];
      }
    },
    measureResult: {
      type: Function
    },
    measureLoad: {
      type: Function
    },
    enableControl: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    handleLoad(measure) {
      this.measure = measure;
      this.$emit('measureLoad', measure);
    },
    activeMeasure() {
      this.popoverVisible = true;
    },
    deactiveMeasure() {
      this.popoverVisible = false;
    },
    measured(result) {
      //取得测量结果
      this.cursorVisible = false;
      this.$emit('measureResult', result);
    },
    measureStart(measureType) {
      if (this.measure) {
        switch (measureType) {
          case 'length':
            this.measure.enableMeasureLength();
            this.cursorVisible = true;
            return;
          case 'area':
            this.measure.enableMeasureArea();
            this.cursorVisible = true;
            return;
          case 'triangle':
            this.measure.enableMeasureTriangle();
            this.cursorVisible = true;
            return;
          case 'slope':
            this.measure.enableMeasureSlope();
            this.cursorVisible = true;
            return;
          case 'delete':
            this.measure.deleteMeasure();
            this.cursorVisible = false;
            return;
          default:
            break;
            return;
        }
      }
    }
  }
};
</script>

<style lang="scss">
.measure-tool {
  position: relative;

  .mapgis-3d-measure {
    display: none;
  }
}

</style>
