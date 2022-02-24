<template>
  <municipal-panel :title="title" @close="$emit('onClose')"
                   :closable="closable" :draggable="draggable"
                   :width="panelWidthCopy"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClass">
    <template v-slot:content>
      <a-tabs
        :default-active-key="choosedTabIndex"
        tab-position="top"
        type="card"
        size="small"
        @change="onTabsChange"
      >
        <a-tab-pane v-for="(item,index) in tabs" :key="index" :tab="item.tabName">
          <a-table :columns="item.columns"
                   :data-source="item.features"
                   :scroll="scrollStyle"
                   :pagination="paginationCopy"
                   @change="handleTableChange"
                   :customRow="customRow"
                   size="small"
                   :load="load">
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </template>
    <template v-slot:extra>
      <div class="export">
        <a-select :value="exportType" style="width: 120px" @change="exportData" size="small">
          <a-select-option v-for="(item,index) in exportTypes" :key="index" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </div>
    </template>
  </municipal-panel>
</template>
<script>
import exportExcel from '@/util/operators/exportExcel';
import resultMixin from "@/util/mixins/resultMixin";
import _ from 'lodash';

const exportTypes = [
  '导出全部', '导出当前页签', '导出当前页'
];
export default {
  name: 'municipal-result-common',
  mixins:[resultMixin],
  data() {
    return {
      exportType: exportTypes[0],
      exportTypes: exportTypes,
      choosedTabIndex: 0
    };
  },
  props: {
    tabs: {
      type: Array,
      default: () => {
        return [];
      },
      //tabs中必须包含标签名，数据，数据列,导出文件名
      validator(value) {
        const results = value.map(item => {
          const intersection = _.intersection(Object.keys(item), ['tabName', 'features', 'columns', 'exportFileName']);
          return intersection.length === 4;
        });
        return !results.includes(false);
      }
    }
  },
  methods: {
    //标签变更事件
    onTabsChange(value) {
      this.choosedTabIndex = value;
      this.$emit('onTabsChange', this.tabs[value]);
    },
    //变更导出方式
    exportData(value) {
      this.exportType = value;
      value === exportTypes[0] && this.exportAll();
      value === exportTypes[1] && this.exportTab();
      value === exportTypes[2] && this.exportPage();
      return;
    },
    //导出所有标签栏中的数据
    exportAll() {
      const sheetNames = this.tabs.map(item => item.tabName);
      const exportData = this.tabs.map(item => {
        return item.features;
      });
      exportExcel(exportData, sheetNames, this.exportFileName);
    },
    //导出当前标签栏中的表格数据
    exportTab() {
      const target = this.tabs[this.choosedTabIndex];
      const sheetNames = [target.tabName];
      const exportData = [target.features];
      exportExcel(exportData, sheetNames, target.exportFileName || this.exportFileName);
    },
    //导出当前表格页
    exportPage() {
      const pageSize = this.paginationCopy.pageSize;
      const current = this.paginationCopy.current;
      const target = this.tabs[this.choosedTabIndex];
      const sheetNames = [target.tabName];
      const exportData = [target.features.slice((current - 1) * pageSize, current * pageSize)];
      exportExcel(exportData, sheetNames, target.exportFileName || this.exportFileName);
    }
  }
};
</script>
