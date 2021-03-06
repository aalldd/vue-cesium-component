//服务接口，只能用于测试，不用于组件库
import Service from '@/service/service';
import {geomUtil, dataFormatter} from './helpers';

class Store {
  constructor(view, m3ds, fileServer) {
    this.view = view;
    this.m3ds = m3ds;
    this.fileServer = fileServer;
    this.IntegratedServer = Service.City.Plugin("IntegratedServer");
    this.GPServer = Service.City.Plugin("GPServer");
    this.ScadaServer = Service.City.Plugin('ScadaServer');
    this.MapServer = Service.City.Plugin('MapServer');
    this.AuxDataServer = Service.City.Plugin("AuxDataServer");
    this.cancelToken = Service.CancelToken;
  }

  //根据条件查询地下管线的信息 然后整理成tabs格式的数据，直接可以供result组件进行使用
  async queryLayers(geometry, geometryType, where, cutLayerIndexs, offset, mapServerName, exportName, layerIds) {
    let layers;
    if (!layerIds) {
      layers = this.m3ds.filter(item => !cutLayerIndexs.includes(item.layerIndex));
    } else {
      layers = this.m3ds.filter(item => layerIds.includes(item.layerId));
    }
    const promises = layers.map(t => {
      if (t.gdbp) {
        let params = {
          gdbp: t.gdbp,
          f: 'json',
          geometry: geometry,
          geometryType: geometryType,
          layerId: t.layerId,
          returnIdsOnly: true,
          returnGeometry: false
        };
        //如果传对象的话，需要是{line:content,point:content}这样的格式
        if (where && where instanceof Object) {
          if (t.civFeatureType.endsWith('Line')) {
            params.where = where.line;
          } else {
            params.where = where.point;
          }
        } else {
          params.where = where;
        }
        return this.query3d(params, t.url, offset, mapServerName);
      }
    });
    let data = await Promise.all(promises);
    data = data.filter((d, ind) => d?.features?.length);
    return dataFormatter(data, exportName);
  }

  //根据oids查询属性信息
  async queryFeatures(params, mapServerName) {
    let data;
    if (params.objectIds.length > 1000) {//objectIds传入过多会卡，因此大于4000的分多次查询
      let objectIdsStrs = [];
      let oidStr = '';
      for (let index = 0; index < params.objectIds.length; index++) {
        oidStr += params.objectIds[index] + ',';
        if ((index !== 0 && (index + 1) % 2000 === 0) || index === params.objectIds.length - 1) {
          objectIdsStrs.push(oidStr.substring(0, oidStr.length - 1));
          oidStr = '';
        }
      }

      const promises = objectIdsStrs.map(oids => {
        return this.MapServer.post(`${mapServerName}/${params.layerId}/query`, {
          objectIds: oids.toString()
        });
      });

      let dataSource = await Promise.allSettled(promises);
      dataSource = dataSource.filter(item => item.status === 'fulfilled' && item.value.data.features.length);
      let fData = dataSource[0].value.data;
      dataSource.forEach(d => {
        fData.features.push(...d.value.data.features);
      });
      data = fData;
    } else {
      const {data: data1} = await this.MapServer.get(`${mapServerName}/${params.layerId}/query`, {
        params: {
          objectIds: params.objectIds.toString()
        }
      });
      data = data1;
    }
    return data;
  }

  //根据图层字段名，查询该图层下，该字段的所有取值
  async queryFieldValues(mapServerName, layerId, fieldName) {
    const {data} = await this.MapServer.get(`${mapServerName}/${layerId}/queryFieldValues?fieldName=${fieldName}`);
    return data;
  }

//获取多管网点或线类型公共字段
  async GetShareField(mapServerName, params) {
    const {data} = await this.MapServer.get(mapServerName + '/QueryPipeNetToalFields', {params: params});
    return data;
  }

//获取统计结果
  async GetStatisticsData(mapServerName, params) {
    const {data} = await this.MapServer.get(mapServerName + '/DevCollectByNetComField', {params: params});
    return data;
  }

