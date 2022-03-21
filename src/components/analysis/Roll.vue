<template>
  <div>
    <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')"
                     :closable="closable"
                     :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
      <template v-slot:content>
        <a-row class="input-item">
          <a-col :span="6">
            <span class="input-tag">卷帘类型</span>
          </a-col>
          <a-col :span="14">
            <div class="itemWrapper">
              <a-radio-group :options="plainOptions" :default-value="rollType" @change="onRollTypeChange"/>
            </div>
          </a-col>
        </a-row>
      </template>

    </municipal-panel>
    <div class="horizontal-slider" ref="sliderRef" @mousedown="handleSlider" v-if="rollType==='上下卷帘'">
    </div>
    <div class="vertical-slider" ref="sliderRef" @mousedown="handleSlider" v-if="rollType==='左右卷帘'">
    </div>
  </div>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import _ from "lodash";

export default {
  name: "municipal-roll",
  mixins: [loadingM3ds],
  data() {
    return {
      plainOptions: ['上下卷帘', '左右卷帘'],
      rollType: '上下卷帘',
      isMoving: false,
      offsetCopy: [0, 0]
    };
  },
  props: {
    ...panelOptions,
    title: {
      type: String,
      default: '卷帘分析'
    },
    minPoint: {
      type: Object,
      default: () => {
        return {lng: 100.1301747254737, lat: 19.631735217081637};
      },
      validator(value) {
        return Object.keys(value).indexOf('lng') >= 0 || Object.keys(value).indexOf('lat') >= 0;
      }
    },
    maxPoint: {
      type: Object,
      default: () => {
        return {lng: 121.32643955517658, lat: 29.782760972168106};
      },
      validator(value) {
        return Object.keys(value).indexOf('lng') >= 0 || Object.keys(value).indexOf('lat') >= 0;
      }
    },
    viewParam: {
      type: Object,
      default: () => {
        return {
          pitch: -0.46705834890842484,
          heading: 0.06441376551273681,
          roll: 0.0001592941383155022,
          position: {
            x: -2414652.3620236595,
            y: 5369471.182661548,
            z: 2445913.9906018856
          }
        };
      },
      validator(value) {
        const intersection = _.intersection(Object.keys(value), ['pitch', 'heading', 'roll', 'position']);
        return intersection.length === 4;
      }
    },
    //卷帘的偏移值
    offsetRoll: {
      type: Array,
      default: () => {
        return [0, 0];
      }
    }
  },
  watch: {
    offset: {
      handler() {
        this.offsetCopy = _.cloneDeep(this.offsetRoll);
      },
      immediate: true
    }
  },
  mounted() {
    const reAsk = () => {
      if (this.emgManager) {
        this.init();
        window.clearInterval(this.myInterval);
      }
    };
    this.reAsked(reAsk);
  },
  destroyed() {
    this.quit();
  },
  methods: {
    onRollTypeChange(e) {
      this.rollType = e.target.value;
    },
    quit() {
      this.removePlanes();
      this.view.viewer.clock.onTick.removeEventListener();
      this.view.viewer.clock.shouldAnimate = false;
      this.view.viewer.scene.screenSpaceCameraController.enableTilt = true;
      window.clearInterval(this.listener);
    },
    init() {
      this.trackCamera();
      this.emgManager && this.cameraListener();
      this.view.viewer.scene.screenSpaceCameraController.enableTilt = false;
    },
    trackCamera() {
      //世界坐标转经纬度坐标
      let position = new Cesium.Cartesian3(this.viewParam.position.x, this.viewParam.position.y, this.viewParam.position.z);
      let cp = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position); // 除Π 乘以180
      let lng = cp.longitude / Math.PI * 180;
      let lat = cp.latitude / Math.PI * 180;
      let height = cp.height;
      if (!this.sceneManager) {
        this.sceneManager = new CesiumZondy.Manager.SceneManager({viewer: this.view.viewer});
      }
      this.sceneManager.flyToEx(lng, lat, {
        height: height,
        heading: 0,
        pitch: -90,
        roll: (this.viewParam.roll * (180 / Math.PI))
      });
    },
    cameraListener() {
      this.listener = setInterval(() => {
        this.calDistance();
      }, 40);
    },
    handleSlider(e) {
      e.preventDefault();
      this.isMoving = true;
      const targetRef = this.$refs.sliderRef;
      if (targetRef.style) {
        this.downClientX = e.clientX;
        this.downScrollLeft = targetRef.getBoundingClientRect().left;
        this.downClientY = e.clientY;
        this.downScrollTop = targetRef.getBoundingClientRect().top;
      }
      const scrollCallback = _.throttle((clientX, clientY) => {
        const canvas = this.view.viewer.scene.canvas;
        const left = _.clamp(this.downScrollLeft - (this.downClientX - clientX), 0, canvas.width);
        const top = _.clamp(this.downScrollTop - (this.downClientY - clientY), 0, canvas.height - 3);
        this.rollType === '左右卷帘' ? targetRef.style.left =
          left + 'px' : targetRef.style.top =
          top + 'px';
      }, 40);
      document.addEventListener('mousemove', e => {
        e.preventDefault();
        if (this.isMoving && this.$refs.sliderRef) {
          scrollCallback(e.clientX, e.clientY);
        }
      });
      document.addEventListener('mouseup', this.handleMouseUp);
    },
    handleMouseUp(e) {
      e.preventDefault();
      this.isMoving = false;
    },
    calDistance() {
      const canvas = this.view.viewer.scene.canvas;
      const targetRef = this.$refs.sliderRef;
      const top = targetRef.getBoundingClientRect().top - this.offsetCopy[0];
      const left = targetRef.getBoundingClientRect().left - this.offsetCopy[1];
      let distance;
      const {lng: lng2, lat: lat2} = this.getScreenPoint(0, 0);
      const {lng: lng3, lat: lat3} = this.getScreenPoint(canvas.width, canvas.height);
      this.screenMinPoint = {lng: lng2, lat: lat2, height: 0};
      this.screenMaxPoint = {lng: lng3, lat: lat3, height: 0};
      if (this.rollType === '上下卷帘') {
        const {lng, lat} = this.getScreenPoint(0, top);
        const {lng: lng1, lat: lat1} = this.getScreenPoint(0, canvas.height / 2);

        //将区域转成模型坐标
        const pointMapMin = this.emgManager.positionTransfer({lng: lng1, lat: lat1, height: 0}, this.transform);

        const point = this.emgManager.positionTransfer({lng: lng, lat: lat, height: 0}, this.transform);
        distance = point[1] - pointMapMin[1];
      } else {
        const {lng, lat} = this.getScreenPoint(left, 0);
        const {lng: lng1, lat: lat1} = this.getScreenPoint(canvas.width, 0);

        //将区域转成模型坐标
        const pointMapMax = this.emgManager.positionTransfer({lng: lng1, lat: lat1, height: 0}, this.transform);

        const point = this.emgManager.positionTransfer({lng: lng, lat: lat, height: 0}, this.transform);

        distance = pointMapMax[0] - point[0];
      }
      this.distance = distance;
      this.rolling();
    },
    //卷帘利用开挖实现
    //初始画一个超过图形的范围，根据距离不断开挖
    rolling() {
      const {distance, rollType, screenMinPoint, screenMaxPoint, view, minPoint: configMin, maxPoint: configMax} = this;
      this.analysisManager && this.removePlanes();
      const point2 = this.emgManager.positionTransfer({
        lng: configMax.lng,
        lat: configMax.lat,
        height: 0
      }, this.transform);
      const point3 = this.emgManager.positionTransfer({
        lng: configMin.lng,
        lat: configMin.lat,
        height: 0
      }, this.transform);
      let clippingPlanes;
      //开挖面设置,这五个面分别表示前后左右，底面，其中底面用于控制开挖深度
      rollType === '上下卷帘' ? clippingPlanes = [
        new Cesium.ClippingPlane(new Cesium.Cartesian3(1, 0.0, 0.0), -(1000000) / 2),//右
        new Cesium.ClippingPlane(new Cesium.Cartesian3(-1, 0.0, 0.0), -(1000000) / 2),//左
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1, 0.0), -(distance)),//前
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1, 0.0), -(point2[1] - point3[1]) / 2),//后
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1), 0.0)
      ] : clippingPlanes = [
        new Cesium.ClippingPlane(new Cesium.Cartesian3(1, 0.0, 0.0), -(point2[0] - point3[0]) / 2),//右
        new Cesium.ClippingPlane(new Cesium.Cartesian3(-1, 0.0, 0.0), -(distance)),//左
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1, 0.0), -(1000000) / 2),//前
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1, 0.0), -(1000000) / 2),//后
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1), 0.0)
      ];
      //中心点  邊界為配置的點
      let centerPoints;
      rollType === '上下卷帘' ?
        centerPoints = [(screenMinPoint.lng + screenMaxPoint.lng) / 2, (screenMaxPoint.lat + screenMinPoint.lat) / 2] :
        centerPoints = [screenMaxPoint.lng, (screenMinPoint.lat + screenMaxPoint.lat) / 2];
      this.tilesetList.map(t => {
        this.startDynaCut(t, centerPoints, clippingPlanes);
      });
    },
    startDynaCut(tileset, centerPoints, clippingPlanes) {
      const dynaCut = this.analysisManager.createExcavateAnalysis({
        //图层信息
        tileset: tileset,
        //开挖面的形状
        //planes: this.planes,
        planes: clippingPlanes,
        //裁剪面材质
        material: new Cesium.Color(0.2, 0.4, 0.3, 0.7),
        //边界线颜色
        edgeColor: new Cesium.Color(0.2, 0.4, 0.3, 0.7),
        //边界线宽度
        edgeWidth: 3,
        //裁减法线方向，默认值为 false
        unionClippingRegions: false,
        //开挖坐标
        longitude: centerPoints[0],
        latitude: centerPoints[1],
        height: 0
      });

      // 设置开挖的动态效果
      dynaCut.planes[0].plane.plane = new Cesium.CallbackProperty(function () {
        for (let i = 0; i < clippingPlanes.length; i++) {
          if (i === clippingPlanes.length - 1) {
            let plane = clippingPlanes[i];
            plane.distance = 0;
            Cesium.Plane.transform(plane, tileset.modelMatrix, new Cesium.ClippingPlane(Cesium.Cartesian3.UNIT_X, 0.0));
          }
        }
      }.bind(this), false);

      this.dynaCutList.push(dynaCut);
    },
    removePlanes() {
      this.analysisManager && this.dynaCutList && this.dynaCutList.map(d => this.analysisManager.deleteDynamicCutting(d));
      this.dynaCutList = [];
    },
    getScreenPoint(left, top) {
      const viewer = this.view.viewer;
      const pick = new Cesium.Cartesian2(left, top);
      const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(pick), viewer.scene);
      if (cartesian) {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        let lng = Cesium.Math.toDegrees(cartographic.longitude);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        return {lng, lat};
      } else {
        return this.minPoint;
      }
    }
  }
};
</script>

<style lang="scss">
.input-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
  min-height: 40px;

  .itemWrapper {
    display: flex;
    justify-content: flex-start;
  }
}

.vertical-slider {
  position: fixed;
  left: 50%;
  top: 0 !important;
  background-color: #D3D3D3;
  width: 5px;
  height: 100%;
  pointer-events: all;
  z-index: 10000;

  &:hover {
    cursor: ew-resize;
  }
}

.horizontal-slider {
  position: fixed;
  left: 0 !important;
  top: 50%;
  background-color: #D3D3D3;
  width: 100%;
  pointer-events: all;
  height: 5px;
  z-index: 10000;

  &:hover {
    cursor: ns-resize;
  }
}
</style>
