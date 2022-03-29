<template>
  <div class="measure-tool">
    <div v-if="!enableControl">
      <slot></slot>
    </div>
    <div v-if="enableControl">
      <div class="tool-item" @mouseenter="activeMeasure" @mouseleave="deactiveMeasure">
        <municipal-icon name="ruler"></municipal-icon>
      </div>
      <div class="toolbar-wrapper" v-show="popoverVisible" @mouseenter="activeMeasure" @mouseleave="deactiveMeasure">
        <div class="tool-item"
             v-for="item in Object.keys(measureToolmap).filter(jitem=>this.measures.indexOf(jitem)>=0) "
             v-on:click="activeMeasureFunc(item)" :key="item">
          <municipal-icon :name="measureToolmap[item][0]"></municipal-icon>
        </div>
      </div>
      <municipal-cursor-tip v-if="cursorVisible" :container="container">
        <span>左键点击测量，右键结束</span>
      </municipal-cursor-tip>
    </div>
  </div>
</template>

<script>
import {measureTool} from './measureTools';

export default {
  name: 'municipal-measure',
  inject: ['webGlobe'],
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
      },
      container: document.getElementsByClassName('cesium-viewer'),
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
    },
    units: {
      type: Array,
      default: () => {
        return ['meters', 'kilometers'];
      }
    }
  },
  mounted() {
    this.funcMapType = {};
    //每一种量测工具对应一个函数
    this.measures.forEach(item => {
      this.funcMapType[item] = measureTool(this.webGlobe, this.units[0], item);
    });
    this.$emit('load', this, this.funcMapType);
  },
  methods: {
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
    clearTools(measureType) {
      this.cursorVisible = false;
      if (this.funcMapType && !_.isEmpty(this.funcMapType)) {
        for (let key in this.funcMapType) {
          if (this.funcMapType[key] && key !== measureType && this.funcMapType[key]._start) {
            this.funcMapType[key].stopTool();
            this.funcMapType[key]._start = false;
          }
        }
      }
    },
    activeMeasureFunc(measureType) {
      //this.clearTools(measureType);
      this.cursorVisible = true;
      // this.registerMouseEvent();
      if (measureType === 'delete') {
        this.clearTools();
      } else {
        //一般来说肯定是有的，但是加一个保险
        if (!this.funcMapType[measureType]) {
          this.funcMapType[measureType] = measureTool(webGlobe, this.units[0], measureType);
        }
        this.funcMapType[measureType].startTool();
        this.funcMapType[measureType]._start = true;
      }
    },
    registerMouseEvent() {
      if (!this.mouseEventManager) {
        //构造鼠标事件管理对象
        this.mouseEventManager = new CesiumZondy.Manager.MouseEventManager({
          viewer: this.webGlobe.viewer
        });
        //注册鼠标右键单击事件
        this.mouseEventManager.registerMouseEvent('RIGHT_CLICK', () => {
          this.cursorVisible = false;
        });
        // this.mouseEventManager.registerMouseEvent('LEFT_CLICK', () => {
        //   this.mouseEventManager.unRegisterMouseEvent('LEFT_CLICK');
        //   this.mouseEventManager.unRegisterMouseEvent('RIGHT_CLICK');
        //   this.cursorVisible = false;
        // });
      }
    },
    measureStart(measureType) {
      this.activeMeasureFunc(measureType);
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
