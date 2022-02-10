<template>
  <municipal-panel title="开挖分析">
    <template v-slot:content>
      <a-row class="input-item">
        <a-col :span="6">
          <span class="input-tag">开挖深度</span>
        </a-col>
        <a-col :span="10">
          <a-slider v-model="inputValue1" :min="1" :max="20"/>
        </a-col>
        <a-col :span="4">
          <a-input-number v-model="inputValue1" :min="1" :max="20" style="marginLeft: 16px"/>
        </a-col>
      </a-row>
      <a-row class="input-item">
        <a-col :span="6">
          <span class="input-tag">开挖材质</span>
        </a-col>
        <a-col :span="10" :style="{display:'flex'}">
          <div v-for="(item,index) in drawTextures" :key="index" style="margin: 0 5px">
            <a-popover>
              <template slot="content">
                <div style="width: 130px;height: 130px">
                  <img :src="item" style="width: 100%;height: 100%">
                </div>
              </template>
              <a-avatar :src="item" size="small"/>
            </a-popover>
          </div>
        </a-col>
      </a-row>
      <a-row class="input-item">
        <a-col :span="6">
          <span class="input-tag">开挖范围</span>
        </a-col>
        <a-col :span="14">
          <municipal-draw :vueKey="vueKey" :enable-menu-control="false" @load="onDrawLoad" @drawcreate="handleDraw">
            <div class="icons">
              <div v-for="item in drawTools" :key="item" style="margin: 0px 8px;cursor: pointer"
                   v-on:click="activeTools(item)">
                <municipal-icon :name="`-vector-${item}`" style="cursor: pointer"></municipal-icon>
              </div>
            </div>
          </municipal-draw>
        </a-col>
      </a-row>
    </template>
  </municipal-panel>
</template>

<script>
import VueOptions from '@/util/vueOptions';
import loadingM3ds from '@/util/mixins/withLoadingM3ds';
import {
  calMinTerrainHeight
} from "@/util/util";

export default {
  name: "municipal-dynacut",
  inject: ['Cesium', 'CesiumZondy', 'webGlobe'],
  mixins: [loadingM3ds],
  props: {
    ...VueOptions,
    drawTextures: {
      type: Array,
      default: () => {
        return [];
      }
    },
    drawTools: {
      type: Array,
      default: () => {
        return ['square', 'polygon'];
      }
    }
  },
  data() {
    return {
      inputValue1: 0,
      inputValue: 0,
      drawRange: []
    };
  },
  methods: {
    onDrawLoad(payload) {
      this.drawOper = payload;
    },
    handleDraw(payload) {
      this.drawRange = payload;
      this.dynacut();
    },
    dynacut() {
      let tileset = this.m3ds.find(t => t.layerId) || this.m3ds[0];
      let transform = tileset.root.transform;
      const Cesium = this.Cesium;
      console.log(transform);
      const pointArr = [];
      const pointL = [];
      if (this.drawRange?.length) {
        this.drawRange.forEach(point => {
          let resPoint = new Cesium.Cartesian3;
          let invserTran = new Cesium.Matrix4;
          Cesium.Matrix4.inverse(transform, invserTran);
          Cesium.Matrix4.multiplyByPoint(invserTran, point, resPoint);
          pointArr.push(resPoint);

          let ellipsoid = this.webGlobe.viewer.scene.globe.ellipsoid;
          let cartesian3 = new Cesium.Cartesian3(point.x, point.y, point.z);
          let cartographic = ellipsoid.cartesianToCartographic(cartesian3);
          let lat = Cesium.Math.toDegrees(cartographic.latitude);
          let lng = Cesium.Math.toDegrees(cartographic.longitude);
          let alt = cartographic.height;
          pointL.push(lng, lat, alt);
        });

        // 获取地形最小高度
        const { _minHeight } = calMinTerrainHeight(this.drawRange);
      }
    },
    activeTools(tool) {
      switch (tool) {
        case 'polygon':
          this.drawOper.enableDrawPolygon();
          return;
        case 'square':
          this.drawOper.enableDrawRectangle();
          return;
        case 'circle':
          this.drawOper.enableDrawCircle();
          return;
        default:
          break;
          return;
      }
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

.icons {
  display: flex;
  justify-content: flex-start;
}

</style>
