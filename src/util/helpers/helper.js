/************************************************************************************************
 * Copyright ©, 2018-2020, MapGIS
 * @Description: 工具集
 * @Author: Chenzilong
 * @History: 1、初始版本 2018-06-29 Chenzilong
 * @Usage:
 ************************************************************************************************/

/**
 * 根据plain object构造FormData实例
 * @param {Object} obj
 * @returns FormData
 */
function formData(obj) {
  var formData = new FormData();
  Object.keys(obj).forEach(function (k) {
    formData.append(k, obj[k]);
  });
  return formData;
}

//验证是否为可用的地图配置
function isValidConfig(config) {
  return config && (config.basemaps.length > 0 || config.layers.length > 0);
}

//创建唯一id
function createCounter() {
  var i = 0;
  return function (prefix = "") {
    return prefix + (i++);
  }
};
const uniqueId = createCounter();

//小数点后位数
function floatLength(num) {
  if ("number" === typeof num) {
    const floatPart = num.toString().split(".")[1];
    return floatPart ? floatPart.length : 0;
  }
  return 0;
}

function relativeUrl() {
  var args = Array.prototype.slice.call(arguments),
    M = /^\s*[a-z][a-z0-9-+.]*:(?![0-9])/i,
    V = /^\s*file:/i;

  function isProtocolRelative(a) {
    return a && "/" === a[0] && "/" === a[1]
  }

  function isAbsolute(a) {
    return isProtocolRelative(a) || M.test(a)
  }

  function join() {
    for (var a = [], b = 0; b < arguments.length; b++) a[b] = arguments[b];
    if (a && a.length) {
      b = [];
      if (isAbsolute(a[0])) {
        var c = a[0],
          d = c.indexOf("//");
        b.push(c.slice(0, d + 1));
        V.test(a[0]) && (b[0] += "/");
        a[0] = c.slice(d + 2)
      } else "/" === a[0][0] && b.push("");
      a = a.reduce(function (a, b) {
        return b ? a.concat(b.split("/")) : a
      }, []);
      for (c = 0; c < a.length; c++) d = a[c], ".." === d && 0 < b.length ? b.pop() : !d || "." === d && 0 !== b.length || b.push(d);
      return b.join("/")
    }
  }
  var url = "";
  for (var i = 0; i < args.length; i++) {
    var arg = args[i],
      relative = isProtocolRelative(arg),
      absolute = isAbsolute(arg);
    if (relative) {
      if (url) url = url.split("://")[0] + ":" + arg.trim()
    } else {
      if (absolute) {
        url = arg;
      } else {
        url = join(url, args[i])
      }
    }
  }
  return url;
}

//获取字符串中类似参数的value值。str格式： xxx?key=value&key1=value1
function getQueryValue(queryName, str) {
  const strArr = str.split("?");
  if (strArr.length != 2) {
    return null;
  }
  const strtemp = strArr[1];
  const query = strtemp.split("&");
  for (var i = 0; i < query.length; i++) {
    var pair = query[i].split("=");
    if (pair[0] == queryName) {
      return pair[1];
    }
  }
  return null;
}

function downloadFile(fileUrl) {
  let frame = document.createElement('iframe');
  frame.id = 'frmDown';
  frame.style.display = 'none';
  frame.src = fileUrl;
  document.body.appendChild(frame);
}

function download(fileUrl, fileName) {
  var a = document.createElement('a');
  a.download = fileName;
  a.href = fileUrl;
  a.click();
}

function downloadText(text, fileName) {
  var a = document.createElement('a');
  var blob = new Blob([text]);
  a.download = fileName || `${Date.now()}.txt`;
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(blob);
}

function downloadImage(url, name) {
  try {
    var image = new Image();
    var fileExtention = name ? name.slice(name.lastIndexOf(".") + 1) : "png";
    image.setAttribute('crossOrigin', 'anonymous');
    image.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      var context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, image.width, image.height);
      var url = canvas.toDataURL(`image/${fileExtention}`);
      var a = document.createElement('a');
      var event = new MouseEvent('click');
      a.download = name || `未命名.${fileExtention}`;
      a.href = url;
      a.dispatchEvent(event);
    }
    image.src = url;
  } catch (e) {
    throw e;
  }
}

