<template>
  <municipal-panel :draggable="draggable" @close="$emit('onClose')" :title="title" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <a-row class="input-item">
        <a-col :span="6">
          <span class="input-tag">开挖深度</span>
        </a-col>
        <a-col :span="10">
          <a-slider v-model="digDistance" :min="1" :max="100"/>
        </a-col>
        <a-col :span="4">
          <a-input-number v-model="digDistance" :min="1" :max="100" style="marginLeft: 16px"/>
        </a-col>
      </a-row>
      <a-row class="input-item">
        <a-col :span="6">
          <span class="input-tag">开挖材质</span>
        </a-col>
        <a-col :span="10" :style="{display:'flex'}">
          <div v-for="(item,index) in drawTextures" :key="index"
               style="margin: 0 5px;display: flex;align-items: center;justify-content: center">
            <a-popover>
              <template slot="content">
                <div style="width: 130px;height: 130px">
                  <img :src="item" style="width: 100%;height: 100%">
                </div>
              </template>
              <div :class="item===drawTexture && activeTexture" class="textrue">
                <a-avatar :src="item" size="small" @click="changeTexture(item)"/>
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
import PanelOpts from '@/util/panelOptions';
import loadingM3ds from '@/util/mixins/withLoadingM3ds';

export default {
  name: "municipal-dynacut",
  inject: ['Cesium', 'CesiumZondy', 'webGlobe'],
  mixins: [loadingM3ds],
  props: {
    ...VueOptions,
    ...PanelOpts,
    //用来控制开挖的材质，字符串数组，里面是图片的url
    drawTextures: {
      type: Array,
      default: () => {
        return [];
      }
    },
    // 绘制开挖的形状，矩形，多边形，圆三种
    drawTools: {
      type: Array,
      default: () => {
        return ['square', 'polygon'];
      }
    },
    //用来指定地上图层的layerIndex,
    layerIndexs: {
      type: Array
    }
  },
  data() {
    return {
      digDistance: 0,
      drawTexture: '',
      drawRange: [],
      sArea: 0,
      fArea: 0,
      heightRange: ''
    };
  },
  computed: {
    activeTexture() {
      return 'activeTexture';
    }
  },
  methods: {
    onDrawLoad(payload) {
      this.drawOper = payload;
    },
    handleDraw(payload) {
      this.drawRange = payload;
      this.dynacut();
    },
    changeTexture(textureUrl) {
      this.drawTexture = textureUrl;
    },
    dynacut() {
      this.emgManager.removeAll();
      let tileset = this.m3ds.find(t => t.layerId) || this.m3ds[0];
      let transform = tileset.root.transform;
      const Cesium = this.Cesium;
      const pointArr = [];
      const pointL = [];
      if (this.drawRange?.length) {
        for (let i = 0; i < this.drawRange.length - 1; i++) {
          let point = this.drawRange[i];
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
        }
        // 获取地形最小高度
        const {_minHeight} = this.emgManager.calMinTerrainHeight(this.drawRange);
        //绘制纹理
        this.emgManager.drawTexture([...this.drawRange, this.drawRange[0]], _minHeight - this.digDistance, this.drawTexture);
        this.cutFillAna(this.drawRange, _minHeight);
        const dynacut = this.emgManager.dig(pointArr, this.digDistance, this.layerIndexs ? this.layerIndexs : null);
        const data = {
          dynacut,
          minHeight: _minHeight - this.digDistance,
          positions: this.drawRange
        };
        //通过回调，将所有信息回传出去，开挖实例，填挖方实例，填挖方数据，开挖深度，开挖范围
        this.$emit('onDynacut', data);
      }
    },
    cutFillAna(positions, terrainHeight) {
      const view = this.webGlobe;
      view.viewer.scene.globe.depthTestAgainstTerrain = false;
      //初始化高级分析功能管理类
      const advancedAnalysisManager = new CesiumZondy.Manager.AdvancedAnalysisManager({
        viewer: view.viewer
      });
      const targetHeight = terrainHeight - this.digDistance;
      //创建填挖方实例
      const cutFill = advancedAnalysisManager.createCutFill(2.0, {
        //设置x方向采样点个数
        xPaneNum: 12,
        //设置y方向采样点个数参数
        yPaneNum: 12,
        //设置填挖规整高度
        height: targetHeight,
        //返回结果的回调函数
        callback: (result) => {
          this.heightRange = result.minHeight.toFixed(2) + '~' + result.maxHeight.toFixed(2);
          this.sArea = result.surfaceArea;
          this.fArea = result.cutVolume;
          const data = {
            heightRange: this.heightRange,
            sArea: this.sArea,
            fArea: this.fArea
          };
          this.$emit('onCutFill', data);
        }
      });
      //开始执行填挖方分析
      advancedAnalysisManager.startCutFill(cutFill, positions);
    },
    activeTools(tool) {
      switch (tool) {
        case 'polygon':
          this.drawOper.enableDrawPolygon();
          return;
        case 'square':
          this.activeRect();
          return;
        case 'circle':
          this.drawOper.enableDrawCircle();
          return;
        default:
          break;
          return;
      }
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
          this.drawRange = Cesium.Cartesian3.fromDegreesArrayHeights([...cnw, ...cne, ...cse, ...csw, ...cnw]);
          //构造区对象
          let polygon = {
            name: "矩形",
            polygon: {
              //坐标点
              hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights([...cnw, ...cne, ...cse, ...csw]),
              //是否指定各点高度
              perPositionHeight: true,
              //颜色
              material: new Cesium.Color(33 / 255, 150 / 255, 243 / 255, 0.3),
              //轮廓线是否显示
              outline: true,
              //轮廓线颜色
              outlineColor: Cesium.Color.BLACK
            }
          };
          //绘制图形通用方法：对接Cesium原生特性
          this.entityController.appendGraphics(polygon);
          this.dynacut();
        }
      });
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

.activeTexture {
  background-color: #fff;
  border-radius: 50%;
  border: 1px solid blue;
}

.textrue {
  padding: 2px;
}
</style>
