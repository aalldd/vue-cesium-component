<template>
  <municipal-fix-roam :modelList="modelList"
                      title="场景漫游"
                      @saveRoam="saveRoam"
                      @deleteRoamPlan="deleteRoamPlan"
                      :roamPlanData="roamData"></municipal-fix-roam>
</template>
<script>
const baseUrl = '/static/cesium/model';
import Store from '@/store/store';

export default {
  name: "FixRoamAna",
  data() {
    return {
      modelList: [
        {
          value: `${baseUrl}/xiaofangche.gltf`,
          name: '消防车'
        },
        {
          value: `${baseUrl}/car.gltf`,
          name: '小车'
        }, {
          value: `${baseUrl}/tejingche.gltf`,
          name: '特警车'
        }, {
          value: `${baseUrl}/person.gltf`,
          name: '人'
        }
      ],
      roamData: [],
      loading: false
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    saveRoam(data, id) {
      let resultData = {key: this.roamData.length + 1, ...data};
      //需要根据是否存在id来判断是添加新方案还是修改方案
      if (!id) {
        this.addRoamPlan(resultData);
      } else {
        this.modifyRoamPlan(id, data);
      }
    },
    async addRoamPlan(data) {
      const dataRes = await this.store.addRoamData({
        type: "add",
        ...data
      });
      if (dataRes.success) {
        this.$message.success('保存成功！');
        await this.getData();
      } else {
        this.$message.error('保存失败！');
      }
    },
    async modifyRoamPlan(id, resultData) {
      const dataRes = await this.store.addRoamData({
        ID: id,
        ...resultData
      });
      if (dataRes.success) {
        this.$message.success('修改成功！');
        await this.getData()
      } else {
        this.$message.error('修改失败！');
      }
    },
    async deleteRoamPlan(dataRes) {
      const {ID} = dataRes;
      const data = await this.store.deleteRoamData({ID});
      if (data.statusCode == '0000') {
        this.$message.success('删除成功！');
        await this.getData();
      } else {
        this.$message.error("删除失败！");
      }
    },
    async getData() {
      this.loading = true;
      const store = new Store();
      this.store = store;
      const roamData = await store.getRoamData();
      if (roamData && roamData.success) {
        const data = [];
        roamData.data.forEach((item, index) => {
          data.push({
            ...item,
            key: index + 1,
            loop: item.isLoop ? '是' : '否'
          });
        });
        this.roamData = data;
      }
      this.loading = false;
    }
  }
};
</script>

<style scoped>

</style>
