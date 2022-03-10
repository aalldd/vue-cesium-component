<template>
  <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
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
import VueOptions from '@/util/options/vueOptions';
import PanelOpts from '@/util/options/panelOptions';
import loadingM3ds from '@/util/mixins/withLoadingM3ds';
import MathTools from '@/util/helpers/mathTools';

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
      tunnelType: '矩形',
      tunnelStyleCopy: {
        color: '#000',
        alpha: 0.4
      }
    };
  },
  props: {
    ...VueOptions,
    ...PanelOpts,
    tunnelStyle: {
      type: Object
    }
  },
  watch: {
    tunnelStyle: {
      handler() {
        this.tunnelStyleCopy = Object.assign(this.tunnelStyleCopy, this.tunnelStyle);
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    onDrawLoad(payload) {
      this.drawOper = payload;
    },
    handleDraw(payload) {
      this.tunnelPath = payload.map(item => {
        return this.emgManager.Cartesian3ToLat(item);
      });
      this.drawTunnel();
      this.calLine();
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
          material: new Cesium.Color.fromCssColorString(this.tunnelStyleCopy.color).withAlpha(this.tunnelStyleCopy.alpha),
          shape: this.tunnelType === '圆形' ? computeCircle(this.tunnelRadius) : computeTriangle(this.tunnelWidth, this.tunnelHeight),
          cornerType: this.tunnelType === '圆形' ? 'ROUNDED' : 'MITERED'
        }
      };
      this.webGlobe.viewer.entities.add(this.tunnel);
    },
    calLine() {
      const {tunnelWidth, tunnelHeight, tunnelCenterHeight, tunnelType, tunnelRadius} = this;
      this.linePoint = [];
      for (let i = 0; i < this.tunnelPath.length; i++) {
        let item = this.tunnelPath[i];
        const itemCar3 = this.emgManager.changeToCartesian3(item);
        this.linePoint[i] = [itemCar3.x, itemCar3.y, itemCar3.z];
      }

      // 用来计算多面体的变量
      let topBarList = [];
      let BottomBarList = [];
      let polygonList = [];

      // 将沿线经过的区域分解为多个凸多边形 因为平台不支持凹多边形
      if (this.linePoint.length === 1) {
        this.$message.info('至少两点才能组成一条线，请重新画点');
      } else if (this.linePoint.length === 2) {
        let sp1, sp2, ep1, ep2;
        let v1 = MathTools.Subtract(this.linePoint[1], this.linePoint[0]);
        let v2 = MathTools.Cross(v1, [0, 0, 1]);
        let l = MathTools.Length(v1);

        sp1 = MathTools.PVL(this.linePoint[0], v2, tunnelType === '矩形' ? tunnelWidth : tunnelRadius * 2);
        sp2 = MathTools.PVL(this.linePoint[0], v2, tunnelType === '矩形' ? -tunnelWidth : -tunnelRadius * 2);
        ep1 = MathTools.PVL(sp1, v1, l);
        ep2 = MathTools.PVL(sp2, v1, l);
        topBarList = [...topBarList, sp2, ep2];
        BottomBarList = [...BottomBarList, sp1, ep1];
      } else {
        this.linePoint.forEach((item, i) => {
          let sp1, sp2, ep1, ep2;
          if (i !== this.linePoint.length - 1) {
            if (i === 0) {
              let v1 = MathTools.Subtract(this.linePoint[i + 1], item);
              let v2 = MathTools.Cross(v1, [0, 0, 1]);
              sp1 = MathTools.PVL(item, v2, tunnelType === '矩形' ? tunnelWidth : tunnelRadius * 2);
              sp2 = MathTools.PVL(item, v2, tunnelType === '矩形' ? -tunnelWidth : -tunnelRadius * 2);
              const vector = MathTools.CalAngleInFace(i, this.linePoint);
              let basic = tunnelType === '矩形' ? tunnelWidth / 2 : tunnelRadius;
              const r = (basic) / Math.cos(vector[1]);
              ep1 = MathTools.PVL(this.linePoint[i + 1], vector[0], r);
              ep2 = MathTools.PVL(this.linePoint[i + 1], vector[0], -r);
              topBarList = [...topBarList, sp2, ep2];
              BottomBarList = [...BottomBarList, sp1, ep1];
            } else if (i === this.linePoint.length - 2) {
              let v1 = MathTools.Subtract(this.linePoint[i + 1], item);
              let v2 = MathTools.Cross(v1, [0, 0, 1]);
              ep1 = MathTools.PVL(this.linePoint[i + 1], v2, tunnelType === '矩形' ? tunnelWidth : tunnelRadius * 2);
              ep2 = MathTools.PVL(this.linePoint[i + 1], v2, tunnelType === '矩形' ? -tunnelWidth : -tunnelRadius * 2);
              topBarList = [...topBarList, ep2];
              BottomBarList = [...BottomBarList, ep1];
            } else {
              const vector = MathTools.CalAngleInFace(i, this.linePoint); // 计算两根线之间的夹角
              let basic = tunnelType === '矩形' ? tunnelWidth / 2 : tunnelRadius;
              let w = (basic) / Math.cos(vector[1]); //计算宽度
              ep1 = MathTools.PVL(this.linePoint[i + 1], vector[0], w);
              ep2 = MathTools.PVL(this.linePoint[i + 1], vector[0], -w);
              topBarList = [...topBarList, ep2];
              BottomBarList = [...BottomBarList, ep1];
            }
          }

        });
      }

      const transform = this.m3ds.find(t => !this.layerIndexs.includes(t.layerIndex)).root.transform;
      BottomBarList = BottomBarList.reverse();
      polygonList = [...topBarList, ...BottomBarList, topBarList[0]].map(item => {
        let point = {x: item[0], y: item[1], z: item[2]};
        let resPoint = new Cesium.Cartesian3;
        let invserTran = new Cesium.Matrix4;
        Cesium.Matrix4.inverse(transform, invserTran);
        Cesium.Matrix4.multiplyByPoint(invserTran, point, resPoint);
        return resPoint;
      });
      //从基础配置中拿取偏移坐标
      const geometry = polygonList.map(p => [p.x + this.offset[0], p.y + this.offset[1]]).reduce((a, b) => a.concat(b), []).join();
      let range = [];
      tunnelType === '矩形' ? range = [tunnelCenterHeight - tunnelHeight / 2, tunnelCenterHeight + tunnelHeight / 2] : range = [tunnelCenterHeight - tunnelRadius, tunnelCenterHeight + tunnelRadius];
      this.$emit('sendQueryParam', {
        'geometry': geometry,
        'geometryType': 'polygon',
        'range': range
      });
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
