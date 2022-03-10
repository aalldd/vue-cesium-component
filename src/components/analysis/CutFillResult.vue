<template>
  <municipal-panel v-show="resultVisible" :title="title" :draggable="draggable" @onClose="$emit('onClose')"
                   :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <a-row class="input-item" v-for="(item,index) in attr" :key="index">
        <a-col :span="6">
          <span class="input-tag">{{ item.title }}:</span>
        </a-col>
        <a-col :span="18">
          <div class="itemWrapper">
            <a-input disabled :value="item.value"/>
          </div>
        </a-col>
      </a-row>
    </template>
  </municipal-panel>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

export default {
  name: "municipal-cutfillresult",
  mixins: [loadingM3ds],
  data() {
    return {
      resultVisible: false,
      attr: [{
        title: '高程范围(m)',
        value: '',
        unikey: 'heightRange'
      }, {
        title: '表面积(㎡)',
        value: '',
        unikey: 'surfaceArea'
      }, {
        title: '挖体积(m³)',
        value: '',
        unikey: 'cutVolume'
      }, {
        title: '填体积(m³)',
        value: '',
        unikey: 'fillVolume'
      }]
    };
  },
  props: {
    ...panelOptions,
    title: {
      type: String,
      default: '填挖方分析结果'
    }
  },
  mounted() {
    this.eventBus.$on('sendCutFillResult', (result) => {
      const {cutVolume, fillVolume, maxHeight, minHeight, surfaceArea} = result;
      const newData = {
        cutVolume,
        fillVolume,
        heightRange: `${minHeight.toFixed(2)}~${maxHeight.toFixed(2)}`,
        surfaceArea
      };
      console.log(newData);
      this.attr = this.attr.map(item => {
        if (Object.keys(newData).indexOf(item.unikey) >= 0) {
          item.value = newData[item.unikey];
        }
        return item;
      });
      this.resultVisible = true;
      console.log(this.attr);
    });
  }
};
</script>

<style scoped>

</style>
