<template>
  <div>
    <municipal-tunnel title="隧道分析" :layerIndexs="layerIndexs" @sendQueryParam="getQueryParam"></municipal-tunnel>
    <municipal-result-common title="隧道分析结果" :panelPosition="panelPosition"
                             @onRowClick="onRowClick"
                             @onTabsChange="onTabsChange"
                             @onPageChange="onPageChange"
                             :exportFileName="exportFileName"
                             :tabs="tabs"></municipal-result-common>
    <municipal-result-simple title="隧道分析结果" :panelPosition="panelSimPosition"
                             @onRowClick="onRowClick"
                             @onTabsChange="onTabsChange"
                             @onPageChange="onPageChange"
                             :exportFileName="exportFileName"
                             :columns="columns"
                             :dataSource="data"
    ></municipal-result-simple>
  </div>
</template>

<script>
import Store from '@/store/store';

const columns = [
  {title: 'Full Name', dataIndex: 'name', key: 'name'},
  {title: 'age', dataIndex: 'age', key: 'age'},
  {title: 'address', dataIndex: 'address', key: '1'},
  {title: 'hobby', dataIndex: 'hobby', key: '2'}
];
const data = [];
for (let i = 0; i < 100; i++) {
  data.push({
    key: i,
    name: `Edrward ${i}`,
    age: 32,
    address: `London Park no. ${i}`,
    hobby: 'badminton'
  });
}
const tabs = [];
for (let i = 0; i < 30; i++) {
  const tabName = `Tabs-${i}`;
  const features = data;
  tabs.push({
    tabName,
    features,
    columns: columns,
    exportFileName: 'exportData'
  });
}

export default {
  name: "tunnelAna",
  inject: ['webGlobe'],
  data() {
    return {
      panelPosition: 'left',
      panelSimPosition: 'bottom',
      tabs,
      data,
      columns,
      exportFileName: '全部数据',
      layerIndexs: [0, 1]
    };
  },
  mounted() {
    this.store = new Store(this.webGlobe, window.m3ds);
  },
  methods: {
    async getQueryParam(param) {
      console.log(param);
      console.log(window.m3ds);
      const m3ds = window.m3ds;
      const promises = m3ds.filter((t, index) => [12].indexOf(index) >= 0).map(t => {
        if (t.gdbp && t.civFeatureType) {
          let params = {
            gdbp: t.gdbp,
            f: 'json',
            pageCount: 20000,
            geometry: param.geometry,
            geometryType: param.geometryType
          };
          // if (typeof t.civFeatureType === 'string' && _.endsWith(t.civFeatureType, 'Line')) {
          //   params.where = `起点地面高程>${param.range[0]}and 起点地面高程<${param.range[1]}`;
          // } else {
          //   params.where = `地面高程>${param.range[0]}and 地面高程<${param.range[1]}`;
          // }

          return this.store.query(params, t.url);//条件查询
        }
      });
      let data = await Promise.all(promises);
      console.log(data);
    },
    onRowClick(record) {
      console.log(record);
    },
    onTabsChange(record) {
      console.log(record);
    },
    onPageChange(pagination) {
      console.log(pagination);
    }
  }
};
</script>

<style scoped>

</style>
