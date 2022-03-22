<template>
  <municipal-linkage :m3dInfos3d="m3dInfos3d" :m3dInfos2d="m3dInfos2d" :pluginPath="pluginPath" :cameraView="cameraView"
                     :libPath="libPath">

  </municipal-linkage>
</template>

<script>
export default {
  name: "linkageAna",
  data() {
    return {
      m3dInfos3d: null,
      pluginPath: null,
      libPath: null,
      m3dInfos2d: null,
      cameraView: {
        destination: {
          x: -2416948.392038159,
          y: 5372543.175879652,
          z: 2444631.2541255946
        },
        orientation: {
          heading: 0.08752,
          pitch: -1.57,
          roll: 0
        }
      },
    };
  },
  mounted() {
    //从三维的本地缓存数据中获取
    const totalData = JSON.parse(window.localStorage.getItem('linkageDataStore')) || {};
    this.m3dInfos3d = totalData.m3dInfos3d;
    this.m3dInfos2d = totalData.m3dInfos2d;
    this.pluginPath = totalData.pluginPath;
    this.libPath = totalData.libPath;
  }
};
</script>

<style scoped>

</style>
