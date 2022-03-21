<template>
  <div>
    <a-input-search style="margin-bottom: 8px" placeholder="搜索图层" @change="onChange" v-if="needSearch"/>
    <a-spin :spinning="loadingCopy" :style="layerStyle">
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
  </div>
</template>

<script>
import VueOptions from '@/util/options/vueOptions';
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
          let checkedKeys = [];
          //默认勾选全部 如果指定了就按照指定的勾选
          if (!this.defaultChecked) {
            treeUtil.forEach(this.layerDataCopy, (item) => {
              checkedKeys.push(item.key);
              checkedKeys.push(item.key);
            });
          } else {
            checkedKeys = this.defaultChecked;
          }
          this.checkedKeysCopy = checkedKeys;
          this.generateList(this.layerData);
          this.expandedKeys = this.dataList
            .map(item => {
              return getParentKey(item.key, this.layerData);
            });
        }
      },
      immediate: true
    },
    //受控状态使用checkedKeys
    checkedKeys: {
      handler() {
        if (this.checkedKeys.length > 0 && !this.defaultChecked) {
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
    needSearch: {
      type: Boolean,
      default: true
    },
    defaultChecked: {
      type: Array
    },
    //图层树的样式
    layerStyle: {
      type: Object,
      default: () => {
        return {
          maxHeight: '500px',
          minHeight: '50px',
          overflowY: 'scroll',
          overflowX: 'hidden'
        };
      }
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
                  //  如果指定了subLayers，但是没有写任何值，说明只需要管网，不需要管网下面的子图层
                } else if (subLayers && subLayers.length === 0) {
                  item.children = null;
                  return item;
                } else {
                  return item;
                }
              } else {
                return false;
              }
            });
          }
          let checkedKeys = [];
          //默认勾选全部 如果指定了就按照指定的勾选
          if (!this.defaultChecked) {
            treeUtil.forEach(treeData, (item) => {
              checkedKeys.push(item.key);
              checkedKeys.push(item.key);
            });
          } else {
            checkedKeys = this.defaultChecked;
          }

          //将图层的layerId添加进去
          treeData = treeUtil.map(treeData, (tItem) => {
            const target = window.m3ds.find(item => item.name === tItem.name);
            if (target) {
              tItem.layerId = target.layerId;
            } else {
              tItem.layerId = null;
            }
            return tItem;
          });

          this.checkedKeysCopy = checkedKeys;
          this.layerDataCopy = treeData;
          this.loadingCopy = false;
          this.generateList(treeData);
          this.expandedKeys = this.dataList
            .map(item => {
              return getParentKey(item.key, this.layerData);
            });
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
      const filterLayerIds = treeUtil.filter(this.layerDataCopy, (item) => checkedKeys.indexOf(item.key) >= 0).map(item => item.layerId).filter(item => item !== null);
      this.$emit('check', checkedKeys, filterLayerIds);
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
