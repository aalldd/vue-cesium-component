import emgUtil from "@/util/helpers/emgUtil";
import {handleColor} from "@/util/helpers/colorHelper";
import * as turf from "@turf/turf";

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
  appendArea(name, positionArr, options={}) {
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
    const height=options.height?options.height:0

    //将颜色转为Cesium的颜色
    const newFillColor = new Cesium.Color(...handleColor(fillColor, fillOpacity));
    const newOutLineColor = new Cesium.Color(...handleColor(outLineColor, outlineOpacity));

    let turfPolygonPoints=positionArr.map(item=>{
      const {lng, lat} = item;
      return [lng,lat]
    })
    turfPolygonPoints=[...turfPolygonPoints,turfPolygonPoints[0]]
    let turfPolygon=turf.polygon([turfPolygonPoints])
    let center=turf.centerOfMass(turfPolygon)
    const middleCenter=center.geometry.coordinates
    const centerPosition={
      lng:middleCenter[0],
      lat:middleCenter[1],
      height
    }

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
    this.appendMarker(name,centerPosition)
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

  // * @param  {String} name 名称
  // * @param  {{lng,lat,height}} position 点数组
  // * @param  {String} [optionsParam.fontStyle="16pt 宋体"] 字体
  // * @param  {Color} [optionsParam.fontColor='rgba(0,0,0,1)'] 字体填充色
  // * @param  {String} [optionsParam.iconUrl=''] 图标的路径
  // * @param  {Number} [options.iconWidth] 图标宽度
  // * @param  {Number} [options.iconHeight] 图标高度
  appendMarker(name, position, options={}) {
    const labelLayer = new CesiumZondy.Manager.LabelLayer({
      viewer: this.view.viewer
    });
    const {lng, lat, height} = position;
    const text = name ? name : '';
    const fontStyle = options.fontStyle ? options.fontStyle : "16pt 宋体";
    const fontColor = options.fontColor ? options.fontColor : 'rgba(0,0,0,1)';
    const iconUrl = options.iconUrl ? options.iconUrl : '';
    const iconWidth = options.width ? options.iconWidth : 50;
    const iconHeight = options.width ? options.iconHeight : 50;
    const cesiumColor=new Cesium.Color(...handleColor(fontColor))
    const labelIcon = labelLayer.appendLabelIcon(
      //文本内容
      text,
      //经度、纬度、高度
      lng, lat, height,
      //文字大小、字体
      fontStyle,
      //文字颜色
      cesiumColor,
      //图片地址
      iconUrl,
      //图片宽度、高度
      iconWidth, iconHeight,
      //最远显示距离：相机到注记的距离大于该值 注记不显示
      10000000,
      //最近显示距离：相机到注记的距离小于该值 注记不显示
      1,
      //图片位置：'center','top','bottom'
      'center'
    );
    return labelIcon
  }

  removeEntities() {
    this.entityCache.forEach(entity => {
      entity && this.view.viewer.entities.remove(entity);
    });
  }
}

export default BasicOpers;
