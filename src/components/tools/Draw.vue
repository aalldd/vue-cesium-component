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
             v-on:click="drawStart(item)" :key="item" :class="drawType===item?'activeItem':''">
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
        return {};
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
  watch: {
    drawStyle: {
      handler: () => {
        const commonStyle = {
          color: '#FF8C00',
          opacity: 0.6
        };
        this.drawStyleCopy = Object.assign(commonStyle, this.drawStyle);
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
      this.drawOper = payload;
      this.$emit('load', payload);
    },
    handleUnload(payload) {
      this.$emit('unload', payload);
    },
    drawStart(drawType) {
      this.drawType = drawType;
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
        //  平台的矩形绘制工具只返回两个坐标，所以自己用cesium原生写了一个
        case 'rect':
          this.activeRect();
          return;
        case 'circle':
          this.drawOper.enableDrawCircle();
          return;
        case 'delete':
          this.drawOper.removeEntities();
          this.drawElement && this.drawElement.stopDrawing();
          return;
        default:
          break;
          return;
      }
    },
    drawcreate(payload) {
      console.log(payload);
      this.$emit('drawcreate', payload);
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
    }
  }
};
</script>

<style lang="scss">
@import "../var";

.draw-tool {
  position: relative;

  .toolbar-wrapper {
    .activeItem {
      background-color: $active-background;
    }
  }
}

</style>
