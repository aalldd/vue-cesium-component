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
        <a-table :columns="columnsCopy"
                 :data-source="dataSource"
                 :scroll="scrollStyle"
                 :row-selection="rowSelection"
                 :pagination="paginationCopy"
                 @change="handleTableChange"
                 :customRow="customRow"
                 size="small"
                 v-if="dataSource.length>0"
                 :bordered="true">
        </a-table>
        <a-empty v-else></a-empty>
      </a-spin>
      <slot></slot>
    </template>
    <template v-slot:extra>
      <div class="export" v-if="needExport">
        <a-select style="width: 120px" @change="exportData" :default-value="exportTypes[0]" size="small">
          <a-select-option v-for="(item,index) in exportTypes" :key="index" :value="item">
            {{ item }}
          </a-select-option>
        </a-select>
      </div>
      <slot name="extra"></slot>
    </template>
    <!--    表格的弹出框-->
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
import resultMixin from "@/util/mixins/resultMixin";

const exportTypes = [
  '导出全部', '导出当前页'
];
export default {
  name: 'municipal-result-simple',
  mixins: [resultMixin],
  data() {
    return {
      exportType: exportTypes[0],
      exportTypes: exportTypes,
      columnsCopy: []
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
  watch: {
    columns: {
      handler() {
        if (this.columns?.length > 0) {
          const extraOption = {
            ellipsis: true,
            scopedSlots: {customRender: 'popover'}
          };
          this.columnsCopy = this.columns.map(item => {
            return {
              ...extraOption,
              ...item
            };
          });
        }
      },
      immediate: true
    }
  },
  methods: {
    //变更导出方式
    exportData(value) {
      this.exportType = value;
      value === exportTypes[0] && this.exportAll();
      value === exportTypes[1] && this.exportPage();

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
