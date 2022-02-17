<template>
  <municipal-panel :title="title" :draggable="draggable" @close="$emit('onClose')" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:extra>
      <div class="tools">
        <a-switch checked-children="显示" un-checked-children="隐藏" :checked="pathVisible" @change="showPath"/>
      </div>
    </template>
    <template v-slot:content>
      <a-row class="input-item" v-for="(item,index) in fixedRoamDataCopy" :key="index">
        <a-col :span="8">
          <span class="input-tag">{{ item.title }}</span>
        </a-col>
        <a-col :span="16" v-if="item.uniKey==='title'">
          <a-input style="width: 100%" v-model="item.value"></a-input>
        </a-col>

        <a-col :span="16" style="display:flex;justify-content: flex-start"
               v-if="item.uniKey==='model'">
          <a-select style="width: 100%" @change="modelChange"
                    :default-value="modelList[0].name">
            <a-select-option v-for="(jitem,index) in modelList" :value="jitem.value"
                             :key="index">
              {{ jitem.name }}
            </a-select-option>
          </a-select>
        </a-col>
        <a-col :span="16" style="display:flex;justify-content: flex-start"
               v-if="item.uniKey==='view'">
          <a-select style="width: 100%" @change="viewChange"
                    :default-value="viewList[0].name">
            <a-select-option v-for="(jitem,index) in viewList" :value="jitem.value"
                             :key="index">
              {{ jitem.name }}
            </a-select-option>
          </a-select>
        </a-col>

        <a-col :span="16" v-if="['speed','pitch','heading','distance'].indexOf(item.uniKey)>=0">
          <a-row style="align-items: center;display: flex;width: 100%">
            <a-col :span="12">
              <a-slider v-model="item.value" :min="-180" :max="180" style="min-width: 100px"/>
            </a-col>
            <a-col :span="12">
              <a-input-number
                v-model="item.value"
                :min="-180"
                :max="180"
                style="margin-left: 4px"
              />
            </a-col>
          </a-row>
        </a-col>

        <a-col :span="16" style="display:flex;justify-content: flex-start" v-if="item.uniKey==='loop'">
          <a-radio-group :options="loopOption" :default-value="item.value" @change="changeLoop"/>
        </a-col>

        <a-col :span="16">
          <div style="display: flex;justify-content: flex-start" v-if="item.uniKey==='path'">
            <municipal-draw
              :vueKey="vueKey"
              :enable-menu-control="false"
              @load="onDrawLoad"
              @drawcreate="handleDraw"
            >
              <municipal-icon
                name="-vector-polyline"
                style="cursor: pointer"
                @click="activeDraw"
              ></municipal-icon>
            </municipal-draw>
          </div>
        </a-col>
      </a-row>
      <a-row class="input-item">
        <a-col :span="24" style="display:flex;justify-content: flex-end">
          <div style="display: flex;justify-content: flex-start">
            <a-button style="margin-right: 10px" @click="startRoam">
              开始漫游
            </a-button>
            <a-button @click="stopRoam" style="margin-right: 10px">
              结束漫游
            </a-button>
            <a-button @click="saveRoam">
              保存漫游参数
            </a-button>
          </div>
        </a-col>
      </a-row>
    </template>
  </municipal-panel>
</template>

<script>
import VueOptions from "@/util/vueOptions";
import PanelOpts from '@/util/panelOptions';
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

