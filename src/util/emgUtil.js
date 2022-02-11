import _ from 'lodash';
import {polygon, point, booleanPointInPolygon} from '@turf/turf';

class emgUtil {
  constructor(view) {
    this.view = view;
    this.view.viewer.scene.globe.undergroundMode = true;
    //开启深度检测
    this.view.viewer.scene.globe.depthTestAgainstTerrain = true;
    this.dynaCutList = [];
  }

  // 坐标转换类方法

  //获取经纬度
  getPosition(movement) {
    //屏幕坐标转笛卡尔坐标
    const cartesian = this.view.viewer.getCartesian3Position(movement.position, cartesian);
    const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    const lng = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    const height = cartographic.height; //模型高度

    return {lng, lat, height};
  }

  // 经纬度转笛卡尔3
  changeToCartesian3 = (position) => {
    const {lng, lat, height} = position;
    return Cesium.Cartesian3.fromDegrees(lng, lat, height);
  };

  // 笛卡尔3转经纬度
  Cartesian3ToLat = (position) => {
    let center = position;
    let cartesian3 = new Cesium.Cartesian3(center.x, center.y, center.z);
    let cartographic = this.view.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
    let lng = Cesium.Math.toDegrees(cartographic.longitude);
    let lat = Cesium.Math.toDegrees(cartographic.latitude);
    let height = cartographic.height;
    return {lng, lat, height};
  };

