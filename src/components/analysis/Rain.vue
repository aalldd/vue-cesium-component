<template>
  <municipal-panel :draggable="draggable" @click="$emit('onClose')" :title="title" :need-expand="true"
                   :panel-class-name="panelClassName" :panel-style="panelStyle">
    <template v-slot:extra>
      <span :style="{marginRight:'10px'}">展示降雨:</span>
      <a-switch @change="onToggleRain" :checked="raining"/>
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
  </municipal-panel>
</template>

<script>
import VueOptions from '@/util/vueOptions';

export default {
  name: "municipal-rain",
  inject: ['Cesium', 'CesiumZondy', 'webGlobe'],
  data() {
    return {
      choosedLevel: '小雨',
      raining: false,
      rainMount: null,
      defaultRainParams: {
        // 透明度
        alpha: 0.3,
        // 倾斜角度
        angle: 0,
        // 速度
        speed: 6,
        // 附加长度
        rainLength: 1,
        // 混合度
        factor: 0.2,
        // 亮度
        brightnessShift: 0,
        // 密度
        density: 0.1,
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
    }
  },
  props: {
    ...VueOptions,
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
    title: {
      type: String,
      default: '降雨信息'
    },
    panelStyle: {
      type: Object,
      default: () => {
        return {
          width: '400px', marginBottom: '20px', position: 'absolute', left: '4em', top: '4em'
        };
      }
    },
    draggable: {
      type: Boolean,
      default: true
    },
    panelClassName: {
      type: String,
      default: ''
    }
  },
  methods: {
    rainLevelChange(value) {
      this.choosedLevel = value;
    },
    onToggleRain(checked) {
      this.raining = checked;
      if (checked) {
        this.startRain();
      } else {
        this.removeRain();
      }
    },
    getCurrentRain() {
      this.rainMount = this.rainLevel.find(item => item.rain === this.choosedLevel).level;
      if (this.rainObj) {
        this.removeRain();
        this.startRain();
      }
    },
    startRain() {
      this.defaultRainParams.speed = Number(this.rainLevel.find(item => item.rain === this.choosedLevel).rainSpeed);
      this.createRain(this.defaultRainParams);
    },
    createRain(options) {
      const optionsParam = Cesium.defaultValue(options, {});
      const collection = this.webGlobe.viewer.scene.postProcessStages;
      this.rainObj = Cesium.PostProcessStageLibrary.createRainStage(optionsParam);
      collection.add(this.rainObj);
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
