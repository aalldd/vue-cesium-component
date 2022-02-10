<!--/**-->
<!--* 洪水淹没分析-基于平台二次封装-->
<!--* 参数列表-->
<!--* created by wangshiyang    2021.11.25-->
<!--*/-->
<template>
  <div class="flood">
    <municipal-rain :draggable="draggable" @close="$emit('onClose')" v-if="needRain" title="降雨信息"
                    :panel-style="panelStyle" :panel-class-name="panelClassName" :rain-level="rainLevel"></municipal-rain>
    <municipal-panel :draggable="draggable" @close="$emit('onClose')" :title="title" :closable="closable"
                     :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
      <template v-slot:content>
        <div class="content">
          <a-row>
            <div class="input-item" v-for="(item,key) in renderData" :key="key">
              <span class="input-tag">{{ item.itemName }}</span>
              <a-input v-model="item.itemValue"
                       v-if="item.uniqueKey!=='floodColor'"
                       :disabled="(item.uniqueKey==='startHeight' || item.uniqueKey==='maxHeight') && terrainMode"></a-input>
              <mapgis-ui-sketch-color-picker
                v-else
                :color.sync="item.itemValue"
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
    </municipal-panel>
  </div>
</template>

<script>
import {
  colorToCesiumColor,
  isDepthTestAgainstTerrainEnable,
  setDepthTestAgainstTerrainEnable,
  calMinTerrainHeight
} from "@/util/util";
import PanelOpts from '@/util/panelOptions'
import VueOptions from '@/util/vueOptions'

export default {
  name: 'municipal-flood',
  inject: ['Cesium', 'CesiumZondy', 'webGlobe'],
  props: {
    components: {
      type: Array,
      default: () => {
        return [{itemName: '淹没速度', itemValue: 1, uniqueKey: 'speed'},
          {
            itemName: '最低高度',
            itemValue: 0,
            uniqueKey: 'startHeight'
          }, {
            itemName: '最高高度',
            itemValue: 0,
            uniqueKey: 'maxHeight'
          }, {
            itemName: '淹没高度',
            itemValue: 10,
            uniqueKey: 'floodHeight'
          }, {
            itemName: '反射光线强度',
            itemValue: 2,
            uniqueKey: 'specularIntensity'
          }, {
            itemName: '水波高度',
            itemValue: 10,
            uniqueKey: 'amplitude'
          }, {
            itemName: '水纹速度',
            itemValue: 0.01,
            uniqueKey: 'animationSpeed'
          }, {
            itemName: '水纹频率',
            itemValue: 500,
            uniqueKey: 'frequency'
          }, {
            itemName: '洪水颜色',
            itemValue: 'rgba(149,232,249,0.5)',
            uniqueKey: 'floodColor'
          }];
      }
    },
    ...VueOptions,
    ...PanelOpts,
    needRain: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: '淹没分析'
    },
    //是否要开启地形模式，地形模式开启，将自动计算地形高度，用户将无法改变最小淹没高度
    terrainMode: {
      type: Boolean,
      default: true
    },
    panelStyle: {
      type: Object,
      default: () => {
        return {
          width: '400px', marginBottom: '20px'
        };
      }
    },
    rainLevel: {
      type: Array,
      default: () => {
        return [{rain: '小雨', level: '0——0.41', rainSpeed: 4},
          {rain: '中雨', level: '0.41——1.04', rainSpeed: 8},
          {rain: '大雨', level: '1.04——2.08', rainSpeed: 12},
          {rain: '暴雨', level: '2.08——4.17', rainSpeed: 20},
          {rain: '大暴雨', level: '4.17——10.41', rainSpeed: 30},
          {rain: '特大暴雨', level: '10.41——以上', rainSpeed: 50}];
      }
    },
    rainTitle: {
      type: String,
      default: '降雨信息'
    }
  },
  data() {
    return {
      //默认的洪水淹没参数
      params: [{itemName: '淹没速度', itemValue: 1, uniqueKey: 'speed'},
        {
          itemName: '最低高度',
          itemValue: 0,
          uniqueKey: 'startHeight'
        }, {
          itemName: '最高高度',
          itemValue: 0,
          uniqueKey: 'maxHeight'
        }, {
          itemName: '淹没高度',
          itemValue: 10,
          uniqueKey: 'floodHeight'
        }, {
          itemName: '反射光线强度',
          itemValue: 2,
          uniqueKey: 'specularIntensity'
        }, {
          itemName: '水波高度',
          itemValue: 10,
          uniqueKey: 'amplitude'
        }, {
          itemName: '水纹速度',
          itemValue: 0.01,
          uniqueKey: 'animationSpeed'
        }, {
          itemName: '水纹频率',
          itemValue: 500,
          uniqueKey: 'frequency'
        }, {
          itemName: '洪水颜色',
          itemValue: 'rgba(149,232,249,0.5)',
          uniqueKey: 'floodColor'
        }],
      renderData: [],
      maxTerrainHeight: 0,
      positions: null
    };
  },
  watch: {
    //将用户传入的参数和默认的参数进行合并
    components: {
      handler() {
        //先合并
        this.params = this.params
          .map(item => {
            const value = this.components.find(component => component.uniqueKey === item.uniqueKey);
            return Object.assign(item, value);
          });
        this.renderData = this.params.filter(item => {
          return this.components.map(item => item.itemName).indexOf(item.itemName) < 0 ? false : !this.terrainMode && item.uniqueKey === 'floodHeight' ? false : true;
        });
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
        params
      } = this;
      const floodColor = params.find(item => item.uniqueKey === 'floodColor').itemValue;
      const floodSpeed = params.find(item => item.uniqueKey === 'speed').itemValue;
      const specularIntensity = params.find(item => item.uniqueKey === 'specularIntensity').itemValue;
      const amplitude = params.find(item => item.uniqueKey === 'amplitude').itemValue;
      const animationSpeed = params.find(item => item.uniqueKey === 'animationSpeed').itemValue;
      const frequency = params.find(item => item.uniqueKey === 'frequency').itemValue;
      const maxHeight = params.find(item => item.uniqueKey === 'maxHeight').itemValue;
      let startHeight = params.find(item => item.uniqueKey === 'startHeight').itemValue;
      let floodHeight = params.find(item => item.uniqueKey === 'floodHeight').itemValue;
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
      if (this.terrainMode && (Number(floodHeight) + _minHeight) >= _maxHeight) {
        maxFloodheight = _maxHeight;
        floodHeight = _maxHeight - _minHeight;
      } else if (this.terrainMode) {
        maxFloodheight = Number(floodHeight) + _minHeight;
      } else {
        maxFloodheight = maxHeight;
      }

      if (this.terrainMode) {
        startHeight = _minHeight;
      }

      // 初始化洪水淹没分析类
      floodAnalysis =
        floodAnalysis ||
        advancedAnalysisManager.createFlood(positions, {
          // 设置洪水淹没区域动画最低高度
          minHeight: Number(0), // 设置洪水淹没区域动画最低高度
          // 设置洪水淹没区域最高高度
          maxHeight: Number(maxFloodheight),
          // 设置洪水上涨速度
          floodSpeed: Number(floodSpeed)
        });

      // 洪水淹没区域最低高度
      floodAnalysis.startHeight = Number(startHeight);
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
      this.params.forEach(param => {
        if (param.uniqueKey === 'startHeight') {
          param.itemValue = startHeight;
        }
        if (param.uniqueKey === 'floodHeight') {
          param.itemValue = floodHeight;
        }
        if (param.uniqueKey === 'maxHeight') {
          param.itemValue = maxFloodheight;
        }
      });
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
