<template>
  <municipal-squib @query="querySquibPoint"
                   @queryRelationships="queryRelationships"
                   @queryFeatures="queryFeatures"
                   @queryInvalid="queryInvalid"
                   @queryDetail="queryDetail"
                   :squibData="squibData"
                   :invalidData="invalidData"
                   :SQUIB_ICONS="SQUIB_ICONS"
                   :SQUIB_RESULT_TYPES="SQUIB_RESULT_TYPES"
                   :DEFUALT_SELECTED_TYPES="DEFUALT_SELECTED_TYPES"
                   :EXLUDE_TYPES="EXLUDE_TYPES"
                   :featureData="featuresData"
                   :detailData="detailData"
                   :loading="loading"></municipal-squib>
</template>

<script>
import Store from '@/store/store';

export default {
  name: "SquibAna",
  data() {
    return {
      //爆管信息
      squibData: [],
      SQUIB_ICONS: {
        fireImg: "/static/cesium/model/fire.png",
        fountainImg: "/static/cesium/model/fountain.png",
        list: "/static/images/analysisimgs/list.png",
        highlight: "/static/images/squib/高亮.png",
        civFeatureMetaTypeIncidentPoint: "/static/images/squib/爆管点.png", //爆管发生点
        civFeatureMetaTypeSwitch: "/static/images/squib/需关闭阀门.png", //需关断设备
        civFeatureMetaTypeClosedSwitch: "/static/images/squib/需关已关阀门.png", //已关断设备
        civFeatureMetaTypeShouldOpenSwitch: "/static/images/squib/需开启阀门.png", //需开启设备
        civFeatureMetaTypeInvalidateSwitch: "/static/images/squib/失效关断设备.png", //失效关断设备
        civFeatureMetaTypeSwieffect: "/static/images/squib/停水用户.png", //受影响用户
        civFeatureMetaTypePipeLine: "/static/images/squib/停水管线.png", //受影响管段
        civFeatureMetaTypeAssistSwitch: "/static/images/squib/辅助关闭阀门.png", //辅助关断设备
        civFeatureMetaTypeRegionResult: "/static/images/squib/受影响区域.png", //受影响区域
        civFeatureMetaTypeResstop: "/static/images/squib/资源装卸点.png", //资源装卸点
        civFeatureMetaTypeRescenter: "/static/images/squib/资源中心.png" //受影响水源
      },
      //设备信息
      featuresData: [],
      //失效设备
      invalidData: [],
      //设备详细信息
      detailData: {},
      loading: false,
      SQUIB_RESULT_TYPES:{
        SQUIBPOINT: "civFeatureMetaTypeIncidentPoint", //爆管发生点
        SHOULDCLOSEDSWITCH: "civFeatureMetaTypeSwitch", //需关断设备
        CLOSEDSWITCH: "civFeatureMetaTypeClosedSwitch", //已关断设备
        SHOULDOPENSWITCH: "civFeatureMetaTypeShouldOpenSwitch", //需开启设备
        INVALIDATESWITCH: "civFeatureMetaTypeInvalidateSwitch", //失效关断设备
        ASSISTSWITCH: "civFeatureMetaTypeAssistSwitch", //辅助关断设备
        EFFECTEDUSER: "civFeatureMetaTypeSwieffect", //受影响用户
        EFFECTEDPIPELINE: "civFeatureMetaTypePipeLine", //受影响管段
        EFFECTEDREGION: "civFeatureMetaTypeRegionResult", //受影响区域
        EFFECTEDRECENTER: "civFeatureMetaTypeRescenter", //受影响水源
        RESSTOP: "civFeatureMetaTypeResstop" //资源装卸点
      },
      DEFUALT_SELECTED_TYPES:[ //默认显示的类型
        "civFeatureMetaTypeIncidentPoint",
        "civFeatureMetaTypeSwitch",
        "civFeatureMetaTypeSwieffect",
        "civFeatureMetaTypePipeLine",
        "civFeatureMetaTypeRegionResult"
      ],
      EXLUDE_TYPES:[ //排除在外的类型
        "civFeatureMetaTypeRescenter",
        "civFeatureMetaTypeResstop"
      ]
    };
  },
  mounted() {
    this.store = new Store();
  },
  methods: {
    async querySquibPoint(params) {
      const funcName = 'IncidentOperNew';
      const {mapServerName, ...rest} = params;
      this.loading = true;
      this.mapServerName = mapServerName;
      const res = await this.store.IncidentOperNew(mapServerName, funcName, rest);//获取爆管点的所有分析结果
      this.squibData = res;
      this.loading = false;
    },
    async queryRelationships(params) {
      const {userItem, serverName} = params;
      let response = await this.store.GetRelationshipList(serverName);//获取爆管点的所有分析结果
      if (response) {
        this.relationships = response;
        this.userItem = userItem;
        this.serverName = serverName;
        await this.queryUserCount();
      }
    },
    async queryUserCount() {
      let layerItem = this.userItems?.length && this.userItems.shift();
      if (layerItem) {
        let r = this.relationships.filter(function (item) {
          return item.layerId === layerItem.layerId;
        })[0];
        if (r) {
          let result = [];
          for (let ii = 0; ii < r.relationships.length; ii++) {
            let params = {
              relationshipTableName: r.relationships[ii].relationshipTableName,
              objectIds: layerItem.objectIds.join()
            };
            let response = await this.store.QueryObjectIds(this.serverName, r.layerId, params);
            result.push(response);
          }
          let total = result.map(function (r) {
            return r;
          }).reduce(function (a, b) {
            return a += b.objectIds.length;
          }, 0);
          layerItem.totalUser = total;
          layerItem.userOids = response.objectIds;
          await this.queryUserCount();
        } else {
          await this.queryUserCount();
        }
      }
    },
    async queryFeatures(params) {
      const promises = [];
      params.forEach(layerItems => {
        layerItems.forEach(item => {
          const {layerId, objectIds, cacheBust, mapServerName, type} = item;
          const promise = this.store.query(mapServerName, layerId, {objectIds, cacheBust});
          promises.push({promise, type});
        });
      });
      //注意这里要将type回传，要不然组件无法知道哪个三维效果对应哪种管段
      const data = await Promise.all(promises.map(item => item.promise));
      this.featuresData = data.map((item, index) => {
        return {
          type: promises[index].type,
          data: item
        };
      });
    },
    async queryInvalid(params) {
      const promises = params.map(param => {
        const {layerId, mapServerName, layerItem, ...rest} = param;
        return this.store.query(mapServerName, layerId, rest);
      });
      const dataS = await Promise.all(promises);
      //回传的时候需要将layerItem回传回来
      this.invalidData = dataS.map((data, index) => {
        return {
          data: data,
          layerItem: params[index].layerItem
        };
      });
    },
    async queryDetail(params) {
      const {mapServerName, layerId, ...rest} = params;
      const data = await this.store.query(mapServerName, layerId, rest);
      this.detailData = data;
    }
  }
};
</script>

<style scoped>

</style>
