<!--/**-->
<!--* 洪水淹没分析-基于平台二次封装-->
<!--* 参数列表-->
<!--* created by wangshiyang    2021.11.25-->
<!--*/-->
<template>
  <div class="flood">
    <rain :draggable="draggable" v-if="needRain" title="降雨信息" :rain-style="{
    width:'400px',marginBottom:'20px'
  }"></rain>
    <m-panel :draggable="draggable" :title="title" :need-close="closeable" :need-expand="expandable" :panel-style="{
    width:'400px'
  }">
      <template v-slot:content>
        <div class="content">
          <a-row>
            <div class="input-item" v-if="components.indexOf('淹没速度')>=0">
              <span class="input-tag">淹没速度:</span>
              <a-input v-model="floodSpeed"></a-input>
            </div>
            <div class="input-item" v-if="components.indexOf('最低高度')>=0">
              <span class="input-tag">最低高度:</span>
              <a-input v-model="startHeight" :disabled="!minHeightControl"></a-input>
            </div>
            <div class="input-item" v-if="components.indexOf('最高高度')>=0">
              <span class="input-tag">最高高度:</span>
              <a-input v-model="maxHeight" :disabled="true"></a-input>
            </div>
            <div class="input-item" v-if="components.indexOf('淹没高度')>=0">
              <span class="input-tag">淹没高度:</span>
              <a-input v-model="floodHeight"></a-input>
            </div>
            <div class="input-item" v-if="components.indexOf('反射光线强度')>=0">
              <span class="input-tag">反射光线强度:</span>
              <a-input v-model="specularIntensity"></a-input>
            </div>
            <div class="input-item" v-if="components.indexOf('水波高度')>=0">
              <span class="input-tag">水波高度:</span>
              <a-input v-model="amplitude"></a-input>
            </div>
            <div class="input-item" v-if="components.indexOf('水纹速度')>=0">
              <span class="input-tag">水纹速度:</span>
              <a-input v-model="animationSpeed"></a-input>
            </div>
            <div class="input-item" v-if="components.indexOf('水纹频率')>=0">
              <span class="input-tag">水纹频率:</span>
              <a-input v-model="frequency"></a-input>
            </div>
            <div class="input-item" v-if="components.indexOf('洪水颜色')>=0">
              <span class="input-tag">洪水颜色:</span>
              <mapgis-ui-sketch-color-picker
                :color.sync="floodColor"
                :disableAlpha="false"
                class="colorPicker"
              ></mapgis-ui-sketch-color-picker>
            </div>
          </a-row>
        </div>
        <div class="buttons">
          <a-button type="primary" @click="analysis">分析</a-button>
          <a-button type="info" @click="remove">清除</a-button>
        </div>
      </template>
    </m-panel>
  </div>
</template>

<script>
import {
  colorToCesiumColor,
  isDepthTestAgainstTerrainEnable,
  setDepthTestAgainstTerrainEnable,
  calMinTerrainHeight
} from "../../util/util";
import Panel from '../common/Panel';
import Rain from './rain';

