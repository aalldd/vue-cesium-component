<template>
  <municipal-panel :title="title" :draggable="draggable" @close="$emit('onClose')" :closable="closable"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <a-tabs type="card" @change="tabsChange" :active-key="0">
        <a-tab-pane v-for="(item,index) in tabArr" :key="index">
          <div v-if="index===0">
            <a-tree show-icon checkable :tree-data="squibRes" :checkedKeys="checkedKeys" @check="choosedLayer">
              <a-icon slot="switcherIcon" type="down"/>
              <!--              每条数据前的图标-->
              <img v-for="(item,index) in iconList" style="width: 20px;height: 20px" :src="item.icon" alt=""
                   :slot="item.type" :key="index">

              <!--              数据项后面添加图标显示爆管点个数-->
              <template slot="badge" slot-scope="item">
                <span style="margin-right: 20px">{{ item.title }}</span>
                <a-badge :count="item.count" :overflow-count="9999"
                         style="background-color:#52c41a;margin-right: 10px"/>
              </template>
              <!--              对于用户数据，需额外显示用户数-->
              <template slot="user" slot-scope="item">
                <span style="margin-right: 20px">{{ item.title }}</span>
                <a-badge :count="item.count" :overflow-count="9999"
                         style="background-color:#52c41a;margin-right: 10px"/>
                <a-badge :count="item.totalUser" :overflow-count="9999" style="background-color:#ff0000"/>
              </template>
              <!--              对于子项，需显示详情按钮-->
              <template slot="subItems" slot-scope="item">
                <span style="width: 160px;display: inline-block">{{ item.title }}}</span>
                <span @click="detailClick(item)"> <img style="width: 16px;height: 16px" :src="item.img"/>({{ item.total }})</span>
              </template>

            </a-tree>
          </div>
          <template slot="tab" v-if="index===1">
            <a-dropdown>
              <span>更多操作<a-icon type="down" style="margin-left: 5px"/></span>
              <a-menu slot="overlay" @click="handleMenuClick">
                <a-menu-item>
                  <span>扩大关阀</span>
                </a-menu-item>
              </a-menu>
            </a-dropdown>
          </template>
          <span slot="tab" v-else>{{ item }}</span>
        </a-tab-pane>
      </a-tabs>
    </template>
  </municipal-panel>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

const SQUIB_RESULT_TYPES = {
  SQUIBPOINT: "civFeatureMetaTypeIncidentPoint", //爆管发生点
  SHOULDCLOSEDSWITCH: "civFeatureMetaTypeSwitch", //需关断设备
  CLOSEDSWITCH: "civFeatureMetaTypeClosedSwitch", //已关断设备
  SHOULDOPENSWITCH: "civFeatureMetaTypeShouldOpenSwitch", //需开启设备
  INVALIDATESWITCH: "civFeatureMetaTypeInvalidateSwitch", //失效关断设备
  ASSISTSWITCH: "civFeatureMetaTypeAssistSwitch", //辅助关断设备
  EFFECTEDUSER: "civFeatureMetaTypeSwieffect", //受影响用户
  EFFECTEDPIPELINE: "civFeatureMetaTypePipeLine", //受影响管段
  EFFECTEDREGION: "civFeatureMetaTypeRegionResult", //受影响区域
  EFFECTEDRECENTER: "civFeatureMetaTypeRescenter", //受影响水源
  RESSTOP: "civFeatureMetaTypeResstop" //资源装卸点
};

const DISABLE_TYPES = [
  SQUIB_RESULT_TYPES.INVALIDATESWITCH,
  SQUIB_RESULT_TYPES.SHOULDOPENSWITCH,
  SQUIB_RESULT_TYPES.CLOSEDSWITCH
];
export default {
  name: "municipal-squibres",
  mixins: [loadingM3ds],
  data() {
    return {
      tabArr: ["分析结果", "更多操作", "返回"],
      iconList: [],
      squibRes: [],
      checkedKeys: []
    };
  },
  props: {
    ...panelOptions,
    title: {
      type: String,
      default: '爆管分析结果'
    },
    squibResults: {
      type: Array,
      default: () => {
        return [];
      }
    },
    loading: {
      type: Boolean,
      default: false
    },
    SQUIB_ICONS: {
      type: Object
    }
  },
  watch: {
    squibResults: {
      handler() {
        if (this.squibResults?.length > 0) {
          this.squibRes = this.squibResults.map((item, index) => {
            const {checked, icon, type, layerItems, typeName, ...rest} = item;
            let result = {key: index, checked, icon, type, title: typeName, slots: {icon: type}, children: [], ...rest};
            //将所有的icon放进去，渲染icon加slot
            this.iconList.push({
              type: type,
              icon: icon
            });
            //已关断设备//需开启设备//失效关断设备  设置禁止选中
            if (DISABLE_TYPES.indexOf(type) >= 0) {
              result.disabled = true;
            } else if (type === SQUIB_RESULT_TYPES.EFFECTEDUSER) {
              result.scopedSlots = {
                title: 'user'
              };
            } else {
              result.scopedSlots = {
                title: 'badge'
              };
            }
            if (layerItems.length > 0) {
              result.children = layerItems.map((layerItem, j) => {
                layerItem.key = `${index}-${j}`;
                layerItem.title = layerItem.typeName;
                layerItem.total = layerItem.objectIds.length;
                layerItem.img = this.SQUIB_ICONS.list;
                layerItem.scopedSlots = {
                  title: 'subItems'
                };
                return layerItem;
              });
            }
            return result;
          });
          //checkedKeys要在树加载完之后再拿
          this.squibRes.forEach(item => {
            item.checked && this.checkedKeys.push(item.key);
            if (item.children) {
              item.children.forEach(n => {
                n.checked && this.checkedKeys.push(n.key);
              });
            }
          });

        }
      },
      immediate: true
    }
  },
  methods: {
    tabsChange(key) {
      if (key === 2) {
        this.$emit('goBack');
      }
    },
    choosedLayer(checkedKeys) {
      this.checkedKeys = checkedKeys;
    },
    handleMenuClick(e){
      //用户点击扩大关阀按钮
      e.key==='0' && this.$emit('valvesExpand')
    },
    //点击设备详情
    detailClick(item){
      const detailParam={
        layerId: item.layerId,
        objectsId: item.objectIds,
        title: item.typeName + " - " + item.layerName,
        type: item.type,
      }
      this.$emit('detailClick',detailParam)
    }
  }
};
</script>

<style scoped>

</style>