  // 经纬度转屏幕坐标
  getSceneTransforms(position) {
    if (typeof position === 'object' && position.hasOwnProperty('lng', 'lat', 'height')) {
      const {lng, lat, height} = position;
      // 经纬度转世界坐标
      let ellipsoid = this.view.viewer.scene.globe.ellipsoid;
      let cartographic = Cesium.Cartographic.fromDegrees(lng, lat, height);
      let cartesian3 = ellipsoid.cartographicToCartesian(cartographic);
      // 世界坐标转屏幕坐标
      return Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.view.viewer.scene, cartesian3);
    }
  }

  // 计算给定范围内最小地形高程
  calMinTerrainHeight = (positions) => {
    const view = this.view;

    // 先将立体的变为平面的
    const positionsWithZeroHeight = positions.map(position => {
      const cartesian3 = new Cesium.Cartesian3(position.x, position.y, position.z);
      const cartographic = view.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const zeroPoint = this.positionTransfer({lng, lat, height: 0});
      return {x: zeroPoint[0], y: zeroPoint[1]};
    });
    let pos = [];
    positionsWithZeroHeight.forEach(position => {
      let posArr = [position.x, position.y];
      pos.push(posArr);
    });

    // 生成多边形-二维
    const poly = polygon([pos]);

    // 去掉最后一个点
    positions.pop();

    // 选中的几个点，经纬度类型
    const clickPositionLng = [];
    const clickPositionLat = [];
    // 转经纬度
    positions.forEach(position => {
      const cartesian3 = new Cesium.Cartesian3(position.x, position.y, position.z);
      const cartographic = view.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      clickPositionLng.push(lng);
      clickPositionLat.push(lat);
    });
    // 扩展为256个点
    let maxLng = _.max(clickPositionLng);
    let minLng = _.min(clickPositionLng);
    let lngDis = maxLng - minLng;
    let maxLat = _.max(clickPositionLat);
    let minLat = _.min(clickPositionLat);
    let latDis = maxLat - minLat;

    let lngList = [], latList = [];
    for (let i = 0; i < 12; i++) {
      let lng = minLng + i * (lngDis / 12);
      let lat = minLat + i * (latDis / 12);
      lngList.push(lng);
      latList.push(lat);
    }
    let pointList = [];
    for (let i = 0; i < 12; i++) {
      let target = {};
      target.lng = lngList[i];
      for (let j = 0; j < 12; j++) {
        let newTarget = _.cloneDeep(target);
        newTarget.lat = latList[j];
        newTarget.height = 0;
        pointList.push(newTarget);
      }
    }
    // 判断这256个点是否在多边形内，如果不在，就删掉
    let resPointList = [];
    pointList.length && pointList.forEach(item => {
      //  经纬度转二维模型
      let p = this.positionTransfer(item);
      let pt = point(p);
      let res = booleanPointInPolygon(pt, poly);
      if (res) {
        resPointList.push(item);
      }
    });
    let heightList = [];
    resPointList.forEach((point) => {
      const carto = new Cesium.Cartographic.fromDegrees(point.lng, point.lat);　　//输入经纬度
      const h2 = view.viewer.scene.sampleHeight(carto);
      h2 !== 0 && heightList.push(h2);
    });
    return {
      _minHeight: _.min(heightList),
      _maxHeight: _.max(heightList)
    };
  };

  //经纬度坐标转换为二维点坐标fv（模型坐标）
  positionTransfer = (position, transform) => {
    // 将经纬度坐标转为模型坐标
    let tileset = this.view.tilesetList.find(t => t.layerId) || this.view.tilesetList[0];
    let m = transform || tileset.root.transform;
    let result = new Cesium.Matrix4();
    Cesium.Matrix4.inverse(m, result);
    let p = Cesium.Cartesian3.fromDegrees(position.lng, position.lat, position.height);
    let r = new Cesium.Matrix4();
    Cesium.Matrix4.multiplyByPoint(result, p, r);
    return [r.x, r.y];
  };

  //将模型坐标转换为经纬度坐标
  changeToLat = (p, transform) => {
    // 将经纬度坐标转为模型坐标
    let tileset = this.view.tilesetList.find(t => t.layerId) || this.view.tilesetList[0];
    let m = transform || tileset.root.transform;
    let r2 = new Cesium.Matrix4();
    let r = new Cesium.Matrix4();
    r.x = p[0];
    r.y = p[1];
    r.z = 10; //服务返回的结果没有高度，而矩阵中需要z坐标
    Cesium.Matrix4.multiplyByPoint(m, r, r2); //r2 世界坐标，
    //世界坐标转经纬度坐标
    let position = new Cesium.Cartesian3(r2.x, r2.y, r2.z);
    let cp = Cesium.Ellipsoid.WGS84.cartesianToCartographic(position); // 除Π 乘以180
    let lng = cp.longitude / Math.PI * 180;
    let lat = cp.latitude / Math.PI * 180;
    return {lng, lat, height: cp.height};
  };

  //计算坐标转换需要用到的矩阵的方法：
  getInverseTransform = (tileset) => {
    let transform;
    let usetileset = tileset || this.view.tilesetList.find(t => t.layerId) || this.view.tilesetList[0];
    let tmp = usetileset.root.transform;
    if ((tmp && tmp.equals(Cesium.Matrix4.IDENTITY)) || !tmp) {
      // 如果root.transform不存在，则3DTiles的原点变成了boundingSphere.center
      transform = Cesium.Transforms.eastNorthUpToFixedFrame(usetileset.boundingSphere.center);
    } else {
      transform = Cesium.Matrix4.fromArray(usetileset.root.transform);
    }
    return Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4());
  };

  //对点进行坐标转换
  getOriginCoordinateSystemPoint = (point, inverseTransform) => {
    let val = Cesium.Cartesian3.fromDegrees(point.lng, point.lat);
    return Cesium.Matrix4.multiplyByPoint(inverseTransform, val, new Cesium.Cartesian3(0, 0, 0));
  };

  // 获取当前屏幕范围内的经纬度坐标，如果超出范围，则取配置的最大或者最小范围
  getCurrentView = () => {
    const canvas = this.view.viewer.scene.canvas;
    const viewer = this.view.viewer;

    let cartesian = viewer.getCartesian3Position({x: 0, y: 0}, cartesian);
    let lng, lat, lng1, lat1;
    if (cartesian) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      lng = Cesium.Math.toDegrees(cartographic.longitude);
      lat = Cesium.Math.toDegrees(cartographic.latitude);
    } else {
      lng = this.minPoint.lng;
      lat = this.minPoint.lat;
    }

    cartesian = viewer.getCartesian3Position({x: canvas.width, y: canvas.height}, cartesian);
    if (cartesian) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      lng1 = Cesium.Math.toDegrees(cartographic.longitude);
      lat1 = Cesium.Math.toDegrees(cartographic.latitude);
    } else {
      lng1 = this.minPoint.lng;
      lat1 = this.minPoint.lat;
    }

    let position1 = {lng: lng, lat: lat, height: 0};
    let position2 = {lng: lng1, lat: lat1, height: 0};

    let pos1 = this.positionTransfer(position1);
    let pos2 = this.positionTransfer(position2);

    let minX = _.min([pos1[0], pos2[0]]);
    let maxX = _.max([pos1[0], pos2[0]]);

    let minY = _.min([pos1[1], pos2[1]]);
    let maxY = _.max([pos1[1], pos2[1]]);

    let geometry = {
      xmin: Number(minX) + Number(AppStore?.D3ConfigGlobal?.offset[0]),
      ymin: Number(minY) + Number(AppStore?.D3ConfigGlobal?.offset[1]),
      xmax: Number(maxX) + Number(AppStore?.D3ConfigGlobal?.offset[0]),
      ymax: Number(maxY) + Number(AppStore?.D3ConfigGlobal?.offset[1])
    };

    return {
      geometryType: 'rect',
      geometry: [minX, minY, maxX, maxY].join(),
      geometryNew: geometry,
      position1,
      position2
    };
  };

  // 获取视口中心点坐标 经纬度
  getCenterPosition = () => {
    const viewer = this.view.viewer;
    const result = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas
      .clientHeight / 2));
    const curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result);
    const lng = curPosition.longitude * 180 / Math.PI;
    const lat = curPosition.latitude * 180 / Math.PI;
    return {
      lng: lng,
      lat: lat,
      height: this.getHeight()
    };
  };

  // 获取视口相机高度
  getHeight = () => {
    const viewer = this.view.viewer;
    if (viewer) {
      let scene = viewer.scene;
      let ellipsoid = scene.globe.ellipsoid;
      let height = ellipsoid.cartesianToCartographic(viewer.camera.position).height;
      return height;
    }
  };

  //计算plane
  createPlane = (p1, p2, inverseTransform) => {
    const {lng1, lat1, height} = p1;
    // 将仅包含经纬度信息的p1,p2，转换为相应坐标系的cartesian3对象
    let p1C3 = this.getOriginCoordinateSystemPoint(p1, inverseTransform);
    let p2C3 = this.getOriginCoordinateSystemPoint(p2, inverseTransform);

    // 定义一个垂直向上的向量up
    let up = new Cesium.Cartesian3(0, 0, 10);
    //  right 实际上就是由p1指向p2的向量
    let right = Cesium.Cartesian3.subtract(p2C3, p1C3, new Cesium.Cartesian3());

    // 计算normal， right叉乘up，得到平面法向量，这个法向量指向right的右侧
    let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
    normal = Cesium.Cartesian3.normalize(normal, normal);

    //由于已经获得了法向量和过平面的一点，因此可以直接构造Plane,并进一步构造ClippingPlane
    let planeTmp = Cesium.Plane.fromPointNormal(p1C3, normal);
    return Cesium.ClippingPlane.fromPlane(planeTmp);
  };

  // 计算目前相机视角与某条向量之间的夹角
  calAngleFromSeight = (p1, p2) => {
    const {lng: lng1, lat: lat1, height: height1} = p1;
    const {lng: lng2, lat: lat2, height: height2} = p2;
    // 拿到当前摄像机所在的坐标 笛卡尔3
    const cameraPos = this.view.viewer.camera.position;
    // 将仅包含经纬度信息的p1,p2，转换为相应坐标系的cartesian3对象
    let p1C3 = Cesium.Cartesian3.fromDegrees(lng1, lat1, height1);
    let p2C3 = Cesium.Cartesian3.fromDegrees(lng2, lat2, height2);

    //  right 实际上就是由p1指向p2的向量
    let right = Cesium.Cartesian3.subtract(p2C3, p1C3, new Cesium.Cartesian3());

    // 定义一个垂直向上的向量up
    let up = new Cesium.Cartesian3(0, 0, 10);

    // top  是相机视角点指向p1的向量
    let top = Cesium.Cartesian3.subtract(cameraPos, p1C3, new Cesium.Cartesian3());

    // 计算normal， right叉乘up，得到平面camera-p1C3-p2C3的法向量
    let normal = Cesium.Cartesian3.cross(right, top, new Cesium.Cartesian3());

    // 计算normal， right叉乘up，得到指向right右侧与right垂直的法向量
    let normalRight = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());

    // 法向量与top
    const radians = Cesium.Cartesian3.angleBetween(normal, normalRight);
    const degree = radians * (180 / Math.PI);
    return Number(degree);
  };

  // 笛卡尔3转经纬度 并传入地形高程
  changeToLatAndTerrainHeight = (position) => {
    let cartesian3 = new Cesium.Cartesian3(position.x, position.y, position.z);
    let cartographic = this.view.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
    let lng = Cesium.Math.toDegrees(cartographic.longitude);
    let lat = Cesium.Math.toDegrees(cartographic.latitude);
    let carto = new Cesium.Cartographic.fromDegrees(lng, lat);　　//输入经纬度
    let h2 = this.view.viewer.scene.sampleHeight(carto);
    return {lng, lat, height: h2};
  };

  // 绘制贴地纹理
  drawTexture = (points, height, urlWall) => {
    // 将传入的点坐标两两一组，两点之间取样200个点  坐标类型cartesian3
    // 围墙顶部高度
    let terranHeight = [];
    let maximumHeights = [];
    let minimumHeights = [];
    let wallPoints = [];
    let wallPoint1s = [];
    for (let i = 0; i < points.length - 1; i++) {
      let pointLeft = points[i];
      let pointRight = points[i + 1];
      const distance = Cesium.Cartesian3.distance(pointLeft, pointRight);
      // 每4m取样一个点
      for (let k = 0; k < Math.floor(distance / 10); k++) {
        let offset = k / (Math.floor(distance / 10) - 1);
        let point = Cesium.Cartesian3.lerp(pointLeft, pointRight, offset, new Cesium.Cartesian3());
        const {lng, lat, height} = this.changeToLatAndTerrainHeight(point);
        wallPoints.push(lng, lat);
        terranHeight.push(height);
      }
    }

    let minHeight = Math.min(...terranHeight);
    minimumHeights = terranHeight.map((item, index) => {
      wallPoint1s.push(wallPoints[index * 2], wallPoints[index * 2 + 1], height);
      return height;
    });
    maximumHeights = terranHeight.map((item, index) => {
      if (item <= height) {
        return minHeight;
      } else {
        return item;
      }
    });
    ;


    this.wall = this.view.viewer.entities.add({
      name: 'wall',
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArray(wallPoints),
        material: urlWall,
        maximumHeights: maximumHeights,
        minimumHeights: minimumHeights,
        outline: false
      }
    });

    const polygon = {
      name: "立体区",
      polygon: {
        //坐标点
        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(wallPoint1s),
        //是否指定各点高度
        perPositionHeight: true,
        //颜色
        material: urlWall
      }
    };

    this.entityController = new CesiumZondy.Manager.EntityController({
      viewer: this.view.viewer
    });

    //绘制图形通用方法：对接Cesium原生特性
    this.entityController.appendGraphics(polygon);
  };

  // 开挖实现的算法

  //获取重心点
  getGravityPoint = (points) => {
    let area = 0.0;
    let gravityPoint = new Cesium.Cartesian3();
    for (let i = 0; i < points.length; i++) {
      let nextIndex = (i + 1) % points.length;
      let p1 = points[i];
      let p2 = points[nextIndex];
      let temp = (p2.y * p1.x - p2.x * p1.y) / 2.0;
      area += temp;
      gravityPoint.x += temp * (p2.x + p1.x) / 3.0;
      gravityPoint.y += temp * (p2.y + p1.y) / 3.0;
    }
    gravityPoint.x = gravityPoint.x / area;
    gravityPoint.y = gravityPoint.y / area;
    return gravityPoint;
  };

  //计算距离
  getDistance = (p0, p1, p2) => {
    let S1 = Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
    let S2 = Math.sqrt((p0.x - p2.x) * (p0.x - p2.x) + (p0.y - p2.y) * (p0.y - p2.y));
    let S3 = Math.sqrt((p1.x - p0.x) * (p1.x - p0.x) + (p1.y - p0.y) * (p1.y - p0.y));
    let p = (S1 + S2 + S3) / 2;
    // 海伦公式算面积
    let S = Math.sqrt(p * (p - S1) * (p - S2) * (p - S3));
    // 面积除底边长度等于距离
    let distance = 2.0 * S / S1;
    return distance;
  };

  //计算开挖面
  getClippingPlane = (points, gravityPoint) => {
    let pointsLength = points.length;
    let planes = [];
    let gravity = gravityPoint;
    for (let i = 0; i < pointsLength; i++) {
      let nextIndex = (i + 1) % pointsLength;
      let p1 = points[i];
      let p2 = points[nextIndex];
      //求重心点到point[i]和point[nextIndex]组成边的距离
      let distancePlane = this.getDistance(gravity, points[i], points[nextIndex]);
      // 求经过重心点的向量 算法二 垂直加距离
      let retVec = new Cesium.Cartesian3();
      if (p2.x - p1.x !== 0.0) {
        let u = Math.sqrt(Math.pow(distancePlane, 2.0) / (1.0 + Math.pow(((p2.y - p1.y) / (p2.x - p1.x)), 2.0)));
        retVec.y = u + gravity.y;
        retVec.x = -((retVec.y - gravity.y) * (p2.y - p1.y)) / (p2.x - p1.x) + gravity.x;
        //判断点是否在线段上
        let k1 = (retVec.y - p1.y) * (p2.x - p1.x);
        let k2 = (retVec.x - p1.x) * (p2.y - p1.y);
        if (Math.abs(k1 - k2) > 0.001) {
          retVec.y = -u + gravity.y;
          retVec.x = -((retVec.y - gravity.y) * (p2.y - p1.y)) / (p2.x - p1.x) + gravity.x;
        }
      } else if (p2.y - p1.y !== 0.0 && p2.x - p1.x === 0.0) {
        retVec.x = p1.x;
        retVec.y = (p1.y + p2.y) / 2.0;
      }
      //求法向量，垂足与重心点的向量
      retVec = Cesium.Cartesian3.subtract(retVec, gravity, retVec);
      retVec = Cesium.Cartesian3.normalize(retVec, retVec);
      if (distancePlane > 0) {
        distancePlane = -(distancePlane);
      }
      planes.push(new Cesium.ClippingPlane(retVec, distancePlane));
    }
    //添加向下挖底面
    planes.push(new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 0.0));
    return planes;
  };

  startDynaCut = (tileset, centerPoints, clippingPlanes, height) => {
    if (!this.analysisManager) {
      this.analysisManager = new CesiumZondy.Manager.AnalysisManager({viewer: this.view.viewer});
    }
    const dynaCut = this.analysisManager.createExcavateAnalysis({
      //图层信息
      tileset: tileset,
      //开挖面的形状
      //planes: this.planes,
      planes: clippingPlanes,
      //裁剪面材质
      material: new Cesium.Color(0.2, 0.4, 0.3, 0.7),
      //边界线颜色
      edgeColor: new Cesium.Color(0.2, 0.4, 0.3, 0.7),
      //边界线宽度
      edgeWidth: 3,
      //裁减法线方向，默认值为 false
      unionClippingRegions: false,
      //开挖坐标
      longitude: centerPoints[0],
      latitude: centerPoints[1],
      height: -1000
    });
    // 设置开挖的动态效果
    dynaCut.planes[0].plane.plane = new Cesium.CallbackProperty(function () {
      for (let i = 0; i < clippingPlanes.length; i++) {
        if (i === clippingPlanes.length - 1) {
          let plane = clippingPlanes[i];
          plane.distance = -height;
          Cesium.Plane.transform(plane, tileset.modelMatrix, new Cesium.ClippingPlane(Cesium.Cartesian3.UNIT_X, 0.0));
        }
      }
    }.bind(this), false);
    this.dynaCutList.push(dynaCut);
  };

  getCenterPoint = (transform, gravity) => {
    //模型坐标转经纬度坐标
    const gravityCartesian = Cesium.Matrix4.multiplyByPoint(transform, gravity, new Cesium.Cartesian3());
    const cartographic = Cesium.Cartographic.fromCartesian(gravityCartesian);
    const lng = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);

    return [lng, lat];
  };

  // 开挖实现  layerIndexs地上图层的id
  dig = (pointArr, height, layerIndexs) => {
    //计算开挖面 对于挖，需要模仿开挖的效果
    let tileset = this.view.tilesetList.find(t => t.layerId) || this.view.tilesetList[0];
    let transform = tileset.root.transform;
    const gravity = this.getGravityPoint(pointArr);
    const clippingPlanes = this.getClippingPlane(pointArr, gravity);
    //开挖
    const cutTilesets = layerIndexs ? this.view.tilesetList.filter(t => layerIndexs.includes(t.layerIndex)) : this.view.tilesetList;
    cutTilesets.map(t =>
      setTimeout(() => {
        this.startDynaCut(t, this.getCenterPoint(transform, gravity), clippingPlanes, height);
      })
    );
    return this.dynaCutList
  };

  /*移除填挖方计算*/
  stopCutFillM = () => {
    if (!this.analysisManager) {
      this.analysisManager = new CesiumZondy.Manager.AnalysisManager({viewer: this.view.viewer});
    }
    this.dynaCutList.forEach(d => this.analysisManager && this.analysisManager.deleteDynamicCutting(d));
    this.dynaCutList = [];
  };

  removeAll=()=>{
    if(!this.entityController){
      //构造几何控制对象
      this.entityController = new CesiumZondy.Manager.EntityController({
        viewer: this.view.viewer
      });
    }
    this.entityController && this.entityController.removeAllEntities();
    this.stopCutFillM()
  }
}

export default emgUtil;
