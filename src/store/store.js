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
}

export default Store;
