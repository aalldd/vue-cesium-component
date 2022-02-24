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
    <a-button type="primary">开始分析</a-button>
    <slot></slot>
  </municipal-layer>
</template>

<script>
import {treeUtil} from "@/util/helpers/helper";
import panelOptions from "@/util/options/panelOptions";
import indexedDBHelper from "@/util/operators/indexDB";

const outFields = '流向,起点地面高程,终点地面高程,管长,管径';
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
      type: Object
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
        if (this.flowData && this.cacheData) {
          this.cacheDataToDB();
        }
      },
      immediate: true
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
        const layers=[]
        //默认勾选全部
        treeUtil.forEach(treeData, (item) => {
          checkedKeys.push(item.key);
          item.layerIndex && layers.push(item.layerIndex)
        });
        this.m3ds = window.m3ds;
        this.layerIds=this.m3ds.filter((item, index) => layers.indexOf(index) >= 0).map(item=>item.layerId);
        this.mapServerName = window.commonConfig?.globalConfig?.mapServerName || "";
        this.layerData = treeData;
        this.checkedKeys = checkedKeys;
        this.loading = false;
        this.$emit('load',this)
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
      this.indexDbHelper = new indexedDBHelper();
      this.indexDbHelper.OpenDB('flow', 'flowData');
      // 如果没有就会新建一个表
      this.indexDbHelper.CreateTable('flowData', {autoIncrement: false});
      this.indexDbHelper.Clear('flowData');
      const pointsStr = JSON.stringify(this.flowData);
      // 将数据加密
      const pointsCode = escape(pointsStr);
      this.indexDbHelper.AddData('flowData', pointsCode);
    },
    check(checkedKeys) {
      //layerData数据项中的layerIndex就是该图层在m3ds中的index
      const choosedLayer = treeUtil.filter(this.layerData, (item) => checkedKeys.indexOf(item.key) >= 0).map(item => item.layerIndex);
      const choosedM3d = this.m3ds.filter((item, index) => choosedLayer.indexOf(index) >= 0);
      const layerIds = choosedM3d.map(item => item.layerId);
      const mapServerName = window.commonConfig?.globalConfig?.mapServerName || "";
      this.$emit('checked', {
        layerIds,
        mapServerName,
        outFields
      });
    }
  }
};
</script>

<style scoped>

</style>
