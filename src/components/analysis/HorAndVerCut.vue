<template>
  <div>
    <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                     :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
      <template v-slot:content>
        <a-row>
          <a-col :span="4" class="input-item">
            <span class="input-tag">截面绘制:</span>
          </a-col>
          <a-col :span="4" class="input-item" style="justify-content: center">
            <div class="icon-wrapper" @click="query">
              <municipal-icon name="-vector-point"></municipal-icon>
            </div>
          </a-col>
          <a-col :span="16" class="input-item">
            <a-radio-group name="cutType" v-model="choosedType">
              <a-radio v-for="item in cutTypeList" :key="item" :value="item">
                {{ item }}
              </a-radio>
            </a-radio-group>
          </a-col>
        </a-row>
      </template>
    </municipal-panel>
    <municipal-cursor-tip v-if="cursorVisible" :container="container">
      <span>左键选择管段,右键取消</span>
    </municipal-cursor-tip>
  </div>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import vueOptions from "@/util/options/vueOptions";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

export default {
  name: "municipal-horvercut",
  mixins: [loadingM3ds],
  data() {
    return {
      cutTypeList: ['横断面', '纵断面'],
      drawItems: ['point'],
      choosedType: '横断面',
      cursorVisible: false,
      container: document.getElementsByClassName('cesium-viewer'),
      pointArray: [],
      pointXy: [],
      layerIds: [],
      objectIds: []
    };
  },
  props: {
    ...panelOptions,
    ...vueOptions,
    title: {
      type: String,
      default: '断面分析'
    }
  },
  methods: {
    query() {
      this.removeAll();
      this.cursorVisible = true;
      if (!this.mouseEventManager) {
        //构造鼠标事件管理对象
        this.mouseEventManager = new CesiumZondy.Manager.MouseEventManager({
          viewer: this.view.viewer
        });
      }
      //注册鼠标左键单击事件
      this.mouseEventManager.registerMouseEvent('LEFT_CLICK', (movement) => this.leftClick(movement));
      //注册鼠标右键单击事件
      this.mouseEventManager.registerMouseEvent('RIGHT_CLICK', () => {
        this.mouseEventManager.unRegisterMouseEvent('LEFT_CLICK');
        this.mouseEventManager.unRegisterMouseEvent('RIGHT_CLICK');
        this.cursorVisible = false;
      });
    },
    leftClick(movement) {
      if (this.choosedType === '纵断面') {
        const pickedFeature = this.view.scene.pick(movement.position);
        //layerId
        if (!pickedFeature) {
          this.$message.warning("请选择实体设备！");
          return;
        }
        if (pickedFeature.primitive.layerId) {
          this.layerIds.push(pickedFeature.primitive.layerId);
        } else {
          const targetLayer = this.m3ds.find(item => item.layerIndex === pickedFeature.tileset.layerIndex);
          this.layerIds.push(targetLayer.layerId);
        }

        //ObjectId
        const propertys = pickedFeature.getPropertyNames();
        let objectId = '';
        if (propertys.includes('name')) {
          objectId = pickedFeature.getProperty('name').split('_')[2];
          this.objectIds.push(objectId);
        } else if (propertys.includes('OID')) {
          objectId = pickedFeature.getProperty('OID');
          this.objectIds.push(objectId);
        } else {
          return;
        }

        if (objectId === "0") {
          this.$message.warning("模型未加载完成");
          return;
        }
      }
      const {lng, lat, height} = this.emgManager.getPosition(movement);
      //将区域转成模型坐标
      const point = this.emgManager.positionTransfer({lng, lat, height});
      this.pointXy.push(point);
      this.pointArray.push(...[lng, lat, height]);
      //画点
      const fillColor = new Cesium.Color(255 / 255, 255 / 255, 0 / 255, 1);
      //边线颜色
      const outLineColor = new Cesium.Color(255 / 255, 0 / 255, 0 / 255, 1);
      this.entityController.appendPointComm(
        //经度、纬度、高程
        lng, lat, height,
        //名称、描述
        '点', "横断面两点",
        //附加属性：像素大小、颜色、外边线颜色、边线宽度
        {
          pixelSize: 12,
          color: fillColor,
          outlineColor: outLineColor,
          outlineWidth: 2
        }
      );
      if (this.pointArray.length > 3) {
        //绘制线（名称、点数组、线宽、线颜色、是否识别带高度的坐标、是否贴地形、附加属性）
        this.entityController.appendLine('贴地线', this.pointArray, 8, new Cesium.Color(255 / 255, 0 / 255, 0 / 255, 0.8), true, false, {});
      }
      if (this.pointArray.length === 6) {
        this.choosedType === '横断面' && this.getCrossSectionData();
        this.choosedType === '纵断面' && this.ConnectionJudgeNew();
        this.pointArray = [];
        this.pointXy = [];
        this.layerIds = [];
        this.objectIds = [];
        this.mouseEventManager && this.mouseEventManager.unRegisterMouseEvent('LEFT_CLICK');
        this.cursorVisible = false;
      }
    },
    //横断面
    getCrossSectionData() {
      const params = {
        point0: {
          x: this.pointXy[0][0] + this.offset[0],
          y: this.pointXy[0][1] + this.offset[1],
          spatialReference: {wkid: 1}
        },
        point1: {
          x: this.pointXy[1][0] + this.offset[0],
          y: this.pointXy[1][1] + this.offset[1],
          spatialReference: {wkid: 1}
        },
      };
      this.$emit('queryCross', {...this.commonParam, ...params});
    },
    //纵断面，先调一下联通分析
    ConnectionJudgeNew() {
      const params = {
        layerId0: this.layerIds[0],
        layerId1: this.layerIds[1],
        objectId0: this.objectIds[0],
        objectId1: this.objectIds[1]
      };
      console.log(params);
      this.$emit('queryVer', {...this.commonParam, ...params});
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

  .input-tag {
    display: flex;
    justify-content: center;
  }
}

.icon-wrapper {
  font-size: 16px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;

  &:hover {
    background-color: $highlight-color;
  }
}
</style>