//对象处理
const objectUtil = {
  atob(base64string) {
    try {
      var jsonString = atob(base64string);
      return JSON.parse(decodeURIComponent(jsonString));
    } catch (error) {
      return null;
    }
  },
  btoa(obj) {
    try {
      var jsonString = JSON.stringify(obj);
      return btoa(encodeURIComponent(jsonString));
    } catch (error) {
      return "";
    }
  },
  isObject(val) {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
  },
  isNumber(val) {
    var num = Number(val);
    return typeof num === "number" && !isNaN(num);
  },
  isEnumerable(val) {
    return val != null && typeof val === 'object';
  },
  isFunction(val) {
    return typeof val === "function";
  },
  isUndefined(val) {
    return typeof val === "undefined";
  },
  isNullOrEmpty(val) {
    return typeof val === "undefined" || val === null || val === "";
  },
  tryConvertNumber(val) {
    const num = Number(val);
    return isNaN(num) ? val : num;
  },
  /**
   * 获取target的field字段值
   * @param {Object} target
   * @param {String} field - field1.field2.field3....
   * @returns any
   */
  getValue(target, field) {
    let fields = field.split("."),
      len = fields.length,
      i = 0,
      currentTarget = target,
      currentField = '';
    if (currentTarget) {
      do {
        currentField = this.tryConvertNumber(fields[i]);
        currentTarget = currentTarget[currentField];
        i++;
      } while (this.isEnumerable(currentTarget) && i < len)
    }
    return currentTarget;
  },
  /**
   * 设置target的field字段值
   * @param {Object} target
   * @param {String} field  - field1.field2.field3....
   * @returns any
   */
  setValue(target, field, value) {
    if (target) {
      let fields = field.split("."),
        len = fields.length,
        i = 0,
        currentTarget = target,
        currentField,
        nextField;
      //获取倒数个第二字段值
      while (i < len - 1) {
        currentField = this.tryConvertNumber(fields[i]);
        nextField = i <= len - 2 ? this.tryConvertNumber(field[i + 1]) : null;
        if (!this.isEnumerable(currentTarget[currentField])) {
          currentTarget[currentField] = this.isNumber(nextField) ? [] : {};
        }
        currentTarget = currentTarget[currentField];
        i++;
      }
      //给最后字段赋值
      currentField = this.tryConvertNumber(fields[len - 1]);
      currentTarget[currentField] = value;
    }
    return target;
  },
  /**
   * 修改target中对应属性的值，并返回被修改对象
   * @param {Object} target
   * @param {Object|Array} modifyVars - {[key]:[any|function(key,value)]} | [{[key]:[any|function(key,value)]}]
   * @returns Object
   */
  setValues(target, modifyVars) {
    if (target && modifyVars) {
      const vars = this.combine(modifyVars);
      Object.keys(vars).forEach(key => {
        const handleOrValue = vars[key];
        this.setValue(target, key, this.isFunction(handleOrValue) ? handleOrValue(key, this.getValue(target, key)) : handleOrValue);
      });
    }
    return target;
  },
  /**
   * target中是否含有field属性
   * @param {Object} target
   * @param {String} field - field1.field2.field3....
   * @returns boolean
   */
  hasOwnProperty(target, field) {
    if (target && field) {
      let fields = field.split("."),
        len = fields.length,
        i = 0,
        key;
      do {
        key = fields[i];
        i++;
      } while (i < len && target.hasOwnProperty(key));
      return i == len;
    }
    return false;
  },
  /**
   * 修改target中对应属性的值（仅修改可枚举属性），并返回被修改对象
   * @param {Object} target
   * @param {Object|Array} modifyVars - {[key]:[any|function(key,value)]} | [{[key,value]:[any|function(key)]}]
   * @returns Object
   */
  setOwnProperties(target, modifyVars) {
    if (target && modifyVars) {
      const vars = this.combine(modifyVars);
      Object.keys(vars).forEach(key => {
        const handleOrValue = vars[key];
        if (this.hasOwnProperty(target, key)) {
          this.setValue(target, key, this.isFunction(handleOrValue) ? handleOrValue(key, this.getValue(target, key)) : handleOrValue);
        }
      })

    }
    return target;
  },
  /**
   * 合并对象
   * @param {Array}
   * @returns Object
   */
  combine() {
    let args = Array.prototype.slice.call(arguments),
      len = args.length,
      argsToCombine = [];
    if (len > 0) {
      const arrayObj = args.find(item => Array.isArray(item));
      if (arrayObj) {
        argsToCombine = arrayObj.filter(item => this.isObject(item));
      } else {
        argsToCombine = args.filter(item => this.isObject(item));
      }
      return Object.assign.apply(null, [{}, ...argsToCombine]);
    } else {
      return null;
    }
  },
  /**
   * 合并target中指定属性，返回新对象
   * @param {Object} target
   * @param {Array<String>} keys
   * @param {Function} mapFunc
   * @returns Object
   */
  take(target, keys, mapFunc) {
    if (target) {
      const keyValues = keys.map(key => {
        return {
          [key]: mapFunc ? mapFunc(key, target[key]) : target[key]
        }
      });
      return this.combine(keyValues);
    }
    return null;
  },
  /**
   * 映射target，返回新对象
   * @param {Object} target
   * @param {Function} mapFunc
   * @returns Object
   */
  map(target, mapFunc) {
    if (target) {
      const keyValues = Object.keys(target).map(key => {
        return {
          [key]: mapFunc ? mapFunc(key, target[key]) : target[key]
        }
      });
      return this.combine(keyValues);
    }
    return null;
  },
  compare(a, b, compares) {
    try {
      return Object.keys(compares).map(key => {
        const compareFun = compares[key];
        return compareFun(a[key], b[key])
      }).reduce((a, b) => a |= b, false)
    } catch (e) {
      return false;
    }
  }
}

