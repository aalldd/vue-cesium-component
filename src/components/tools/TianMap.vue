<template>
  <div class="tool-item" @click="loadBaseMap">
    <municipal-icon name="-map"></municipal-icon>
  </div>
</template>

<script>

export default {
  name: "municipal-tian",
  inject: ['CesiumZondy', 'webGlobe'],
  data() {
    return {
      tianMapVisible: false
    };
  },
  props: {
    wmtsMap: {
      type: Object
    },
    mapType: {
      type: String,
      default: '天地图',
      validator(value) {
        return ['天地图', '百度矢量', '百度遥感', '高德矢量', '高德影像'].indexOf(value) >= 0;
      }
    }
  },
  mounted() {
    this.thirdPartyLayer = null;
    this.baseLayer = null;
  },
  methods: {
    loadBaseMap() {
      if (!this.wmtsMap) {
        this.$message.warn('请传入天地图对象');
        return;
      }
      let {url, token, ptype} = this.wmtsMap;
      url = url || 'http://t0.tianditu.com/DataServer?T=vec_c&X={x}&Y={y}&L={l}';
      token = token || '9c157e9585486c02edf817d2ecbc7752';
      ptype = ptype || 'vec';

      if (this.tianMapVisible) {
        this.thirdPartyLayer && this.baseLayer && this.thirdPartyLayer.removeImageLayer(this.baseLayer);
      } else {
        if (!this.thirdPartyLayer) {
          //构造第三方图层对象
          this.thirdPartyLayer = new CesiumZondy.Layer.ThirdPartyLayer({
            viewer: this.webGlobe.viewer
          });
        }
        if (this.mapType === '天地图') {
          //加载天地图
          this.baseLayer = this.thirdPartyLayer.appendTDTuMap({
            //天地图经纬度数据
            url: 'http://t0.tianditu.com/DataServer?T=vec_c&X={x}&Y={y}&L={l}',
            //开发token （请到天地图官网申请自己的开发token，自带token仅做功能验证随时可能失效）
            token: "9c157e9585486c02edf817d2ecbc7752",
            //地图类型 'vec'矢量 'img'影像 'ter'地形
            ptype: "vec"
          });
        } else if (this.mapType === '百度矢量') {
          this.baseLayer = this.thirdPartyLayer.appendBaiduMap({
            ptype: 'tile'
          });
        } else if (this.mapType === '百度遥感') {
          this.baseLayer = this.thirdPartyLayer.appendBaiduMap({
            ptype: 'sate'
          });
        } else if (this.mapType === '高德矢量') {
          this.baseLayer = this.thirdPartyLayer.appendGaodeMap({
            ptype: 'vec'
          });
        } else if (this.mapType === '高德影像') {
          this.baseLayer = this.thirdPartyLayer.appendGaodeMap({
            ptype: 'img'
          });
        }
      }
      this.tianMapVisible = !this.tianMapVisible;
    }
  }
};
</script>

<style scoped lang="scss">

</style>
