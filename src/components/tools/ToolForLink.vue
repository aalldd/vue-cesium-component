<template>
  <div class="controlTools">
    <municipal-measure :vueKey="vueKey" v-if="this.toolComponents.indexOf('measure')>=0"
                       @measureResult="handleMeasure"></municipal-measure>
    <municipal-draw :vueKey="vueKey" v-if="this.toolComponents.indexOf('draw')>=0" enable-menu-control="menu"
                    @drawcreate="handleDraw"></municipal-draw>
    <municipal-fullScreen v-if="this.toolComponents.indexOf('fullScreen')>=0"
                          :initScreen="false"></municipal-fullScreen>
    <municipal-tian v-if="this.toolComponents.indexOf('tian')>=0" :wmtsMap="wmtsMap"></municipal-tian>
    <municipal-layer-control v-if="this.toolComponents.indexOf('layerControl')>=0"></municipal-layer-control>
    <municipal-home v-if="this.toolComponents.indexOf('home')>=0" :cameraView="cameraView"></municipal-home>
    <municipal-click-query-link v-if="this.toolComponents.indexOf('clickQuery')>=0"
                                :clickQueryData="clickQueryData"
                                :popupOffset="popupOffset"
                                :queryType="queryType"
                                :radius="radius"
                                @clickQuery2d="clickQuery2d"
                                @clickQuery3d="clickQuery3d"></municipal-click-query-link>
  </div>
</template>

<script>
export default {
  name: "municipal-tool-link",
  data() {
    return {
      wmtsMapObj: {},
      cameraViewObj: {}
    };
  },
  props: {
    vueKey: {
      type: String,
      default: 'default'
    },
    vueIndex: {
      type: Number
    },
    toolComponents: {
      type: Array,
      default: () => {
        return ['measure', 'draw', 'fullScreen', 'tian', 'home', 'layerControl', 'clickQuery'];
      }
    },
    wmtsMap: {
      type: Object
    },
    cameraView: {
      type: Object
    },
    clickQueryData: {
      type: Object
    },
    popupOffset: {
      type: Array,
      default: () => {
        return [0, 0];
      }
    },
    queryType: {
      type: String,
      default: '3d'
    },
    radius: {
      type: Number,
      default: 3
    }
  },
  updated() {
    this.wmtsMapObj = this.wmtsMap;
    this.cameraViewObj = this.cameraView;
  },
  computed: {
    renderTool(item) {
      return this.toolComponents.indexOf(item) >= 0;
    }
  },
  methods: {
    handleDraw(payload) {
      this.$emit('drawcreate', payload);
    },
    handleMeasure(payload) {
      this.$emit('measured', payload);
    },
    clickQuery3d(payload) {
      this.$emit('clickQuery3d', payload);
    },
    clickQuery2d(payload) {
      this.$emit('clickQuery2d', payload);
    }
  }
};
</script>

<style lang="scss">
.controlTools {
  position: absolute;
  right: 1em;
  bottom: 2em;
  width: 2em;

  .tool-item {
    width: 2em;
    height: 2em;
    background-color: var(--background-base);
    color: var(--text-color);
    border: 1px solid var(--border-color-base);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:hover {
      background-color: var(--hover-color);
    }
  }

  .toolbar-wrapper {
    position: absolute;
    right: 100%;
    top: 0;
    display: flex;
  }
}
</style>
