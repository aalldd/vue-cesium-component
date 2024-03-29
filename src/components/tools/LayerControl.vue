<template>
  <div class="tool-item" @click="showLayers">
    <municipal-icon name="-layers"></municipal-icon>
    <a-drawer
      :title="title"
      placement="right"
      :closable="false"
      :visible="visible"
      @close="onClose"
      :width="400"
    >
      <a-tree checkable :checkedKeys="checkedKeys" default-expand-all :tree-data="treeData"
              :replace-fields="replaceFields" @check="onCheck">
        <template slot="custom" slot-scope="item">
          <div class="treeItem">
            <span class="treeTitle">{{ item.name }}</span>
            <a-slider :value="item.opacity*100" class="slider"
                      @change="onLayerOpacityChange($event,item)"></a-slider>
          </div>
        </template>
      </a-tree>
    </a-drawer>
  </div>
</template>


<script>
import {treeUtil} from '@/util/helpers/helper';

export default {
  name: "municipal-layer-control",
  inject: ['Cesium', 'CesiumZondy', 'webGlobe', 'commonConfig'],
  data() {
    return {
      visible: false,
      replaceFields: {
        title: 'name'
      },
      treeData: [],
      checkedKeys: []
    };
  },
  props: {
    title: {
      type: String,
      default: '图层控制'
    },
    layerGroupTree: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  mounted() {
    const scopedSlots = {title: 'custom'};

    //由于M3d图层数据加载慢，每秒轮询一次
    const resetChecked = () => {
      if (window.m3ds && window.commonConfig) {
        const layerGroupNamesTree = [window.commonConfig?.globalConfig?.layerGroupNamesTree] || this.layerGroupTree;
        let count = 0;
        const treeData = treeUtil.map(layerGroupNamesTree, (item) => {
          const name = item.title;
          const {title, Id, opacity, ...rest} = item;
          let layerIndex;
          if (!item.children) {
            layerIndex = count;
            count++;
          }
          return {
            ...rest,
            scopedSlots,
            name,
            visible: true,
            opacity: opacity || 1,
            layerIndex
          };
        });
        const checkedKeys = treeUtil.filter(treeData, (item) => item.visible === true).map(n => n.key);
        this.treeData = treeData;
        this.checkedKeys = checkedKeys;
        this.m3ds = window.m3ds;
        window.clearInterval(this.myInterval);
      }
    };
    this.reAskM3ds(resetChecked);
  },
  destroyed() {
    this.myInterval && window.clearInterval(this.myInterval);
  },
  watch: {
    checkedKeys: {
      handler() {
        if (this.treeData.length > 0) {
          this.onLayerVisibleChange();
        }
      },
      immediate: true
    }
  },
  methods: {
    showLayers() {
      this.visible = true;
    },
    reAskM3ds(callback) {
      this.myInterval = window.setInterval(() => {
        setTimeout(callback);
      }, 3000);
    },
    onClose() {
      this.visible = false;
    },
    onCheck(checkedKeys, info) {
      this.checkedKeys = checkedKeys;
    },
    onLayerVisibleChange() {
      const itemFlatten = treeUtil.flatten(this.treeData).filter(item => this.checkedKeys.indexOf(item.key) >= 0).map(ch => {
        return ch.name;
      });//找到对应的layerIndex
      if (this.m3ds?.length) {
        this.m3ds.filter((t, index) => itemFlatten.includes(this.findName(t))).forEach(layer => {
          layer.show = true;
        });
        this.m3ds.filter((t, index) => !itemFlatten.includes(this.findName(t))).forEach(layer => {
          layer.show = false;
        });
      }
    },
    findName(t){
      let gdbpUrl = t.gdbpUrl.split('\\');
      return gdbpUrl[gdbpUrl.length - 1].split('.')[0];
    },
    onLayerOpacityChange(value, item) {
      const key = item.key;
      treeUtil.forEach(this.treeData, (item) => {
        if (item.key !== key) {
          return;
        }
        item.opacity = value / 100;
        if (item.children && item.children.length !== 0) {
          treeUtil.forEach(item.children, (n) => n.opacity = value / 100);
        }
      });
      this.changeLayerOpacity(value, item);
    },
    changeLayerOpacity(value, item) {
      const itemFlatten = treeUtil.flatten([item]).map(ch => {
        return ch.name;
      });//找到对应的layerIndex
      const tilesetList = this.m3ds.filter((t, index) => itemFlatten.includes(this.findName(t)));
      tilesetList.forEach(tileset => {
        if (value === 100) {
          tileset.style = new Cesium.Cesium3DTileStyle();
        } else {
          tileset.style = new Cesium.Cesium3DTileStyle({
            color: {
              conditions: [
                ['true', `color("white",${value / 100})`]
              ]
            },
            show: true
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.treeItem {
  width: 100%;
  display: flex;
  align-items: center;
  padding-right: 40px;

  .treeTitle {
    margin-right: 20px;
  }

  .slider {
    flex: 1;
  }
}

</style>
