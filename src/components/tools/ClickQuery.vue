<template>
  <div>
    <div class="tool-item" @click="query">
      <a-icon type="search"></a-icon>
    </div>
    <municipal-cursor-tip v-if="cursorVisible" :container="container">
      <span>左键点击测量，右键结束</span>
    </municipal-cursor-tip>
  </div>
</template>

<script>
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

export default {
  name: "municipal-click-query",
  mixins: [loadingM3ds],
  data() {
    return {
      cursorVisible: false,
      container: document.getElementsByClassName('cesium-viewer'),
    };
  },
  props: {
    clickQueryData: {
      type: Object
    },
    popupOffset: {
      type: Array,
      default: () => {
        return [0, 0];
      }
    }
  },
  watch: {
    clickQueryData: {
      handler() {
        if (Object.keys(this.clickQueryData).length > 0) {
          //校验数据源是否包含gisData，emgData，title这三个字段
          this.showPopUp();
        }
      },
      immediate: true
    }
  },
  destroyed() {
    this.removeAll();
  },
  methods: {
    query() {
      this.removeAll();
      this.cursorVisible = true;
      if (!this.mouseEventManager) {
        //构造鼠标事件管理对象
        this.mouseEventManager = new CesiumZondy.Manager.MouseEventManager({
          viewer: this.view.viewer
        });
      }
      //注册鼠标左键单击事件
      this.mouseEventManager.registerMouseEvent('LEFT_CLICK', (movement) => this.leftClick(movement));
      //注册鼠标右键单击事件
      this.mouseEventManager.registerMouseEvent('RIGHT_CLICK', () => {
        this.mouseEventManager.unRegisterMouseEvent('LEFT_CLICK');
        this.mouseEventManager.unRegisterMouseEvent('RIGHT_CLICK');
        this.cursorVisible = false;
      });
    },
    leftClick(movement) {
      this.position = this.emgManager.getPosition(movement);
      this.emgManager.removePopUp();
      const pickedFeature = this.view.scene.pick(movement.position);
      if (!Cesium.defined(pickedFeature)) {
        this.mouseEventManager.registerMouseEvent('LEFT_CLICK', (movement) => this.leftClick(movement));
        this.$message.warn('请点击管道');
        return;
      }
      if (!pickedFeature.getPropertyNames) {
        this.mouseEventManager.registerMouseEvent('LEFT_CLICK', (movement) => this.leftClick(movement));
        return;
      }
      this.currentPicked && this.emgManager.stopHighlight([this.currentPicked.tileset]);
      if (pickedFeature.primitive.gdbp && pickedFeature.getPropertyNames) {
        this.emgManager.highlight(pickedFeature);
      }
      this.$emit('clickQuery', {pickedFeature: pickedFeature, mapServerName: this.mapServerName, offset: this.offset});
      this.currentPicked = pickedFeature;
    },
    showPopUp() {
      const {gisData, emgData, title} = this.clickQueryData;
      gisData && this.emgManager.addPopup(gisData, emgData, title, this.position, 0, this.popupOffset);
    }
  }
};
</script>

<style scoped>

</style>