//数组处理函数
const arrayUtil = {
  replace(array, compareFunc, mapFunc) {
    const foundItems = array.filter(compareFunc);
    foundItems.forEach(item => {
      const index = array.indexOf(item);
      if (mapFunc) {
        array.splice(index, 1, mapFunc(item));
      } else {
        array.splice(index, 1);
      }
    })
    return array;
  },
  delete(array, compareFunc) {
    return this.replace(array, compareFunc);
  },
  groupBy(array, iteratee) {
    let groupedObject = {};
    array.map(item => iteratee(item)).forEach((key, i) => {
      if (!groupedObject[key]) {
        groupedObject[key] = [];
      }
      groupedObject[key].push(array[i]);
    });
    return groupedObject;
  },
  create(length, iteratee = (index) => index) {
    var array = [];
    for (var i = 0; i < length; i++) {
      array.push(iteratee(i));
    }
    return array;
  }
}

//树形数据处理函数
const treeUtil = {
  flatten(dataSource, childrenField = "children") { //扁平化，转成一维数组
    let flattenArray = [];
    if (dataSource && dataSource.length) {
      let _children = dataSource.concat();
      do {
        //插入当前深度的所有子节点
        Array.prototype.push.apply(flattenArray, _children);
        //获取下一级所有子节点，Array.from用于将ObservableArray转化为一般数组（防止树数据源在添加@Observable情况下出错）
        _children = _children.map(item => item[childrenField] ? ("function" == typeof item[childrenField].toArray ? item[childrenField].toArray() : Array.from(item[childrenField])) : []).reduce((a, b) => a.concat(b), []);
      } while (_children.length)
    }
    return flattenArray;
  },
  find(dataSource, compareFunc, childrenField = "children") {
    return this.flatten(dataSource, childrenField).find(compareFunc);
  },
  forEach(dataSource, iteratee, childrenField = "children", parent = null) {
    dataSource.forEach((item, index, array) => {
      iteratee(item, parent, index, array);
      const children = item[childrenField] ? Array.from(item[childrenField]) : [];
      if (children && children.length) {
        this.forEach(children, iteratee, childrenField, item);
      }
    })
  },
  findParent(dataSource, compareFunc, childrenField = "children") { //获取父节点
    const depth = this.depthBy(dataSource, compareFunc, childrenField);
    return this.depthWith(dataSource, depth - 1, childrenField).find(item => {
      const children = item[childrenField] ? Array.from(item[childrenField]) : [];
      return children && children.some(compareFunc);
    });
  },
  findRoot(dataSource, compareFunc, childrenField = "children") { //获取根节点
    return dataSource && dataSource.find(item => this.some(item[childrenField] ? Array.from(item[childrenField]) : [], compareFunc, childrenField));
  },
  some() {
    const item = this.find.apply(this, arguments);
    return item != null;
  },
  filter(dataSource, compareFunc, childrenField = "children") {
    return this.flatten(dataSource, childrenField).filter(compareFunc);
  },
  filter2(dataSource, compareFunc, childrenField = "children") {
    let data = dataSource.filter(compareFunc);
    this.forEach(data, (item) => {
      if (item[childrenField]) {
        item[childrenField] = item[childrenField].filter(compareFunc);
      }
    }, childrenField);
    return data;
  },
  map(dataSource, mapFunc, childrenField = "children", parent = null) {
    let mappedData = [];
    if (dataSource) {
      mappedData = dataSource.map((item, index, array) => {
        let mappedItem = mapFunc(item, parent, index, array);
        const children = item[childrenField] ? Array.from(item[childrenField]) : null;
        if (children) {
          mappedItem[childrenField] = this.map(children, mapFunc, childrenField, mappedItem);
        }
        return mappedItem;
      });
    }
    return mappedData;
  },
  depth(dataSource, childrenField = "children") { //计算最大深度
    let dep = 0;
    if (dataSource) {
      let _copy = dataSource.concat();
      while (_copy.length) {
        dep++;
        //获取下一级所有子节点
        _copy = _copy.map(item => item[childrenField] ? Array.from(item[childrenField]) : []).reduce((a, b) => a.concat(b), []);
      }
      _copy = null;
    }
    return dep;
  },
  depthBy(dataSource, compareFunc, childrenField = "children") { //计算满足条件的深度
    let dep = 0,
      found = false;
    if (dataSource) {
      let _copy = dataSource.concat();
      while (_copy.length) {
        dep++;
        if (_copy.some(compareFunc)) {
          found = true;
          break;
        }
        //获取下一级所有子节点
        _copy = _copy.map(item => item[childrenField] ? Array.from(item[childrenField]) : []).reduce((a, b) => a.concat(b), []);
      }
      _copy = null;
    }
    return found ? dep : 0;
  },
  depthWith(dataSource, depth, childrenField = "children") { //获取指定深度的所有字节点
    let _copy = [];
    if (dataSource && depth >= 1) {
      let dep = 1;
      _copy = dataSource.concat();
      while (_copy.length && dep != depth) {
        //获取下一级所有子节点
        _copy = _copy.map(item => item[childrenField] ? Array.from(item[childrenField]) : []).reduce((a, b) => a.concat(b), []);
        dep++;
      }
    }
    return _copy;
  }
}

