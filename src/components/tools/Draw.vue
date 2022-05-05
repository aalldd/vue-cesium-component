<template>
  <div class="draw-tool">
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
      <div v-for="item in Object.keys(drawToolmap).filter(jitem=>this.drawItems.indexOf(jitem)>=0)"
           class="tool" :class="drawType===item?'activeItem':''"
           :key="item"
           v-on:click="drawStart(item)">
        <municipal-icon :name="drawToolmap[item][0]"></municipal-icon>
      </div>
    </div>
  </div>
</template>

<script>
import {ScreenSpaceEventType} from "@/components/common/ScreenSpaceEventType";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import {buffer} from '@turf/turf';

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
        opacity: 0.4,
        outlineWidth: 1,
        //边线颜色
        outlineColor: '#000000',
        //线宽
        width: 2,
        drawHeight: 40
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
        return ['global', 'point', 'line', 'polygon', 'rect', 'circle', 'delete'];
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
      default: false
    },
    position: {
      type: String,
      default: 'top-right'
    },
    infinite: {
      type: Boolean,
      default: false
    },
    screenSpaceEventType: {
      type: Array,
      default: () => [
        ScreenSpaceEventType.WHEEL,
        ScreenSpaceEventType.MOUSE_MOVE,
        ScreenSpaceEventType.LEFT_UP,
        ScreenSpaceEventType.LEFT_DOWN,
        ScreenSpaceEventType.RIGHT_UP,
        ScreenSpaceEventType.RIGHT_DOWN
      ]
    }
  },
  watch: {
    drawStyle: {
      handler() {
        this.drawStyleCopy = Object.assign(this.drawStyleCopy, this.drawStyle);
      },
      immediate: true
    },
    //暂时不要默认选中的项
    // drawItems: {
    //   handler() {
    //     if (this.drawItems.length > 0) {
    //       this.drawType = this.drawItems[0];
    //     }
    //   },
    //   immediate: true
    // }
  },
  destroyed() {
    this.stopDrawing();
    this.removeDrawEntities();
  },
  mounted() {
    if (!this.drawElement) {
      this.drawElement = new Cesium.DrawElement(this.view.viewer);
    }
    if (!window.drawEntities) {
      window.drawEntities = [];
    }
    //针对范围为当前视角范围的情况，需要动态的去获取
    if (this.drawItems.indexOf('preview') >= 0) {
      this.addHandler();
    }
    // //构造鼠标事件管理对象
    // this.mouseEventManager = new CesiumZondy.Manager.MouseEventManager({
    //   viewer: this.view.viewer
    // });
    // //注册鼠标右键单击事件
    // this.mouseEventManager.registerMouseEvent('RIGHT_CLICK', () => {
    //   this.mouseEventManager.unRegisterMouseEvent('RIGHT_CLICK');
    //   this.removeDrawEntities();
    //   this.drawElement.stopDrawing();
    // });
  },
  methods: {
    addHandler() {
      this.handler = new Cesium.ScreenSpaceEventHandler(this.view.viewer.scene.canvas);
      const getCurrentView = _.throttle(() => {
        if (this.drawType === 'preview') {
          const previewRange = this.emgManager.getCurrentView();
          this.drawcreate(previewRange);
        }
      }, 500);
      this.screenSpaceEventType.forEach(item => {
        this.handler.setInputAction(() => {
          getCurrentView();
        }, Cesium.ScreenSpaceEventType[item.type]);
      });
    },
    activeDraw() {
      this.popoverVisible = true;
    },
    deactiveDraw() {
      this.popoverVisible = false;
    },
    drawStart(drawType) {
      if (!this.infinite) {
        this.removeDrawEntities();
        this.stopDrawing();
      }
      const {outlineColor, color, drawHeight} = this.startDrawing();
      this.drawType = drawType;
      const self = this;
      switch (this.drawType) {
        //如果绘制范围为全球，我们返回一个字符用来标识是查全部的数据
        case 'global':
          self.drawcreate('global');
          return;
        //如果绘制范围为当前视角范围，我们返回四个坐标经纬度分别对应当前屏幕的四角的四个坐标点
        case 'preview':
          self.activePreview();
          return;
        case 'point':
          self.activePoint(outlineColor, color, drawHeight);
          return;
        case 'line':
          self.activeLine(outlineColor, color, drawHeight);
          return;
        case 'polygon':
          self.activePolygon(outlineColor, color, drawHeight);
          return;
        //  平台的矩形绘制工具只返回两个坐标，所以自己用cesium原生写了一个
        case 'rect':
          self.activeRect(outlineColor, color, drawHeight);
          return;
        case 'circle':
          //由于平台的圆形绘制工具只返回一个中心点坐标
          self.activeCircle(outlineColor, color, drawHeight);
          return;
        case 'delete':
          this.removeDrawEntities();
          this.stopDrawing();
          return;
        default:
          break;
      }
    },
    drawcreate(payload) {
      console.log(payload);
      this.$emit('drawcreate', {
        payload,
        type: this.drawType
      });
    },
    startDrawing() {
      if (this.clampToGround) {
        this.drawElement.setGroundPrimitiveType('BOTH');
      } else {
        this.drawElement.setGroundPrimitiveType('NONE');
      }
      const outlineColor = new Cesium.Color.fromCssColorString(this.drawStyleCopy.outlineColor).withAlpha(this.drawStyleCopy.opacity);
      const color = new Cesium.Color.fromCssColorString(this.drawStyleCopy.color).withAlpha(this.drawStyleCopy.opacity);
      const drawHeight = this.drawStyleCopy.drawHeight;
      return {outlineColor, color, drawHeight};
    },
    activePoint(outlineColor, color, drawHeight) {
      this.drawElement.startDrawingMarker({
        addDefaultMark: false,
        color: color,
        callback: (position) => {
          //拿经纬度坐标
          let cartographic = Cesium.Cartographic.fromCartesian(position);
          let lng = Cesium.Math.toDegrees(cartographic.longitude);
          let lat = Cesium.Math.toDegrees(cartographic.latitude);
          let height = this.clampToGround ? cartographic.height : drawHeight;
          //添加点：经度、纬度、高程、名称、像素大小、颜色、外边线颜色、边线宽度
          let drawEntity = this.entityController.appendPoint(lng, lat, height, '点', 10,
            color,
            outlineColor,
            this.drawStyleCopy.outlineWidth);
          window.drawEntities.push(drawEntity);
          if (!this.infinite) {
            this.drawElement.stopDrawing();
          }
          this.drawcreate(position);
        }
      });
    },
    activeLine(outlineColor, color, drawHeight) {
      this.drawElement.startDrawingPolyline({
        color,
        callback: (positions) => {
          let pointArr = [];
          let degreeArr = [];
          positions.forEach(position => {
            const {lng, lat, height} = this.emgManager.changeToLatAndTerrainHeight(position);
            const modelHeight = this.clampToGround ? height : drawHeight;
            this.clampToGround ? pointArr.push(lng, lat) : pointArr.push(lng, lat, modelHeight);
            degreeArr.push([lng, lat, modelHeight]);
          });
          let drawEntity = this.entityController.appendLine("polyline", pointArr, this.drawStyleCopy.width, color, !this.clampToGround, this.clampToGround);
          window.drawEntities.push(drawEntity);
          if (!this.infinite) {
            this.drawElement.stopDrawing();
          }
          this.drawcreate(positions);
        }
      });
    },
    activePolygon(outlineColor, color, drawHeight) {
      this.drawElement.startDrawingPolygon({
        callback: (positions) => {
          let pointArr = [];
          let polygonArr = [];
          positions.forEach(position => {
            let cartographic = Cesium.Cartographic.fromCartesian(position);
            let lng = Cesium.Math.toDegrees(cartographic.longitude);
            let lat = Cesium.Math.toDegrees(cartographic.latitude);
            let height = cartographic.height;
            const pointM = this.emgManager.positionTransfer({lng, lat, height});
            pointArr.push(lng, lat, drawHeight);
            polygonArr.push(pointM[0], pointM[1]);
          });
          //构造区对象
          const polygon = new Cesium.DrawElement.PolygonPrimitive({
            positions: positions,
            material: Cesium.Material.fromType('Color', {
              color: color
            }),
          });
          //绘制图形通用方法：对接Cesium原生特性
          const polygonEntity = this.view.viewer.scene.primitives.add(polygon);
          if (!this.infinite) {
            this.drawElement.stopDrawing();
          }
          polygonEntity.primitive = true;
          window.drawEntities.push(polygonEntity);
          this.drawcreate(positions);
        }
      });
    },
    activeRect(outlineColor, color, drawHeight) {
      this.drawElement.startDrawingExtent({
        callback: (positions, e) => {
          this.drawElement.stopDrawing();

          //获取弧度制经纬度坐标
          let northwest = Cesium.Rectangle.northwest(positions, new Cesium.Cartographic());//西北角的坐标
          let northeast = Cesium.Rectangle.northeast(positions, new Cesium.Cartographic());//东北角的坐标
          let southeast = Cesium.Rectangle.southeast(positions, new Cesium.Cartographic());//东南角的坐标
          let southwest = Cesium.Rectangle.southwest(positions, new Cesium.Cartographic());//西南角的坐标

          //经纬度
          const cnw = [Cesium.Math.toDegrees(northwest.longitude), Cesium.Math.toDegrees(northwest.latitude), drawHeight || northwest.height];
          const cne = [Cesium.Math.toDegrees(northeast.longitude), Cesium.Math.toDegrees(northeast.latitude), drawHeight || northwest.height];
          const cse = [Cesium.Math.toDegrees(southeast.longitude), Cesium.Math.toDegrees(southeast.latitude), drawHeight || northwest.height];
          const csw = [Cesium.Math.toDegrees(southwest.longitude), Cesium.Math.toDegrees(southwest.latitude), drawHeight || northwest.height];
          const hierarchy = Cesium.Cartesian3.fromDegreesArrayHeights([...cnw, ...cne, ...cse, ...csw]);
          let rectangle = new Cesium.DrawElement.ExtentPrimitive({
            extent: positions,
            material: Cesium.Material.fromType('Color', {
              color: color
            }),
          });
          let drawEntity = this.view.viewer.scene.primitives.add(rectangle);
          drawEntity.primitive = true;
          window.drawEntities.push(drawEntity);
          if (!this.infinite) {
            this.drawElement.stopDrawing();
          }
          this.drawcreate(hierarchy);
        }
      });
    },
    activeCircle(outlineColor, color, drawHeight) {
      this.drawElement.startDrawingCircle({
        callback: (centerPoint, radius) => {
          const centerCartographic = Cesium.Cartographic.fromCartesian(centerPoint);
          let lng = Cesium.Math.toDegrees(centerCartographic.longitude);
          let lat = Cesium.Math.toDegrees(centerCartographic.latitude);
          let height = this.clampToGround ? centerCartographic.height : drawHeight;
          let circle = new Cesium.DrawElement.CirclePrimitive({
            center: centerPoint,
            radius: radius,
            height: height,
            asynchronous: false,
            material: Cesium.Material.fromType('Color', {
              color: color
            })
          });
          let drawEntity = this.view.viewer.scene.primitives.add(circle);
          drawEntity.primitive = true;

          //计算圆的缓冲区，并返回坐标
          const origindata = {
            "type": "FeatureCollection",
            "features": [{
              "type": "Feature",
              "properties": {},
              "geometry": {
                "type": "Point",
                "coordinates": [lng, lat]
              }
            }]
          };

          const geojson = buffer(origindata, radius, {
            units: 'meters'
          });
          if (geojson?.features.length && geojson.features[0]?.geometry?.coordinates.length) {
            let polygonArr = [];
            let points = geojson.features[0].geometry.coordinates[0].reduce((a, b) => a.concat(b), []);
            points.forEach((point, index) => {
              if (index % 2 === 0) {
                const pointM = this.emgManager.changeToCartesian3({lng: point, lat: points[index + 1], height});
                polygonArr.push(pointM);
              }
            });
            if (!this.infinite) {
              this.drawElement.stopDrawing();
            }
            window.drawEntities.push(drawEntity);
            this.drawcreate(polygonArr);
          }
        }
      });
    },
    activePreview() {
      const previewRange = this.emgManager.getCurrentView();
      this.drawcreate(previewRange);
    },
    removeDrawEntities() {
      if (window.drawEntities?.length) {
        window.drawEntities.forEach(item => {
          this.view.viewer.entities.remove(item);
          if (item.primitive) {
            item.destroy();
          }
        });
      }
    },
    stopDrawing() {
      this.drawElement && this.drawElement.stopDrawing();
    }
  }
};
</script>

<style lang="scss">
@import "../var";

.draw-tool {
  position: relative;


  .tool-wrapper, .toolbar-wrapper {
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

    .activeItem {
      background-color: $active-background !important;
    }
  }
}


</style>
