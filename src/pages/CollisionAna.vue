<template>
  <municipal-collision @load="onComLoad" :layerData="layerData"></municipal-collision>
</template>

<script>
import Store from "@/store/store";

export default {
  name: "CollisionAna",
  data() {
    return {
      hitTypeMap: {1: '水平碰撞规则', 2: '垂直碰撞规则'},
      // 用于映射表字段的哈希表 key值为服务传来的字段名称(缺少的图层名称字段从tileSet中找)，value为界面展示的名称
      tableColumnMap: {
        "layerName0": "图层名称1",
        "layerId0": "图层ID1",
        "objectId0": "设备ID1",
        "layerName1": "图层名称2",
        "layerId1": "图层ID2",
        "objectId1": "设备ID2",
        "值": "值",
        "描述": "描述",
        "规则": "规则"
      },
      layerData: [],
      commonObj: {}
    };
  },
  mounted() {
    this.store = new Store();
  },
  methods: {
    async onComLoad(payload) {
      const {commonParam: {mapServerName}} = payload;
      const params = [];
      for (let key in this.hitTypeMap) {
        params.push({
          hitType: key
        });
      }

      const promiseList = params.map(item => this.store.GetHitDetectRulInfo(mapServerName, item));
      const dataRes = await Promise.allSettled(promiseList);
      let validData = dataRes.filter(item => item !== 'error');
      let ruleList = Object.values(this.hitTypeMap);
      let hitType = Object.keys(this.hitTypeMap);
      let result;
      if (validData.length === ruleList.length) {
        result = this.constructTree(ruleList, validData);
      } else {
        let resRuleList = [];
        validData.forEach(item => {
          let hit = item?.config?.params?.hitType;
          let index = hitType.indexOf(hit);
          if (index >= 0) {
            resRuleList.push(ruleList[index]);
          }
        });
        result = this.constructTree(resRuleList, validData);
      }
      this.layerData = result;
    },
    constructTree(ruleList, resList) {
      const res = [];
      let commonObj = {};
      if (ruleList.length && ruleList.length === resList.length) {
        ruleList.forEach((item, i) => {
          let hitType = Object.keys(this.hitTypeMap)[i];
          let childrenItems = [];
          res.push({
            title: item,
            key: hitType + '-' + i,
            value: hitType + '-' + i,
            selectable: false,
            children: resList[i].data.map((ly, j) => {
              childrenItems.push(ly);
              commonObj[`${hitType}-${i}-${j}`] = [ly];
              return {
                title: ly,
                key: hitType + '-' + i + '-' + j,
                value: hitType + '-' + i + '-' + j,
                children: []
              };
            })
          });
          commonObj[`${hitType}-${i}`] = childrenItems;
        });
        //{'0-0':[燃气,给水],'0-0-1':[燃气]}  这个索引可以更方便的拼接选中的ruleName
        this.commonObj = commonObj;
        return res;
      }
    }
  }
};
</script>

<style scoped>

</style>