const pwdUtil = {
  //字符二进制标识
  charSign(charCode) {
    if (charCode >= 48 && charCode <= 57) { //数字
      return 1;
    }
    if (charCode >= 97 && charCode <= 122) { //小写字母
      return 2;
    }
    if (charCode >= 65 && charCode <= 90) { //大写字母
      return 4;
    }
    return 8; //其他字符
  },
  //字符种类个数
  charTypeCount(pwd) {
    let result = 0,
      typeCount = 0,
      sign = 1,
      len = pwd.length;
    for (var i = 0; i < len; i++) {
      sign = this.charSign(pwd.charCodeAt(i));
      result |= sign;
    }
    for (var j = 0; j < 4; j++ , result >>>= 1) {
      if (result & 1)
        typeCount++;
    }
    return typeCount;
  },
  //密码强度验证
  //规则：
  //1、长度大于等于6位
  //2、字符类型种类: 1 - 弱, 2 - 中, 3/4 - 强
  verify(pwd) {
    let len = pwd.length,
      typeCount = this.charTypeCount(pwd);
    if (len >= 6) {
      switch (typeCount) {
        case 1:
          return "弱";
        case 2:
          return "中";
        case 3:
        case 4:
        default:
          return "强";
      }
    }
    return "弱";
  }
}


