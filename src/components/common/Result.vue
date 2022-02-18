<template>
  <municipal-panel :title="title" :draggable="false" @close="$emit('onClose')"
                   :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClass" >
    <template v-slot:content>
      <a-table :columns="columns" :data-source="data" :scroll="{ x: 1500, y: 150 }" size="middle">
        <a slot="action" slot-scope="text">action</a>
      </a-table>
    </template>
  </municipal-panel>
</template>
<script>
const columns = [
  {title: 'Full Name', width: 100, dataIndex: 'name', key: 'name', fixed: 'left'},
  {title: 'Age', width: 100, dataIndex: 'age', key: 'age', fixed: 'left'},
  {title: 'Column 1', dataIndex: 'address', key: '1', width: 150},
  {title: 'Column 2', dataIndex: 'address', key: '2', width: 150},
  {title: 'Column 3', dataIndex: 'address', key: '3', width: 150},
  {title: 'Column 4', dataIndex: 'address', key: '4', width: 150},
  {title: 'Column 5', dataIndex: 'address', key: '5', width: 150},
  {title: 'Column 6', dataIndex: 'address', key: '6', width: 150},
  {title: 'Column 7', dataIndex: 'address', key: '7', width: 150},
  {title: 'Column 8', dataIndex: 'address', key: '8'},
  {
    title: 'Action',
    key: 'operation',
    fixed: 'right',
    width: 100,
    scopedSlots: {customRender: 'action'},
  },
];

const data = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
  });
}

export default {
  name: 'municipal-result',
  data() {
    return {
      data,
      columns,
      panelWidth:1000
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
      type: Object,
      default: () => {
        return {
          width: '95%',
          height:'240px'
        };
      }
    },
    panelClassName: {
      type: String,
      default: ''
    },
    panelPosition:{
      type:String,
      default:'bottom',
      validator(value) {
        return ['bottom', 'left', 'right'].indexOf(value) >= 0
      }
    }
  },
  computed:{
    panelClass(){
      return {
        ['resultPanel']:true,
        [`${this.panelClassName}`]:true,
        [`position-${this.panelPosition}`]: true,
      }
    }
  }
};
</script>

<style lang="scss">
.resultPanel{
  ::v-deep .content{
    padding:0!important;
  }
}
.position-bottom{
  position: absolute;
  top: 470px;
  left: 2em;

}
</style>
