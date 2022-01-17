import {polygon, point, booleanPointInPolygon} from '@turf/turf';
import _ from 'lodash';

export function flyTo(globeView, webGlobe) {
  webGlobe.viewer.camera.flyTo(globeView);
}

export function flyToEx(globeView, webGlobe) {
  let {destination, orientation} = globeView;
  let {x, y, z} = destination;
  let {heading, pitch} = orientation;
  let center,
    range = 1.0;

  if (x > 180 || x < -180 || y > 180 || y < -180) {
    center = new Cesium.Cartesian3(x, y, z);
  } else {
    center = new Cesium.Cartesian3.fromDegrees(x, y, z);
  }

  webGlobe.viewer.camera.flyToEx({
    target: center,
    offset: new Cesium.HeadingPitchRange(heading, pitch, range)
  });
}

export function dirname(path) {
  if (typeof path !== "string") path = path + "";
  if (path.length === 0) return ".";
  var code = path.charCodeAt(0);
  var hasRoot = code === 47; /* / */
  var end = -1;
  var matchedSlash = true;
  for (var i = path.length - 1; i >= 1; --i) {
    code = path.charCodeAt(i);
    if (code === 47 /* / */) {
      if (!matchedSlash) {
        end = i;
        break;
      }
    } else {
      // We saw the first non-path separator
      matchedSlash = false;
    }
  }

  if (end === -1) return hasRoot ? "/" : ".";
  if (hasRoot && end === 1) {
    // return '//';
    // Backwards-compat fix:
    return "/";
  }
  return path.slice(0, end);
}

/**
 * RGB/RGBA转Cesium内部颜色值
 * @param color rgb/rgba字符串
 * @returns {*}
 */
export function colorToCesiumColor(color, webGlobe) {
  let cesiumColor;
  if (color.includes("rgb")) {
    // 如果是rgb或者rgba
    const a = color.split("(")[1].split(")")[0];
    const arr = a.split(",");
    const cesiumRed = Number((Number(arr[0]) / 255).toFixed(2));
    const cesiumGreen = Number((Number(arr[1]) / 255).toFixed(2));
    const cesiumBlue = Number((Number(arr[2]) / 255).toFixed(2));
    const cesiumAlpha = Number(arr[3] ? arr[3] : 1);
    cesiumColor = webGlobe.getColor(
      cesiumRed,
      cesiumGreen,
      cesiumBlue,
      cesiumAlpha
    );
  }
  return cesiumColor;
}

/**
 * 获取当前摄像机的位置
 * @returns {null|{lng: number, lat: number, height: *}}
 */
export function getCenterPosition(webGlobe) {
  const lnglat = getCartographic(webGlobe);
  if (lnglat) {
    const {longitude, latitude} = lnglat;
    const pi = Math.PI;
    const lng = (longitude * 180) / pi;
    const lat = (latitude * 180) / pi;
    const height = getCameraHeight(webGlobe);
    return {
      lng,
      lat,
      height
    };
  }
  return null;
}

/**
 * 获取地理坐标
 * @returns 地理坐标
 */
export function getCartographic(webGlobe) {
  const pickEllipsoid = getPickEllipsoid(webGlobe);
  return pickEllipsoid
    ? Cesium.Ellipsoid.WGS84.cartesianToCartographic(pickEllipsoid)
    : null;
}

/**
 * 获取椭球坐标
 * @returns height
 */
export function getPickEllipsoid(webGlobe) {
  const {w, h} = getWebGlobeCanvasSize(webGlobe);
  return webGlobe.viewer.camera.pickEllipsoid(
    new Cesium.Cartesian2(w / 2, h / 2)
  );
}

/**
 * 获取三维场景画布高宽
 * @returns {w:number; h: number}
 */
export function getWebGlobeCanvasSize(webGlobe) {
  const {canvas} = webGlobe.viewer;
  return {
    w: canvas.clientWidth,
    h: canvas.clientHeight
  };
}

/**
 * 获取camera高度
 * @returns height
 */
