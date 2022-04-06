<template>
  <div>
    <municipal-collision @load="onComLoad"
                         @query="query"
                         :layerData="layerData"
                         :defaultCheckedKeys="defaultCheckedKeys"></municipal-collision>
    <municipal-result-simple v-if="resultVisible"
                             :dataSource="dataSource"
                             :defaultCheckedKeys="defaultCheckedKeys"
                             :columns="columns"
                             title="覆土埋深结果"
                             :load="load"
                             :geometry="currentGeo"
                             @onClose="resultVisible=false"
                             @onRowClick="onRowClick"
                             :exportFileName="exportFileName">
    </municipal-result-simple>
  </div>
</template>

<script>
import Store from "@/store/store";
import _ from 'lodash';

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
      commonObj: {},
      defaultCheckedKeys: [],
      dataSource: [],
      columns: [],
      load: false,
      exportFileName: '碰撞分析',
      resultVisible: false,
      currentGeo: null
    };
  },
  mounted() {
    this.store = new Store();
  },
  methods: {
    async onComLoad(payload) {
      const {commonParam: {mapServerName}, m3ds} = payload;
      const params = [];
      this.mapServerName = mapServerName;
      for (let key in this.hitTypeMap) {
        params.push({
          hitType: key
        });
      }
      this.m3ds = m3ds;
      const promiseList = params.map(item => this.store.GetHitDetectRulInfo(mapServerName, item));
      const dataRes = await Promise.allSettled(promiseList);
      const validData = dataRes.map(item => {
        const {value: {data}} = item;
        return {data};
      });
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
      let checkedKeys = [];
      if (ruleList.length && ruleList.length === resList.length) {
        ruleList.forEach((item, i) => {
          let hitType = Object.keys(this.hitTypeMap)[i];
          let childrenItems = [];
          checkedKeys.push(`${hitType}-${i}`);
          res.push({
            title: item,
            key: hitType + '-' + i,
            value: hitType + '-' + i,
            selectable: false,
            children: resList[i].data.map((ly, j) => {
              childrenItems.push(ly);
              checkedKeys.push(`${hitType}-${i}-${j}`);
              commonObj[`${hitType}-${i}-${j}`] = [ly];
              return {
                title: ly,
                key: hitType + '-' + i + '-' + j,
                value: hitType + '-' + i + '-' + j,
                isLeaf: true
              };
            })
          });
          commonObj[`${hitType}-${i}`] = childrenItems;
        });
        //{'0-0':[燃气,给水],'0-0-1':[燃气]}  这个索引可以更方便的拼接选中的ruleName
        this.commonObj = commonObj;
        this.defaultCheckedKeys = checkedKeys;
        return res;
      }
    },
    async query(param) {
      let newGeo;
      this.resultVisible = true;
      this.load = true;
      try {
        const {geometry: geo, geometryType, offset, mapServerName, ruleName} = param;
        if (geometryType === 'rect') {
          newGeo = {"xmin": geo[0], "ymin": geo[1], "xmax": geo[2], "ymax": geo[3]};
        } else {
          let geos = this.create2dArr(geo);
          newGeo = {"rings": [geos]};
        }

        const params = Object.keys(this.hitTypeMap).map(item => {
          const geo = _.cloneDeep(newGeo);
          return {
            hitType: item,
            geometry: geo,
            ruleName: ruleName.join()
          };
        });

        const promises = params.map(para => this.store.HitDetect(mapServerName, para, geometryType, offset));
        let data = await Promise.allSettled(promises);
        let res = [];
        data.forEach(item => {
          if (item.status === 'fulfilled') {
            res = [...res, ...item.value];
          }
        });
        const renderData = res.map(item => {
          item.layerName0 = null;
          item.layerName1 = null;
          if (item.layerId0) {
            let gdbpUrlStr = this.m3ds.find(jitem => jitem.layerId === item.layerId0).gdbpUrl.split('\\');
            let layerName = gdbpUrlStr[gdbpUrlStr.length - 1].split('.')[0];
            let layerName0 = layerName;
            item.layerName0 = layerName0;
          }

          if (item.layerId1) {
            let gdbpUrlStr = this.m3ds.find(jitem => jitem.layerId === item.layerId1).gdbpUrl.split('\\');
            let layerName = gdbpUrlStr[gdbpUrlStr.length - 1].split('.')[0];
            let layerName1 = layerName;
            item.layerName1 = layerName1;
          }
          return item;
        });
        if (renderData?.length) {
          this.columns = this.getColumns(renderData);
          this.dataSource = this.createSource(renderData);
        } else {
          this.columns = [];
          this.dataSource = [];
        }
      } catch (e) {
        this.$message.warn(e);
      }
      this.load = false;
    },
    create2dArr(points) {
      const ps = [];
      let subPs = [], i = 0;
      points.forEach((point) => {
        subPs.push(parseFloat(point));
        i++;
        if (i % 2 === 0 && i > 0) {
          ps.push(subPs);
          i = 0;
          subPs = [];
        }
      });
      return ps;
    },
    getColumns(renderData) {
      return [
        {title: '序号', dataIndex: 'key'},
        ...Object.keys(renderData[0]).map((f, ind) => ({
          title: f,
          dataIndex: f,
          key: ind,
          width: 180
        }))
      ];
    },
    createSource(renderData) {
      renderData.forEach((data, index) => {
        data.key = index + 1;
      });
      return renderData;
    },
    async onRowClick(record) {
      //  由于服务数据缺少了geometry，所以需要在点击行的时候，获取geometry，然后给到组件去做跳转操作
      const layerId0 = record.layerId0;
      const layerId1 = record.layerId1;
      const oid0 = record.objectId0;
      const oid1 = record.objectId1;
      let result = [];
      const params = [{
        objectIds: [oid0],
        layerId: layerId0
      }, {
        objectIds: [oid1],
        layerId: layerId1
      }];
      const promises = params.map(param => {
        return this.store.queryFeatures(param, this.mapServerName);
      });
      const data = await Promise.allSettled(promises);
      data.forEach(item => {
        if (item.status === "fulfilled") {
          result.push(item.value);
        }
      });
      result = result.map(item => {
        return item.features[0].geometry.paths;
      });
      this.currentGeo = {
        paths: result,
        intersection: true,
        layerId: [layerId0, layerId1],
        oid: [oid0, oid1]
      };
    }
  }
};
</script>

<style scoped>

</style>
