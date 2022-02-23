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
  async query(params,url){
    const structs = { IncludeAttribute: true, IncludeGeometry: false, IncludeWebGraphic: true };
    const rule = { CompareRectOnly: true, EnableDisplayCondition: true, Intersect: true };
    try {
      const { data } = await Service.get(`http://${url.split('/')[2]}/igs/rest/g3d/getFeature`, {
        params: {
          ...params,
          structs: JSON.stringify(structs),
          rule: JSON.stringify(rule),
        }
      });
      return data;
    } catch (e) {
      return { TotalCount: 0 };
    }
  }
}

export default Store
