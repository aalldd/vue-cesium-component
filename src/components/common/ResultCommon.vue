<template>
  <municipal-panel :title="title" @onClose="onClose"
                   :closable="closable" :draggable="draggable"
                   :width="panelWidthCopy"
                   :height="height"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClass">
    <template v-slot:content>
      <a-spin :spinning="load">
        <div v-if="fileUrl && displayImg">
          <div style="display: flex;justify-content: flex-end;align-items: center">
            <a-button style="margin-right: 10px" @click="show">查看大图</a-button>
            <a-button @click="downLoadImg">下载</a-button>
          </div>
          <Viewer @inited="inited">
            <img :src="fileUrl" alt="" style="width:100%;height:300px">
          </Viewer>
        </div>
        <a-tabs
          :default-active-key="choosedTabIndex"
          tab-position="top"
          type="card"
          size="small"
          v-if="tabs.length>0"
          @change="onTabsChange"
        >
          <a-tab-pane v-for="(item,index) in tabsCopy" :key="index" :tab="item.tabName">
            <a-table :columns="item.columns"
                     :data-source="item.features"
                     :scroll="scrollStyle"
                     :pagination="paginationCopy"
                     :row-selection="rowSelection"
                     @change="handleTableChange"
                     :customRow="customRow"
                     size="small"
                     :bordered="true">
            </a-table>
          </a-tab-pane>
        </a-tabs>
        <a-empty v-else></a-empty>
      </a-spin>
    </template>
    <template v-slot:extra>
      <div class="export" v-if="needExport">
        <a-select :value="exportType" style="width: 120px" @change="exportData" size="small">
          <a-select-option v-for="(item,index) in exportTypes" :key="index" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </div>
    </template>
    <template slot="popover" slot-scope="record">
      <a-popover>
        <template slot="content">
          <div>
            {{ record.title }}
          </div>
        </template>
        <div>
          {{ record.title }}
        </div>
      </a-popover>
    </template>
  </municipal-panel>
</template>
<script>
import exportExcel from '@/util/operators/exportExcel';
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import resultMixin from "@/util/mixins/resultMixin";
import _ from 'lodash';

const exportTypes = [
  '导出全部', '导出当前页签', '导出当前页'
];
export default {
  name: 'municipal-result-common',
  mixins: [loadingM3ds, resultMixin],
  data() {
    return {
      exportType: exportTypes[0],
      exportTypes: exportTypes,
      choosedTabIndex: 0,
      tabsCopy: []
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
  watch: {
    tabs: {
      handler() {
        if (this.tabs?.length > 0) {
          const extraOption = {
            ellipsis: true,
            scopedSlots: {customRender: 'popover'}
          };
          this.tabsCopy = this.tabs.map(tab => {
            if (tab.columns) {
              tab.columns = tab.columns.map(item => {
                return {
                  ...extraOption,
                  ...item
                };
              });
            }
            return tab;
          });
        }
      },
      immediate: true
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