import moment from 'moment'
const dateUtil = {
  //21世纪某日期所属季节
  getSeason(date) {
    const d = date || new Date(),
      t = d.getTime(),
      y = d.getFullYear(),
      beginOfSpring = this.beginOfSeason(y, "spring").getTime(),
      beginOfSummer = this.beginOfSeason(y, "summer").getTime(),
      beginOfAutumn = this.beginOfSeason(y, "autumn").getTime(),
      beginOfWinter = this.beginOfSeason(y, "winter").getTime();
    if (t >= beginOfSpring && t < beginOfSummer) {
      return "spring";
    } else if (t >= beginOfSummer && t < beginOfAutumn) {
      return "summer";
    } else if (t >= beginOfAutumn && t < beginOfWinter) {
      return "autumn";
    } else {
      return "winter";
    }
  },
  getLeapYearCount(year) {
    return Math.floor(year / 4 - year / 100 + year / 400);
  },
  //21世纪立春、立夏、立秋、立冬日计算
  beginOfSeason(year, season) {
    const Y = year % 100,
      D = 0.2422,
      L = this.getLeapYearCount(year) - this.getLeapYearCount(2000);
    switch (season) {
      case "spring":
        let springDay = Math.floor(Y * D + 3.87) - L;
        return new Date(year, 1, springDay);
      case "summer":
        let summerDay = Math.floor(Y * D + 5.52) - L;
        return new Date(year, 4, summerDay);
      case "autumn":
        let autumnDay = Math.floor(Y * D + 7.5) - L;
        if (year == 2002) {
          autumnDay += 1;
        }
        return new Date(year, 7, autumnDay);
      case "winter":
        let winterDay = Math.floor(Y * D + 7.438) - L;
        if (year == 2089) {
          winterDay += 1;
        }
        return new Date(year, 10, winterDay);
      default:
        return null;
    }
  },

  //获取当前班次的起止时间
  getCurrentDutyTime() {
    const now = moment();
    const hour = now.hours();
    let startTime, endTime;
    if (8 < hour < 18) {
      startTime = now.format('YYYY-MM-DD 08:00:00');
      endTime = now.format('YYYY-MM-DD 17:59:59');
    } else {
      startTime = now.add(-8, 'hour').format('YYYY-MM-DD 18:00:00');
      endTime = now.add(8, 'hour').format('YYYY-MM-DD 07:59:59');
    }
    return {
      startTime,
      endTime
    };
  }
}

function getElementRelativeTop(element, relativeElement) {
  var actualTop = element.offsetTop;
  var current = element.offsetParent;

  while (current !== relativeElement) {
    actualTop += current.offsetTop;
    current = current.offsetParent;
  }

  return actualTop;
}

function getElementRelativeLeft(element, relativeElement) {
  var actualLeft = element.offsetLeft;
  var current = element.offsetParent;

  while (current !== relativeElement) {
    actualLeft += current.offsetLeft;
    current = current.offsetParent;
  }

  return actualLeft;
}

function tryJSONParse(json) {
  try {
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

const geomUtil = {
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
      }
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
    }
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
          return { x: (polyline.getPoint(0, s).x + polyline.getPoint(0, e).x) / 2, y: (polyline.getPoint(0, s).y + polyline.getPoint(0, e).y) / 2, spatialReference: geometry.spatialReference };
        } else {
          return geometry.extent.center;
        }
      default:
        return null;
    }
  }
}

