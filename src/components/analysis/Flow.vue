<template>
  <municipal-layer :loading="loading"
                   :layerData="layerData"
                   :checkedKeys="checkedKeys"
                   :title="title"
                   :draggable="draggable"
                   @onClose="$emit('onClose')"
                   :closable="closable"
                   :need-expand="expandable"
                   :panel-style="panelStyle"
                   @check="check"
                   :panel-class-name="panelClassName">
    <div style="display: flex;align-items: center;justify-content: flex-end">
      <a-button type="primary" @click="queryData" style="margin-right: 10px">请求数据</a-button>
      <a-button @click="startFlow">开始分析</a-button>
    </div>
  </municipal-layer>
</template>

<script>
import {treeUtil} from "@/util/helpers/helper";
import panelOptions from "@/util/options/panelOptions";
import indexedDBHelper from "@/util/operators/indexDB";

export default {
  name: "municipal-flow",
  data() {
    return {
      checkedKeys: [],
      layerData: [],
      loading: false
    };
  },
  props: {
    ...panelOptions,
    //需要提供哪些管网需要展示，配置格式 管网分组名称+layerIndex+流动的绘制纹理图片,如果不配置，将显示全部图层，如果只配置管网分组名称，将显示该分组下的全部图层
    layerGroup: {
      type: Object,
      default: () => {
        return {};
      }
    },
    title: {
      type: String,
      default: '流向分析'
    },
    flowData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    //是否需要缓存流向数据 因为流向数据非常庞大，建议缓存
    cacheData: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    flowData: {
      handler() {
        if (this.flowData.length > 0 && this.cacheData) {
          this.cacheDataToDB();
        }
      }
    }
  },
  mounted() {
    this.loading = true;
    const scopedSlots = {title: 'title'};
    const reaskedData = () => {
      if (window.commonConfig && window.m3ds) {
        const layerGroupNamesTree = [window.commonConfig?.globalConfig?.layerGroupNamesTree] || this.layerData;
        let count = 0;
        let treeData;
        let treeDataTotal = treeUtil.map(layerGroupNamesTree, (item) => {
          const {title, Id, opacity, ...rest} = item;
          let layerIndex;
          if (!item.children) {
            layerIndex = count;
            count++;
          }
          return {
            ...rest,
            title,
            scopedSlots,
            layerIndex
          };
        });
        const keys = Object.keys(this.layerGroup);
        if (!keys) {
          treeData = treeDataTotal;
        } else {
          treeData = treeUtil.filter(treeDataTotal, (item) => {
            if (keys.indexOf(item.title) >= 0) {
              const indexs = this.layerGroup[item.title].layerIndexs;
              if (item.children && Array.isArray(indexs) && indexs.length > 0) {
                item.children = item.children.filter(n => indexs.indexOf(n.layerIndex) >= 0);
              }
              return item;
            } else {
              return false;
            }
          });
        }
        const checkedKeys = [];
        const layers = [];
        //默认勾选全部
        treeUtil.forEach(treeData, (item) => {
          checkedKeys.push(item.key);
          item.layerIndex && layers.push(item.layerIndex);
        });
        this.m3ds = window.m3ds;
        this.layerIds = this.m3ds.filter((item, index) => layers.indexOf(index) >= 0).map(item => item.layerId);
        this.mapServerName = window.commonConfig?.globalConfig?.mapServerName || "";
        this.layerData = treeData;
        this.checkedKeys = checkedKeys;
        this.loading = false;
        if (this.cacheData) {
          this.indexDbHelper = new indexedDBHelper();
          this.indexDbHelper.OpenDB('flow', 'flowData');
          // 如果没有就会新建一个表
          this.indexDbHelper.CreateTable('flowData', {autoIncrement: false});
        }
        this.$emit('load', this);
        window.clearInterval(this.myInterval);
      }
    };
    this.reAskM3ds(reaskedData);
  },
  methods: {
    reAskM3ds(callback) {
      this.myInterval = window.setInterval(() => {
        setTimeout(callback);
      }, 3000);
    },
    //将流向数据缓存至indexDB中的方法
    cacheDataToDB() {
      const points = this.createPoints();
      this.indexDbHelper.Clear('flowData');
      const pointsStr = JSON.stringify(points);
      // 将数据加密
      const pointsCode = escape(pointsStr);
      this.indexDbHelper.AddData('flowData', pointsCode);
    },
    createPoints() {
      const startHeightName = this.commonConfig?.globalConfig?.StartHeightName || '起点地面高程';
      const endHeightName = this.commonConfig?.globalConfig?.EndHeightName || '终点地面高程';
      const pipeLength = this.commonConfig?.globalConfig?.PipeLength || '管长';
      const flowDirection = this.commonConfig?.globalConfig?.FlowDirection || '流向';
      const pipeRadius = this.commonConfig?.globalConfig?.PipeRadius || '管径';
      const points=[]
      this.flowData.forEach(jitem=>{
        Object.keys(jitem).length !== 0 && jitem.features.map(item => {
          const startp = item.geometry.paths[0][0];
          const endp = item.geometry.paths[0][1];
          const startHeight = Number(item?.attributes[startHeightName]) || 40;
          const endHeight = Number(item.attributes[endHeightName]) || 40;
          const long = Number(item.attributes[pipeLength]);
          const direction = Number(item.attributes[flowDirection]);
          const radius = Number(item.attributes[pipeRadius]);
          return {
            point: [startp[0], startp[1], startHeight, endp[0], endp[1], endHeight],
            direction,
            long,
            radius
          };
        });
      })
      return points;
    },
    check(checkedKeys) {
      //layerData数据项中的layerIndex就是该图层在m3ds中的index
      const choosedLayer = treeUtil.filter(this.layerData, (item) => checkedKeys.indexOf(item.key) >= 0).map(item => item.layerIndex);
      const choosedM3d = this.m3ds.filter((item, index) => choosedLayer.indexOf(index) >= 0);
      this.layerIds = choosedM3d.map(item => item.layerId);
      this.mapServerName = window.commonConfig?.globalConfig?.mapServerName || "";
    },
    queryData() {
      const params = {
        layerIds: this.layerIds,
        mapServerName: this.mapServerName
      };
      //点击请求数据,将请求参数传出去，让外面去调用服务
      this.$emit('query', params);
    },
    startFlow() {
      //如果需要缓存数据,就从缓存数据中获取流向信息
      let count = 0;
      if (this.cacheData) {
        this.indexDbHelper.ReadAllData('flowData', count, async (data) => {
          const pointsData = JSON.parse(unescape(data));
          console.log(pointsData);
        });
      }
    }
  }
};
</script>

<style scoped>

</style>
