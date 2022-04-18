//接受一个标准的gis服务返回的数据集Array，当前功能的名称,返回的数据格式一定是包含了tabName，columns，features，exportFileName这四个字段
export const dataFormatter = (data, funcName) => {
  let tabs = [];
  tabs = data.map(item => {
    //tab的名称
    const tabName = item.layerName;
    //表格的列
    let columns = [];
    for (let key in item.fieldAliases) {
      let attr = item.fieldAliases[key];
      columns.push({
        title: attr,
        dataIndex: attr,
        key: attr,
        width: 120
      });
    }
    let features = item.features.map((feature, index) => {
      return Object.assign(feature.attributes, {geometry: feature.geometry, layerId: item.layerId, key: index});
    });
    let exportFileName = `${funcName}-${tabName}`;
    return {
      tabName,
      features,
      columns,
      exportFileName
    };
  });
  return tabs;
};

export const geomUtil = {
  toEsriJSON(geometry, spatialReference) {
    let geom = {
      ...geometry
    };
    if (spatialReference != null) {
      geom.spatialReference = spatialReference;
    }
    if (geometry.hasOwnProperty("x")) {
      geom.type = "point";
    } else if (geometry.hasOwnProperty("xmin")) {
      geom.type = "extent";
    } else if (geometry.hasOwnProperty("points")) {
      geom.type = "multipoint";
    } else if (geometry.hasOwnProperty("paths")) {
      geom.type = "polyline";
    } else if (geometry.hasOwnProperty("rings")) {
      geom.type = "polygon";
    } else {
      return null;
    }
    return geom;
  },
  toJSON(geom, hasSpatialReference) {
    var geometry = "",
      geometryType = "",
      spatialReference = hasSpatialReference ? ',"spatialReference":{"wkid":1}' : "";
    if (geom) {
      switch (geom.type) {
        case "point":
          geometryType = "civGeometryPoint";
          break;
        case "multipoint":
          geometryType = "civGemetryMultipoint";
          break;
        case "extent":
          geometryType = "civGeometryEnvelope";
          break;
        case "polyline":
          geometryType = "civGeometryPolyline";
          break;
        case "polygon":
          geometryType = "civGeometryPolygon";
          break;
        default:
          break;
      }

      if (geom.x) { //point
        geometry = '{"x":' + geom.x + ',"y":' + geom.y + spatialReference + '}';
      } else if (geom.xmin) { // extent
        geometry = '{"xmin":' + geom.xmin + ',"ymin":' + geom.ymin + ',"xmax":' + geom.xmax + ',"ymax":' + geom.ymax + spatialReference + '}';
      } else if (geom.paths) { // polyline
        var paths = [];
        geom.paths.forEach(function (path) {
          var pathPoints = [];
          path.forEach(function (pathPoint) {
            pathPoints.push('[' + pathPoint[0] + ',' + pathPoint[1] + ']');
          });
          paths.push('[' + pathPoints.join() + ']');
        });
        geometry = '{"paths":[' + paths.join() + ']' + spatialReference + '}';
      } else if (void 0 != geom.rings) { //polygon
        var rings = [];
        geom.rings.forEach(function (ring) {
          var ringPoints = [];
          ring.forEach(function (ringPoint) {
            ringPoints.push('[' + ringPoint[0] + ',' + ringPoint[1] + ']');
          });
          ringPoints.push('[' + ring[0][0] + ',' + ring[0][1] + ']'); //4.3以上api 添加第一个点至最后
          rings.push('[' + ringPoints.join() + ']');
        });
        geometry = '{"rings":[' + rings.join() + ']' + spatialReference + '}';
      }
    }
    return {
      geometryType,
      geometry
    };
  },

  toGeoJSON(features) {
    function toGeometry(geom) {
      if (!geom) {
        return;
      }

      let geoType = "",
        coordinates = [];

      if (geom.hasOwnProperty("x")) {
        geoType = "Point";
        coordinates = [geom.x, geom.y];
      } else if (geom.hasOwnProperty("xmin")) {
        geoType = "Polygon";
        coordinates = [
          [geom.xmin, geom.ymin],
          [geom.xmax, geom.ymin],
          [geom.xmax, geom.ymax],
          [geom.xmin, geom.ymax],
          [geom.xmin, geom.ymin]
        ];
      } else if (geom.hasOwnProperty("points")) {
        geoType = "MultiPoint";
        coordinates = geom.points;
      } else if (geom.hasOwnProperty("paths")) {
        geoType = "LineString";
        coordinates = geom.paths;
      } else if (geom.hasOwnProperty("rings")) {
        geoType = "Polygon";
        coordinates = geom.rings;
      } else {
        return null;
      }

      return {
        type: geoType,
        coordinates: coordinates
      };
    }

    if (!Array.isArray(features)) {
      return null;
    }

    const nfeatures = features.map(f => ({
      type: "Feature",
      geometry: toGeometry(f.geometry),
      properties: {
        ...f.attributes
      } //一定要有name属性
    }));

    return {
      type: "FeatureCollection",
      features: nfeatures || []
    };
  },

  getGeometryType(geometry) {
    var geomType = "";
    if (geometry) {
      switch (geometry.type) {
        case "point":
          geomType = "civGeometryPoint";
          break;
        case "multipoint":
          geomType = "civGemetryMultipoint";
          break;
        case "extent":
          geomType = "civGeometryEnvelope";
          break;
        case "polyline":
          geomType = "civGeometryPolyline";
          break;
        case "polygon":
          geomType = "civGeometryPolygon";
          break;
        default:
          break;
      }
    }
    return geomType;
  },

  async getEffectiveLODs(view, timeout = 10000) {
    try {
      return await new Promise((resolve, reject) => {
        if (view.constraints && view.constraints.effectiveLODs) {
          resolve(view.constraints.effectiveLODs);
        } else {
          const timeoutId = setTimeout(() => {
            watchHandle.remove();
            reject();
          }, timeout);
          const watchHandle = view.watch("constraints", (newVal) => {
            if (newVal && newVal.effectiveLODs) {
              watchHandle.remove();
              clearTimeout(timeoutId);
              resolve(newVal.effectiveLODs);
            }
          });
        }
      });
    } catch (e) {
      return 0;
    }
  },

  geomCenter(geometry) {
    switch (geometry.type) {
      case "point":
        return geometry;
      case "polygon":
      case "extent":
      case "multipoint":
        return geometry.extent.center;
      case "polyline":
        var polyline = geometry;
        if (polyline.paths.length == 1) {
          var s = Math.floor(polyline.paths[0].length / 2) - 1,
            e = s + 1;
          return {
            x: (polyline.getPoint(0, s).x + polyline.getPoint(0, e).x) / 2,
            y: (polyline.getPoint(0, s).y + polyline.getPoint(0, e).y) / 2,
            spatialReference: geometry.spatialReference
          };
        } else {
          return geometry.extent.center;
        }
      default:
        return null;
    }
  }
};
