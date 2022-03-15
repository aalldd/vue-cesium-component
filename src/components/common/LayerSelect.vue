<template>
  <div>
    <a-tree-select
      v-model="value"
      style="width: 100%"
      size="small"
      allow-clear
      :disable-branch-nodes="true"
      :maxTagCount="6"
      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
      :tree-data="layerDataCopy"
      :show-checked-strategy="SHOW_PARENT"
      search-placeholder="请选择图层"
      @change="onChange"
    />
  </div>
</template>

<script>
import VueOptions from '@/util/options/vueOptions';
import {treeUtil} from "@/util/helpers/helper";
import {TreeSelect} from 'ant-design-vue';

const SHOW_PARENT = TreeSelect.SHOW_PARENT;
export default {
  name: "municipal-layer-select",
  props: {
    ...VueOptions,
    //生成树的数据
    layerData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    loading: {
      type: Boolean,
      default: false
    },
    checkedKeys: {
      type: Array,
      default: () => {
        return [];
      }
    },
    checkable: {
      type: Boolean,
      default: true
    },
    //是否需要自定义树的数据,如果为是，则渲染layerData，如果为否，根据globalConfig中的全部图层树结合layerGroup中的筛选规则进行筛选
    customTreeData: {
      type: Boolean,
      default: false
    },
    //需要提供哪些管网需要展示，配置格式 管网分组名称+子管网图层名称+流动的绘制纹理图片,如果不配置，将显示全部图层，如果只配置管网分组名称，将显示该分组下的全部图层
    //如果需要指定的单独的管网图层，每个管网名称下面必须含有subLayers字段
    layerGroup: {
      type: Object,
      default: () => {
        return {};
      }
    },
    defaultChecked: {
      type: Array
    }
  },
  data() {
    return {
      SHOW_PARENT,
      loadingCopy: false,
      value: [],
      layerDataCopy: []
    };
  },
  watch: {
    layerData: {
      handler() {
        if (this.layerData.length > 0 && this.customTreeData) {
          this.layerDataCopy = this.layerData;
        }
      },
      immediate: true
    },
    loading: {
      handler() {
        this.loadingCopy = this.loading;
      },
      immediate: true
    }
  },
  mounted() {
    //不用自定义数据的时候，获取完整图层树与管网规则进行筛选
    if (!this.customTreeData) {
      this.loadingCopy = true;
      const scopedSlots = {title: 'title'};
      const reaskedData = () => {
        if (window.commonConfig && window.m3ds) {
          if (window.commonConfig && window.m3ds) {
            //从commonConfig里面可以拿到完整的图层树
            const layerGroupNamesTree = [window.commonConfig?.globalConfig?.layerGroupNamesTree] || this.layerData;
            let treeData;
            let treeDataTotal = treeUtil.map(layerGroupNamesTree, (item) => {
              const {title, Id, opacity, ...rest} = item;
              return {
                ...rest,
                title,
                value: item.key,
                scopedSlots,
                name: title
              };
            });
            const keys = Object.keys(this.layerGroup);
            if (!keys.length > 0) {
              treeData = treeDataTotal;
            } else {
              //从完整的图层树中筛选出用户传入的图层分组以及分组下的子图层
              treeData = treeUtil.filter(treeDataTotal, (item) => {
                //找到对应的管网 如果用户指定了layerIds,也就是需要具体的一些图层,就从m3ds中找到该图层添加进去
                if (keys.indexOf(item.title) >= 0) {
                  const subLayers = this.layerGroup[item.title].subLayers;
                  if (subLayers && subLayers.length > 0 && item.children) {
                    const target = item.children.filter(jItem => subLayers.indexOf(jItem.title) >= 0);
                    item.children = target;
                    return item;
                  } else {
                    return item;
                  }
                } else {
                  return false;
                }
              });
            }

            //将图层的layerId添加进去 并且只能选择存在layerId的图层
            treeData = treeUtil.map(treeData, (tItem) => {
              const target = window.m3ds.find(item => item.name === tItem.name);
              if (target) {
                tItem.layerId = target.layerId;
                tItem.disabled = false;
              } else {
                tItem.layerId = null;
                tItem.disabled = true;
              }
              return tItem;
            });
            this.layerDataCopy = treeData;
            this.loadingCopy = false;
            this.$emit('load', this);
            window.clearInterval(this.myInterval);
          }
        }
      };
      this.reAskM3ds(reaskedData);
    }
  },
  methods: {
    reAskM3ds(callback) {
      this.myInterval = window.setInterval(() => {
        setTimeout(callback);
      }, 3000);
    },
    onChange(value) {
      //将选中的图层信息回传回去
      const target = treeUtil.filter(this.layerDataCopy, item => item.key === value)[0];
      this.$emit('onLayerChange', target);
    }
  }
};
</script>

<style scoped>

</style>
