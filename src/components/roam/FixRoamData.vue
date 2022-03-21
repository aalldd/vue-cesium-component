<template>
  <municipal-panel :title="title" @onClose="onClose"
                   :closable="closable" :draggable="draggable"
                   :width="width"
                   :height="height"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:extra>
      <a-button type="primary" size="small" @click="addRoamPlan">
        <a-icon type="plus" style="margin-right: 5px"></a-icon>
        <span>新增</span>
      </a-button>
    </template>
    <template v-slot:content>
      <a-table :bordered="true" :columns="columns"
               :data-source="dataSourceCopy"
               :scroll="{y: 300}"
               :customRow="customRow"
               :load="loading"
      >
        <template slot="action" slot-scope="text, record">
          <div style="display: flex;justify-content: space-around;align-items: center">
            <a-icon style="color: #1e6ceb" @click.stop="modify(record)" type="edit"></a-icon>
            <a-popconfirm title="是否删除" ok-text="是" cancel-text="否" @confirm="confirm(record)">
              <a-icon style="color: #1e6ceb" type="delete"></a-icon>
            </a-popconfirm>
          </div>
        </template>
      </a-table>
    </template>
  </municipal-panel>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";

export default {
  name: "municipal-fixroam-data",
  data() {
    return {
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          key: 'index',
          align: 'center',
          width:80,
          customRender: (text, record, index) => `${index + 1}`,
        },
        {
          title: '方案名称',
          dataIndex: 'planName', align: 'center', ellipsis: true
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          width:80,
          scopedSlots: {customRender: 'action'}
        }
      ],
      dataSourceCopy: []
    };
  },
  props: {
    ...panelOptions,
    title: {
      type: String,
      default: '漫游方案管理'
    },
    dataSource: {
      type: Array,
      default: () => {
        return [];
      }
    },
    panelStyle: {
      type: Object,
      default: () => {
        return {
          width: '400px',
          position: 'absolute',
          left: '2em',
          top: '4em'
        };
      }
    },
    loading:{
      type:Boolean,
      default:false
    }
  },
  watch: {
    dataSource: {
      handler() {
        if (this.dataSource?.length > 0) {
          console.log(this.dataSource);
          this.dataSourceCopy = this.dataSource;
        }
      }
    }
  },
  methods: {
    onClose() {
      this.$emit('close');
    },
    addRoamPlan(){
      this.$emit('addRoamPlan')
    },
    modify(record){
      this.$emit('modifyRoamPlan',record)
    },
    confirm(record){
      this.$emit('deleteRoamPlan',record)
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
    }
  }
};
</script>

<style scoped>

</style>
