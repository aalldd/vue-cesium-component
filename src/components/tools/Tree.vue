<template>
  <a-tree checkable default-expand-all>
    <a-tree-node v-for="item in treeData" :key="item.key" :title="item.name">
      <a-slider></a-slider>
      <Tree v-if="item.children" :tree-data="item.children"></Tree>
    </a-tree-node>
  </a-tree>
</template>

<script>
export default {
  name: "Tree",
  props: {
    treeData: {
      type: Array,
      default: () => {
        return [{
          name: '全部图层',
          key: '-1',
          children: [
            {
              name: '地上图层', key: '1', children: [{
                name: '倾斜摄影',
                key: '1-1',
                children: [
                  {name: "Data1-15-0", layerIndex: 0, key: '1-1-1'},
                  {name: "Data1-15-2", layerIndex: 1, key: '1-1-2'},
                  {name: "Data1-15-4", layerIndex: 2, key: '1-1-3'},
                  {name: "Data1-15-7", layerIndex: 3, key: '1-1-4'},
                ]
              },
                {
                  name: '地上模型',
                  key: '1-2',
                  children: [
                    {name: "floor", layerIndex: 4, key: '1-2-1'},
                    {name: "model", layerIndex: 5, key: '1-2-2'}
                  ]
                }]
            },
            {
              name: '地下图层', key: '2', children: [
                {
                  name: '供电管网', key: '2-1', children: [
                    {name: '供电管网_上杆', layerIndex: 6, key: '2-1-1'},
                    {name: '供电管网_交叉点', layerIndex: 7, key: '2-1-2'}
                  ]
                }
              ]
            }
          ]
        }];
      }
    }
  }
};
</script>

<style scoped>

</style>
