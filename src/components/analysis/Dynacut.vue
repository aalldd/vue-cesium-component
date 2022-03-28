<template>
  <div>
    <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                     :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
      <template v-slot:content>
        <a-row class="input-item">
          <a-col :span="6">
            <span class="input-tag">开挖深度</span>
          </a-col>
          <a-col :span="10">
            <a-slider v-model="digDistance" :min="1" :max="40"/>
          </a-col>
          <a-col :span="8">
            <a-input-number
              v-model="digDistance"
              :min="1"
              :max="40"
              style="margin-left: 16px"
            />
          </a-col>
        </a-row>
        <a-row class="input-item">
          <a-col :span="6">
            <span class="input-tag">开挖材质</span>
          </a-col>
          <a-col :span="10" :style="{ display: 'flex' }">
            <div
              v-for="(item, index) in drawTextures"
              :key="index"
              style="
              margin: 0 5px;
              display: flex;
              align-items: center;
              justify-content: center;
            "
            >
              <a-popover>
                <template slot="content">
                  <div style="width: 130px; height: 130px">
                    <img :src="item" style="width: 100%; height: 100%"/>
                  </div>
                </template>
                <div
                  :class="item === drawTexture && activeTexture"
                  class="textrue"
                >
                  <a-avatar
                    :src="item"
                    size="small"
                    @click="changeTexture(item)"
                  />
                </div>
              </a-popover>
            </div>
          </a-col>
        </a-row>
        <a-row class="input-item">
          <a-col :span="6">
            <span class="input-tag">开挖范围</span>
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
      </template>
    </municipal-panel>
    <slot></slot>
  </div>
</template>

<script>
import VueOptions from "@/util/options/vueOptions";
import PanelOpts from '@/util/options/panelOptions';
import loadingM3ds from "@/util/mixins/withLoadingM3ds";


export default {
  name: "municipal-dynacut",
  inject: ["Cesium", "CesiumZondy", "webGlobe"],
  mixins: [loadingM3ds],
  props: {
    ...VueOptions,
    ...PanelOpts,
    drawTextures: {
      type: Array,
      default: () => {
        return [];
      },
    },
    drawTools: {
      type: Array,
      default: () => {
        return ["square", "polygon"];
      }
    },
    title: {
      type: String,
      default: '开挖分析'
    }
  },
  data() {
    return {
      digDistance: 0,
      drawTexture: "",
      drawRange: [],
      sArea: 0,
      fArea: 0,
      heightRange: "",
      drawType: '',
      drawItems: ['polygon', 'rect']
    };
  },
  computed: {
    activeTexture() {
      return "activeTexture";
    },
  },
  methods: {
    onDrawLoad(payload) {
      this.drawOper = payload;
    },
    handleDraw(drawRes) {
      const {payload} = drawRes;
      this.drawRange = [...payload, payload[0]];
      this.dynacut();
    },
    removePlanes() {
      this.analysisManager && this.dynaCutList && this.dynaCutList.map(d => this.analysisManager.deleteDynamicCutting(d));
      this.dynaCutList = [];
    },
    changeTexture(textureUrl) {
      this.drawTexture = textureUrl;
    },
    dynacut() {
      this.drawOper.removeDrawEntities();
      let tileset = this.m3ds.find((t) => t.layerId) || this.m3ds[0];
      let transform = tileset.root.transform;
      const pointArr = [];
      const pointL = [];
      if (!this.drawRange?.length) {
        return;
      }
      for (let i = 0; i < this.drawRange.length - 1; i++) {
        let point = this.drawRange[i];
        let resPoint = new Cesium.Cartesian3();
        let invserTran = new Cesium.Matrix4();
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
      }
      const {_minHeight} = this.emgManager.calMinTerrainHeight(
        this.drawRange
      );
      this.emgManager.drawTexture(
        [...this.drawRange, this.drawRange[0]],
        _minHeight - this.digDistance,
        this.drawTexture
      );
      const {dynaCutList} = this.emgManager.dig(
        pointArr,
        this.digDistance,
        this.layerIndexs ? this.layerIndexs : null
      );
      pointArr.push(pointArr[0]);
      const geometry = pointArr.map(p => [p.x, p.y]).reduce((a, b) => a.concat(b), []).join();
      const data = {
        dynaCutList,
        minHeight: _minHeight - this.digDistance,
        geometry: geometry,
        geometryType: this.drawType === 'square' ? 'rect' : 'polygon',
        cutLayerIndexs: this.layerIndexs,
        m3ds: this.m3ds,
        offset: this.offset,
        mapServerName: this.mapServerName
      };
      this.emgManager.cutFillAna(this.drawRange, _minHeight - this.digDistance, (result) => {
        this.heightRange =
          result.minHeight.toFixed(2) + "~" + result.maxHeight.toFixed(2);
        this.sArea = result.surfaceArea;
        this.fArea = result.cutVolume;
        const dataRes = {
          heightRange: this.heightRange,
          sArea: this.sArea,
          fArea: this.fArea,
        };
        this.$emit('onDynacut', Object.assign(dataRes, data));
      });
    }
  },
};
</script>

<style scoped lang="scss">
.input-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
  min-height: 40px;
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
