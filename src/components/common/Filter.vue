<template>
  <div>
    <a-table :columns="columns" :data-source="dataSource" :pagination="false" :bordered="false">
      <!--      逻辑-->
      <div slot="logicOpers" slot-scope="text,record,index" title="增加条件">
        <a-select :value="record.selectedItem.logicOpers" @change="changeLogicOpers" v-if="index"
                  style="width: 100%;min-width: 80px;max-width: 110px">
          <a-select-option v-for="item in LOGIC_OPERS" :value="item.label" :key="item.label">
            {{ item.label }}
          </a-select-option>
        </a-select>
        <div title="增加条件" v-else>
          <a-icon type="plus-circle" @click="plus"/>
        </div>
      </div>
      <!--      字段名-->
      <a-select slot="fieldName" slot-scope="text,record,index" :value="record.selectedItem.fieldName"
                style="width: 100%;min-width: 80px;max-width: 110px"
                @change="v=>changeFieldName(v,index)">
        <a-select-option v-for="item in fldName" :value="item" :key="item">
          {{ item }}
        </a-select-option>
      </a-select>
      <!--      运算符-->
      <a-select slot="funcOpers" slot-scope="text,record,index" :value="record.selectedItem.funcOpers"
                style="width: 100%;min-width: 80px;max-width: 110px"
                @change="changeOpers(index)">
        <a-select-option v-for="item in text" :value="item.value" :key="item.label">
          {{ item.label }}
        </a-select-option>
      </a-select>
      <!--      值-->
      <a-auto-complete slot="fieldValues" slot-scope="text,record" allowClear :value="record.selectedItem.fieldValues"
                       style="width: 100%;min-width: 80px;max-width: 110px">
        <template slot="dataSource">
          <a-select-option v-for="(item,index) in text" :key="index" :title="item.toString()">
            {{ item.toString() }}
          </a-select-option>
        </template>
      </a-auto-complete>
      <!--      删-->
      <a-popconfirm
        slot="delete"
        slot-scope="text,record,index"
        title="确认删除？"
        ok-text="是"
        cancel-text="否"
        @confirm="onDelete(text,record,index)"
      >
        <a btn="1">
          <a-icon type="delete"></a-icon>
        </a>
      </a-popconfirm>
    </a-table>
  </div>
</template>

<script>
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import {getOperators, LOGIC_OPERS, NUMBER_OPERS} from './DataType';

const columns = [
  {
    dataIndex: 'logicOpers',
    key: '逻辑',
    title: '逻辑',
    width: 60,
    align: 'center',
    scopedSlots: {customRender: 'logicOpers'}
  }, {
    dataIndex: 'fieldName',
    key: '字段名',
    title: '字段名',
    width: 120,
    align: 'center',
    scopedSlots: {customRender: 'fieldName'}
  }, {
    dataIndex: 'funcOpers',
    key: '运算符',
    title: '运算符',
    width: 120,
    align: 'center',
    scopedSlots: {customRender: 'funcOpers'}
  },
  {
    dataIndex: 'fieldValues',
    key: '值',
    title: '值',
    width: 120,
    align: 'center',
    scopedSlots: {customRender: 'fieldValues'}
  },
  {
    dataIndex: 'delete',
    key: '删',
    title: '删',
    width: 80,
    align: 'center',
    scopedSlots: {customRender: 'delete'}
  }
];
export default {
  name: "municipal-filter",
  mixins: [loadingM3ds],
  data() {
    return {
      dataSource: [{
        logicOpers: [],
        fieldName: [],
        funcOpers: [],
        fieldValues: [],
        key: 0,
        selectedItem: [],
        delete: []
      }],
      columns,
      LOGIC_OPERS,
      //当前编辑的数据的index
      currentIndex: 0,
      //当前的操作项
      currentOpers: [],
      //当前的数据列表
      currentFieldValues: [],
      //当前的数据名
      currentFieldName: ''
    };
  },
  props: {
    fldName: {
      type: Array,
      default: () => {
        return [];
      }
    },
    fieldArr: {
      type: Array,
      default: () => {
        return [];
      }
    },
    fieldValue: {
      type: Array
    }
  },
  watch: {
    fieldValue: {
      handler() {
        if (this.fieldValue) {
          this.currentFieldValues = [...new Set(this.fieldValue)];
          this.assginData();
        }
      },
      immediate: true
    }
  },
  methods: {
    changeFieldName(value, index) {
      let item = this.fieldArr.find(f => f.fldName === value);
      const funcOpers = getOperators(item.fldType);
      this.currentOpers = funcOpers;
      this.currentIndex = index;
      this.currentFieldName = value;
      //我们现在获取了
      this.$emit('onChangeFieldName', value);
    },
    changeLogicOpers(value) {
      console.log(value);
    },
    changeOpers(value, index) {
      console.log(value);
      console.log(index);
    },
    plus() {
      //  添加
    },
    onDelete(text, record, index) {
      //  删除
    },
    assginData() {
      const newData = {
        funcOpers: this.currentOpers,
        fieldValues: this.currentFieldValues,
        selectedItem: {
          fieldName: this.currentFieldName,
          funcOpers: "", fieldValues: ""
        }
      };
      const target = Object.assign(this.dataSource[this.currentIndex], newData);
      console.log(target);
      this.$set(this.dataSource, this.currentIndex, target);
      console.log(this.dataSource);
    }
  }
};
</script>

<style scoped>

</style>
