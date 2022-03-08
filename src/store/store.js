//服务接口，只能用于测试，不用于组件库
import Service from '@/service/service';

class Store {
  constructor(view, m3ds) {
    this.view = view;
    this.m3ds = m3ds;
    this.IntegratedServer = Service.City.Plugin("IntegratedServer");
    this.GPServer = Service.City.Plugin("GPServer");
    this.ScadaServer = Service.City.Plugin('ScadaServer');
    this.MapServer = Service.City.Plugin('MapServer');
    this.AuxDataServer = Service.City.Plugin("AuxDataServer");
  }

  async query(params, url) {
    const structs = {IncludeAttribute: true, IncludeGeometry: false, IncludeWebGraphic: true};
    const rule = {CompareRectOnly: true, EnableDisplayCondition: true, Intersect: true};
    try {
      const {data} = await Service.get(`http://${url.split('/')[2]}/igs/rest/g3d/getFeature`, {
        params: {
          ...params,
          structs: JSON.stringify(structs),
          rule: JSON.stringify(rule),
        }
      });
      return data;
    } catch (e) {
      return {TotalCount: 0};
    }
  }

  //获取漫游信息
  async getRoamData(params) {
    const { data } = await this.IntegratedServer.get("getRoamData", {
      params: params
    });
    return data;
  }

  //添加漫游信息
  async addRoamData(params) {
    const { data } = await this.IntegratedServer.get("addRoamData", {
      params: params
    });
    return data;
  }

  //删除漫游信息
  async deleteRoamData(params) {
    const { data } = await this.IntegratedServer.get("deleteRoamData", {
      params: params
    });
    return data;
  }

  // 查询流向信息
  async queryFlow(mapServerName, layerIds, params) {
    let result;
    try {
      const promises = layerIds.map(layerId => {
        return this.MapServer.get(mapServerName + `/${layerId}/queryFlow`, {
          params: {
            ...params,
            unMerge: true
          }
        });
      });
      const data = Promise.all(promises);
      console.log(data);
      result = data;
    } catch (err) {
      message.error('所选图层没有流向信息');
      result = [];
    }
    return result;
  }

  //查询爆管信息
  //funcName : 供水：IncidentOperNew，燃气：MidPressOperEx
  async IncidentOperNew(mapServiceName, funcName, params) {
    try {
      const {data} = await this.GPServer.get(`/${mapServiceName}/${funcName}`, {params});
      return data;
    } catch (error) {
      return [];
    }
  }

  async GetRelationshipList(mapServiceName) {
    try {
      const {data} = await this.AuxDataServer.get(`/${mapServiceName}/GetRelationshipList`);
      return data;
    } catch (error) {
      return [];
    }
  }

  async QueryObjectIds(mapServiceName, layerId, params) {
    try {
      //QueryByObjectIds
      const {data} = await this.AuxDataServer.post(`/${mapServiceName}/${layerId}/QueryObjectIds`, params);
      return data;
    } catch (error) {
      return [];
    }
  }

  async query(mapServiceName, layerId, params) {
    try {
      const {data} = await this.MapServer.post(`/${mapServiceName}/${layerId}/query`, params);
      return data;
    } catch (error) {
      return [];
    }
  }
}

export default Store;