  //查询GIS信息
  async query3d(params, url, offset, mapServerName) {
    if (params.geometry && params.geometry.length > 0) {
      let geometrys = params.geometry.split(',');
      const length = params.geometryType === 'circle' ? geometrys.length - 1 : geometrys.length;
      for (let index = 0; index < length; index++) {
        if (index % 2 === 0) {
          geometrys[index] = Number(geometrys[index]) + Number(offset[0]);
        } else {
          geometrys[index] = Number(geometrys[index]) + Number(offset[1]);
        }
      }
      params.geometry = geometrys.join();
    }

    try {
      //这套是调用mapServer的方法
      if (params.layerId) {
        if (mapServerName) {
          const {geometry, geometryType, page, pageCount} = params;
          if (params.returnIdsOnly) {//返回OID列表
            if (geometryType === 'rect') {//矩形查询
              let geometrys = geometry.split(',');
              const xList=geometrys.filter((item,index)=>index%2===0)
              const yList=geometrys.filter((item,index)=>index%2!==0)
              const xmin=_.min(xList)
              const xmax=_.max(xList)
              const ymin=_.min(yList)
              const ymax=_.max(yList)
              const geom = geomUtil.toJSON({
                type: 'extent',
                xmin: xmin,
                xmax: xmax,
                ymin: ymin,
                ymax: ymax,
              });
              params.geometry = geom.geometry;
              params.geometryType = geom.geometryType;
            } else if (geometryType === 'polygon') {
              let geometrys = geometry.split(',');
              let geometryList = [];
              geometrys.forEach((ge, index) => {
                if ((index) % 2 === 0) {//
                  geometryList.push([ge]);
                } else {
                  geometryList[geometryList.length - 1].push(ge);
                }
              });
              const geom = geomUtil.toJSON({
                type: 'polygon',
                rings: [geometryList.slice(0, geometryList.length - 1)],
              });
              params.geometry = geom.geometry;
              params.geometryType = geom.geometryType;
            }

            const {data} = await this.MapServer.get(`${mapServerName}/${params.layerId}/query`, {
              params: {
                ...params,
              }
            });

            if (data?.objectIds?.length) {
              if ((page === 0 || page) && pageCount) {
                params.objectIds = data.objectIds.filter((oid, index) => index >= (page * pageCount) && index < ((page + 1) * pageCount));
              } else {
                params.objectIds = data.objectIds;
              }
              const features = await this.queryFeatures(params, mapServerName);
              return {
                totalCount: data.objectIds.length,
                oids: data.objectIds,
                ...features
              };
            }

          } else if (params.objectIds) {
            return this.queryFeatures(params, mapServerName);
          }
        }
      } else {
        //这条是调用igs服务的方法，但是现在基本不用了
        const structs = {IncludeAttribute: true, IncludeGeometry: false, IncludeWebGraphic: true};
        const rule = {CompareRectOnly: true, EnableDisplayCondition: true, Intersect: true};
        const {data} = await Service.get(`http://${url.split('/')[2]}/igs/rest/g3d/getFeature`, {
          params: {
            ...params,
            structs: JSON.stringify(structs),
            rule: JSON.stringify(rule),
          }
        });

        return data;
      }
    } catch (e) {
      return {totalCount: 0};
    }
  }

  //获取漫游信息
  async getRoamData(params) {
    const {data} = await this.IntegratedServer.get("getRoamData", {
      params: params
    });
    return data;
  }

  //添加漫游信息
  async addRoamData(params) {
    const {data} = await this.IntegratedServer.get("addRoamData", {
      params: params
    });
    return data;
  }

  //删除漫游信息
  async deleteRoamData(params) {
    const {data} = await this.IntegratedServer.get("deleteRoamData", {
      params: params
    });
    return data;
  }

