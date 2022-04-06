import 'viewerjs/dist/viewer.css';
import {component as Viewer} from "v-viewer";
import emgUtil from "@/util/helpers/emgUtil";
import {lineString, lineIntersect} from '@turf/turf';

const resultMixin = {
  inject: ['Cesium', 'CesiumZondy', 'webGlobe'],
  components: {
    Viewer
  },
  data() {
    return {
      panelWidthCopy: Number(window.getComputedStyle(document.body).width.replace('px', '')) * 0.95,
      paginationCopy: {}
    };
  },
  mounted() {
    if (window.m3ds && window.commonConfig) {
      this.m3ds = window.m3ds;
      this.emgManager = new emgUtil(this.webGlobe);
      this.commonConfig = window.commonConfig;
      this.offset = this.commonConfig?.globalConfig?.offset;
    }
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
    flyHeight: {
      type: Number,
      default: 60
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
    //是否需要点击行跳转,当且仅当record中存在geometry的时候生效
    needClickFly: {
      type: Boolean,
      default: true
    },
    //是否需要图片控件
    displayImg: {
      type: Boolean,
      default: false
    },
    //图片的路径
    fileUrl: [String],
    //  如果record中不存在geometry，就需要外面传入坐标，坐标可以为paths或者xy
    geometry: [Object]
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
    },
    geometry: {
      handler() {
        if (this.geometry && this.geometry.layerId && this.geometry.oid) {
          if (this.geometry.paths?.length === 1) {
            const {paths, layerId, oid} = this.geometry;
            this.m3ds?.length && this.jumpToPipeLine(paths[0], layerId, oid);
          } else if (this.geometry.paths?.length > 1 && this.geometry.intersection) {
            //  如果传入的管段数，大于1个管子，说明传入了多个管段，需要使用算法计算出这些管子的交点,并高亮多个管段针对碰撞分析
            const {paths, layerId, oid} = this.geometry;
            this.m3ds?.length && this.jumpToMultyPipe(paths, layerId, oid);
          } else {
            const {XY, layerId, oid} = this.geometry;
            this.m3ds?.length && this.jumpToPipePoint(XY, layerId, oid);
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
        return {x: true, y: 200};
      } else {
        return {x: true, y: 300};
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
              if (record.geometry.paths) {
                this.jumpToPipeLine(record.geometry.paths, record.layerId, record.OID);
              } else {
                this.jumpToPipePoint(record.geometry, record.layerId, record.OID);
              }
            }
            this.$emit('onRowClick', record);
          }
        }
      };
    },
    //关闭结果面板
    onClose() {
      this.$emit('onClose');
    },
    inited(viewer) {
      this.$viewer = viewer;
    },
    show() {
      this.$viewer.show();
    },
    downLoadImg() {
      const a = document.createElement('a');
      a.download = name || 'pic';
      a.href = this.fileUrl;
      a.click();
    },
    //跳转至管段
    jumpToPipeLine(paths, layerId, Oid) {
      const startPoint = paths[0][0];
      const endPoint = paths[0][1];
      const centerPoint = [(startPoint[0] + endPoint[0]) / 2, (startPoint[1] + endPoint[1]) / 2];
      let position = [centerPoint[0] - this.offset[0], centerPoint[1] - this.offset[1]];
      this.jump(position, layerId, Oid);
    },
    //跳转至管点
    jumpToPipePoint(XY, layerId, Oid) {
      let position = [XY.x - this.offset[0], XY.y - this.offset[1]];
      this.jump(position, layerId, Oid);
    },
    jump(position, layerId, Oid) {
      this.emgManager.stopHighlight()
      const tile = this.m3ds.find(item => item.layerId === layerId);
      //模型坐标转出来的高度有问题
      const {lng, lat} = this.emgManager.changeToLat(position);
      this.emgManager.flyToEx(lng, lat, this.flyHeight);
      this.emgManager.binkPipe([tile], [Oid]);
    },
    //跳转至多个管段的交点
    jumpToMultyPipe(paths, layerId, Oid) {
      this.emgManager.stopHighlight()
      const tiles = this.m3ds.filter(item => layerId.indexOf(item.layerId)>=0);
      let pipes = paths.map(pipe => {
        let linePoint = [];
        pipe[0].forEach(point => {
          const x = point[0] - this.offset[0];
          const y = point[1] - this.offset[1];
          const lngLat = this.emgManager.changeToLat([x, y]);
          linePoint.push(lngLat);
        });
        return linePoint;
      });
      const lines = pipes.map(pipe => {
        let lng1 = pipe[0].lng;
        let lat1 = pipe[0].lat;
        let lng2 = pipe[1].lng;
        let lat2 = pipe[1].lat;
        return lineString([[lng1, lat1], [lng2, lat2]]);
      });
      let intersects = lineIntersect(...lines);
      let targetLng = intersects.features[0].geometry.coordinates[0];
      let targetLat = intersects.features[0].geometry.coordinates[1];
      this.emgManager.flyToEx(targetLng, targetLat, this.flyHeight);
      this.emgManager.binkPipe(tiles, Oid);
    }
  }
};

export default resultMixin;
