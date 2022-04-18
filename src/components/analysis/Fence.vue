<template>
  <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <!--      绘制电子围栏-->
      <a-row class="input-item">
        <a-col :span="4">
          <span class="input-tag">绘制：</span>
        </a-col>
        <a-col :span="19" style="margin-left: 10px">
          <municipal-draw :vueKey="vueKey" enable-menu-control="func" :drawItems="drawItems" @load="onDrawLoad"
                          @drawcreate="handleDraw" :clampToGround="true">
          </municipal-draw>
        </a-col>
      </a-row>

      <a-row v-for="(item,index) in renderData" :key="index" class="input-item">
        <a-col :span="4">
          <span class="input-tag">{{ item.title }}：</span>
        </a-col>
        <a-col :span="19" v-if="item.uniKey==='planName'">
          <a-input v-model="item.value" style="margin-left: 10px" size="small"></a-input>
        </a-col>

        <a-col :span="9" v-if="['speed','maxHeight'].indexOf(item.uniKey)>=0">
          <a-slider
            v-model.number="item.value"
            :min="0"
            :max="item.uniKey==='speed'?speedList.length:100"
            style="min-width: 100px;margin-left: 10px"
          />
        </a-col>
        <a-col :span="9" v-if="['speed','maxHeight'].indexOf(item.uniKey)>=0">
          <a-input-number
            size="small"
            v-model.number="item.value"
            :min="0"
            :max="item.uniKey==='speed'?speedList.length:100"
            style="margin-left: 20px"
          />
        </a-col>

        <a-col :span="20" v-if="item.uniKey==='wallType'">
          <a-radio-group name="fenceType" v-model="item.value" style="margin-left: 10px">
            <a-radio v-for="item in fenceTypesCopy" :key="item.value" :value="item.value">
              {{ item.title }}
            </a-radio>
          </a-radio-group>
        </a-col>
      </a-row>

      <!--      预览模式下不支持保存-->
      <a-row style="justify-content: flex-end" class="input-item" v-if="status!=='preview'">
        <a-button @click="initForm" style="margin-right: 10px">重置</a-button>
        <a-button @click="savePlan" style="margin-right: 10px">保存</a-button>
        <a-button @click="startDisplay" type="primary">开始</a-button>
      </a-row>
    </template>
  </municipal-panel>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import vueOptions from "@/util/options/vueOptions";
import emgUtil from "@/util/helpers/emgUtil";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

export default {
  name: "municipal-fence",
  mixins: [loadingM3ds],
  data() {
    return {
      drawItems: ['polygon'],
      formData: [
        {
          uniKey: 'planName',
          title: '名称',
          value: '电子围栏1'
        }, {
          uniKey: 'speed',
          title: '速度',
          value: '1'
        }, {
          uniKey: 'maxHeight',
          title: '高度',
          value: '20'
        }, {
          uniKey: 'wallType',
          title: '效果',
          value: '0'
        }
      ],
      //用来初始化form的数据
      initData: [
        {
          uniKey: 'planName',
          title: '名称',
          value: '电子围栏1'
        }, {
          uniKey: 'speed',
          title: '速度',
          value: '1'
        }, {
          uniKey: 'maxHeight',
          title: '高度',
          value: '20'
        }, {
          uniKey: 'wallType',
          title: '效果',
          value: '0'
        }
      ],
      fenceTypesCopy: [{
        title: '闪烁',
        value: '0'
      }, {
        title: '呼吸灯',
        value: '1'
      }]
    };
  },
  props: {
    ...panelOptions,
    ...vueOptions,
    initFormData: {
      type: Array
    },
    fenceTypes: {
      type: Array,
      default: () => {
        return [{
          title: '呼吸灯',
          value: '0'
        }, {
          title: '闪烁',
          value: '1'
        }];
      }
    },
    status: [String],
    speedList: {
      type: Array,
      default: () => {
        return [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0.5];
      }
    }
  },
  watch: {
    initFormData: {
      handler() {
        if (this.initFormData?.length > 0) {
          this.formData = this.formData.map(item => {
            const target = this.initFormData.find(v => v.uniKey === item.uniKey);
            if (target) {
              item.value = target.value;
            }
            return item;
          });
          const dataWithout = this.initFormData.filter(item => {
            const target = this.formData.find(v => v.uniKey === item.uniKey);
            return !target;
          });
          this.formData = this.formData.concat(dataWithout);
          //添加默认数据
          this.initData = _.cloneDeep(this.formData);
          this.$nextTick(() => {
            //每次外界修改方案数据时，需要去渲染围栏效果
            this.renderFence();
          });
        }
      },
      immediate: true
    }
  },
  computed: {
    renderData() {
      return this.formData.map(item => {
        if (item.uniKey === 'speed' || item.uniKey === 'maxHeight') {
          item.value = Number(item.value);
        }
        return item;
      }).filter(item => item.title && item.title !== '');
    }
  },
  destroyed() {
    this.removeAll();
  },
  methods: {
    onDrawLoad(payload) {
      this.drawOper = payload;
    },
    handleDraw(drawRes) {
      const {payload} = drawRes;
      const pointArr = [];
      const minimumHeights = [];
      payload.map(item => {
        const {lng, lat, height} = this.emgManager.changeToLatAndTerrainHeight(item);
        pointArr.push(lng);
        pointArr.push(lat);
        minimumHeights.push(height);
      });
      this.setValue('pointArr', pointArr.join());
      this.setValue('minimumHeights', minimumHeights.join());
    },
    initForm() {
      this.formData = _.cloneDeep(this.initData);
    },
    savePlan() {
      //将传入的状态回传，外界根据这个状态，去决定点击保存是去修改数据还是新增
      const planData = this.formatData();
      if (!planData.pointArr) {
        this.$message.warn('请绘制电子围栏！');
        return;
      }

      if (!planData.planName) {
        this.$message.warn('请添加电子围栏名称！');
        return;
      }
      this.$emit('savePlan', planData, this.status);
    },
    startDisplay() {
      this.removeAll();
      this.renderFence();
    },
    renderFence() {
      if (!this.emgManager) {
        this.emgManager = new emgUtil(this.webGlobe);
      }
      this.webGlobe.viewer.entities.removeAll();
      const pointArr = this.getValue('pointArr').split(',').map(item => Number(item));
      const minimimHeights = this.getValue('minimumHeights').split(',').map(item => Number(item));
      const maxHeight = Number(this.getValue('maxHeight'));
      const wallType = this.getValue('wallType');
      const speed = Number(this.getValue('speed'));
      if (!pointArr || !minimimHeights) {
        this.$message.warn('请先绘制围栏区域！');
        return;
      }

      this.emgManager.drawFence(pointArr, minimimHeights, maxHeight, wallType, speed, this.speedList);
    },
    getValue(uniKey) {
      return this.formData.find(item => item.uniKey === uniKey).value;
    },
    setValue(uniKey, value) {
      let hasUniKey = this.formData.find(item => item.uniKey === uniKey);
      if (hasUniKey) {
        this.formData = this.formData.map(item => {
          if (item.uniKey === uniKey) {
            item.value = value;
          }
          return item;
        });
      } else {
        this.formData.push({
          uniKey: uniKey,
          value: value
        });
      }
    },
    formatData() {
      const result = {};
      this.formData.forEach(item => {
        result[item.uniKey] = item.value.toString();
      });
      return result;
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
</style>
