<template>
  <municipal-squib @query="querySquibPoint" @queryRelationships="queryRelationships"
                   :squibData="squibData" :SQUIB_ICONS="SQUIB_ICONS"></municipal-squib>
</template>

<script>
import Store from '@/store/store';

export default {
  name: "SquibAna",
  data() {
    return {
      squibData: [],
      SQUIB_ICONS:{
        list:"/static/images/analysisimgs/list.png",
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
      }
    };
  },
  mounted() {
    this.store = new Store();
  },
  methods: {
    async querySquibPoint(params) {
      const funcName = 'IncidentOperNew';
      const {mapServerName, ...rest} = params;
      const res = await this.store.IncidentOperNew(mapServerName, funcName, rest);//获取爆管点的所有分析结果
      this.squibData = res;
    },
    async queryRelationships(params) {
      const {userItem, serverName} = params;
      let response = await this.store.GetRelationshipList(serverName);//获取爆管点的所有分析结果
      if (response) {
        this.relationships = response;
        this.userItem = userItem;
        console.log(userItem);
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
    }
  }
};
</script>

<style scoped>

</style>