function pointerCursor(view, layer, whenHovered = null, graphicFilter = (g) => true, showPointer = true) {
  return view.on("pointer-move", (event) => {
    view.hitTest(event).then(({
                                results
                              }) => {
      const layers = Array.isArray(layer) ? layer : [layer];
      const result = results.find(r => layers.includes(r.graphic.layer) && graphicFilter(r.graphic));
      document.body.style.cursor = (result && showPointer) ? "pointer" : "default";
      "function" == typeof whenHovered && whenHovered(result ? result.graphic : null);
    })
  })
}

function viewClick(view, callback) {
  return view.on("click", (event) => {
    view.hitTest(event).then(({
                                results
                              }) => {
      const graphics = results.map(r => r.graphic);
      if (graphics.length) {
        callback(graphics);
      }
    });
  });
}

function measureTextWidth(text, font) {
  var ctx = document.createElement('canvas').getContext("2d");
  ctx.font = font;
  return ctx.measureText(text).width;
}

function formatFileSize(byteLength) {
  const KB = 1024;
  const MB = 1024 * 1024;
  const GB = 1024 * 1024 * 1024;
  if (byteLength < KB) {
    return `${byteLength}B`;
  } else if (byteLength >= KB && byteLength < MB) {
    return `${Number((byteLength / KB).toFixed(1))}KB`;
  } else if (byteLength >= MB && byteLength < GB) {
    return `${Number((byteLength / MB).toFixed(2))}MB`;
  } else {
    return `${(Number(byteLength / GB).toFixed(2))}GB`;
  }
}

function getFileIcon(url) {
  const extensions = [
    ".avi",
    ".bmp",
    ".doc",
    ".docx",
    ".exe",
    ".gif",
    ".html",
    ".ico",
    ".jar",
    ".java",
    ".jpg",
    ".js",
    ".json",
    ".mp3",
    ".mp4",
    ".pdf",
    ".png",
    ".ppt",
    ".pptx",
    ".psd",
    ".rar",
    ".tar",
    ".tif",
    ".tiff",
    ".ttf",
    ".txt",
    ".wav",
    ".xls",
    ".xlsx",
    ".xml",
    ".zip",
    ".csv"
  ];
  const ext = extensions.find(ext => url.toLowerCase().endsWith(ext)) || '.other';
  return `/static/imgs/${ext.substring(1)}.svg`;
}

function getFileExtension(url) {
  const lastIndex = url.lastIndexOf('.');
  if (lastIndex >= 0) {
    return url.substring(lastIndex + 1).toLowerCase();
  }
  return '';
}

function isPreviewAvailable(fileUrl) {
  const exts = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'png', 'gif', 'bmp', 'jpg', 'jpeg', 'mp3', 'wav', 'mp4', 'ogg', 'webm', 'txt', 'xml', 'csv', 'json'];
  const ext = getFileExtension(fileUrl);
  return exts.includes(ext);
}

