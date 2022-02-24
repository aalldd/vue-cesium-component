<template>
  <municipal-panel :title="title" :draggable="draggable" @close="$emit('onClose')"
                   :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <a-input-search style="margin-bottom: 8px" placeholder="Search" @change="onChange"/>
      <a-spin :spinning="loading" style="min-height: 300px;overflow-y: scroll;overflow-x:hidden;max-height: 600px">
        <a-tree
          :expanded-keys="expandedKeys"
          :checkedKeys="checkedKeysCopy"
          :auto-expand-parent="autoExpandParent"
          :tree-data="layerData"
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
      dataList: []
    };
  },
  watch: {
    layerData: {
      handler() {
        if (this.layerData.length > 0) {
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
    }
  },
  props: {
    ...panelOptions,
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
    }
  },
  methods: {
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
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
