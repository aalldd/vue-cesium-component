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
import {buffer} from "@turf/turf";
import emgUtil from "@/util/helpers/emgUtil";

export default {
  name: "municipal-click-query-link",
  inject: ['webGlobe', 'CesiumZondy', 'm3ds', 'commonConfig'],
  data() {
    return {
      cursorVisible: false,
      container: document.getElementsByClassName('cesium-viewer'),
    };
  },
  mounted() {
    //由于M3d图层数据加载慢，每秒轮询一次
    const vm = this;
    let CesiumZondy = vm.CesiumZondy;
    const m3dName = `m3ds_${vm.queryType}`;
    const resetChecked = () => {
      if (vm.webGlobe && vm.commonConfig && CesiumZondy) {
        window[m3dName] = vm.m3ds;
        vm.webGlobe.tilesetList = vm.m3ds;
        vm.emgManager = new emgUtil(vm.webGlobe);
        vm.commonConfig = window.commonConfig;
        vm.mapServerName = vm.commonConfig?.globalConfig?.mapServerName;
        vm.offset = vm.commonConfig?.globalConfig?.offset;
        vm.layerIndexs = vm.commonConfig?.globalConfig?.cutLayerIndexList;
        vm.sceneManager = new CesiumZondy.Manager.SceneManager({viewer: vm.webGlobe.viewer});
        //初始化分析功能管理类
        vm.analysisManager = new CesiumZondy.Manager.AnalysisManager({
          viewer: this.webGlobe.viewer
        });
        vm.entityController = new CesiumZondy.Manager.EntityController({
          viewer: this.webGlobe.viewer
        });
        //过滤出地上模型以及地上模型的计算矩阵
        if (vm.layerIndexs) {
          vm.tilesetList = vm.m3ds.filter(t => this.layerIndexs.includes(t.layerIndex));
          if (vm.tilesetList?.length) {
            vm.transform = vm.tilesetList[0]?.root?.transform;
          }
        }
        vm.commonParam = {
          offset: vm.offset,
          mapServerName: vm.mapServerName,
          cutLayerIndexs: vm.layerIndexs,
          m3ds: vm.m3ds
        };
        vm.$emit('load', vm);
        window.clearInterval(vm.myInterval);
      }
    };
    vm.reAsked(resetChecked);
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
    },
    queryType: {
      type: String,
      default: '3d',
      validator(value) {
        return ['2d', '3d'].indexOf(value) >= 0;
      }
    },
    //二维查询的缓冲范围
    radius: {
      type: Number,
      default: 3
    }
  },
  watch: {
    clickQueryData: {
      handler() {
        if (this.clickQueryData && Object.keys(this.clickQueryData).length > 0) {
          //校验数据源是否包含gisData，emgData，title这三个字段
          this.showPopUp();
        }
      },
      immediate: true
    }
  },
  destroyed() {
    const vm = this;
    vm.emgManager.removeAll();
  },
  methods: {
    reAsked(callback) {
      const vm = this;
      vm.myInterval = window.setInterval(() => {
        setTimeout(callback);
      }, 1000);
    },
    query() {
      const vm = this;

      vm.emgManager.removeAll();
      vm.cursorVisible = true;
      if (!this.mouseEventManager) {
        //构造鼠标事件管理对象
        this.mouseEventManager = new CesiumZondy.Manager.MouseEventManager({
          viewer: this.webGlobe.viewer
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
      //由于二三维联动中，点击二维的管点管线，特别细，不好点击，所以要走另外一条逻辑
      this.queryType === '3d' && this.clickQuery3d(movement);
      this.queryType === '2d' && this.clickQuery2d();
    },
    showPopUp() {
      const {gisData, emgData, title} = this.clickQueryData;
      gisData && this.emgManager.addPopup(gisData, emgData, title, this.position, 0, this.popupOffset);
    },
    clickQuery3d(movement) {
      const pickedFeature = this.webGlobe.scene.pick(movement.position);
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
      console.log(this.commonParam);
      this.$emit('clickQuery3d', {
        pickedFeature: pickedFeature,
        ...this.commonParam
      });
      this.currentPicked = pickedFeature;
    },
    clickQuery2d() {
      const {lng, lat} = this.position;
      const origindata = {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Point",
            "coordinates": [lng, lat]
          }
        }]
      };
      const geojson = buffer(origindata, this.radius, {
        units: 'meters'
      });
      if (geojson?.features.length && geojson.features[0]?.geometry?.coordinates.length) {
        let polygonArr = [];
        let points = geojson.features[0].geometry.coordinates[0].reduce((a, b) => a.concat(b), []);
        points.forEach((point, index) => {
          if (index % 2 === 0) {
            const pointM = this.emgManager.positionTransfer({lng: point, lat: points[index + 1], height: 0});
            polygonArr.push(pointM);
          }
        });
        this.$emit('clickQuery2d', {...this.commonParam, positions: polygonArr});
      }
    }
  }
};
</script>

<style scoped>

</style>
