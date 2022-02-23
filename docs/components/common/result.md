---
title: 'result 结果面板'
---

# result结果面板

> 用于展示数据结果，是一个结合了tabs标签栏与table与导出功能的综合组件

## 基本用法

> result组件分为两种，一种是需要tabs分栏的，一种是不需要的

```vue

<template>
  <div>
    <!-- 需要tabs分标签的结果组件-->
    <municipal-result-common title="分析结果" :panelPosition="panelPosition"
                             @onRowClick="onRowClick"
                             @onTabsChange="onTabsChange"
                             @onPageChange="onPageChange"
                             :exportFileName="exportFileName"
                             :tabs="tabs"></municipal-result-common>
    <!--  不需要tabs分标签的结果组件-->
    <municipal-result-simple title="分析结果" :panelPosition="panelPosition"
                             @onRowClick="onRowClick"
                             @onTabsChange="onTabsChange"
                             @onPageChange="onPageChange"
                             :exportFileName="exportFileName"
                             :data="data"
                             :columns="columns"
    ></municipal-result-simple>
  </div>
</template>

<script>
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
      tabs,
      data,
      columns,
      exportFileName: '全部数据',
      layerIndexs: [0, 1]
    };
  },
  methods: {
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
```

## 属性

### 属性说明

属性|说明|取值类型|默认值
--|:--:|:--:|:--:
[panelProps](https://aalldd.github.io/vue-cesium-component/components/common/panel.html#属性)|见面板工具属性说明|Attr|见面板工具说明
panelPosition|结果面板所处的位置(支持bottom,left,right三种)|String|bottom load|结果面板是否处于加载状态|Boolean|false
exportFileName|导出的excel文件名称|String|'全部数据'
pagination|分页信息(数据格式{pageSize:10,current:0})|Object|null
tabs|标签数据以及每个标签下的表格数据，当使用带标签的结果组件时需传入</br>(数组中每条数据必须包含tabName,feature,columns,exportFileName这几个字段)|Array|[]
dataSource|表格数据，当使用不带标签的结果组件时需传入|Array|[]
columns|表格列信息，当使用不带标签的结果组件时需传入|Array|[]

## 事件

### `@onClose`

- **描述:** 在点击panel面板关闭按钮后发送该事件
- **回调参数** 无

### `@onPageChange`

- **描述:** 在切换分页后发送该事件
- **回调参数** {pagination}
- **pagination** `{ pageSize ,current}`
- `pageSize` 每页包含多少条数据
- `current` 当前为第几页

### `@onRowClick`

- **描述:** 点击表格行发送该事件
- **回调参数** {record}
- **record** 表格行中的数据对象

