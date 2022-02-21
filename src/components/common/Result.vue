<template>
  <municipal-panel :title="title" :draggable="false" @close="$emit('onClose')"
                   :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClass">
    <template v-slot:content>
      <a-tabs
        :default-active-key="choosedTabIndex"
        tab-position="top"
        type="card"
        @change="onTabsChange"
        :style="tabStyle"
      >
        <a-tab-pane v-for="(item,index) in tabs" :key="index" :tab="item.tabName">
          <a-table :columns="item.columns"
                   :data-source="item.features"
                   :scroll="scrollStyle"
                   :pagination="paginationCopy"
                   @change="handleTableChange"
                   size="small"
                   :load="load">
            <a slot="action" slot-scope="text">action</a>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </template>
    <template v-slot:extra>
      <div class="export">
        <a-select :value="exportType" style="width: 120px" @change="changeExportType" size="small">
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
import _ from 'lodash';

const exportTypes = [
  '导出全部', '导出当前页签', '导出当前页'
];
export default {
  name: 'municipal-result',
  data() {
    return {
      panelWidth: 1000,
      exportType: exportTypes[0],
      exportTypes: exportTypes,
      choosedTabIndex: 0,
      paginationCopy: {}
    };
  },
  props: {
    title: {
      type: String,
      default: '结果面板'
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
    tabs: {
      type: Array,
      default: () => {
        return [];
      },
      //tabs中必须包含标签名，数据，数据列
      validator(value) {
        const results = value.map(item => {
          const intersection = _.intersection(Object.keys(item), ['tabName', 'features', 'columns', 'exportFileName']);
          return intersection.length === 4;
        });
        return !results.includes(false);
      }
    },
    //导出excel的文件名称,仅用于导出全部
    exportFileName: {
      type: String,
      default: ''
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
    onTabsChange(value) {
      this.choosedTabIndex = value;
    },
    handleTableChange(pagination, filters, sorter) {
      const pager = {...this.paginationCopy};
      pager.current = pagination.current;
      this.paginationCopy = pager;
      this.$emit('onPageChange', this.paginationCopy);
    },
    changeExportType(value) {
      this.exportType = value;
      switch (value) {
        //导出全部
        case exportTypes[0]:
          this.exportAll();
        // 导出当前页签
        case exportTypes[1]:
          this.exportTab();
        // 导出当前页
        case exportTypes[2]:
          this.exportPage();
      }
    },
    exportAll() {
      const sheetNames = this.tabs.map(item => item.tabName);
      const exportData = this.tabs.map(item => {
        return item.features;
      });
      exportExcel(exportData, sheetNames, this.exportFileName);
    },
    exportTab() {
      const target = this.tabs[this.choosedTabIndex];
      const sheetName = target.tabName;
      const exportData = [target.features];
      exportExcel(exportData, sheetName, target.exportFileName || this.exportFileName);
    },
    exportPage() {
      const pageSize = this.paginationCopy.pageSize;
      const current = this.paginationCopy.current;
      const target = this.tabs[this.choosedTabIndex];
      const sheetName = target.tabName;
      const exportData = [target.features.slice((current - 1) * pageSize, current * pageSize)];
      exportExcel(exportData, sheetName, target.exportFileName || this.exportFileName);
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
  top: 470px !important;
  left: 2em !important;
}

.position-left {
  position: absolute;
  top: 4em !important;
  left: 4em !important;
  width: 30% !important;
}

.position-right {
  position: absolute;
  top: 4em !important;
  right: 4em !important;
  width: 30% !important;
}
</style>
