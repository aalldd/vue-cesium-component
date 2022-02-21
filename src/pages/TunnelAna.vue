<template>
  <div>
    <municipal-tunnel title="隧道分析"></municipal-tunnel>
    <municipal-result title="隧道分析结果" :panelPosition="panelPosition"
                      :tabs="tabs"></municipal-result>
  </div>
</template>

<script>

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
    columns:[
      {title: 'Full Name', dataIndex: 'name', key: 'name'},
      {title: 'age', dataIndex: 'age', key: 'age'},
      {title: 'address', dataIndex: 'address', key: '1'},
      {title: 'hobby', dataIndex: 'hobby', key: '2'}
    ],
    exportFileName:'exportData'
  });
}



export default {
  name: "tunnelAna",
  data() {
    return {
      panelPosition: 'left',
      tabs,
      exportFileName:{
        '导出全部':'全部数据',
        '导出当前页签':''
      }
    };
  }
};
</script>

<style scoped>

</style>
