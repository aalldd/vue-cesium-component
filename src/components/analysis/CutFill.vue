<template>
  <div>
    <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                     :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
      <template v-slot:content>
        <a-row class="input-item">
          <a-col :span="6">
            <span class="input-tag">平整高程</span>
          </a-col>
          <a-col :span="14">
            <div class="itemWrapper">
              <a-input-number v-model="terrainHeight"/>
            </div>
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
            <span class="input-tag">绘制区域</span>
          </a-col>
          <a-col :span="14">
            <municipal-draw :vueKey="vueKey"
                            enable-menu-control="func"
                            @load="onDrawLoad"
                            :drawItems="drawItems"
                            @drawcreate="handleDraw">
              <div class="icons" @click="drawArea">
                <municipal-icon name="-vector-polygon" style="cursor: pointer"></municipal-icon>
              </div>
            </municipal-draw>
          </a-col>
        </a-row>
      </template>
    </municipal-panel>
    <slot></slot>
  </div>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import vueOptions from "@/util/options/vueOptions";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

export default {
  name: "municipal-cutfill",
  mixins: [loadingM3ds],
  data() {
    return {
      terrainHeight: 30,
      drawTexture: "",
      drawItems: ['polygon', 'rect']
    };
  },
  props: {
    ...panelOptions,
    ...vueOptions,
    title: {
      type: String,
      default: '填挖方分析'
    },
    drawTextures: {
      type: Array,
      default: () => {
        return [];
      },
    }
  },
  destroyed() {
    this.removeAll();
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
      this.drawOper.removeDrawEntities();
      const {payload} = drawRes;
      const positions = [...payload, payload[0]];
      let tileset = this.m3ds.find((t) => t.layerId) || this.m3ds[0];
      let transform = tileset.root.transform;
      this.view.viewer.scene.globe.depthTestAgainstTerrain = true;
      const pointArr = [];
      const pointL = [];
      //坐标转换、处理
      for (let i = 0; i < positions.length - 1; i++) {
        let point = positions[i];
        let resPoint = new Cesium.Cartesian3;
        let invserTran = new Cesium.Matrix4;
        Cesium.Matrix4.inverse(transform, invserTran);
        Cesium.Matrix4.multiplyByPoint(invserTran, point, resPoint);
        pointArr.push(resPoint);

        let ellipsoid = this.view.viewer.scene.globe.ellipsoid;
        let cartesian3 = new Cesium.Cartesian3(point.x, point.y, point.z);
        let cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        let lat = Cesium.Math.toDegrees(cartographic.latitude);
        let lng = Cesium.Math.toDegrees(cartographic.longitude);
        let alt = cartographic.height;
        pointL.push(lng, lat, alt);
      }
      const {_minHeight} = this.emgManager.calMinTerrainHeight(positions);
      //绘制纹理
      this.emgManager.drawTexture([...positions, positions[0]], this.terrainHeight, this.drawTexture);
      this.emgManager.dig(pointArr, this.terrainHeight, this.layerIndexs ? this.layerIndexs : null);
      // 获取填挖分析的结果
      this.emgManager.cutFillAna(positions, _minHeight, (result) => {
        this.eventBus.$emit('sendCutFillResult', result);
      });
    },
    drawArea() {
      this.removeAll();
      this.drawOper && this.drawOper.enableDrawPolygon();
    },
    changeTexture(texture) {
      this.drawTexture = texture;
    }
  }
};
</script>

<style scoped lang="scss">
.activeTexture {
  background-color: #fff;
  border-radius: 50%;
  border: 1px solid blue;
}
</style>
