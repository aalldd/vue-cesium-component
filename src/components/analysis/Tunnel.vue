<template>
  <municipal-panel title="隧道分析">
    <template v-slot:content>
      <a-row class="input-item">
        <a-col :span="6">
          <span class="input-tag">隧道类型</span>
        </a-col>
        <a-col :span="14">
          <div class="itemWrapper">
            <a-radio-group :options="plainOptions" :default-value="tunnelType" @change="onTunnelTypeChange"/>
          </div>
        </a-col>
      </a-row>
      <div v-if="tunnelType==='矩形'">
        <a-row class="input-item">
          <a-col :span="6">
            <span class="input-tag">隧道宽度</span>
          </a-col>
          <a-col :span="14">
            <div class="itemWrapper">
              <a-input-number v-model="tunnelWidth"/>
            </div>
          </a-col>
        </a-row>

        <a-row class="input-item">
          <a-col :span="6">
            <span class="input-tag">隧道高度</span>
          </a-col>
          <a-col :span="14">
            <div class="itemWrapper">
              <a-input-number v-model="tunnelHeight"/>
            </div>
          </a-col>
        </a-row>
      </div>
      <div v-else>
        <a-row class="input-item">
          <a-col :span="6">
            <span class="input-tag">隧道半径</span>
          </a-col>
          <a-col :span="14">
            <div class="itemWrapper">
              <a-input-number v-model="tunnelRadius"/>
            </div>
          </a-col>
        </a-row>
      </div>

      <a-row class="input-item">
        <a-col :span="6">
          <span class="input-tag">管中心高程</span>
        </a-col>
        <a-col :span="14">
          <div class="itemWrapper">
            <a-input-number v-model="tunnelCenterHeight"/>
          </div>
        </a-col>
      </a-row>

      <a-row class="input-item">
        <a-col :span="6">
          <span class="input-tag">绘制隧道</span>
        </a-col>
        <a-col :span="14">
          <municipal-draw :vueKey="vueKey" :enable-menu-control="false" @load="onDrawLoad" @drawcreate="handleDraw">
            <div class="icons" @click="drawTunnelPath">
              <municipal-icon name="-vector-point" style="cursor: pointer"></municipal-icon>
            </div>
          </municipal-draw>
        </a-col>
      </a-row>
    </template>
  </municipal-panel>
</template>

<script>
import VueOptions from '@/util/vueOptions';
import PanelOpts from '@/util/panelOptions';
import loadingM3ds from '@/util/mixins/withLoadingM3ds';

export default {
  name: "municipal-tunnel",
  inject: ['Cesium', 'CesiumZondy', 'webGlobe'],
  mixins: [loadingM3ds],
  data() {
    return {
      tunnelWidth: 5,
      tunnelHeight: 5,
      //管中心高程
      tunnelCenterHeight: 5,
      tunnelRadius: 5,
      plainOptions: ['矩形', '圆形'],
      tunnelType: '矩形'
    };
  },
  props: {
    ...VueOptions,
    ...PanelOpts,
    tunnelStyle:{
      type:Object,
      default:()=>{
        return {
          color:'#000',
          alpha:0.4
        }
      }
    }
  },
  methods: {
    onDrawLoad(payload) {
      this.drawOper = payload;
    },
    handleDraw(payload) {
      this.tunnelPath = payload.map(item=>{
        return this.emgManager.Cartesian3ToLat(item)
      });
      this.drawTunnel();
    },
    drawTunnelPath() {
      this.emgManager.removeAll();
      this.drawOper && this.drawOper.enableDrawLine();
    },
    onTunnelTypeChange(e) {
      this.tunnelType = e.target.value;
    },
    drawTunnel() {
      const LinePositions = [];

      function computeCircle(radius) {
        const positions = [];
        for (let i = 0; i < 360; i++) {
          let radians = Cesium.Math.toRadians(i);
          positions.push(new Cesium.Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians)));
        }
        return positions;
      }

      function computeTriangle(width, height) {
        return [new Cesium.Cartesian2(width / 2, height / 2), new Cesium.Cartesian2(-width / 2, height / 2), new Cesium.Cartesian2(-width / 2, -height / 2), new Cesium.Cartesian2(width / 2, -height / 2)];
      }

      this.tunnelPath.forEach(point => {
        const CesPoint = this.tunnelType === '圆形' ? new Cesium.Cartesian3.fromDegrees(point.lng, point.lat, -this.tunnelRadius + this.tunnelCenterHeight) : new Cesium.Cartesian3.fromDegrees(point.lng, point.lat, -this.tunnelHeight / 2 + this.tunnelCenterHeight);
        LinePositions.push(CesPoint);
      });
      this.tunnel = {
        id: "test",
        polylineVolume: {
          positions: LinePositions,
          material: new Cesium.Color(255, 255, 255, 0.4),
          shape: this.tunnelType === '圆形' ? computeCircle(this.tunnelRadius) : computeTriangle(this.tunnelWidth, this.tunnelHeight),
          cornerType: this.tunnelType === '圆形' ? 'ROUNDED' : 'MITERED'
        }
      };
      this.webGlobe.viewer.entities.add(this.tunnel);
    }
  }
};
</script>

<style scoped lang="scss">
@import "../var";

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

.icons {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 20px;
  height: 20px;

  &:hover {
    background-color: $active-background;
  }
}

.activeTexture {
  background-color: #fff;
  border-radius: 50%;
  border: 1px solid blue;
}

.textrue {
  padding: 2px;
}
</style>
