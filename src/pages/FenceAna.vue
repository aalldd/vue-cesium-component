<template>
  <div>
    <municipal-fence :title="title" v-if="fenceVisible" :status="status" :initFormData="fenceData"
                     @savePlan="savePlan"></municipal-fence>
    <municipal-plan-mananger v-if="planVisible" :title="titlePlan" @close="planVisible=false"
                             :dataSource="planData"
                             @addPlan="addPlan"
                             @onRowClick="previewPlan"
                             @modifyPlan="modifyPlan"
                             @deletePlan="deletePlan"
                             :loading="loading">
    </municipal-plan-mananger>
  </div>
</template>

<script>
import Store from "@/store/store";

export default {
  name: "FenceAna",
  data() {
    return {
      title: '新增电子围栏方案',
      titlePlan: '电子围栏方案管理',
      planVisible: true,
      fenceVisible: false,
      loading: false,
      //全部的电子围栏方案数据，从服务获取
      planData: [],
      status: 'add',
      //当前需要去编辑的电子围栏数据，是单条的数据，但是需要整理为Array<{uniKey,title,value}>的数据形式
      fenceData: []
    };
  },
  mounted() {
    this.store = new Store();
    this.getFenceData();
  },
  methods: {
    addPlan() {
      this.fenceVisible = true;
      this.status = 'add';
      this.title = '新增电子围栏方案';
    },
    previewPlan(record) {
      this.formatData(record);
      this.fenceVisible = true;
      this.status = 'preview';
      this.title = '预览电子围栏方案';
    },
    formatData(record) {
      let result = [];
      for (let key in record) {
        let value = record[key];
        result.push({
          uniKey: key,
          value: value
        });
      }
      this.fenceData = result;
    },
    modifyPlan(record) {
      this.formatData(record);
      this.fenceVisible = true;
      this.isPreview = true;
      this.status = 'modify';
      this.title = '修改电子围栏方案';
    },
    async deletePlan(record) {
      const data = await this.store.deleteFenceData({
        ID: record.ID
      });
      if (data.statusCode == '0000') {
        this.$message.success('删除成功！');
        await this.getFenceData();
        this.planVisible = false;
      } else {
        this.$message.error("删除失败！");
      }
    },
    async getFenceData() {
      const fenceData = await this.store.getFenceData();
      let result = [];
      if (fenceData && fenceData.success) {
        if (fenceData.data?.length > 0) {
          fenceData.data.forEach((item, index) => {
            result.push({
              ...item,
              key: index + 1
            });
          });
        }
      }
      this.planData = result;
    },
    savePlan(data, status) {
      const pointArr = data.pointArr;
      const minimumHeights = data.minimumHeights;
      data.pointArr = "'" + pointArr + "'";
      data.minimumHeights = "'" + minimumHeights + "'";
      //新增电子围栏数据
      const modifyData = async (type, ID) => {
        let param;
        type === '保存' ? param = {
          type: 'add',
          ...data
        } : param = {
          ID,
          ...data
        };
        const res = await this.store.addFenceData(param);
        if (res.success) {
          this.$message.success(`${type}成功`);
          this.getFenceData();
        } else {
          this.$message.error(`${type}失败`);
        }
      };
      //如果有状态，就用状态去判断
      if (status) {
        if (status === 'add') {
          modifyData('保存');
        } else {
          modifyData('修改', data.ID);
        }
      } else {
        // 没有状态，就用id去判断
        if (!data.ID) {
          modifyData('保存');
        } else {
          modifyData('修改', data.ID);
        }
      }
    }
  }
};
</script>

<style scoped>

</style>
