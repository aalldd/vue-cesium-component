const resultMixin = {
  data() {
    return {
      panelWidthCopy: Number(window.getComputedStyle(document.body).width.replace('px', '')) * 0.95,
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
    height: {
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
      default: () => {
        return {
          pageSize: 10,
          current: 1
        };
      }
    },
    rowSelection: {
      type: Object
    },
    needExport: {
      type: Boolean,
      default: true
    },
    //是否需要点击行跳转
    needClickFly: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    pagination: {
      handler() {
        this.paginationCopy = this.pagination;
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
        return {x: 10000, y: 200};
      } else {
        return {y: 300};
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
            //如果需要点击行跳转
            if (this.needClickFly && record.geometry) {
              const tile = this.m3ds.find(item => item.layerId === record.layerId);
              const position = [record.geometry.x - this.offset[0], record.geometry.y - this.offset[1]];
              //模型坐标转出来的高度有问题，看管段高度统一为70m
              const {lng, lat} = this.emgManager.changeToLat(position);
              this.emgManager.flyToEx(lng, lat, 70);
              this.emgManager.binkPipe([tile], [record.OID]);
            }
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