export function getCameraHeight(webGlobe) {
  const {viewer} = webGlobe;
  return viewer
    ? viewer.scene.globe.ellipsoid.cartesianToCartographic(
      viewer.camera.position
    ).height
    : 0;
}

/**
 * 判断当前是否开启了对数深度缓存区
 * @returns true:开启,false:关闭
 */
export function isLogarithmicDepthBufferEnable(webGlobe) {
  return webGlobe.viewer.scene.logarithmicDepthBuffer;
}

/**
 * 设置是否开启对数深度缓存区
 * @param {*} isEnable true:开启，false:关闭
 */
export function setLogarithmicDepthBufferEnable(isEnable, webGlobe) {
  webGlobe.viewer.scene.logarithmicDepthBuffer = isEnable;
}

/**
 * 判断当前是否开启了深度检测
 * @returns true:开启,false:关闭
 */
export function isDepthTestAgainstTerrainEnable(webGlobe) {
  return webGlobe.viewer.scene.globe.depthTestAgainstTerrain;
}

/**
 * 设置是否开启深度检测
 * @param {*} isEnable true:开启，false:关闭
 */
export function setDepthTestAgainstTerrainEnable(isEnable, webGlobe) {
  webGlobe.viewer.scene.globe.depthTestAgainstTerrain = isEnable;
}

/**
 * 判断当前是否开启了光照
 * @returns true:开启,false:关闭
 */
export function isEnableLighting(webGlobe) {
  return webGlobe.viewer.scene.globe.enableLighting;
}

/**
 * 设置光照
 * @param {*} isEnable true:开启，false:关闭
 */
export function setEnableLighting(isEnable, webGlobe) {
  webGlobe.viewer.scene.globe.enableLighting = isEnable;
}

/**
 * 获取光照对象
 * @returns brightness对象
 */
export function getBrightness(webGlobe) {
  return webGlobe.viewer.scene.brightness;
}

/**
 * 获取光照对象的开启状态和Uniforms的brightness参数
 * @returns this.webGlobe.viewer.scene.brightness的enabled和uniforms.brightness值
 */
export function getBrightnessStatusAndUniformsBrightness(webGlobe) {
  const {enabled, uniforms} = webGlobe.viewer.scene.brightness;
  const {brightness} = uniforms;
  return {enabled, brightness};
}

/**
 * 设置光照对象的开启状态和Uniforms的brightness参数
 * @param {*} { enabled, brightness } this.webGlobe.viewer.scene.brightness的enabled和uniforms.brightness值组成的数组
 */
export function setBrightnessStatusAndUniformsBrightness(
  {enabled, brightness},
  webGlobe
) {
  const sceneBrightness = webGlobe.viewer.scene.brightness;
  sceneBrightness.enabled = enabled;
  sceneBrightness.uniforms.brightness = brightness;
}

// 计算给定范围内最小地形高程
export function calMinTerrainHeight(webGlobal, positions) {
  const positionTransfer = (positionLng) => {
    const car3 = Cesium.Cartesian3.fromDegrees(positionLng.lng, positionLng.lat, positionLng.height);
    return Cesium.Cartesian2.fromCartesian3(car3);
  };

  // 先将立体的变为平面的
  const positionsWithZeroHeight = positions.map(position => {
    const cartesian3 = new Cesium.Cartesian3(position.x, position.y, position.z);
    const cartographic = webGlobal.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
    const lng = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
    const zeroPoint = positionTransfer({lng, lat, height: 0});
    return zeroPoint;
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
    const cartographic = webGlobal.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
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
    let p = positionTransfer(item);
    let pt = point([p.x, p.y]);
    let res = booleanPointInPolygon(pt, poly);
    if (res) {
      resPointList.push(item);
    }
  });
  let heightList = [];
  resPointList.forEach((point) => {
    const carto = new Cesium.Cartographic.fromDegrees(point.lng, point.lat);　　//输入经纬度
    const h2 = webGlobal.viewer.scene.sampleHeight(carto);
    h2 !== 0 && heightList.push(h2);
  });
  return {
    _minHeight: _.min(heightList),
    _maxHeight: _.max(heightList)
  };
};


