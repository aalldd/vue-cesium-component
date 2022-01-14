<!--/**-->
<!--* 洪水淹没分析-基于平台二次封装-->
<!--* 参数列表-->
<!--* created by wangshiyang    2021.11.25-->
<!--*/-->
<template>
  <div class="storybook-ui-card">
    <mapgis-3d-analysis-flood
      :startHeight="startHeight"
      :minHeight="minHeight"
      :maxHeight="maxHeight"
      :floodColor="floodColor"
      :floodSpeed="floodSpeed"
      :specularIntensity="specularIntensity"
      :amplitude="amplitude"
      :animationSpeed="animationSpeed"
      :frequency="frequency"
      @load="(payload)=>{$emit('load',payload)}"
    >
      <!--      这里是自定义的界面-->
      <slot></slot>
    </mapgis-3d-analysis-flood>
  </div>
</template>

<script>
const {Mapgis3dFlood} = window.Mapgis3d;
export default {
  name: 'mapgis-flood',
  inject:['Cesium','CesiumZondy','webGlobe'],
  components: {
    'mapgis-3d-analysis-flood': Mapgis3dFlood
  },
  props: {
    startHeight: {
      type: Number,
      default: 0
    },
    minHeight: {
      type: Number,
      default: 0
    },
    maxHeight: {
      type: Number,
      default: 2000
    },
    floodColor: {
      type: String,
      default: 'rgba(149,232,249,0.5)'
    },
    floodSpeed: {
      type: Number,
      default: 500
    },
    //反射光线强度
    specularIntensity: {
      type: Number,
      default: 2
    },
    //水波高度
    amplitude: {
      type: Number,
      default: 10
    },
    //水波速度
    animationSpeed: {
      type: Number,
      default: 0.1
    },
    //水纹频率
    frequency: {
      type: Number,
      default: 500
    }
  },
  mounted() {
    if (!this.$parent.vueKey) {
      this.$message.warn('分析功能组件需挂载在地图组件之上！');
    }
  }
};
</script>

<style scoped>
.storybook-ui-card {
  position: absolute;
  right: 10px;
  top: 10px;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
}
</style>
