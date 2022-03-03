const resultMixin = {
  data() {
    return {
      panelWidthCopy: 1600,
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
    width: {
      type: Number
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
    //导出excel的文件名称,仅用于导出全部
    exportFileName: {
      type: String,
      default: '全部数据'
    },
    pagination: {
      type: Object
    },
    rowSelection:{
      type:Object
    },
    needExport:{
      type:Boolean,
      default:true
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
    },
    panelPosition: {
      handler() {
        if (this.panelPosition === 'left' || this.panelPosition === 'right') {
          if (this.width) {
            this.panelWidthCopy = this.width;
          } else {
            this.panelWidthCopy = 450;
          }
        }
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
        return {x: 400, y: 300};
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

export default resultMixin;
