<!--/**-->
<!--* 粒子分析-基于平台二次封装-->
<!--* 参数列表见props-->
<!--* created by wangshiyang    2021.01-18-->
<!--*/-->
<template>
  <m-panel :draggable="true" :title="title" :need-expand="true">
      <template v-slot:content>

      </template>
  </m-panel>
</template>

<script>
import Panel from '../common/Panel';
export default {
  name: "particular",
  components:{
    'm-panel':Panel
  },
  props:{
    title:{
      type:String,
      default:'粒子分析'
    }
  }
};
</script>

<style scoped lang="scss">
  .mapgis-ui-particular{

  }
</style>
