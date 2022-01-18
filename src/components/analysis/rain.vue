<template>
  <m-panel :draggable="draggable" :title="title" :need-expand="true" :panel-style="rainStyle">
    <template v-slot:extra>
      <span :style="{marginRight:'10px'}">展示降雨:</span>
      <a-switch default-checked @change="onToggleRain" :checked="raining"/>
    </template>
    <template v-slot:content>
      <a-row>
        <div class="rainItem">
          <a-col :span="6">
            <span>降雨等级:</span>
          </a-col>
          <a-col :span="18">
            <a-select :default-value="choosedLevel" class="select" @change="rainLevelChange">
              <a-select-option v-for="(item,index) in rainLevel" :value="item.rain" :key="index">
                <span>{{ item.rain }}</span>
                <span>({{ item.level }})</span>
              </a-select-option>
            </a-select>
          </a-col>
        </div>
      </a-row>
      <a-row>
        <div class="rainItem">
          <a-col :span="6">
            <span>小时降雨量:</span>
          </a-col>
          <a-col :span="18">
            <a-input v-model="rainMount" :disabled="true"></a-input>
          </a-col>
        </div>
      </a-row>
    </template>
  </m-panel>
</template>

<script>
import Panel from '../common/Panel';
import _ from 'lodash';

export default {
  name: "rain",
  inject: ['Cesium', 'CesiumZondy', 'webGlobe'],
  components: {
    'm-panel': Panel
  },
  data() {
    return {
      choosedLevel: '小雨',
      raining: true,
      rainMount: null,
      rainObj: null,
      defaultRainParams: {
        // 透明度
        alpha: 0.3,
        // 倾斜角度
        angle: 0,
        // 速度
        speed: 14,
        // 附加长度
        rainLength: 1,
        // 混合度
        factor: 0.2,
        // 亮度
        brightnessShift: 0,
        // 密度
        density: 0.3,
        // 色调
        hueShift: 1
      }
    };
  },
  mounted() {
    this.getCurrentRain();
  },
  destroyed() {
    this.removeRain();
  },
  watch: {
    choosedLevel: {
      handler() {
        this.getCurrentRain();
      },
      immediate: true
    },
    raining: {
      handler() {
        this.startRain();
      },
      immediate: true
    }
  },
  props: {
    rainLevel: {
      type: Array,
      default: () => {
        return [{rain: '小雨', level: '0——0.41'},
          {rain: '中雨', level: '0.41——1.04'},
          {rain: '大雨', level: '1.04——2.08'},
          {rain: '暴雨', level: '2.08——4.17'},
          {rain: '大暴雨', level: '4.17——10.41'},
          {rain: '特大暴雨', level: '10.41——以上'}];
      }
    },
    rainLevelToSpeed: {
      type: Object,
      default: () => {
        return {
          '小雨': 8,
          '中雨': 16,
          '大雨': 30,
          '暴雨': 60,
          '大暴雨': 100,
          '特大暴雨': 140
        };
      }
    },
    title: {
      type: String,
      default: '降雨信息'
    },
    rainStyle: {
      type: Object
    },
    draggable: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    rainLevelChange(value) {
      this.choosedLevel = value;
    },
    onToggleRain(checked) {
      this.raining = checked;
    },
    getCurrentRain() {
      this.rainMount = this.rainLevel.find(item => item.rain === this.choosedLevel).level;
      if (this.rainObj) {
        this.removeRain();
        this.startRain();
      }
    },
    startRain() {
      if (this.raining) {
        let currentSpeed, currentDensity;
        const defaultDensity = this.defaultRainParams.density;
        const defaultSpeed = this.defaultRainParams.speed;
        for (let key in this.rainLevelToSpeed) {
          if (key === this.choosedLevel) {
            currentSpeed = this.rainLevelToSpeed[key];
            const rate = (currentSpeed / defaultSpeed).toFixed(2);
            currentDensity = (rate * defaultDensity).toFixed(2);
          }
        }
        this.defaultRainParams.speed = currentSpeed;
        this.defaultRainParams.density = Number(currentDensity);
        const params = _.cloneDeep(this.defaultRainParams);
        this.rainObj = this.createRain(params);
      } else {
        this.removeRain();
      }
    },
    createRain(options) {
      const optionsParam = Cesium.defaultValue(options, {});
      const collection = this.webGlobe.viewer.scene.postProcessStages;
      const rain = Cesium.PostProcessStageLibrary.createRainStage(optionsParam);
      collection.add(rain);
      return rain;
    },
    removeRain() {
      if (this.rainObj) {
        this.webGlobe.viewer.scene.postProcessStages.remove(this.rainObj);
      }
    }
  }
};
</script>

<style scoped lang="scss">
.rainItem {
  margin: 5px 0;
  display: flex;
  align-items: center;
}

.select {
  width: 100%;
}
</style>