export default {
  name: "municipal-fix-roam",
  inject: ["Cesium", "CesiumZondy", "webGlobe"],
  mixins: [loadingM3ds],
  data() {
    return {
      pathVisible: true,
      isRoaming: false,
      loopOption: ['是', '否'],
      fixedRoamDataCopy: [{
        title: '漫游方案名称',
        value: '场景漫游方案',
        uniKey: 'title'
      }, {
        title: '漫游模型',
        value: '',
        uniKey: 'model'
      }, {
        title: '漫游视角',
        value: 0,
        uniKey: 'view'
      }, {
        title: '漫游速度',
        value: 30,
        uniKey: 'speed'
      }, {
        title: '俯仰角度',
        value: -10,
        uniKey: 'pitch'
      }, {
        title: '方位角度',
        value: 90,
        uniKey: 'heading'
      }, {
        title: '视角距离',
        value: 16,
        uniKey: 'distance'
      }, {
        title: '循环漫游',
        value: '是',
        uniKey: 'loop'
      }, {
        title: '绘制路径',
        value: null,
        uniKey: 'path'
      }],
      path: []
    };
  },
  props: {
    ...VueOptions,
    ...PanelOpts,
    modelList: {
      type: Array,
      default: () => {
        return [{
          name: '消防车',
          value: ''
        }, {
          name: '小车',
          value: ''
        }, {
          name: '特警车',
          value: ''
        }, {
          name: '人',
          value: ''
        }, {
          name: '无人机',
          value: ''
        }];
      }
    },
    viewList: {
      type: Array,
      default: () => {
        return [{
          name: '自由视角',
          value: 1
        }, {
          name: '第一视角',
          value: 2
        }, {
          name: '上帝视角',
          value: 3
        }];
      }
    },
    fixedRoamData: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  watch: {
    fixedRoamData: {
      handler() {
        //将外面传进来的场景漫游数据与data里面的备份数据合并
        if (this.fixedRoamData?.length > 0) {
          this.fixedRoamDataCopy = this.fixedRoamDataCopy.map(item => {
            const target = this.fixedRoamData.find(data => data.uniKey === item.uniKey);
            if (target) {
              return Object.assign(item, target);
            } else {
              return item;
            }
          });
        }
      },
      immediate: true,
      deep: true
    },
    modelList: {
      handler() {
        if (this.modelList?.length && this.fixedRoamDataCopy?.length) {
          this.fixedRoamDataCopy = this.fixedRoamDataCopy.map(item => {
            if (item.uniKey === 'model') {
              item.value = this.modelList[0].value;
            }
            return item;
          });
        }
      },
      immediate: true
    },
    viewList: {
      handler() {
        if (this.viewList?.length && this.fixedRoamDataCopy?.length) {
          this.fixedRoamDataCopy = this.fixedRoamDataCopy.map(item => {
            if (item.uniKey === 'view') {
              item.value = this.viewList[0].value;
            }
            return item;
          });
        }
      },
      immediate: true
    },
    fixedRoamDataCopy: {
      handler() {
        if (this.fixedRoamDataCopy?.length && this.isRoaming) {
          this.startRoam();
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    showPath() {
      this.pathVisible = !this.pathVisible;
      this.isRoaming && this.startRoam();
    },
    modelChange(val) {
      this.changeFixedData(val, 'model');
    },
    viewChange(val) {
      this.changeFixedData(val, 'view');
    },
    changeLoop(e) {
      this.changeFixedData(e.target.value, 'loop');
    },
    changeFixedData(value, uniKey) {
      this.fixedRoamDataCopy = this.fixedRoamDataCopy.map(data => {
        if (data.uniKey === uniKey) {
          data.value = value;
          return data;
        }
        return data;
      });
    },
    onDrawLoad(payload) {
      this.drawOper = payload;
    },
    handleDraw(result) {
      const lats = result.map(item => this.emgManager.Cartesian3ToLat(item));
      lats.forEach(item => {
        const longtitude = item?.lng;
        const latitude = item?.lat;
        const height = item?.height;
        this.path.push(...[longtitude, latitude, height]);
      });
      this.isRoaming && this.startRoam();
    },
    activeDraw() {
      this.drawOper && this.drawOper.enableDrawLine();
    },
    findValue(uniKey) {
      return this.fixedRoamDataCopy.find(item => item.uniKey === uniKey)?.value;
    },
    startRoam() {
      //防止视点跳转
      this.webGlobe.viewer.trackedEntity = undefined;
      this.removeAll();
      !!this.animationAnalyse && this.animationAnalyse.stop();
      const loop = this.findValue('loop') === '是' ? true : false;
      const modelUrl = this.findValue('model');
      const view = this.findValue('view');
      const speed = this.findValue('speed');
      const heading = this.findValue('heading');
      const pitch = this.findValue('pitch');
      const range = this.findValue('distance');

      this.animationAnalyse = new Cesium.AnimationAnalyse(this.webGlobe.viewer, {
        exHeight: 1,
        isLoop: loop,
        modelUrl: modelUrl,
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(this.path),
        animationType: Number(view),
        showPath: this.pathVisible,
        speed: speed,
        heading: Cesium.Math.toRadians(parseInt(heading)),
        pitch: Cesium.Math.toRadians(parseInt(pitch)),
        range: range
      });
      this.animationAnalyse.start();
      this.animationAnalyse._animationModel.model.minimumPixelSize = 5;
      this.isRoaming = true;
    },
    stopRoam() {
      this.animationAnalyse && this.animationAnalyse.stop();
      this.isRoaming = false;
    },
    saveRoam() {
      this.$emit('saveRoam', Object.assign(this.fixedRoamDataCopy, {path: this.path}));
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

  .input-tag {
    display: flex;
    justify-content: flex-start;
  }
}

.tools {
  display: flex;
  align-items: center;
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

.sliderWrapper {
  display: flex;
}
</style>
