<template>
  <div>
    <municipal-panel v-if="detailVisibleCopy" :title="roamTitle" :draggable="draggable" @onClose="onClose"
                     :closable="closable"
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
          <a-col :span="16" v-if="item.uniKey==='planName'">
            <a-input style="width: 100%" v-model="item.value"></a-input>
          </a-col>

          <a-col :span="16" style="display:flex;justify-content: flex-start"
                 v-if="item.uniKey==='model'">
            <a-select style="width: 100%" @change="modelChange"
                      :value="currentModel">
              <a-select-option v-for="(jitem,index) in modelList" :value="jitem.name"
                               :key="index">
                {{ jitem.name }}
              </a-select-option>
            </a-select>
          </a-col>
          <a-col :span="16" style="display:flex;justify-content: flex-start"
                 v-if="item.uniKey==='angle'">
            <a-select style="width: 100%" @change="viewChange"
                      :value="currentView">
              <a-select-option v-for="(jitem,index) in viewList" :value="jitem.name"
                               :key="index">
                {{ jitem.name }}
              </a-select-option>
            </a-select>
          </a-col>

          <a-col :span="16" v-if="['speed','pitch','heading','range'].indexOf(item.uniKey)>=0">
            <a-row style="align-items: center;display: flex;width: 100%">
              <a-col :span="12">
                <a-slider v-model="item.value" :min="item.uniKey==='speed' || item.uniKey==='range'?0:-180" :max="180"
                          style="min-width: 100px;margin-right: 10px"/>
              </a-col>
              <a-col :span="12">
                <a-input-number
                  v-model="item.value"
                  :min="item.uniKey==='speed' || item.uniKey==='range'?0:-180"
                  :max="180"
                />
              </a-col>
            </a-row>
          </a-col>

          <a-col :span="16" style="display:flex;justify-content: flex-start" v-if="item.uniKey==='loop'">
            <a-radio-group :options="loopOption" :value="item.value" @change="changeLoop"/>
          </a-col>

          <a-col :span="16">
            <div style="display: flex;justify-content: flex-start" v-if="item.uniKey==='route'">
              <municipal-draw
                :vueKey="vueKey"
                enable-menu-control="func"
                :drawItems="drawItems"
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
        <a-row class="input-item" v-if="!preview">
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
    <municipal-plan-mananger v-if="planVisible" :title="title" :draggable="draggable" @close="$emit('onPlanClose')"
                             :closable="closable" :dataSource="roamPlanData"
                             @addPlan="addRoamPlan"
                             @onRowClick="previewRoamPlan"
                             @modifyPlan="modifyRoamPlan"
                             @deletePlan="deleteRoamPlan"
                             :loading="loading"
                             :need-expand="expandable" :panel-class-name="panelClassName">

    </municipal-plan-mananger>
  </div>
</template>

<script>
import VueOptions from "@/util/options/vueOptions";
import PanelOpts from '@/util/options/panelOptions';
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