  //获取GIS数据和应急数据
  async getGeometry(params) {
    let options = {
      gisData: '',
      emgData: '',
      title: ''
    };
    const {mapServerName, offset, pickedFeature} = params;
    if (!pickedFeature) {
      return options;
    }

    try {
      const propertys = pickedFeature.getPropertyNames();
      let oid = '';
      if (propertys.includes('name')) {
        oid = pickedFeature.getProperty('name').split('_')[2];
      } else if (propertys.includes('OID')) {
        oid = pickedFeature.getProperty('OID');
      } else {
        return;
      }

      if (oid == "0") {
        this.$message.warning("模型未加载完成");
        return options;
      }

      if (!pickedFeature.primitive.gdbp) {
        this.$message.warning("未配置gdbp");
        return options;
      }

      const title = pickedFeature.primitive.gdbp.substring(pickedFeature.primitive.gdbp.lastIndexOf('/') + 1);

      const params = {
        gdbp: pickedFeature.primitive.gdbp,
        objectIds: oid,
        f: 'json',
        layerId: pickedFeature.primitive.layerId
      };

      const data = await this.query3d(params, pickedFeature.primitive.url, offset, mapServerName);

      if (data && data.features && data.features.length > 0) {
        options = {
          gisData: data,
          emgData: '',
          title,
          ID: null //数据库唯一标识ID
        };
      }
    } catch (e) {
      this.$message.error("数据获取失败");
      return options;
    }

    return options;
  };

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
      result = data;
    } catch (err) {
      this.$message.error('所选图层没有流向信息');
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

  // 查询覆土埋深规则hitType=3,水平碰撞规则hitType=1，垂直碰撞规则hitType=2
  async GetHitDetectRulInfo(mapServerName, params) {
    let data;
    try {
      data = await this.GPServer.get(mapServerName + '/GetHitDetectRulInfo', {
        params: params
      });
      return data;
    } catch (error) {
      new Promise((resolve) => {
        resolve('error');
      });
      return [];
    }
  }

  //查询覆土埋深信息
  async DeepDetec(mapServerName, params, geometryType, offset) {
    if (offset) {
      if (geometryType === 'rect') {
        let geometrys = params.geometry;
        geometrys.xmin = Number(geometrys.xmin) + Number(offset[0]);
        geometrys.ymin = Number(geometrys.ymin) + Number(offset[1]);
        geometrys.xmax = Number(geometrys.xmax) + Number(offset[0]);
        geometrys.ymax = Number(geometrys.ymax) + Number(offset[1]);
        params.geometry = geometrys;
      } else if (geometryType === 'polygon') {
        params.geometry.rings[0] = params.geometry.rings[0].map((item) => {
          return [Number(item[0]) + Number(offset[0]), Number(item[1]) + Number(offset[1])];
        });
      }
    }
    const {data} = await this.GPServer.get(mapServerName + '/DeepDetec', {
      params: params
    });
    return data;
  }

  // 查询碰撞检测信息 HitDetect?hitType={hitType}&ruleName={ruleName}&geometry={geometry}
  async HitDetect(mapServerName, param, geometryType, offset) {
    let params = JSON.parse(JSON.stringify(param));
    if (offset) {
      if (geometryType === 'rect') {
        let geometrys = params.geometry;
        geometrys.xmin = Number(geometrys.xmin) + Number(offset[0]);
        geometrys.ymin = Number(geometrys.ymin) + Number(offset[1]);
        geometrys.xmax = Number(geometrys.xmax) + Number(offset[0]);
        geometrys.ymax = Number(geometrys.ymax) + Number(offset[1]);
        params.geometry = geometrys;
      } else if (geometryType === 'polygon') {
        params.geometry.rings[0] = params.geometry.rings[0].map((item) => {
          return [Number(item[0]) + Number(offset[0]), Number(item[1]) + Number(offset[1])];
        });
      }
    }
    let result = [];
    if (params.ruleName !== '') {
      try {
        const {data} = await this.GPServer.get(mapServerName + '/HitDetect', {
          params: params
        });
        result = data;
      } catch (error) {
        message.error('未查询到碰撞信息数据');
        result = [];
      }
    }
    return result;
  }

  //获取横断面分析信息
  // /ProfileMapAnlySH
  async getCrossSectionData(mapServerName, params, exportName) {
    exportName = exportName || '';
    const {data} = await this.GPServer.get(mapServerName + "/ProfileMapAnly", {
      params: params
    });
    if (data.featureSets) {
      data.featureSets = dataFormatter(data.featureSets, exportName);
    }
    return data;
  }

  //连通性分析
  async connectionJudgeNew(mapServerName, params) {
    const {data} = await this.GPServer.get(mapServerName + "/ConnectionJudgeNew", {
      params: params
    });
    if (!data.error) {
      const tabs = dataFormatter(data);
      return {
        data, tabs
      };
    } else {
      return data;
    }
  }

  //获取纵断面分析信息
  async getVerticalSectionData(mapServerName, params, exportName) {
    const {data} = await this.GPServer.get(mapServerName + "/VertSurfaceAnly", {
      params: params
    });
    if (data.featureSets) {
      data.featureSets = dataFormatter(data.featureSets, exportName);
    }
    return data;
  }

  //获取电子围栏数据
  async getFenceData(params) {
    const {data} = await this.IntegratedServer.get("getFenceData", {
      params: params
    });
    return data;
  }

  //添加/修改电子围栏
  async addFenceData(params) {
    const {data} = await this.IntegratedServer.get("addFenceData", {
      params: params
    });
    return data;
  }

  //删除电子围栏
  async deleteFenceData(params) {
    const {data} = await this.IntegratedServer.get("deleteFenceData", {
      params: params
    });
    return data;
  }

  toFileUrl(url) {
    if (this.fileServer) {
      url = `${this.fileServer}/Cityinterface/rest/services/Filedownload.svc/download/${url}`;
    } else {
      url = Service.DownloadURL(url);
    }
    return {src: url, alt: ""};
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
