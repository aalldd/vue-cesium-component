---
title: 'horAndVerCut-断面分析'
---

# 断面分析

> municipal-horAndVerCut 断面分析，用于展示所画的横切面与纵切面，切到的管点与管线数据


## 基本用法

> 基本的断面分析用法，需配合result组件一起使用，用来展示断面分析结果

> 需通过queryCross获取横断面的查询参数，通过queryVer获取纵断面的查询参数

> 由于断面分析需要展示图片，所以result组件需传入displayImg=true，并传入文件的url地址

```vue
<template>
  <div>
    <municipal-horvercut @queryCross="queryCross" @queryVer="queryVer"></municipal-horvercut>
    <municipal-result-common title="分析剖面图" :panelPosition="panelPosition"
                             @onClose="resultVisible=false"
                             :load="load"
                             v-if="resultVisible"
                             :fileUrl="fileUrl"
                             :displayImg="true"
                             :tabs="tabs"></municipal-result-common>
  </div>
</template>

<script>
import Store from "@/store/store";

export default {
  name: "HorAndVerCutAna",
  data() {
    return {
      panelPosition: 'left',
      resultVisible: false,
      tabs: [],
      load: false,
      fileUrl: null,
    };
  },
  methods: {
    async queryCross(params) {
      const store = new Store();
      const {mapServerName, point0, point1} = params;
      this.resultVisible = true;
      this.load = true;
      const dataT = await store.getCrossSectionData(mapServerName, {point0, point1}, '横断面分析');
      if (!dataT.error) {
        this.tabs = dataT.featureSets;
        const url = store.toFileUrl(dataT.imgPath).src;
        this.fileUrl = url;
        this.load = false;
      } else {
        this.$message.warn(dataT.error.message);
        this.load = false;
      }
    },
    async queryVer(params) {
      const store = new Store();
      this.resultVisible = true;
      this.load = true;
      const {mapServerName, layerId0, layerId1, objectId0, objectId1} = params;
      const {data} = await store.connectionJudgeNew(mapServerName, {layerId0, layerId1, objectId0, objectId1});
      if (data.length > 0 && !data.error) {
        this.vertSurfaceAnly(data, mapServerName);
      } else {
        this.$message.info(data.error.message);
      }
    },
    async vertSurfaceAnly(data, mapServerName) {
      const store = new Store();
      let objectArr = [];
      const linef = data.find(d => {
        return d.geometryType === "civGeometryPolyline";
      });
      let oids = linef.features.map(f => {
        return f.attributes.OID;
      });
      objectArr.push({layerId: linef.layerId, objectIds: oids});
      const params = {
        objectInfo: JSON.stringify(objectArr)
      };
      const dataT = await store.getVerticalSectionData(mapServerName, params, '纵断面分析');
      if (!dataT.error) {
        this.tabs = dataT.featureSets;
        const url = store.toFileUrl(dataT.imgPath).src;
        this.fileUrl = url;
        this.load = false;
      } else {
        this.$message.warn(dataT.error.message);
        this.load = false;
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
[panelProps](https://aalldd.github.io/vue-cesium-component/components/common/panel.html#属性)|见面板工具属性说明|Attr|见面板工具说明


## 事件

### `@load`

- **描述:** 在 碰撞分析组件 加载完毕后发送该事件
- **回调参数** `{ vm }`
- `vm` collision vue实例对象

### `@unload`

- **描述:** 在 碰撞分析组件 注销完毕后发送该事件
- **回调参数** `{ vm }`
- `vm` collision vue实例对象

### `@queryCross`

- **描述:** 获取横断面分析的查询参数
- **回调参数** `{mapServerName, point0, point1}`
- `vm` mapServerName查询服务名，point0，第一个查询点的坐标，point1，第二个查询点的坐标

### `@queryVer`

- **描述:** 在 碰撞分析组件 注销完毕后发送该事件
- **回调参数** `{mapServerName, layerId0, layerId1, objectId0, objectId1}`
- `vm` mapServerName查询服务名，layerId0，第一个点中的设备的layerId，layerId1，第二个点中的设备的layerId，
  objectId0，第一个点中的设备的设备id，objectId1，第二个点中的设备的设备id
