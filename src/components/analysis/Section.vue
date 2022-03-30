<template>
  <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <a-row class="input-item">
        <a-col :span="6">
          <span class="input-tag">绘制:</span>
        </a-col>
        <a-col :span="14">
          <municipal-draw
            :vueKey="vueKey"
            enable-menu-control="func"
            :drawItems="drawItems"
            @load="onDrawLoad"
            @drawcreate="handleDraw"
          >
          </municipal-draw>
        </a-col>
      </a-row>
      <a-row class="input-item" v-for="item in renderData" :key="item.title">
        <a-col :span="6">
          <span class="input-tag">{{ item.title }}:</span>
        </a-col>
        <a-col :span="10">
          <a-slider v-model="item.value" :min="cutLength[0]" :max="cutLength[1]"/>
        </a-col>
        <a-col :span="8">
          <a-input-number
            v-model="item.value"
            :min="cutLength[0]"
            :max="cutLength[1]"
            style="margin-left: 16px"
          />
        </a-col>
      </a-row>
    </template>
  </municipal-panel>
</template>

<script>
import VueOptions from '@/util/options/vueOptions';
import PanelOpts from '@/util/options/panelOptions';
import loadingM3ds from '@/util/mixins/withLoadingM3ds';

export default {
  name: "municipal-section",
  mixins: [loadingM3ds],
  data() {
    return {
      drawItems: ['rect'],
      renderData: [
        {
          title: '右拉伸距离',
          value: 0
        },
        {
          title: '左拉伸距离',
          value: 0
        }, {
          title: '前拉伸距离',
          value: 0
        }, {
          title: '后拉伸距离',
          value: 0
        }
      ],
      pointsXY: [],
      centerPoint: []
    };
  },
  props: {
    ...PanelOpts,
    ...VueOptions,
    cutLength: {
      type: Array,
      default: () => {
        return [0, 4000];
      }
    },
    title: {
      type: String,
      default: '动态剖切'
    }
  },
  watch: {
    renderData: {
      handler() {
        this.sectioning();
      },
      immediate: true,
      deep: true
    }
  },
  destroyed() {
    this.removePlanes();
  },
  methods: {
    onDrawLoad(payload) {
      this.dynaCutList = [];
      this.drawOper = payload;
    },
    removePlanes() {
      this.analysisManager && this.dynaCutList && this.dynaCutList.map(d => this.analysisManager.deleteDynamicCutting(d));
      this.dynaCutList = [];
    },
    handleDraw(drawRes) {
      const {payload} = drawRes;
      const point = this.emgManager.Car3ToFv(payload[1]);
      const point1 = this.emgManager.Car3ToFv(payload[3]);
      const pointLng = this.emgManager.Cartesian3ToLat(payload[0]);
      const pointLng1 = this.emgManager.Cartesian3ToLat(payload[2]);
      this.centerPoint = [Number(pointLng.lng + pointLng1.lng) / 2, Number(pointLng.lat + pointLng1.lat) / 2];
      this.pointsXY = [point, point1];
      this.sectioning();
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
    sectioning() {
      const cutLayer = this.layerIndexs.map(item => parseInt(item));
      this.drawOper.removeDrawEntities();
      if (!this.centerPoint.length) {
        return;
      }
      const distances = this.renderData.map(item => item.value);
      //开挖面设置,这五个面分别表示前后左右，底面，其中底面用于控制开挖深度
      const dynamicEast = (this.pointsXY[0].x - this.pointsXY[1].x + parseInt(distances[0])) / 2;
      const dynamicWest = (this.pointsXY[0].x - this.pointsXY[1].x + parseInt(distances[1])) / 2;
      const dynamicNorth = (this.pointsXY[0].y - this.pointsXY[1].y + parseInt(distances[2])) / 2;
      const dynamicSouth = (this.pointsXY[0].y - this.pointsXY[1].y + parseInt(distances[3])) / 2;
      const clippingPlanes = [
        new Cesium.ClippingPlane(new Cesium.Cartesian3(1, 0.0, 0.0), -dynamicEast),//右
        new Cesium.ClippingPlane(new Cesium.Cartesian3(-1, 0.0, 0.0), -dynamicWest),//左
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1, 0.0), -dynamicNorth),//前
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1, 0.0), -dynamicSouth),//后
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1), 0.0)
      ];
      //开挖
      this.view.tilesetList.filter(t => cutLayer.includes(t.layerIndex)).map(t =>
        setTimeout(() => {
          this.startDynaCut(t, this.centerPoint, clippingPlanes);
        })
      );
    }
  }
};
</script>

<style scoped lang="scss">
.input-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
  min-height: 40px;
}
</style>
