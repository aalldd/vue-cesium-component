<template>
  <municipal-flood>
    <municipal-rain title="降雨信息" :rain-level="rainLevel" @onClose="onClose"
                    v-if="panelVisible"></municipal-rain>
  </municipal-flood>
</template>

<script>
import funMixin from "@/pages/funMixin";
export default {
  name: "FloodAna",
  mixins:[funMixin],
  data() {
    return {
      rainLevel: [{rain: '小雨', level: '0——0.41', rainSpeed: 4},
        {rain: '中雨', level: '0.41——1.04', rainSpeed: 8},
        {rain: '大雨', level: '1.04——2.08', rainSpeed: 12},
        {rain: '暴雨', level: '2.08——4.17', rainSpeed: 20},
        {rain: '大暴雨', level: '4.17——10.41', rainSpeed: 30},
        {rain: '特大暴雨', level: '10.41——以上', rainSpeed: 50}]
    };
  }
};
</script>

<style scoped>

</style>
