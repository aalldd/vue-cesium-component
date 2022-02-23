<template>
  <municipal-panel :title="title" @close="$emit('onClose')"
                   :closable="closable" :draggable="draggable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClass">
    <template v-slot:content>
      <a-table :columns="columns"
               :data-source="dataSource"
               :scroll="scrollStyle"
               :pagination="paginationCopy"
               @change="handleTableChange"
               :customRow="customRow"
               size="small"
               :load="load">
      </a-table>
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
import exportExcel from '@/util/exportExcel';

const exportTypes = [
  '导出全部', '导出当前页'
];
export default {
  name: 'municipal-result-simple',
  data() {
    return {
      panelWidth: 1000,
      exportType: exportTypes[0],
      exportTypes: exportTypes,
      paginationCopy: {}
    };
  },
  props: {
    title: {
      type: String,
      default: '结果面板'
    },
    draggable: {
      type: Boolean,
      default: false
    },
    closable: {
      type: Boolean,
      default: true
    },
    expandable: {
      type: Boolean,
      default: true
    },
    panelStyle: {
      type: Object
    },
    panelClassName: {
      type: String,
      default: ''
    },
    panelPosition: {
      type: String,
      default: 'bottom',
      validator(value) {
        return ['bottom', 'left', 'right'].indexOf(value) >= 0;
      }
    },
    load: {
      type: Boolean,
      default: false
    },
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
    },
    //导出excel的文件名称,仅用于导出全部
    exportFileName: {
      type: String,
      default: '全部数据'
    },
    pagination: {
      type: Object
    }
  },
  watch: {
    pagination: {
      handler() {
        this.paginationCopy = Object.assign({
          pageSize: 10,
          current: 1
        }, this.pagination);
      },
      immediate: true
    }
  },
  computed: {
    panelClass() {
      return {
        ['resultPanel']: true,
        [`${this.panelClassName}`]: true,
        [`position-${this.panelPosition}`]: true,
      };
    },
    scrollStyle() {
      if (this.panelPosition === 'bottom') {
        return {x: 400, y: 150};
      } else {
        return {x: 400, y: 400};
      }
    },
    tabStyle() {
      if (this.panelPosition === 'bottom') {
        return {height: '290px'};
      } else {
        return {height: '550px'};
      }
    }
  },
  methods: {
    //切换分页
    handleTableChange(pagination, filters, sorter) {
      const pager = {...this.paginationCopy};
      pager.current = pagination.current;
      this.paginationCopy = pager;
      this.$emit('onPageChange', this.paginationCopy);
    },
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
      console.log(sheetNames);
      console.log(exportData);
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
    },
    //点击行事件
    customRow(record, index) {
      return {
        on: {
          click: () => {
            this.$emit('onRowClick', record);
          }
        }
      };
    },
    //关闭结果面板
    onClose() {
      this.$emit('onClose');
    }
  }
};
</script>

<style lang="scss">
.resultPanel {
  ::v-deep .content {
    padding: 0 !important;
  }
}

.position-bottom {
  position: absolute;
  width: 95% !important;
  top: 550px !important;
  left: 2em !important;
}

.position-left {
  position: absolute;
  top: 2em !important;
  left: 4em !important;
  width: 30% !important;
}

.position-right {
  position: absolute;
  top: 2em !important;
  right: 4em !important;
  width: 30% !important;
}
</style>
