---
title: 'overburden-覆土埋深分析'
---

# 覆土埋深分析

> municipal-overburden 覆土埋深分析，用于查询一定地图范围内，管线与管点的埋深情况


## 基本用法

> 基本的覆土埋深分析用法，需配合result组件一起使用，用来展示覆土埋深结果

> 需传入layerData，用于展示覆土埋深规则树，query,用于获取查询的参数

```vue
<template>
  <div>
    <municipal-overburden :layerData="layerData" :defaultCheckedKeys="defaultCheckedKeys"
                          @load="onComLoad" @query="query"></municipal-overburden>
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

export default {
  name: "OverBurdenAna",
  data() {
    return {
      layerData: [],
      defaultCheckedKeys: [],
      hitType: 3,
      columns: [],
      dataSource: [],
      load: false,
      exportFileName: '覆土埋深结果',
      resultVisible: false,
      currentGeo:null
    };
  },
  mounted() {
    this.store = new Store();
  },
  methods: {
    async onComLoad(payload) {
      const {commonParam: {mapServerName}} = payload;
      this.mapServerName = mapServerName;
      const params = {
        hitType: this.hitType
      };
      const {data} = await this.store.GetHitDetectRulInfo(mapServerName, params);
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
        this.layerData = result;
        this.defaultCheckedKeys = checkedKeys;
      }
    },
    async query(params) {
      let newGeo;
      this.resultVisible = true;
      this.load = true;
      try {
        const {geometry: geo, geometryType, offset, mapServerName, ruleName} = params;
        if (geometryType === 'rect') {
          newGeo = {"xmin": geo[0], "ymin": geo[1], "xmax": geo[2], "ymax": geo[3]};
        } else {
          let geos = this.create2dArr(geo);
          newGeo = {"rings": [geos]};
        }
        const newParam = {
          hitType: this.hitType,
          geometry: newGeo,
          ruleName: ruleName.join(',')
        };
        let data = await this.store.DeepDetec(mapServerName, newParam, geometryType, offset);
        if (data?.length) {
          this.columns = this.getColumns(data);
          this.dataSource = this.createSource(data);
        } else {
          this.columns = [];
          this.dataSource = [];
        }
      } catch (e) {
        console.log(e);
      }
      this.load = false;
    },
    getColumns(data) {
      return [
        {title: '序号', dataIndex: 'key'},
        ...Object.keys(data[0]).map((f, ind) => ({
          title: f,
          dataIndex: f,
          key: ind,
          width: 300
        }))
      ];
    },
    createSource(data) {
      data.forEach((data, index) => {
        data.key = index + 1;
      });
      return data;
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
    async onRowClick(record) {
      const param = {
        layerId: record.layerId,
        objectIds: [record.objectId]
      };
      const data = await this.store.queryFeatures(param, this.mapServerName);
      if(data.features[0].geometry.paths?.length){
        this.currentGeo={
          paths:[data.features[0].geometry.paths],
          layerId: record.layerId,
          oid:record.objectId
        }
      }
    }
  }
};
</script>
```

## 属性

### 属性说明

属性|说明|取值类型|默认值
--|:--:|:--:|:--:
vueKey|municipal-web-scene组件的 ID，当使用多个mapgis-web-scene组件时，需要指定该值，来唯一标识mapgis-web-scene组件|String|default vueIndex|当
vueIndex|municipal-web-scene 插槽中使用了多个相同组件时，例如多个 municipal-igs-doc-layer 组件，用来区分组件的标识符|Number|空
layerData|卷帘规则，需从服务获取|Array|[]
defaultCheckedKeys|默然勾选的规则|Array|[]
[panelProps](https://aalldd.github.io/vue-cesium-component/components/common/panel.html#属性)|见面板工具属性说明|Attr|见面板工具说明


## 事件

### `@load`

- **描述:** 在 覆土埋深分析组件 加载完毕后发送该事件
- **回调参数** `{ vm }`
- `vm` overburden vue实例对象

### `@unload`

- **描述:** 在 覆土埋深分析组件 注销完毕后发送该事件
- **回调参数** `{ vm }`
- `vm` overburden vue实例对象


