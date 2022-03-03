<template>
  <div>
    <municipal-panel v-if="state==='init'" :title="title" :draggable="draggable" @close="$emit('onClose')"
                     :closable="closable"
                     :need-expand="expandable" :panel-style="panelStyle" :panel-class-name="panelClassName">
      <template v-slot:content>
        <div class="initContent">
          <a-spin :spinning="loading">
            <div style="display: flex;margin-left: 10px;align-items: center">
              <div class="icons" @click="pickPipe">
                <municipal-icon name="-vector-point" style="cursor: pointer"></municipal-icon>
              </div>
              <span>
            点击地图选取爆管点
            </span>
            </div>
            <hr style="margin-top: 10px;margin-bottom: 10px"/>
            <div style="width: 100%;display: flex;justify-content: flex-end">
              <a-checkbox @change="onToggle" :default-checked="true">
                允许开启已关闭阀门
              </a-checkbox>
            </div>
          </a-spin>
          <municipal-cursor-tip v-if="tipVisible">
            左键选择设备，右键取消
          </municipal-cursor-tip>
        </div>
      </template>
    </municipal-panel>
    <municipal-squibres v-if="state==='res'" :title="title" :draggable="draggable" @close="$emit('onClose')"
                        :closable="closable"
                        :need-expand="expandable"
                        :panel-style="panelStyle"
                        :panel-class-name="panelClassName"
                        :squibResults="squibResults"
                        :SQUIB_ICONS="SQUIB_ICONS"
                        @goBack="goBack"
                        @onCheck="onCheck"
                        @valvesExpand="valvesExpand"
    >

    </municipal-squibres>
    <municipal-result-simple v-if="invalidVisible"
                             title="选择失效关联设备"
                             panelPosition="left"
                             :columns="invalidColunm"
                             :dataSource="invalidDataS"
                             :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange,columnTitle:'是否失效',columnWidth:120 }"
                             :needExport="false">

    </municipal-result-simple>
  </div>
</template>

<script>
import panelOptions from "@/util/options/panelOptions";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";

const SQUIB_RESULT_TYPES = {
  SQUIBPOINT: "civFeatureMetaTypeIncidentPoint", //爆管发生点
  SHOULDCLOSEDSWITCH: "civFeatureMetaTypeSwitch", //需关断设备
  CLOSEDSWITCH: "civFeatureMetaTypeClosedSwitch", //已关断设备
  SHOULDOPENSWITCH: "civFeatureMetaTypeShouldOpenSwitch", //需开启设备
  INVALIDATESWITCH: "civFeatureMetaTypeInvalidateSwitch", //失效关断设备
  ASSISTSWITCH: "civFeatureMetaTypeAssistSwitch", //辅助关断设备
  EFFECTEDUSER: "civFeatureMetaTypeSwieffect", //受影响用户
  EFFECTEDPIPELINE: "civFeatureMetaTypePipeLine", //受影响管段
  EFFECTEDREGION: "civFeatureMetaTypeRegionResult", //受影响区域
  EFFECTEDRECENTER: "civFeatureMetaTypeRescenter", //受影响水源
  RESSTOP: "civFeatureMetaTypeResstop" //资源装卸点
};
const DEFUALT_SELECTED_TYPES = [ //默认显示的类型
  "civFeatureMetaTypeIncidentPoint",
  "civFeatureMetaTypeSwitch",
  "civFeatureMetaTypeSwieffect",
  "civFeatureMetaTypePipeLine",
  "civFeatureMetaTypeRegionResult"
];
const EXLUDE_TYPES = [ //排除在外的类型
  "civFeatureMetaTypeRescenter",
  "civFeatureMetaTypeResstop"
];

