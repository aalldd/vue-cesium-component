<template>
  <municipal-panel :draggable="draggable" @close="$emit('onClose')" :title="title"
                   :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
    <template v-slot:content>
      <div class="content">
        <div class="icon" @click="clickQuery">
          <municipal-icon name="-vector-square" ></municipal-icon>
        </div>
        <span class="title">点击查询</span>
        <municipal-cursor-tip v-if="cursorVisible">
          <span>左键点击查询，右键结束</span>
        </municipal-cursor-tip>
      </div>
    </template>
  </municipal-panel>
</template>

<script>
import PanelOpts from '@/util/options/panelOptions';

export default {
  name: "clickQuery",
  props: {
    ...PanelOpts,
    title: {
      type: String,
      default: '点击查询'
    },
    panelStyle:{
      type:Object,
      default:()=>{
        return {
          width:'250px',
          position:'absolute',
          top:'4em',
          right:'4em'
        }
      }
    }
  },
  data() {
    return {
      cursorVisible: false
    };
  },
  methods: {
    clickQuery() {
      this.cursorVisible = true;
      document.oncontextmenu = () => {
        if (this.cursorVisible) {
          this.cursorVisible = false;
        }
        return false;
      };
    }
  }
};
</script>

<style scoped lang="scss">
.content {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  vertical-align: middle;
  padding-left: 50px;
  .icon{
    cursor: pointer;
  }
  .title {
    margin-left: 20px;
  }
}
</style>