export default {
  name: 'municipal-flood',
  inject: ['Cesium', 'CesiumZondy', 'webGlobe'],
  components: {
    'm-panel': Panel,
    'rain': Rain
  },
  props: {
    components: {
      type: Array,
      default: () => {
        return ['淹没速度', '最低高度', '最高高度', '淹没高度', '反射光线强度', '水波高度', '水纹速度', '水纹频率', '洪水颜色'];
      }
    },
    vueKey: {
      type: String,
      default: 'default'
    },
    vueIndex: {
      type: Number
    },
    needRain: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: '淹没分析'
    },
    closeable: {
      type: Boolean,
      default: true
    },
    expandable: {
      type: Boolean,
      default: true
    },
    draggable:{
      type:Boolean,
      default:true
    },
    //是否需要自己控制最小的淹没高度，如果不控制，默认取范围内的最小地形高度
    minHeightControl: {
      type: Boolean,
      default: false
    },
    //是否可以淹没超过最大地形高度，默认值否
    allowFloodOverTerrain: {
      type: Boolean,
      default: false
    },
    initMinHeight: {
      type: Number,
      default: 0
    },
    initFloodSpeed: {
      type: Number,
      default: 1
    },
    initFloodColor: {
      type: String,
      default: 'rgba(149,232,249,0.5)'
    },
    initStartHeight: {
      type: Number,
      default: 0
    },
    initSpecularIntensity: {
      type: Number,
      default: 2
    },
    initAmplitude: {
      type: Number,
      default: 10
    },
    initAnimationSpeed: {
      type: Number,
      default: 0.01
    },
    initFrequency: {
      type: Number,
      default: 500
    },
    initIsDepthTestAgainstTerrainEnable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      floodSpeed: 1,
      floodColor: 'rgba(149,232,249,0.5)',
      //淹没水体起始高度
      startHeight: 0,
      //淹没动画起始高度
      minHeight: 0,
      specularIntensity: 2,
      amplitude: 10,
      animationSpeed: 0.01,
      frequency: 500,
      //淹没高度，洪水距离最小地面高程淹没的深度
      floodHeight: 10,
      maxTerrainHeight: 0
    };
  },
  computed: {
    maxHeight: {
      get() {
        if (!this.allowFloodOverTerrain && (Number(this.startHeight) + Number(this.floodHeight)) >= Number(this.maxTerrainHeight)) {
          return Number(this.maxTerrainHeight);
        } else {
          return Number(this.startHeight) + Number(this.floodHeight);
        }
      },
      set(value) {
        this.maxHeight = Number(value);
      }
    }
  },
  watch: {
    initMinHeight: {
      handler() {
        this.minHeight = this.initMinHeight;
      },
      immediate: true
    },
    initFloodSpeed: {
      handler() {
        this.floodSpeed = this.initFloodSpeed;
      },
      immediate: true
    },
    initFloodColor: {
      handler() {
        this.floodColor = this.initFloodColor;
      },
      immediate: true
    },
    initStartHeight: {
      handler() {
        this.startHeight = this.initStartHeight;
      },
      immediate: true
    },
    initSpecularIntensity: {
      handler() {
        this.specularIntensity = this.initSpecularIntensity;
      },
      immediate: true
    },
    initAmplitude: {
      handler() {
        this.amplitude = this.initAmplitude;
      },
      immediate: true
    },
    initAnimationSpeed: {
      handler() {
        this.animationSpeed = this.initAnimationSpeed;
      },
      immediate: true
    },
    initFrequency: {
      handler() {
        this.frequency = this.initFrequency;
      },
      immediate: true
    }
  },
  mounted() {
    if (!this.$parent.vueKey) {
      this.$message.warn('分析功能组件需挂载在地图组件之上！');
      return;
    }
    this.mount();
  },
  destroyed() {
    this.unmount();
  },
  methods: {
    async createCesiumObject() {
      return new Promise(
        resolve => {
          resolve();
        },
        reject => {
        }
      );
    },
    mount() {
      const {webGlobe, CesiumZondy, vueKey, vueIndex} = this;
      const {viewer} = webGlobe;
      const vm = this;
      let promise = this.createCesiumObject();
      promise.then(function (dataSource) {
        vm.$emit("load", vm);
        CesiumZondy.FloodAnalysisManager.addSource(
          vueKey,
          vueIndex,
          dataSource,
          {
            drawElement: null,
            floodAnalysis: null
          }
        );
      });
    },
    unmount() {
      let {CesiumZondy, vueKey, vueIndex} = this;
      let find = CesiumZondy.FloodAnalysisManager.findSource(vueKey, vueIndex);
      if (find) {
        this.remove();
      }
      CesiumZondy.FloodAnalysisManager.deleteSource(vueKey, vueIndex);
      this.$emit("unload", this);
    },
    /**
     * @description rgba值转cesium内部color对象
     * @param rgba - {String} rgba值
     * @return {Object} cesium内部color对象
     */
    _getColor(rgba) {
      return colorToCesiumColor(rgba, this.webGlobe);
    },
    /**
     * @description 开始绘制并分析
     */
    analysis() {
      const {CesiumZondy, vueKey, vueIndex} = this;
      const options = this._getSourceOptions();
      let {drawElement} = options;
      const {viewer} = this.webGlobe;
      // 初始化交互式绘制控件
      drawElement = drawElement || new Cesium.DrawElement(viewer);
      CesiumZondy.FloodAnalysisManager.changeOptions(
        vueKey,
        vueIndex,
        "drawElement",
        drawElement
      );

      // 激活交互式绘制工具
      drawElement.startDrawingPolygon({
        // 绘制完成回调函数
        callback: positions => {
          this.remove();
          this.positions = positions;
          this._doAnalysis();
        }
      });
    },
    /**
     * @description 进行洪水淹没分析
     */
    _doAnalysis() {
      const {positions} = this;
      if (!positions) {
        this.$message.warning("请绘制分析区域");
        return;
      }
      const {CesiumZondy, vueKey, vueIndex} = this;
      const options = this._getSourceOptions();
      let {floodAnalysis} = options;
      const {viewer} = this.webGlobe;
      const {
        floodColor,
        floodSpeed,
        specularIntensity,
        amplitude,
        animationSpeed,
        frequency
      } = this;
      // 初始化高级分析功能管理类
      const advancedAnalysisManager = new this.CesiumZondy.Manager.AdvancedAnalysisManager(
        {
          viewer: viewer
        }
      );
      const {_minHeight, _maxHeight} = calMinTerrainHeight(this.webGlobe, positions);
      //将最大地形高度保存，供计算淹没高度
      this.maxTerrainHeight = _maxHeight;

      let maxFloodheight;
      if (!this.allowFloodOverTerrain && (Number(this.floodHeight) + _minHeight) >= _maxHeight) {
        maxFloodheight = _maxHeight;
        this.floodHeight = _maxHeight - _minHeight;
      } else {
        maxFloodheight = Number(this.floodHeight) + _minHeight;
      }

      if (!this.minHeightControl) {
        this.startHeight = _minHeight;
      }

      // 初始化洪水淹没分析类
      floodAnalysis =
        floodAnalysis ||
        advancedAnalysisManager.createFlood(positions, {
          // 设置洪水淹没区域动画最低高度
          minHeight: Number(this.minHeight), // 设置洪水淹没区域动画最低高度
          // 设置洪水淹没区域最高高度
          maxHeight: Number(maxFloodheight),
          // 设置洪水上涨速度
          floodSpeed: Number(floodSpeed)
        });

      // 洪水淹没区域最低高度
      floodAnalysis.startHeight = Number(this.startHeight);
      // 洪水颜色
      floodAnalysis.floodColor = this._getColor(floodColor);
      // 水纹频率 指波浪的个数
      floodAnalysis.frequency = Number(frequency);
      // 水纹速度
      floodAnalysis.animationSpeed = Number(animationSpeed);
      // 水波的高度
      floodAnalysis.amplitude = Number(amplitude);
      // 指定光线强度
      floodAnalysis.specularIntensity = Number(specularIntensity);

      this.isDepthTestAgainstTerrainEnable = isDepthTestAgainstTerrainEnable(
        this.webGlobe
      );
      if (!this.isDepthTestAgainstTerrainEnable) {
        // 如果深度检测没有开启，则开启
        setDepthTestAgainstTerrainEnable(true, this.webGlobe);
      }
      // 添加洪水淹没结果显示
      this.webGlobe.scene.VisualAnalysisManager.add(floodAnalysis);
      this.mHeight = maxFloodheight;
      CesiumZondy.FloodAnalysisManager.changeOptions(
        vueKey,
        vueIndex,
        "floodAnalysis",
        floodAnalysis
      );
    },
    /**
     * @description 获取SourceOptions,以方便获取洪水淹没分析对象和绘制对象
     * @return SourceOptions对象
     */
    _getSourceOptions() {
      const {CesiumZondy, vueKey, vueIndex} = this;
      const find = CesiumZondy.FloodAnalysisManager.findSource(
        vueKey,
        vueIndex
      );
      const {options} = find;
      return options;
    },
    /**
     * @description 重新进行洪水淹没分析
     */
    refresh() {
      this._removeFlood();
      this._doAnalysis();
    },
    /**
     * @description 恢复深度检测设置
     */
    _restoreDepthTestAgainstTerrain() {
      if (
        this.isDepthTestAgainstTerrainEnable !== undefined &&
        this.isDepthTestAgainstTerrainEnable !==
        isDepthTestAgainstTerrainEnable(this.webGlobe)
      ) {
        setDepthTestAgainstTerrainEnable(
          this.isDepthTestAgainstTerrainEnable,
          this.webGlobe
        );
      }
    },
    /**
     * @description 移除洪水淹没分析结果
     */
    _removeFlood() {
      const {CesiumZondy, vueKey, vueIndex} = this;
      const options = this._getSourceOptions();
      const {floodAnalysis} = options;

      // 判断是否已有洪水淹没分析结果
      if (floodAnalysis) {
        // 移除洪水淹没分析显示结果
        this.webGlobe.scene.VisualAnalysisManager.remove(floodAnalysis);
        CesiumZondy.FloodAnalysisManager.changeOptions(
          vueKey,
          vueIndex,
          "floodAnalysis",
          null
        );
      }
      this._restoreDepthTestAgainstTerrain();
    },
    /**
     * @description 移除洪水淹没分析结果，取消交互式绘制事件激活状态，恢复深度检测设置
     */
    remove() {
      this._removeFlood();
      const {CesiumZondy, vueKey, vueIndex} = this;
      const options = this._getSourceOptions();
      const {drawElement} = options;

      if (drawElement) {
        // 取消交互式绘制事件激活状态
        drawElement.stopDrawing();
        CesiumZondy.FloodAnalysisManager.changeOptions(
          vueKey,
          vueIndex,
          "drawElement",
          null
        );
      }

      this.positions = null;
      this.recalculate = false;
    }
  }
};
</script>

<style scoped lang="scss">
.buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  > button {
    margin: 0 10px;
  }
}

.flood {
  position: absolute;
  right: 4em;
  top: 4em;
}

.input-item {
  display: flex;
  align-items: center;
  margin: 10px 0;

  .input-tag {
    margin-right: 20px;
  }
}

.colorPicker {
  flex: 1;
  max-width: 200px;
}
</style>
