<template>
  <municipal-panel :title="title" :draggable="draggable" @close="$emit('onClose')"
                   :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <a-input-search style="margin-bottom: 8px" placeholder="Search" @change="onChange" v-if="needSearch"/>
      <a-spin :spinning="loadingCopy" style="min-height: 200px;overflow-y: scroll;overflow-x:hidden;max-height: 600px">
        <a-tree
          :expanded-keys="expandedKeys"
          :checkedKeys="checkedKeysCopy"
          :auto-expand-parent="autoExpandParent"
          :tree-data="layerDataCopy"
          :checkable="checkable"
          @expand="onExpand"
          @check="checked"
        >
          <template slot="title" slot-scope="{ title }">
        <span v-if="title.indexOf(searchValue) > -1">
          {{ title.substr(0, title.indexOf(searchValue)) }}
          <span style="color: #f50">{{ searchValue }}</span>
          {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
        </span>
            <span v-else>{{ title }}</span>
          </template>
        </a-tree>
      </a-spin>
      <slot></slot>
    </template>
  </municipal-panel>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import VueOptions from '@/util/options/vueOptions'
import {treeUtil} from "@/util/helpers/helper";

const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};
export default {
  name: 'municipal-layer',
  data() {
    return {
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      checkedKeysCopy: [],
      //将树形数据铺平之后放入数组
      dataList: [],
      layerDataCopy: [],
      loadingCopy: false
    };
  },
  watch: {
    layerData: {
      handler() {
        if (this.layerData.length > 0 && this.customTreeData) {
          this.layerDataCopy = this.layerData;
          this.generateList(this.layerData);
          this.expandedKeys = this.dataList
            .map(item => {
              return getParentKey(item.key, this.layerData);
            });
        }
      },
      immediate: true
    },
    checkedKeys: {
      handler() {
        if (this.checkedKeys.length > 0) {
          this.checkedKeysCopy = this.checkedKeys;
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
  props: {
    ...panelOptions,
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
      default: true
    },
    //需要提供哪些管网需要展示，配置格式 管网分组名称+子管网图层名称+流动的绘制纹理图片,如果不配置，将显示全部图层，如果只配置管网分组名称，将显示该分组下的全部图层
    //如果需要指定的单独的管网图层，每个管网名称下面必须含有subLayers字段
    layerGroup: {
      type: Object,
      default: () => {
        return {};
      }
    },
    needSearch: {
      type: Boolean,
      default: true
    }
  },
  mounted() {
    //不用自定义数据的时候，获取完整图层树与管网规则进行筛选
    if (!this.customTreeData) {
      this.loadingCopy = true;
      const scopedSlots = {title: 'title'};
      const reaskedData = () => {
        if (window.commonConfig && window.m3ds) {
          //从commonConfig里面可以拿到完整的图层树
          const layerGroupNamesTree = [window.commonConfig?.globalConfig?.layerGroupNamesTree] || this.layerData;
          let treeData;
          let treeDataTotal = treeUtil.map(layerGroupNamesTree, (item) => {
            const {title, Id, opacity, ...rest} = item;
            return {
              ...rest,
              title,
              scopedSlots,
              name: title
            };
          });
          const keys = Object.keys(this.layerGroup);
          if (!keys) {
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
          const checkedKeys = [];
          const layers = [];
          //默认勾选全部
          treeUtil.forEach(treeData, (item) => {
            checkedKeys.push(item.key);
            checkedKeys.push(item.key);
            item.name && layers.push(item.name);
          });
          this.checkedKeysCopy = checkedKeys;
          this.layerDataCopy = treeData;
          this.loadingCopy = false;
          this.generateList(treeData);
          this.expandedKeys = this.dataList
            .map(item => {
              return getParentKey(item.key, this.layerData);
            });
          this.layerIds = window.m3ds.filter((item, index) => layers.indexOf(item.name) >= 0).map(item => item.layerId);
          this.$emit('load', this);
          window.clearInterval(this.myInterval);
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
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
      this.$emit('onExpand', expandedKeys);
    },
    checked(checkedKeys) {
      this.checkedKeysCopy = checkedKeys;
      this.$emit('check', checkedKeys);
    },
    generateList(data) {
      for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const key = node.key;
        const title = node.title;
        this.dataList.push({key, title});
        if (node.children) {
          this.generateList(node.children);
        }
      }
    },
    onChange(e) {
      const value = e.target.value;
      const expandedKeys = this.dataList
        .map(item => {
          if (item.title.indexOf(value) > -1) {
            return getParentKey(item.key, this.layerData);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true,
      });
    },
  },
};
</script>