export default {
  name: "municipal-fix-roam",
  inject: ["Cesium", "CesiumZondy", "webGlobe"],
  mixins: [loadingM3ds],
  data() {
    return {
      drawItems: ['line'],
      pathVisible: true,
      isRoaming: false,
      loopOption: ['是', '否'],
      showRoamDetail: true,
      preview: false,
      currentModel: '',
      currentView: '',
      isLoop: false,
      roamTitle: '',
      //用来渲染界面的数据，可以由外部决定，不传就用默认的
      fixedRoamDataCopy: [{
        title: '漫游方案名称',
        value: '场景漫游方案',
        uniKey: 'planName'
      }, {
        title: '漫游模型',
        value: '',
        uniKey: 'model'
      }, {
        title: '漫游视角',
        value: '',
        uniKey: 'angle'
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
        uniKey: 'range'
      }, {
        title: '循环漫游',
        value: '是',
        uniKey: 'loop'
      }, {
        title: '绘制路径',
        value: null,
        uniKey: 'route'
      }],
      path: [],
      detailVisibleCopy: false
    };
  },
  props: {
    ...VueOptions,
    ...PanelOpts,
    modelList: {
      type: Array,
      require: true,
      default: () => {
        return [];
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
    },
    //外部通过服务获取的漫游方案数据
    roamPlanData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    planVisible: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
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
          this.currentModel = this.modelList[0].name;
          this.fixedRoamDataCopy = this.fixedRoamDataCopy.map(item => {
            if (item.uniKey === 'model') {
              item.value = this.modelList[0].name;
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
          this.currentView = this.viewList[0].name;
          this.fixedRoamDataCopy = this.fixedRoamDataCopy.map(item => {
            if (item.uniKey === 'angle') {
              item.value = this.viewList[0].name;
            }
            return item;
          });
        }
      },
      immediate: true
    },
    fixedRoamDataCopy: {
      handler() {
        const start = _.debounce(() => {
          if (this.fixedRoamDataCopy?.length && this.isRoaming) {
            this.startRoam();
          }
        }, 400);
        start();
      },
      immediate: true,
      deep: true
    }
  },
  destroyed() {
    this.webGlobe.viewer.trackedEntity = undefined;
    this.stopRoam();
  },
  methods: {
    onClose() {
      this.stopRoam();
      this.detailVisibleCopy = false;
    },
    showPath() {
      this.pathVisible = !this.pathVisible;
      this.isRoaming && this.startRoam();
    },
    modelChange(val) {
      this.currentModel = val;
      this.changeFixedData(val, 'model');
    },
    viewChange(val) {
      this.currentView = val;
      this.changeFixedData(val, 'angle');
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
    handleDraw(drawRes) {
      const {payload: result} = drawRes;
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
      this.stopRoam();
      this.removeAll();
      !!this.animationAnalyse && this.animationAnalyse.stop();
      let loop;
      loop = this.findValue('loop') === '是';
      const model = this.findValue('model');
      const angle = this.findValue('angle');
      const speed = this.findValue('speed');
      const heading = this.findValue('heading');
      const pitch = this.findValue('pitch');
      const range = this.findValue('range');
      const modelUrl = this.modelList.find(item => item.name === model).value;
      const view = this.viewList.find(item => item.name === angle).value;

      if (!this.path?.length) {
        this.$message.warn('请先绘制漫游路线');
      }

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
      if (this.animationAnalyse._animationModel) {
        this.animationAnalyse._animationModel.model.minimumPixelSize = 5;
      }
      this.isRoaming = true;
    },
    stopRoam() {
      this.animationAnalyse && this.animationAnalyse.stop();
      this.isRoaming = false;
    },
    saveRoam() {
      this.changeFixedData("'" + this.path.join() + "'", 'route');
      const planData = {isVisible: this.pathVisible ? '是' : '否'};
      this.fixedRoamDataCopy.forEach(item => {
        planData[item.uniKey] = item.value;
      });
      this.$emit('saveRoam', planData);
    },
    addRoamPlan() {
      this.stopRoam();
      this.roamTitle = '新增漫游方案';
      this.preview = false;
      this.detailVisibleCopy = true;
    },
    initForm(record) {
      //消除antd的props数据校验错误
      for (let key in record) {
        if (['range', 'heading', 'pitch', 'speed'].indexOf(key) >= 0) {
          record[key] = Number(record[key]);
        }
      }
      this.currentModel = record['model'];
      this.currentView = record['angel'];
      this.detailVisibleCopy = true;
      this.fixedRoamDataCopy = this.fixedRoamDataCopy.map(item => {
        if (Object.keys(record).indexOf(item.uniKey) >= 0) {
          item.value = record[item.uniKey];
        }
        if (record?.isVisible === '是') {
          this.pathVisible = true;
        } else {
          this.pathVisible = false;
        }
        if (record?.route !== '') {
          this.path = record.route.split(',').map(item => Number(item));
        }
        return item;
      });
      this.startRoam();
    },
    previewRoamPlan(record) {
      this.roamTitle = `预览${record.planName}方案`;
      this.preview = true;
      this.initForm(record);
    },
    modifyRoamPlan(record) {
      this.roamTitle = `修改${record.planName}方案`;
      this.preview = false;
      this.initForm(record);
    },
    deleteRoamPlan(record) {
      this.stopRoam();
      this.$emit('deleteRoamPlan', record);
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