export default {
  name: "municipal-squib",
  mixins: [loadingM3ds],
  data() {
    return {
      tipVisible: false,
      //失效设备
      invalidElemIDs: [],
      isOpenFlg: true,
      expbtnFlag: false,
      state: 'init',
      squibResults: [],
      switchLayerItems: [],
      //失效关断设备面板
      invalidVisible: false,
      invalidDataS: [],
      invalidColunm: [
        {
          title: '设备',
          dataIndex: '__equip'
        }
      ],
      selectedRowKeys: []
    };
  },
  props: {
    ...panelOptions,
    title: {
      type: String,
      default: '爆管分析'
    },
    loading: {
      type: Boolean,
      default: false
    },
    //爆管的数据，需要从父组件中传入
    squibData: {
      type: Array
    },
    //最大失效设备数
    maxFeatureCount: {
      type: Number,
      default: 2000
    },
    SQUIB_ICONS: {
      type: Object
    },
    //爆管设备的详细数据,需要外部组件调服务返回
    featureData: {
      type: Array
    },
    heightName: {
      type: Object,
      default: () => {
        return {
          startHeightName: '起点地面高程',
          endHeightName: '终点地面高程'
        };
      }
    },
    //爆管分析粒子特效自定义参数
    FountainParam: {
      type: Object,
      default: () => {
        return {
          startScale: 1,
          endScale: 5,
          gravity: -40,
          emissionRate: 30
        };
      }
    },
    //失效设备数据
    invalidData: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  mounted() {
    this.initEntitiesCache();
  },
  destroyed() {
    this.emgManager.removeAll();
  },
  watch: {
    squibData: {
      handler() {
        if (this.squibData?.length > 0) {
          this.afterAnalysis();
        }
      }
    },
    //如果父组件传进来了设备信息，用设备信息去渲染三维效果
    featureData: {
      handler() {
        if (this.featureData?.length > 0) {
          this.renderThreeD();
        }
      }
    },
    invalidData: {
      handler() {
        if (this.invalidData?.length > 0) {
          this.dealWithInvalidData();
        }
      }
    }
  },
  methods: {
    initEntitiesCache() {
      this.currentPicked = null;
      this.threeDEntites = {};
      //被影响管段的layerid集合
      this.layerIdList = [];
      //被影响管段的oid集合
      this.oidList = [];
      //  被影响管段的端点坐标集合
      this.effectedLinePoints = [];
      //  被影响管段的高程集合
      this.effectedLineHeights = [];
    },
    pickPipe() {
      this.emgManager.removeAll();
      if (!this.mouseEventManager) {
        //构造鼠标事件管理对象
        this.mouseEventManager = new CesiumZondy.Manager.MouseEventManager({
          viewer: this.webGlobe.viewer
        });
      }
      this.tipVisible = true;
      this.mouseEventManager.registerMouseEvent('LEFT_CLICK', (movement) => this.leftClick(movement));
      //注册鼠标右键单击事件
      this.mouseEventManager.registerMouseEvent('RIGHT_CLICK', () => {
        this.mouseEventManager.unRegisterMouseEvent('LEFT_CLICK');
        this.mouseEventManager.unRegisterMouseEvent('RIGHT_CLICK');
        this.tipVisible = false;
      });
    },
    onToggle(e) {
      this.isOpenFlg = e.target.checked;
    },
    goBack() {
      this.state = 'init';
      this.emgManager.removeAll();
      this.initEntitiesCache();
    },
    leftClick(movement) {
      this.mouseEventManager.unRegisterMouseEvent('LEFT_CLICK');
      const pickedFeature = this.webGlobe.scene.pick(movement.position);
      if (!Cesium.defined(pickedFeature)) {
        this.$message.warn('请点击管道！');
        this.emgManager.removeAll();
        this.tipVisible = false;
        return;
      }
      this.currentPicked && this.emgManager.stopHighlight([this.currentPicked.tileset]);
      this.emgManager.binkPipe(null, null, pickedFeature);
      // 获取经纬度
      this.position = this.emgManager.getPosition(movement);
      // 获取模型坐标
      const pos = this.emgManager.getPosition(movement);
      this.loc = this.emgManager.positionTransfer(pos);
      this.queryParam();
      this.currentPicked = pickedFeature;
      this.tipVisible = false;
    },
    queryParam() {
      let squibPoint = {
        x: Number(this.loc[0]) + Number(this.offset[0]),
        y: Number(this.loc[1]) + Number(this.offset[1])
      };
      const params = {
        isexactAcc: true,
        isOpenFlg: true === this.isOpenFlg ? 1 : 0,
        imageDisplay: [1920, 969, 96].join(),
        geometryType: 'Point',
        tolerance: 10,
        invalidateValves: this.invalidElemIDs.join(), // 失效设备
        barrier: '',
        geometry: JSON.stringify(squibPoint),
        mapExtent: JSON.stringify(this.getCurrentView()),
        cacheBust: true,
        mapServerName: this.commonConfig.globalConfig.mapServerName
      };
      this.$emit('query', params);
    },
    getCurrentView() {
      const {position1, position2} = this.emgManager.getCurrentView();

      let pos1 = this.emgManager.positionTransfer(position1);
      let pos2 = this.emgManager.positionTransfer(position2);

      return {
        "xmin": Number(pos1[0]) + Number(this.offset[0]),
        "ymin": Number(pos2[1]) + Number(this.offset[1]),
        "xmax": Number(pos2[0]) + Number(this.offset[0]),
        "ymax": Number(pos1[1]) + Number(this.offset[1])
      };
    },
    afterAnalysis() {
      this.state = 'res';
      this.squibResults = this.toSquibResults(this.squibData);//过滤掉不显示类型后的分析结果
      //扩大关阀设备
      this.switchLayerItems = this.squibResults.map(function (item) {
        if (this.isSwitchEquip(item.type)) {
          return item.layerItems.filter(function (l) {
            return l.objectIds.length > 0;
          });
        } else {
          return [];
        }
      }, this).reduce(function (a, b) {
        return a.concat(b);
      }, []);
      //如果没有扩大关阀设备，
      this.expbtnFlag = this.switchLayerItems.length !== 0;
      //受影响用户
      this.userItems = this.squibResults.map(function (item) {
        if (item.type === SQUIB_RESULT_TYPES.EFFECTEDUSER) {
          return item.layerItems.filter(function (l) {
            return l.objectIds.length > 0;
          });
        } else {
          return [];
        }
      }, this).reduce(function (a, b) {
        return a.concat(b);
      }, []);
      //暂时没有用户数据
      if (this.userItems.length > 0) {
        this.queryRelationships();
      } else {
        this.showResultOnMap();
      }
    },
    //地图显示爆管结果
    showResultOnMap() {
      this.pendingLayerItems = [];
      this.squibResults.forEach(item => {
        if (item.type === SQUIB_RESULT_TYPES.EFFECTEDUSER) {
          item.totalUser = item.layerItems.reduce(function (a, b) {
            return a += (b.totalUser || 0);
          }, 0);
        }
      });
      this.squibResults.forEach(function (item) {
        this.pendingLayerItems = this.pendingLayerItems.concat(item.layerItems);
      }, this);
      this.queryPendingLayerItems();
    },
    //将每个结果中的layerItems整理成请求参数{objectIds，cacheBust：true} queryParams二维数组类型，[[{objectIds，cacheBust：true}]]
    queryPendingLayerItems() {
      const totalFeatures = this.squibResults.reduce((a, b) => a += (b.count || 0), 0);
      if (totalFeatures > this.maxFeatureCount) {
        this.$message.warn('设备总数超过了限制的最大数目，不展示三维效果');
      } else {
        const queryParams = this.squibResults.map(item => {
          const layerItems = item.layerItems;
          let result = [];
          layerItems.forEach(layerItem => {
            const layerId = layerItem.layerId;
            const objectIds = layerItem.objectIds.join();
            result.push({
              mapServerName: this.mapServerName,
              layerId,
              objectIds,
              cacheBust: true,
              type: item.type
            });
          });
          return result;
        });
        this.$emit('queryFeatures', queryParams);
      }
    },
    renderThreeD() {
      this.featureData.forEach(featureInfo => {
        const {data, type} = featureInfo;
        const fieldAliases = data.fieldAliases;
        const features = data.features;
        const layerId = data.layerId;
        features.forEach(feature => {
          const geometry = feature.geometry;
          const oid = feature.attributes.OID;
          let startHeight, endHeight;
          let startHeightName = this.heightName.startHeightName;
          let endHeightName = this.heightName.endHeightName;
          //我们要获取管段的管中心高程，方案：首先根据外面传进来的高程字段匹配，匹配不上，报错，并查找出与传入的字段最相近的字段名，返回
          const mostLike = Object.keys(fieldAliases).map((aliase, index) => {
            const diffStrStart = _.difference(Array.from(aliase), Array.from(startHeightName)).length;
            const diffStrEnd = _.difference(Array.from(aliase), Array.from(endHeightName)).length;
            //找到了匹配的字符，直接给起点高程赋值
            if (aliase === startHeightName) {
              startHeight = feature.attributes[startHeightName];
            }
            if (aliase === endHeightName) {
              endHeight = feature.attributes[endHeightName];
            }
            return {
              diffStrStart, diffStrEnd, aliase
            };
          });
          //如果没有找到,从mostLike数组中找最接近的字段
          if (!startHeightName || !endHeightName) {
            let mostLikelyStartName = mostLike.sort((a, b) => {
              return a.diffStrStart - b.diffStrStart;
            })[0].aliase;
            let mostLikelyEndName = mostLike.sort((a, b) => {
              return a.diffStrEnd - b.diffStrEnd;
            })[0].aliase;
            this.$message.warn(`传入的起点高程和终点高程名称有误,您是否应该填入${mostLikelyStartName}和${mostLikelyEndName}`);
            return;
          }
          let HeightCenter = (Number(startHeight) + Number(endHeight)) / 2 || feature.attributes.地面高程 || (feature.attributes.起点管顶高程 + feature.attributes.终点管顶高程) / 2 || 0;
          switch (type) {
            //爆管点
            case SQUIB_RESULT_TYPES.SQUIBPOINT:
              // 爆管点添加喷泉特效
              this.squibParam = {geometry, HeightCenter};
              this.particular = this.addFountain(geometry, HeightCenter);
              const squibSwitch = this.showSquibPoint(geometry, HeightCenter, type);
              this.threeDEntites[SQUIB_RESULT_TYPES.SQUIBPOINT] = this.threeDEntites[SQUIB_RESULT_TYPES.SQUIBPOINT] || [];
              this.threeDEntites[SQUIB_RESULT_TYPES.SQUIBPOINT].push(squibSwitch);
              this.threeDEntites[SQUIB_RESULT_TYPES.SQUIBPOINT].push(this.particular);
              break;
            // 需关断设备
            case SQUIB_RESULT_TYPES.SHOULDCLOSEDSWITCH:
              //拿到关断设备的实体信息
              const ShouldCloseSwitch = this.showSquibPoint(geometry, HeightCenter, type);
              this.threeDEntites[SQUIB_RESULT_TYPES.SHOULDCLOSEDSWITCH] = this.threeDEntites[SQUIB_RESULT_TYPES.SHOULDCLOSEDSWITCH] || [];
              this.threeDEntites[SQUIB_RESULT_TYPES.SHOULDCLOSEDSWITCH].push(ShouldCloseSwitch);
              break;
            // 受影响管段
            case SQUIB_RESULT_TYPES.EFFECTEDPIPELINE:
              if (geometry.paths) {
                //受影响管段不使用实体类完成效果
                this.showSEffectedPipeLine(layerId, oid, geometry, HeightCenter);
              }
              break;
            // 失效关断设备
            case SQUIB_RESULT_TYPES.INVALIDATESWITCH:
              const invalidSwitch = this.showSquibPoint(geometry, HeightCenter, type);
              this.threeDEntites[SQUIB_RESULT_TYPES.INVALIDATESWITCH] = this.threeDEntites[SQUIB_RESULT_TYPES.INVALIDATESWITCH] || [];
              this.threeDEntites[SQUIB_RESULT_TYPES.INVALIDATESWITCH].push(invalidSwitch);
              break;
          }
        });
      });
      this.$nextTick(() => {
        //渲染受影响区域
        const effectedRegion = this.renderEffectedRegion();
        //渲染受影响管段
        this.highLightPipe();
        //添加受影响区域实体至集合
        this.threeDEntites[SQUIB_RESULT_TYPES.EFFECTEDREGION] = this.threeDEntites[SQUIB_RESULT_TYPES.EFFECTEDREGION] || [];
        this.threeDEntites[SQUIB_RESULT_TYPES.EFFECTEDREGION].push(effectedRegion);
        //添加受影响管段至集合，由于没有实体，给一个标识
        this.threeDEntites[SQUIB_RESULT_TYPES.EFFECTEDPIPELINE] = this.threeDEntites[SQUIB_RESULT_TYPES.EFFECTEDPIPELINE] || 'highlight';
      });
    },
    getLng(geometry) {
      let startPoint;
      let endPoint;
      if (geometry.paths) {
        startPoint = geometry.paths[0][0];
        endPoint = geometry.paths[0][1];
      } else {
        startPoint = [geometry.x, geometry.y];
        endPoint = [geometry.x, geometry.y];
      }
      if (startPoint?.length > 0 && endPoint?.length > 0) {
        // 获取经纬度坐标
        const p = [Number((startPoint[0] + endPoint[0]) / 2) - Number(this.offset[0]), Number((startPoint[1] + endPoint[1]) / 2) - Number(this.offset[1])];
        return this.emgManager.changeToLat(p);
      }
    },
    //展示喷泉粒子效果
    addFountain() {
      const {geometry, HeightCenter} = this.squibParam;
      const {lng, lat} = this.getLng(geometry);
      const params = this.FountainParam;
      return this.emgManager.addParticular(lng, lat, HeightCenter, params, this.SQUIB_ICONS.fountainImg);
    },
    highLightPipe() {
      const layerList = this.m3ds.filter(tile => this.layerIdList.indexOf(tile.layerId) >= 0);
      this.emgManager.binkPipe(layerList, this.oidList);
    },
    findMaxAndMin(arr, type) {
      if (type === 'max') {
        let max = arr[0];
        arr.forEach(item => {
          if (item > max) {
            max = item;
          }
        });
        return max;
      } else if (type === 'min') {
        let min = arr[0];
        arr.forEach(item => {
          if (item < min) {
            min = item;
          }
        });
        return min;
      } else {
        return;
      }
    },
    renderEffectedRegion() {
      // 从管段的坐标集中找出左上角（xmin,ymax）与右下角 (xmax,ymin)
      if (this.effectedLinePoints.length && this.effectedLineHeights.length) {
        let xSet = [], ySet = [];
        this.effectedLinePoints.forEach(point => {
          xSet.push(point[0]);
          ySet.push(point[1]);
        });
        let avgHeight = this.effectedLineHeights.reduce((a, b) => a + b) / this.effectedLineHeights.length;
        let xMax = this.findMaxAndMin(xSet, 'max') + 10;
        let xMin = this.findMaxAndMin(xSet, 'min') - 10;
        let yMax = this.findMaxAndMin(ySet, 'max') + 10;
        let yMin = this.findMaxAndMin(ySet, 'min') - 10;
        // 矩形四个点的模型坐标
        const point1 = [xMin, yMax];
        const point2 = [xMax, yMax];
        const point3 = [xMax, yMin];
        const point4 = [xMin, yMin];
        // 将四个坐标转为经纬度
        const lat1 = this.emgManager.changeToLat(point1);
        const lat2 = this.emgManager.changeToLat(point2);
        const lat3 = this.emgManager.changeToLat(point3);
        const lat4 = this.emgManager.changeToLat(point4);
        // 点数组
        const pointArr = [
          lat1.lng, lat1.lat, avgHeight + 10,
          lat2.lng, lat2.lat, avgHeight + 10,
          lat3.lng, lat3.lat, avgHeight + 10,
          lat4.lng, lat4.lat, avgHeight + 10,
        ];
        const fillColor = new Cesium.Color(66 / 255, 66 / 255, 66 / 255, .3);
        const outLineColor = new Cesium.Color(66 / 255, 66 / 255, 66 / 255, .3);
        return this.emgManager.addPolyon(pointArr, fillColor, outLineColor, 'stereoscopic', avgHeight - 10);
      }
    },
    //展示点的函数
    showSquibPoint(geometry, HeightCenter, type) {
      const position = this.getLng(geometry);
      return this.addIcon(position, this.SQUIB_ICONS[type], 30, 30, HeightCenter);
    },
    // 在指定坐标出添加图标 接收图片位置，图片路径，图片宽高,图片高程
    addIcon(p, url, width, height, centerHeight) {
      const {lng, lat} = p;
      return this.emgManager.addBillboard(
        lng, lat, centerHeight + 1, '图标', url, width, height, {show: true}
      );
    },
    onCheck(data) {
      data.forEach(item => {
        let type = item.type;
        let checked = item.checked;
        const entities = this.threeDEntites[type];
        //对于受影响管段 直接使用高亮方法
        if (type === SQUIB_RESULT_TYPES.EFFECTEDPIPELINE) {
          if (checked) {
            this.highLightPipe();
          } else {
            this.emgManager.stopHighlight();
          }
          //  对于爆管发生点，需要循环entity，并使用其他方法清除
        } else if (type === SQUIB_RESULT_TYPES.SQUIBPOINT) {
          this.emgManager.removeParticular();
          entities?.length && entities.forEach(entity => {
            entity.show = checked;
            //对于粒子特效
            if (entity.emissionRate) {
              if (!checked) {
                entity?.remove();
              } else {
                entity?.remove();
                this.addFountain();
              }
            }
          });
        } else {
          entities?.length && entities.forEach(entity => {
            entity.show = checked;
          });
        }
      });
    },
    showSEffectedPipeLine(layerId, oid, geometry, HeightCenter) {
      this.layerIdList.push(layerId);
      this.oidList.push(oid);
      // 模型坐标
      const startPoint = geometry.paths[0][0];
      const endPoint = geometry.paths[0][1];

      // 将减掉了经纬度的模型坐标放进去
      const startp = [Number(startPoint[0]) - Number(this.offset[0]), Number(startPoint[1]) - Number(this.offset[1])];
      const endp = [Number(endPoint[0]) - Number(this.offset[0]), Number(endPoint[1]) - Number(this.offset[1])];
      this.effectedLinePoints = this.effectedLinePoints.concat([startp, endp]);
      this.effectedLineHeights.push(HeightCenter);
    },
    //查询附属数据关联信息
    queryRelationships() {
      this.$emit('queryRelationships', {
        serverName: this.commonConfig.globalConfig.mapServerName,
        userItem: this.userItem
      });
    },
    //是否为可启闭设备
    isSwitchEquip(type) {
      return type === SQUIB_RESULT_TYPES.SHOULDCLOSEDSWITCH ||
        type === SQUIB_RESULT_TYPES.INVALIDATESWITCH;
    },
    //data create methods
    toSquibResults(data) {
      let results = [];
      data.forEach(function (r) {
        r.resultList == null && (r.resultList = []);
        if (EXLUDE_TYPES.indexOf(r.civFeatureMetaType) === -1) {
          let checked = DEFUALT_SELECTED_TYPES.indexOf(r.civFeatureMetaType) !== -1,
            total = r.resultList.reduce(function (a, b) {
              return a += (!!b.objectIds ? b.objectIds.length : 0);
            }, 0); //总设备数
          if (checked) {
            checked = total <= this.maxFeatureCount && total > 0;
          }
          let layerItems = this.toLayerItems(r, checked),
            result = {
              type: r.civFeatureMetaType,
              typeName: r.civFeatureMetaTypeName,
              layerItems: layerItems,
              icon: this.SQUIB_ICONS[r.civFeatureMetaType],
              count: total,
              checked: checked
            };
          results.push(result);
        }
      }, this);
      //受影响区域与受影响管段关联
      let region = results.filter(function (r) {
          return r.type === SQUIB_RESULT_TYPES.EFFECTEDREGION;
        }, this)[0],
        pipe = results.filter(function (r) {
          return r.type === SQUIB_RESULT_TYPES.EFFECTEDPIPELINE;
        }, this)[0];
      if (region) {
        region.checked = pipe ? pipe.checked : false;
      }
      return results;
    },
    toLayerItems(result, checked) {
      let layerItems = [];
      result.resultList.forEach(function (item) {
        layerItems.push({
          type: result.civFeatureMetaType,
          typeName: result.civFeatureMetaTypeName,
          layerId: item.layerId,
          layerName: item.layerName,
          objectIds: item.objectIds,
          checked: checked
        });
      });
      return layerItems;
    },
    //点击扩大关阀
    valvesExpand() {
      if (this.expbtnFlag) {
        this.queryEquips(this.switchLayerItems);
      } else {
        this.invalidVisible = true;
      }
    },
    //查询失效设备,提供参数
    queryEquips(layerItems) {
      const params = [];
      layerItems.forEach(layerItem => {
        if (layerItem.objectIds.length > 0) {
          const param = {
            returnGeometry: false,
            returnDistinctValues: false,
            objectIds: layerItem.objectIds.join(','),
            spatialRel: "civSpatialRelIntersects",
            cacheBust: true,
            layerId: layerItem.layerId,
            mapServerName: this.mapServerName,
            layerItem
          };
          params.push(param);
        }
      });
      this.$emit('queryInvalid', params);
    },
    //  处理失效设备数据
    dealWithInvalidData() {
      const result = [];
      this.invalidData.forEach(item => {
        const layerItem = item.layerItem;
        const data = item.data;
        data.features.forEach((feature, index) => {
          const checked = this.isInvalidEquip(layerItem.type);
          checked && this.invalidElemIDs.push(feature.attributes.ElemID);
          feature.attributes.newParam = '__checked';
          feature.attributes.__checked = checked;
          feature.attributes.newParam = '__equip';
          feature.attributes.__equip = [layerItem.layerName, feature.attributes.OID].join(" - ");
          feature.attributes.newParam = '__type';
          feature.attributes.__type = layerItem.type;
          feature.attributes.newParam = '__geometry';
          feature.attributes.__geometry = feature.geometry;
          feature.attributes.newParam = '__layerId';
          feature.attributes.__layerId = layerItem.layerId;
          feature.attributes.newParam = 'key';
          feature.attributes.key = index;
          result.push(feature.attributes);
        });
      });
      this.invalidDataS = result;
      result.forEach(item => {
        if (item.__checked) {
          this.selectedRowKeys.push(item.key);
        }
      });
      this.invalidVisible = true;
    },
    //是否为失效设备
    isInvalidEquip(type) {
      return type === SQUIB_RESULT_TYPES.INVALIDATESWITCH;
    },
    //选择失效关断设备
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    }
  }
};
</script>

<style scoped lang="scss">
@import "../var";

.icons {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 26px;
  height: 26px;
  margin-left: 10px;
  margin-right: 30px;
  cursor: pointer;

  &:hover {
    background-color: $active-background;
  }
}
</style>
