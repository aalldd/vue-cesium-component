<template>
  <municipal-overburden :layerData="layerData" :defaultCheckedKeys="defaultCheckedKeys"></municipal-overburden>
</template>

<script>
import Store from "@/store/store";

export default {
  name: "OverBurdenAna",
  data() {
    return {
      layerData: [],
      defaultCheckedKeys: [],
      hitType: 3,
      count: 0
    };
  },
  mounted() {
    this.store = new Store();
    const vm = this;
    const getOverBurdenRule = async () => {
      if (vm.count >= 10) {
        vm.count = 0;
        this.$message.warn('请检查服务接口是否正常');
        window.clearInterval(vm.myInterval);
      } else {
        vm.count++;
      }
      if (window.commonParam) {
        const {mapServerName} = window.commonParam;
        const params = {
          hitType: vm.hitType
        };
        const {data} = await vm.store.GetHitDetectRulInfo(mapServerName, params);
        const result = [];
        let checkedKeys = [];
        if (data.length) {
          data.forEach((item, index) => {
            let pr = {
              title: item,
              key: index,
              value: index
            };
            result.push(pr);
            checkedKeys.push(index);
          });
        }
        vm.layerData = result;
        vm.defaultCheckedKeys = checkedKeys;
        vm.count = 0;
        window.clearInterval(vm.myInterval);
      }
    };
    vm.reAsked(getOverBurdenRule);
  },
  methods: {
    reAsked(callback) {
      this.myInterval = window.setInterval(() => {
        setTimeout(callback);
      }, 1000);
    }
  }
};
</script>

<style scoped>

</style>
