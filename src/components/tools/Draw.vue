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
    <div v-if="enableMenuControl==='none'">
      <slot></slot>
    </div>
    <div v-if="enableMenuControl==='menu'">
      <div class="toolbar-wrapper" v-show="popoverVisible" @mouseenter="activeDraw" @mouseleave="deactiveDraw">
        <div class="tool-item" v-for="item in Object.keys(drawToolmap).filter(jitem=>this.drawItems.indexOf(jitem)>=0) "
             v-on:click="drawStart(item)" :key="item" :class="drawType===item?'activeItem':''">
          <municipal-icon :name="drawToolmap[item][0]"></municipal-icon>
        </div>
      </div>
      <div class="tool-item" @mouseenter="activeDraw" @mouseleave="deactiveDraw">
        <municipal-icon name="draw"></municipal-icon>
      </div>
    </div>
    <div v-if="enableMenuControl==='func'" class="tool-wrapper">
      <div class="tool" :class="drawType===item?'activeItem':''"
           :key="item" v-for="item in Object.keys(drawToolmap).filter(jitem=>this.drawItems.indexOf(jitem)>=0)"
           v-on:click="drawStart(item)">
        <municipal-icon :name="drawToolmap[item][0]"></municipal-icon>
      </div>
    </div>
  </div>
</template>

<script>
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

export default {
  name: "municipal-draw",
  mixins: [loadingM3ds],
  data() {
    return {
      activeTool: true,
      cursorVisible: false,
      popoverVisible: false,
      drawToolmap: {
        'preview': ['-vector-preview'],
        'global': ['-vector-global'],
        'point': ['-vector-point'],
        'line': ['-vector-polyline'],
        'polygon': ['-vector-polygon'],
        'rect': ['-vector-square'],
        'circle': ['-vector-circle'],
        'delete': ['shanchu'],
      },
      drawType: '',
      drawStyleCopy: {
        color: '#FF0000',
        opacity: 1,
        outlineWidth: 1,
        //边线颜色
        outlineColor: '#000000',
        //线宽
        width: 2,
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
        return ['preview', 'global', 'point', 'line', 'polygon', 'rect', 'circle', 'delete'];
      }
    },
    //是否采用mapgis-ceisum提供的原生样式
    enableControl: {
      type: Boolean,
      default: false
    },
    //绘制组件有三种呈现方式，自定义ui，用于右下角的展示，用于普通功能的展示
    enableMenuControl: {
      type: String,
      default: 'none',
      validator(value) {
        return ['none', 'menu', 'func'].indexOf(value) >= 0;
      }
    },
    drawStyle: {
      type: Object,
      default: () => {
        return {};
      }
    },
    clampToGround: {
      type: Boolean,
      default: true
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
  watch: {
    drawStyle: {
      handler: () => {
        this.drawStyleCopy = Object.assign(this.drawStyleCopy, this.drawStyle);
      }
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
      this.$emit('load', payload);
      window.drawOper = payload;
    },
    handleUnload(payload) {
      this.$emit('unload', payload);
    },
    drawStart(drawType) {
      this.drawType = drawType;
      switch (drawType) {
        //如果绘制范围为全球，我们返回一个字符用来标识是查全部的数据
        case 'global':
          this.drawcreate('global');
          return;
        //如果绘制范围为当前视角范围，我们返回四个坐标经纬度分别对应当前屏幕的四角的四个坐标点
        case 'preview':
          this.activePreview();
          return;
        case 'point':
          window.drawOper.enableDrawPoint();
          return;
        case 'line':
          window.drawOper.enableDrawLine();
          return;
        case 'polygon':
          window.drawOper.enableDrawPolygon();
          return;
        //  平台的矩形绘制工具只返回两个坐标，所以自己用cesium原生写了一个
        case 'rect':
          this.activeRect();
          return;
        case 'circle':
          //由于平台的圆形绘制工具只返回一个中心点坐标
          this.activeCircle();
          return;
        case 'delete':
          window.drawOper.removeEntities();
          this.drawElement && this.drawElement.stopDrawing();
          return;
        default:
          break;
          return;
      }
    },
    drawcreate(payload) {
      this.$emit('drawcreate', {
        payload,
        type: this.drawType
      });
    },
    activeRect() {
      const view = this.webGlobe;
      if (!this.drawElement) {
        this.drawElement = new Cesium.DrawElement(view.viewer);
        this.drawElement.setGroundPrimitiveType('TERRAIN');
      }
      if (!this.entityController) {
        this.entityController = new CesiumZondy.Manager.EntityController({
          viewer: view.viewer
        });
      }

      this.drawElement.startDrawingExtent({
        callback: (positions, e) => {
          this.drawElement.stopDrawing();

          //获取弧度制经纬度坐标
          let northwest = Cesium.Rectangle.northwest(positions, new Cesium.Cartographic());//西北角的坐标
          let northeast = Cesium.Rectangle.northeast(positions, new Cesium.Cartographic());//东北角的坐标
          let southeast = Cesium.Rectangle.southeast(positions, new Cesium.Cartographic());//东南角的坐标
          let southwest = Cesium.Rectangle.southwest(positions, new Cesium.Cartographic());//西南角的坐标

          //经纬度
          const cnw = [Cesium.Math.toDegrees(northwest.longitude), Cesium.Math.toDegrees(northwest.latitude), northwest.height];
          const cne = [Cesium.Math.toDegrees(northeast.longitude), Cesium.Math.toDegrees(northeast.latitude), northwest.height];
          const cse = [Cesium.Math.toDegrees(southeast.longitude), Cesium.Math.toDegrees(southeast.latitude), northwest.height];
          const csw = [Cesium.Math.toDegrees(southwest.longitude), Cesium.Math.toDegrees(southwest.latitude), northwest.height];
          const hierarchy = Cesium.Cartesian3.fromDegreesArrayHeights([...cnw, ...cne, ...cse, ...csw]);
          //构造区对象
          let polygon = {
            name: "矩形",
            polygon: {
              //坐标点
              hierarchy: hierarchy,
              //是否指定各点高度
              perPositionHeight: true,
              //颜色
              material: new Cesium.Color.fromCssColorString(this.drawStyleCopy.color).withAlpha(this.drawStyleCopy.opacity),
              //轮廓线是否显示
              outline: true,
              //轮廓线颜色
              outlineColor: new Cesium.Color.fromCssColorString(this.drawStyleCopy.outlineColor)
            }
          };
          //绘制图形通用方法：对接Cesium原生特性
          this.entityController.appendGraphics(polygon);
          this.drawcreate(hierarchy);
        }
      });
    },
    activePreview() {
      const previewRange = this.emgManager.getCurrentView();
      this.drawcreate(previewRange);
    }
  }
};
</script>

<style lang="scss">
@import "../var";

.draw-tool {
  position: relative;

  .activeItem {
    background-color: $active-background;
  }
}

.tool-wrapper {
  display: flex;
  align-items: center;

  .tool {
    width: 2em;
    height: 2em;
    background-color: transparent;
    color: var(--text-color);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background-color: var(--hover-color);
    }
  }
}

</style>