function formatInt(value) {
  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function list2Tree(data, idFieldName = 'id', pidFieldName = 'pid') {
  const idMapping = data.reduce((acc, el, i) => {
    acc[el[idFieldName]] = i
    return acc
  }, {})
  let treeData = [];
  data.forEach(el => {
    if (!el[pidFieldName]) {
      treeData.push(el)
    } else {
      const parentEl = data[idMapping[el[pidFieldName]]]
      parentEl.children = [...(parentEl.children || []), el]
    }
  })
  return treeData
}
const featureTypeUtil = {
  featureLayerTypes: {
    JS_NET: "civFeatureTypeJSNet", //供水
    JS_NOD: "civFeatureTypeJSNode",
    JS_LIN: "civFeatureTypeJSLine",

    RQ_NET: "civFeatureTypeRQNet", //燃气
    RQ_NOD: "civFeatureTypeRQNode",
    RQ_LIN: "civFeatureTypeRQLine",

    PS_NET: "civFeatureTypePSNet", //排水
    PS_NOD: "civFeatureTypePSNode",
    PS_LIN: "civFeatureTypePSLine",

    WS_NET: "civFeatureTypeWSNet", //污水
    WS_NOD: "civFeatureTypeWSNode",
    WS_LIN: "civFeatureTypeWSLine",

    YS_NET: "civFeatureTypeYSNet", //雨水
    YS_NOD: "civFeatureTypeYSNode",
    YS_LIN: "civFeatureTypeYSLine",

    GENERAL_NET: "civFeatureTypeGeneralNet", //通用
    GENERAL_NOD: "civFeatureTypeGeneralNode",
    GENERAL_LIN: "civFeatureTypeGeneralLine",

    COMM_ROADLINE: "civFeatureTypeCOMMRoadLine", //道路中心线
    COMM_LOCLINE: "civFeatureTypeCOMMLocLine", //定位线
    COMM_LOCNAME: "civFeatureTypeCOMMLocName", //地名库

    JSRQAPP_PROP_SWITCH: "civFeatureMetaTypeSwitch", //关断特性
    JSRQAPP_PROP_SWIEFFECT: "civFeatureMetaTypeSwieffect", //关断影响
    JSRQAPP_PROP_RESCENTER: "civFeatureMetaTypeRescenter", //资源中心
    JSRQAPP_PROP_ATTACH: "civFeatureMetaTypeAttach", //管线附件
    JSRQAPP_PROP_RESSTOP: "civFeatureMetaTypeResstop", //资源装卸
    JSRQAPP_PROP_HYDRANT: "civFeatureMetaTypeHydrant", //消防设施（消火栓）
    JSRQAPP_PROP_BOOSTER: "civFeatureMetaTypeBooster", //调压设施
    JSRQAPP_PROP_MONITOR: "civFeatureMetaTypeMonitor", //测压点

    PSAPP_PROP_PUMP: "civFeatureMetaTypePump", //泵站
    PSAPP_PROP_DEAL: "civFeatureMetaTypeDeal", //污水厂
    PSAPP_PROP_USER: "civFeatureMetaTypeUser", //排水户
    PSAPP_PROP_YLF: "civFeatureMetaTypeYLF", //溢流阀
    PSAPP_PROP_YSK: "civFeatureMetaTypeYSK", //雨水口
    PSAPP_PROP_JCJ: "civFeatureMetaTypeJCJ", //检查井
    PSAPP_PROP_OUT: "civFeatureMetaTypeOUT", //排放口
  },
  isPipeNetFeatureClass: function(featureLayerType) {
    return featureLayerType == this.featureLayerTypes.JS_NET ||
      featureLayerType == this.featureLayerTypes.JS_LIN ||
      featureLayerType == this.featureLayerTypes.JS_NOD ||
      featureLayerType == this.featureLayerTypes.RQ_NET ||
      featureLayerType == this.featureLayerTypes.RQ_LIN ||
      featureLayerType == this.featureLayerTypes.RQ_NOD ||
      featureLayerType == this.featureLayerTypes.PS_NET ||
      featureLayerType == this.featureLayerTypes.PS_NOD ||
      featureLayerType == this.featureLayerTypes.PS_LIN ||
      featureLayerType == this.featureLayerTypes.WS_NET ||
      featureLayerType == this.featureLayerTypes.WS_NOD ||
      featureLayerType == this.featureLayerTypes.WS_LIN ||
      featureLayerType == this.featureLayerTypes.YS_NET ||
      featureLayerType == this.featureLayerTypes.YS_NOD ||
      featureLayerType == this.featureLayerTypes.YS_LIN ||
      featureLayerType == this.featureLayerTypes.GENERAL_NET ||
      featureLayerType == this.featureLayerTypes.GENERAL_NOD ||
      featureLayerType == this.featureLayerTypes.GENERAL_LIN;
  },
  isNetFeatureClass: function(featureLayerType) {
    return featureLayerType == this.featureLayerTypes.JS_NET ||
      featureLayerType == this.featureLayerTypes.RQ_NET ||
      featureLayerType == this.featureLayerTypes.PS_NET ||
      featureLayerType == this.featureLayerTypes.WS_NET ||
      featureLayerType == this.featureLayerTypes.YS_NET ||
      featureLayerType == this.featureLayerTypes.GENERAL_NET;
  },

  isRQFeatureClass: function(featureLayerType) {
    return featureLayerType == this.featureLayerTypes.RQ_NOD ||
      featureLayerType == this.featureLayerTypes.RQ_LIN;
  },
  isJSFeatureClass: function(featureLayerType) {
    return featureLayerType == this.featureLayerTypes.JS_NOD ||
      featureLayerType == this.featureLayerTypes.JS_LIN;
  },
  isPSFeatureClass: function(featureLayerType) {
    return featureLayerType == this.featureLayerTypes.PS_NOD ||
      featureLayerType == this.featureLayerTypes.PS_LIN ||
      featureLayerType == this.featureLayerTypes.WS_NOD ||
      featureLayerType == this.featureLayerTypes.WS_LIN ||
      featureLayerType == this.featureLayerTypes.YS_NOD ||
      featureLayerType == this.featureLayerTypes.YS_LIN;
  },
  isGeneralFeatureClass: function(featureLayerType) {
    return featureLayerType == this.featureLayerTypes.GENERAL_NOD ||
      featureLayerType == this.featureLayerTypes.GENERAL_LIN;
  },
  isPipeLineFeatureClass: function(featureLayerType) {
    return featureLayerType == this.featureLayerTypes.JS_LIN ||
      featureLayerType == this.featureLayerTypes.RQ_LIN ||
      featureLayerType == this.featureLayerTypes.PS_LIN ||
      featureLayerType == this.featureLayerTypes.WS_LIN ||
      featureLayerType == this.featureLayerTypes.YS_LIN ||
      featureLayerType == this.featureLayerTypes.GENERAL_LIN;
  },
  isPipeNodFeatureClass: function(featureLayerType) {
    return featureLayerType == this.featureLayerTypes.JS_NOD ||
      featureLayerType == this.featureLayerTypes.RQ_NOD ||
      featureLayerType == this.featureLayerTypes.PS_NOD ||
      featureLayerType == this.featureLayerTypes.WS_NOD ||
      featureLayerType == this.featureLayerTypes.YS_NOD ||
      featureLayerType == this.featureLayerTypes.GENERAL_NOD;
  },
  getNodLineType:function(featureLayerType){
    var nodLineType = {}
    switch(featureLayerType){
      case "civFeatureTypeJSNet":
        nodLineType={NOD:"civFeatureTypeJSNode",LIN:"civFeatureTypeJSLine"};
        break;
      case "civFeatureTypeRQNet":
        nodLineType={NOD:"civFeatureTypeRQNode",LIN:"civFeatureTypeRQLine"};
        break;
      case "civFeatureTypePSNet":
        nodLineType={NOD:"civFeatureTypePSNode",LIN:"civFeatureTypePSLine"};
        break;
      case "civFeatureTypeWSNet":
        nodLineType={NOD:"civFeatureTypeWSNode",LIN:"civFeatureTypeWSLine"};
        break;
      case "civFeatureTypeYSNet":
        nodLineType={NOD:"civFeatureTypeYSNode",LIN:"civFeatureTypeYSLine"};
        break;
      case "civFeatureTypeGeneralNet":
        nodLineType={NOD:"civFeatureTypeGeneralNode",LIN:"civFeatureTypeGeneralLine"};
        break;
    }
    return nodLineType
  }


}

export {
  isValidConfig,
  formData,
  uniqueId,
  relativeUrl,
  getQueryValue,
  downloadFile,
  download,
  downloadText,
  downloadImage,
  floatLength,
  objectUtil,
  arrayUtil,
  treeUtil,
  pwdUtil,
  dateUtil,
  getElementRelativeTop,
  getElementRelativeLeft,
  tryJSONParse,
  geomUtil,
  pointerCursor,
  viewClick,
  measureTextWidth,
  formatFileSize,
  getFileIcon,
  getFileExtension,
  isPreviewAvailable,
  formatInt,
  list2Tree,
  featureTypeUtil
};
