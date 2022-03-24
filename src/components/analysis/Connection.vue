<template>
  <div>
    <municipal-panel :title="title" :draggable="draggable" @onClose="$emit('onClose')" :closable="closable"
                     :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
      <template v-slot:content>
        <a-row>
          <a-col :span="4" class="input-item">
            <div class="icon-wrapper">
              <municipal-icon name="-vector-polyline" @click="handleConnect"></municipal-icon>
            </div>
          </a-col>
          <a-col :span="20" class="input-item">
            <span>请选择管线的两点</span>
          </a-col>
        </a-row>
      </template>
    </municipal-panel>
    <municipal-cursor-tip v-if="cursorVisible" :container="container">
      <span>左键选择管段,右键取消</span>
    </municipal-cursor-tip>
  </div>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import vueOptions from "@/util/options/vueOptions";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

export default {
  name: "municipal-connection",
  mixins: [loadingM3ds],
  data() {
    return {
      drawItems: ['line'],
      cursorVisible: false,
      container: document.getElementsByClassName('cesium-viewer'),
      layerIds: [],
      oids: []
    };
  },
  props: {
    ...panelOptions,
    ...vueOptions,
    title: {
      type: String,
      default: '联通分析'
    }
  },
  methods: {
    handleConnect() {
      this.removeAll();
      this.cursorVisible = true;
      this.registerMouseEvent();
    },
    leftClick(movement) {
      const pickedFeature = this.view.scene.pick(movement.position);
      if (!Cesium.defined(pickedFeature)) {
        this.$message.warn('请点击管段');
        return;
      }
      //获取layerId和oid
      const propertys = pickedFeature.getPropertyNames();
      let oid = '';
      if (propertys.includes('name')) {
        oid = pickedFeature.getProperty('name').split('_')[2];
        this.oids.push(oid);
      } else if (propertys.includes('OID')) {
        oid = pickedFeature.getProperty('OID');
        this.oids.push(oid);
      } else {
        return;
      }

      let layerId = pickedFeature.tileset.layerId;
      this.layerIds.push(layerId);
      this.emgManager.binkPipe(null, null, pickedFeature);
      if (this.layerIds.length >= 2) {
        const param = {
          layerId0: this.layerIds[0],
          layerId1: this.layerIds[1],
          objectId0: this.oids[0],
          objectId1: this.oids[1]
        };
        this.$emit('queryConnect', {...commonParam, ...param});
        this.mouseEventManager.unRegisterMouseEvent('LEFT_CLICK');
        this.mouseEventManager.unRegisterMouseEvent('RIGHT_CLICK');
        this.cursorVisible = false;
      }
    }
  }
};
</script>

<style scoped lang="scss">
@import "../var";

.icon-wrapper {
  font-size: 16px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  cursor: pointer;

  &:hover {
    background-color: $highlight-color;
  }
}

.input-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
  min-height: 40px;

  .input-tag {
    display: flex;
    justify-content: center;
  }
}
</style>
