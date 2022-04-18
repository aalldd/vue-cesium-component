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
        <a-row v-for="(item,index) in fixedRoamDataCopy" :key="index">
          <div v-if="item.visible" style="width: 100%" class="input-item">
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

            <a-col :span="16" style="display:flex;justify-content: flex-start" v-if="item.uniKey==='isLoop'">
              <a-radio-group :value="item.value" @change="changeLoop">
                <a-radio :value="1">是</a-radio>
                <a-radio :value="0">否</a-radio>
              </a-radio-group>
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
          </div>
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
      modify: false,
      currentModel: '',
      currentView: '',
      isLoop: false,
      roamTitle: '',
      defaultRoamData: [],
      //用来渲染界面的数据，可以由外部决定，不传就用默认的
      fixedRoamDataCopy: [{
        title: '漫游方案名称',
        value: '场景漫游方案',
        uniKey: 'planName',
        visible: true
      }, {
        title: '漫游模型',
        value: '',
        uniKey: 'model',
        visible: true
      }, {
        title: '漫游视角',
        value: '',
        uniKey: 'angle',
        visible: true
      }, {
        title: '漫游速度',
        value: 30,
        uniKey: 'speed',
        visible: true
      }, {
        title: '俯仰角度',
        value: -10,
        uniKey: 'pitch',
        visible: true
      }, {
        title: '方位角度',
        value: 90,
        uniKey: 'heading',
        visible: true
      }, {
        title: '视角距离',
        value: 16,
        uniKey: 'range',
        visible: true
      }, {
        title: '循环漫游',
        value: 1,
        uniKey: 'isLoop',
        visible: true
      }, {
        title: '绘制路径',
        value: null,
        uniKey: 'route',
        visible: true
      }],
      path: [],
      detailVisibleCopy: false,
      //用来表示修改的方案的id
      id: null
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
          this.defaultRoamData = _.cloneDeep(this.fixedRoamDataCopy);
        }
      },
      immediate: true,
      deep: true
    },
    modelList: {
      handler() {
        this.initModel();
      },
      immediate: true
    },
    viewList: {
      handler() {
        this.initView();
      },
      immediate: true
    },
    //针对data的监听，当表单中任意数据改变的时候，如果处于漫游状态，重新漫游，视角改变，改变页面结构，同步改变表单数据，模型改变，改变表单数据
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
    },
    currentView: {
      handler() {
        //针对不同的漫游视角，需要去控制显示参数
        const changeVisible = (unikeyList, status) => {
          if (this.fixedRoamDataCopy?.length) {
            this.fixedRoamDataCopy = this.fixedRoamDataCopy.map(item => {
              if (unikeyList.indexOf(item.uniKey) >= 0) {
                item.visible = status;
              }
              return item;
            });
          }
        };
        //每次漫游视角改变之后，需要同步去改变当前数据fixedRoamDataCopy中angle的值
        this.changeFixedData(this.currentView, 'angle');
        if (this.currentView === '自由视角') {
          changeVisible(['heading', 'pitch', 'range'], false);
          changeVisible(['speed'], true);
        } else if (this.currentView === '上帝视角') {
          changeVisible(['heading', 'pitch'], false);
          changeVisible(['speed', 'range'], true);
        } else {
          changeVisible(['speed', 'range', 'heading', 'pitch'], true);
        }
      },
      immediate: true
    },
    currentModel: {
      handler() {
        this.changeFixedData(this.currentModel, 'model');
      },
      immediate: true
    }
  },
  destroyed() {
    this.emgManager.removeAll();
    this.webGlobe.viewer.trackedEntity = undefined;
    this.stopRoam();
  },
  mounted() {
    this.defaultRoamData = _.cloneDeep(this.fixedRoamDataCopy);
    this.resetForm();
  },
  methods: {
    onClose() {
      this.emgManager.removeAll();
      this.webGlobe.viewer.trackedEntity = undefined;
      this.stopRoam();
      this.drawOper.removeDrawEntities();
      this.detailVisibleCopy = false;
    },
    initModel() {
      if (this.modelList?.length && this.fixedRoamDataCopy?.length) {
        this.currentModel = this.modelList[0].name;
      }
    },
    initView() {
      if (this.viewList?.length && this.fixedRoamDataCopy?.length) {
        this.currentView = this.viewList[0].name;
      }
    },
    showPath() {
      this.pathVisible = !this.pathVisible;
      this.isRoaming && this.startRoam();
    },
    modelChange(val) {
      this.currentModel = val;
    },
    viewChange(val) {
      this.currentView = val;
    },
    changeLoop(e) {
      this.changeFixedData(e.target.value, 'isLoop');
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
      this.path = [];
      const {payload: result} = drawRes;
      const lats = result.map(item => this.emgManager.Cartesian3ToLat(item));
      lats.forEach(item => {
        const longtitude = item?.lng;
        const latitude = item?.lat;
        const height = item?.height;
        this.path.push(...[longtitude, latitude, height]);
      });
      this.isRoaming && this.startRoam();
      this.drawOper.removeDrawEntities();
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
      let isLoop = this.findValue('isLoop');
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
        isLoop: isLoop,
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
      this.$emit('saveRoam', planData, this.id);
    },
    addRoamPlan() {
      this.stopRoam();
      this.roamTitle = '新增漫游方案';
      this.preview = false;
      this.modify = false;
      this.detailVisibleCopy = true;
      this.resetForm();
    },
    //点击修改，预览需要用外部数据去修改表单的数据，而不是重置为默认值
    initForm(record) {
      //消除antd的props数据校验错误
      for (let key in record) {
        if (['range', 'heading', 'pitch', 'speed'].indexOf(key) >= 0) {
          record[key] = Number(record[key]);
        }
      }
      this.id = record.ID;
      this.currentModel = record['model'];
      this.currentView = record['angel'];
      this.detailVisibleCopy = true;
      this.fixedRoamDataCopy = this.fixedRoamDataCopy.map(item => {
        if (Object.keys(record).indexOf(item.uniKey) >= 0) {
          item.value = record[item.uniKey];
        }
        //为什么要单独对视角进行处理，传入的视角字段名是angle，但是传出的视角字段名是angel
        if (item.uniKey === 'angle') {
          item.value = record['angel'];
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
      this.modify = true;
      this.initForm(record);
    },
    deleteRoamPlan(record) {
      this.stopRoam();
      this.$emit('deleteRoamPlan', record);
    },
    //将表单数据完全重置为默认值
    resetForm() {
      this.id = null;
      this.fixedRoamDataCopy = _.cloneDeep(this.defaultRoamData);
      this.initModel();
      this.initView();
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
