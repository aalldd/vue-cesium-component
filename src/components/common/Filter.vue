<template>
  <div>
    <a-table :columns="columns" :data-source="dataSource" :pagination="false" :bordered="false">
      <!--      逻辑-->
      <div slot="logicOpers" slot-scope="text,record,index" title="增加条件">
        <a-select :value="record.selectedItem.logicOpers" @change="v=>changeLogicOpers(v,index)" v-if="index"
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
                @change="v=>changeOpers(v,index)">
        <a-select-option v-for="item in text" :value="item.value" :key="item.label">
          {{ item.label }}
        </a-select-option>
      </a-select>
      <!--      值-->
      <a-auto-complete slot="fieldValues" slot-scope="text,record,index" :data-source="record.fieldValues" allowClear
                       :value="record.selectedItem.fieldValues"
                       style="width: 100%;min-width: 80px;max-width: 110px" @change="v=>changeFieldValue(v,index)">
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
    <a-input style="margin-top: 10px" disabled :value="inputSql"></a-input>
  </div>
</template>

<script>
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import {getOperators, LOGIC_OPERS, NUMBER_OPERS} from './DataType';
//这里列就直接写死，因为条件筛选表格是固定的
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
const initDataSource = [{
  logicOpers: [],
  fieldName: [],
  funcOpers: [],
  fieldValues: [],
  key: 0,
  selectedItem: {},
  delete: []
}];
export default {
  name: "municipal-filter",
  mixins: [loadingM3ds],
  data() {
    return {
      initDataSource: initDataSource,
      dataSource: [{
        logicOpers: [],
        fieldName: [],
        funcOpers: [],
        fieldValues: [],
        key: 0,
        selectedItem: {},
        delete: []
      }],
      columns,
      LOGIC_OPERS,
      //当前编辑的数据的index
      currentIndex: 0,
      //当前的运算项目，运算符的集合
      currentOpers: [],
      //当前的数据列表
      currentFieldValues: [],
      //查询的sql字符串
      inputSql: ''
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
    },
    maxRow: {
      type: Number,
      default: 4
    }
  },
  watch: {
    fieldValue: {
      handler() {
        if (this.fieldValue) {
          const currentFieldValues = [...new Set(this.fieldValue)].map(item => item.toString());
          this.dataSource[this.currentIndex].fieldValues = currentFieldValues;
          this.$nextTick(() => {
            this.createSql();
          });
        }
      },
      immediate: true
    }
  },
  destroyed() {
    this.dataSource = initDataSource;
  },
  methods: {
    reset() {
      this.dataSource = _.cloneDeep(initDataSource);
      this.createSql();
    },
    changeFieldName(value, index) {
      this.currentIndex = index;
      const newDataS = _.cloneDeep(this.dataSource);
      let item = this.fieldArr.find(f => f.fldName === value);
      const funcOpers = getOperators(item.fldType);
      newDataS[index].funcOpers = funcOpers;
      const selectedItem = Object.assign(newDataS[index].selectedItem, {
        fieldName: value,
        funcOpers: '',
        fieldValues: ''
      });
      newDataS[index].selectedItem = selectedItem;
      this.dataSource = newDataS;
      this.$nextTick(() => {
        this.createSql();
      });
      //从外面的服务获取到这个字段下面的取值
      this.$emit('onChangeFieldName', value);
    },
    changeLogicOpers(value, index) {
      this.changeDataSource({logicOpers: value}, index);
    },
    changeOpers(value, index) {
      this.changeDataSource({funcOpers: value}, index);
    },
    changeFieldValue(value, index) {
      this.changeDataSource({fieldValues: value}, index);
    },
    changeDataSource(data, index) {
      const newDataS = _.cloneDeep(this.dataSource);
      const selectedItem = Object.assign(newDataS[index].selectedItem, data);
      newDataS[index].selectedItem = selectedItem;
      this.dataSource = newDataS;
      this.$nextTick(() => {
        this.createSql();
      });
    },
    plus() {
      //  添加
      if (this.dataSource.length >= this.maxRow) {
        this.$message.warn('你的条件有点多哟');
        return;
      }
      const newData = Object.assign(this.initDataSource[0], {key: this.dataSource.length});

      const lastSelected = this.dataSource[this.dataSource.length - 1];
      //如果发现上一项数据，为空，或者有一个value是空，都不让添加
      if (lastSelected && lastSelected.selectedItem) {
        let valid = true;
        for (let key in lastSelected.selectedItem) {
          let value = lastSelected.selectedItem[key];
          if (value === '' || !value) {
            valid = false;
          }
        }
        if (!valid) {
          this.$message.warn('请先填满上一项条件哦');
        } else {
          this.dataSource.push(newData);
        }
      } else {
        this.$message.warn('请先填满上一项条件哦');
      }
    },
    onDelete(text, record, index) {
      //  删除
      if (this.dataSource.length <= 1) {
        this.$message.warn('已经是第一条数据了哟');
      } else {
        this.dataSource.splice(index, 1);
        this.createSql();
      }
    },
    createSql() {
      let sql = '';
      this.dataSource.forEach((item, index) => {
        const {fieldName, funcOpers, fieldValues, logicOpers} = item.selectedItem;
        const value = item.funcOpers === NUMBER_OPERS ? fieldValues : `'${fieldValues}'`;
        if (!index) {
          Object.values(item.selectedItem).filter(v => v).length === 3 ? (sql = `${fieldName} ${funcOpers} ${value}`) : "";
        } else {
          Object.values(item.selectedItem).filter(v => v).length === 4 ? (sql += `${logicOpers} ${fieldName} ${funcOpers} ${value}`) : sql;
        }
      });
      this.inputSql = sql;
      this.eventBus.$emit('sendSql', sql);
      this.$emit('sendSql', sql);
    }
  }
};
</script>

<style scoped>

</style>
