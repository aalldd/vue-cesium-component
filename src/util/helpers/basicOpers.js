import emgUtil from "@/util/helpers/emgUtil";
import {handleColor} from "@/util/helpers/colorHelper";

class BasicOpers {
  constructor(view) {
    this.view = view;
    this.emgManager = new emgUtil(view);
    this.entityCache = [];
    this.entityController = new CesiumZondy.Manager.EntityController({
      viewer: this.view.viewer
    });
  }

  //* 添加多边形区
  //* @param {Array<{lng,lat,height}>} positionArr  点数组
  //* @param {Number} opacity  透明度,默认0.5
  //* @param {Color} fillColor  填充颜色 默认白色半透明
  //* @param {Color} outLineColor 外边框颜色
  //* @param {Number<px>} width 参数
  appendArea(name, positionArr, options) {
    let renderPoints = [];
    positionArr.forEach(point => {
      const {lng, lat, height} = point;
      renderPoints = [...renderPoints, lng, lat, height];
    });
    //给所有参数一个默认值
    const fillColor = options.fillColor ? options.fillColor : '#005bac';
    const outLineColor = options.outLineColor ? options.outLineColor : '#005bac';
    const fillOpacity = options.fillOpacity ? options.fillOpacity : 1;
    const outlineOpacity = options.outlineOpacity ? options.outlineOpacity : 1;
    const width = options.width ? options.width : 1;

    //将颜色转为Cesium的颜色
    const newFillColor = new Cesium.Color(...handleColor(fillColor, fillOpacity));
    const newOutLineColor = new Cesium.Color(...handleColor(outLineColor, outlineOpacity));

    //构造区对象
    let polygon = {
      name: "多边形",
      polygon: {
        //坐标点
        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(renderPoints),
        perPositionHeight: true,
        //颜色
        material: newFillColor,
        heightReference: Cesium.HeightReference.NONE
      }
    };
    //绘制图形通用方法：对接Cesium原生特性
    const areaEntity = new Cesium.Entity(polygon);
    this.view.viewer.entities.add(areaEntity);

    let linePositionArr = [...positionArr, positionArr[0], positionArr[1]];
    this.appendLine(name, linePositionArr, width, newOutLineColor, true);
    this.entityCache.push(areaEntity);
  }

  // * @param  {String} name 名称
  // * @param  {Array<{lng,lat,height}>} pointsArray 点数组
  // * @param  {Number} width 线的宽度
  // * @param  {Color} color 线颜色(默认为蓝色)
  // * @param  {Boolean} isHeight 设置是否识别带高度的坐标
  // * @param  {Boolean} clampToGround 设置是否贴地形
  // * @param  {Object} options 包含的附加属性
  appendLine(name, positions, width, color) {
    let newPositions = [];
    positions.forEach(point => {
      const {lng, lat, height} = point;
      newPositions = [...newPositions, lng, lat, height];
    });
    const lineEntity = this.entityController.appendLine(name, newPositions, width, color, true, false);
    this.entityCache.push(lineEntity);
  }

  removeEntities() {
    this.entityCache.forEach(entity => {
      entity && this.view.viewer.entities.remove(entity);
    });
  }
}

export default BasicOpers;
