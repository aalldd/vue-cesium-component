<template>
  <municipal-panel :title="title" @onClose="onClose"
                   :closable="closable" :draggable="draggable"
                   :width="panelWidthCopy"
                   :height="height"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClass">
    <template v-slot:content>
      <a-table :columns="columns"
               :data-source="dataSource"
               :scroll="scrollStyle"
               :row-selection="rowSelection"
               :pagination="paginationCopy"
               @change="handleTableChange"
               :customRow="customRow"
               size="small"
               :load="load">
      </a-table>
      <slot></slot>
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
  </municipal-panel>
</template>
<script>
import exportExcel from '@/util/operators/exportExcel';
import resultMixin from "@/util/mixins/resultMixin";

const exportTypes = [
  '导出全部', '导出当前页'
];
export default {
  name: 'municipal-result-simple',
  mixins:[resultMixin],
  data() {
    return {
      exportType: exportTypes[0],
      exportTypes: exportTypes
    };
  },
  props: {
    dataSource: {
      type: Array,
      default: () => {
        return [];
      }
    },
    columns: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  methods: {
    //变更导出方式
    exportData(value) {
      this.exportType = value;
      value === exportTypes[0] && this.exportAll();
      value === exportTypes[1] && this.exportPage();
      return;
    },
    //导出所有标签栏中的数据
    exportAll() {
      const sheetNames = [this.exportFileName];
      const exportData = [this.dataSource];
      exportExcel(exportData, sheetNames, this.exportFileName);
    },
    //导出当前表格页
    exportPage() {
      const pageSize = this.paginationCopy.pageSize;
      const current = this.paginationCopy.current;
      const target = this.dataSource;
      const sheetNames = [`${this.exportFileName}-第${current}页`];
      const exportData = [target.slice((current - 1) * pageSize, current * pageSize)];
      exportExcel(exportData, sheetNames, this.exportFileName);
    }
  }
};
</script>
