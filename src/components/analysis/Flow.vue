<template>
  <municipal-layer :customTreeData="customTreeData"
                   :checkedKeys="checkedKeys"
                   :title="title"
                   :layerDataCopy="layerDataCopy"
                   :layerGroup="layerGroup"
                   :draggable="draggable"
                   @onClose="$emit('onClose')"
                   :closable="closable"
                   :need-expand="expandable"
                   :panel-style="panelStyle"
                   @check="check"
                   @load="onLayerLoad"
                   :panel-class-name="panelClassName">
    <div style="display: flex;align-items: center;justify-content: flex-end">
      <a-button type="primary" @click="queryData" style="margin-right: 10px">请求数据</a-button>
      <a-button @click="startFlow" style="margin-right: 10px">开始分析</a-button>
      <a-button @click="cancelFlow">结束分析</a-button>
    </div>
  </municipal-layer>
</template>

<script>
import {treeUtil} from "@/util/helpers/helper";
import panelOptions from "@/util/options/panelOptions";
import indexedDBHelper from "@/util/operators/indexDB";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import _ from "lodash";

export default {
  name: "municipal-flow",
  mixins: [loadingM3ds],
  data() {
    return {
      checkedKeys: [],
      layerDataCopy: [],
      loading: false
    };
  },
  props: {
    ...panelOptions,
    layerData: {
      type: Array
    },
    //需要提供哪些管网需要展示，配置格式 管网分组名称+子管网图层名称+流动的绘制纹理图片,如果不配置，将显示全部图层，如果只配置管网分组名称，将显示该分组下的全部图层
    //如果需要指定的单独的管网图层，每个管网名称下面必须含有subLayers和url字段
    layerGroup: {
      type: Object,
      default: () => {
        return {};
      }
    },
    title: {
      type: String,
      default: '流向分析'
    },
    //用于流向分析的数据数据格式:Array<typeFlow>
    //typeFlow :{
    //  features:Array<attributes,geometry>,
    //  fieldAliases:Array<attrName> features中对应的attributes中的字段顺序,这样我才能精准的拿到流向，管径，管长，终点地面高程，起点地面高程的数据
    //  layerId:Number 该图层在二维服务中的id
    //  layerName:String  该图层的名称
    // }
    flowData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    //是否需要缓存流向数据 因为流向数据非常庞大，建议缓存
    cacheData: {
      type: Boolean,
      default: true
    },
    //是否需要自定义树的数据，如果不需要，就会从commonConfig中自动的获取到全部的树数据，然后根据传入的筛选规则进行筛选
    customTreeData: {
      type: Boolean,
      default: false
    },
    //视角高度与管道上箭头数量，箭头宽度的关系，用于抽晰
    heightMapRepeat: {
      type: Object,
      default: () => {
        return {
          level0: {
            height: 70,
            repeatRate: 1.5,
            arrowWidth: 30
          },
          level1: {
            height: 100,
            repeatRate: 1,
            arrowWidth: 30
          },
          level2: {
            height: 300,
            repeatRate: 0.7,
            arrowWidth: 20
          },
          level3: {
            height: 500,
            repeatRate: 0.5,
            arrowWidth: 15
          },
          level4: {
            height: 800,
            repeatRate: 0.2,
            arrowWidth: 10
          },
          level5: {
            height: 1200,
            repeatRate: 0.1,
            arrowWidth: 5
          }
        };
      }
    }
  },
  watch: {
    flowData: {
      handler() {
        if (this.flowData.length > 0 && this.cacheData) {
          this.cacheDataToDB();
        }
      }
    },
    layerData: {
      handler() {
        //只有当自定义树数据为true且传入了正确的树数据时，允许用户自定义树的数据
        if (this.layerData?.length > 0 && this.customTreeData === true) {
          this.layerDataCopy = this.layerData;
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.arrowWidth = 15;
    this.mapServerName = window.commonConfig?.globalConfig?.mapServerName || "";
    this.arrListener = null;
    this.motivation = null;
    this.flowEntities = [];
    if (this.cacheData) {
      this.indexDbHelper = new indexedDBHelper();
      this.indexDbHelper.OpenDB('flow', 'flowData');
      // 如果没有就会新建一个表
      this.indexDbHelper.CreateTable('flowData', {autoIncrement: false});
    }
  },
  methods: {
    reAskM3ds(callback) {
      this.myInterval = window.setInterval(() => {
        setTimeout(callback);
      }, 3000);
    },
    onLayerLoad(payload) {
      console.log(payload);
      this.layerIds = payload.layerIds;
      this.checkedKeys = payload.checkedKeysCopy;
      this.layerDataCopy = payload.layerDataCopy;
    },
    //将流向数据缓存至indexDB中的方法
    cacheDataToDB() {
      const points = this.createPoints();
      this.indexDbHelper.Clear('flowData');
      const pointsStr = JSON.stringify(points);
      // 将数据加密
      const pointsCode = escape(pointsStr);
      this.indexDbHelper.AddData('flowData', pointsCode);
    },
    createPoints() {
      const result = [];
      this.flowData.forEach(jitem => {
        const layerId = jitem.layerId;
        //得到layerName
        let layerName;
        let url;
        this.m3ds.forEach((item, index) => {
          if (item.layerId === layerId) {
            layerName = item.name;
          }
        });
        for (let key in this.layerGroup) {
          const item = this.layerGroup[key];
          if (item.subLayers.indexOf(layerName) >= 0) {
            url = item.url;
          }
        }
        const attrs = jitem.fields.map(item => item.name); // [流向，起点地面高程，终点地面高程，管长，管径]
        const points = Object.keys(jitem).length !== 0 && jitem.features.map(item => {
          const startp = item.geometry.paths[0][0];
          const endp = item.geometry.paths[0][1];
          const dataS = attrs.map(attr => {
            return Number(item.attributes[attr]);
          });
          return {
            point: [startp[0], startp[1], dataS[1], endp[0], endp[1], dataS[2]],
            direction: dataS[0],
            long: dataS[3],
            radius: dataS[4]
          };
        });
        result.push({
          layerId,
          layerName,
          url,
          points
        });
      });
      return result;
    },
    check(checkedKeys) {
      //通过找与m3ds中匹配的图层名进行筛选
      this.checkedKeys = checkedKeys;
      const choosedLayer = treeUtil.filter(this.layerDataCopy, (item) => checkedKeys.indexOf(item.key) >= 0).map(item => item.name);
      const choosedM3d = this.m3ds.filter((item, index) => choosedLayer.indexOf(item.name) >= 0);
      this.layerIds = choosedM3d.map(item => item.layerId);
      this.mapServerName = window.commonConfig?.globalConfig?.mapServerName || "";
      this.flowEntities.length > 0 && this.flowEntities.forEach(item => {
        const layerName = item.layerName;
        if (choosedLayer.indexOf(layerName) >= 0) {
          item.visible = true;
        } else {
          item.visible = false;
          item.flowLines.forEach((flowLine, index) => {
            const arrowId = this.webGlobe.viewer.entities.getById(`line-${layerName}-${index}`);
            if (arrowId) {
              this.webGlobe.viewer.entities.remove(arrowId);
            }
          });
        }
      });
    },
    queryData() {
      const params = {
        layerIds: this.layerIds,
        mapServerName: this.mapServerName
      };
      //点击请求数据,将请求参数传出去，让外面去调用服务
      this.$emit('query', params);
    },
    cancelFlow() {
      this.emgManager.removeAll();
      this.arrListener && window.clearInterval(this.arrListener);
      this.view.viewer.camera.changed.removeEventListener(this.motivation, this);
    },
    getWidth() {
      return this.arrowWidth;
    },
    createFlowLines(pointData) {
      //pointData {url,points,layerId,layerName} 每个图层对应的流向数据
      const layerName = pointData.layerName;
      const materialUrl = pointData.url;
      let options = {
        image: materialUrl,
        color: Cesium.Color.YELLOW,
        duration: 800,
        direction: 1.0,
        repeat: new Cesium.Cartesian2(1.0, 1.0)
      };
      const points = pointData.points;
      const flowLines = points.map((pointInfo, index) => {
        const point = pointInfo.point;
        const direction = pointInfo.direction;
        const long = Number(pointInfo.long) / 2;
        const radius = pointInfo.radius;
        const startHeight = point[2];
        const endHeight = point[5];
        options.repeat = new Cesium.Cartesian2(Math.ceil(long / 2), 1.0);
        if (direction === 1) {
          options.direction = 1.0;
        } else {
          options.direction = 2.0;
        }
        //解决平台的bug，每个颜色都要不一样，要不然箭头就流不动
        const i = index / 1000000 + 64;
        options.color = new Cesium.Color(245 / 255, 245 / 255, i / 255, 1);
        const offset = window.commonConfig?.globalConfig?.offset;
        let pointStandard = [point[0] - offset[0], point[1] - offset[1], 0,
          (point[3] - offset[0]), (point[4] - offset[1]), 0];
        const {lng: lng1, lat: lat1} = this.emgManager.changeToLat([pointStandard[0], pointStandard[1]]);
        const {lng: lng2, lat: lat2} = this.emgManager.changeToLat([pointStandard[3], pointStandard[4]]);
        let position = [lng1, lat1, startHeight, lng2, lat2, endHeight];
        if (index === 0) {
          this.sceneManager.flyTo(lng1, lat1, 100, 2);
        }
        const material = new Cesium.PolylineTrailLinkMaterialProperty(
          options
        );
        const flowLine = {
          name: `line-${layerName}-${index}`,
          id: `line-${layerName}-${index}`,
          polyline:
            new Cesium.PolylineGraphics({
              show: true,
              positions: Cesium.Cartesian3.fromDegreesArrayHeights(position),
              width: new Cesium.CallbackProperty(this.getWidth, false),
              material: material
            })
        };
        flowLine.radius = radius;
        flowLine.repeatX = Math.ceil(long / 2);
        flowLine.position = {
          position3: {lng: lng1, lat: lat1, height: startHeight},
          position4: {lng: lng2, lat: lat2, height: endHeight}
        };
        return flowLine;
      });
      return flowLines;
    },
    arrowListener() {
      this.arrListener = setInterval(() => {
        const {position1, position2} = this.emgManager.getCurrentView();
        const {lng: lng1, lat: lat1} = position1;
        const {lng: lng2, lat: lat2} = position2;

        const pointInRange = (position) => {
          const {lng, lat} = position;
          if (_.inRange(lng, lng1, lng2) && _.inRange(lat, lat1, lat2)) {
            return true;
          }
        };

        const nearCamera = (position) => {
          const target = this.emgManager.changeToCartesian3(position);
          const cameraPos = this.webGlobe.viewer.camera.position;
          const distance = Cesium.Cartesian3.distance(target, cameraPos);
          return distance;
        };
        this.flowEntities.length && this.flowEntities.forEach((item) => {
          //this.flowEntities 结构[{layerName,layerId,flowLines}]
          const flowLines = item.flowLines;
          item.visible && flowLines.forEach((flowLine, index) => {
            const {position3, position4} = flowLine.position;
            const {lng: lng1, lat: lat1, height: startHeight} = position3;
            const {lng: lng2, lat: lat2, height: endHeight} = position4;
            const center = {lng: (lng1 + lng2) / 2, lat: (lat1 + lat2) / 2, height: (startHeight + endHeight) / 2};
            const arrowId = this.webGlobe.viewer.entities.getById(`line-${item.layerName}-${index}`);
            // 筛选出管道两端在屏幕范围内的，防止出现屏幕离管道过近导致的管道在屏幕内而端点不在的情况，限制显示距离相机2000m范围内的管道，优化性能
            if (((pointInRange(position3) || pointInRange(position4)) || (nearCamera(center) <= 500)) && (nearCamera(center) <= 2000)) {
              if (!arrowId) {
                this.webGlobe.viewer.entities.add(flowLine);
              } else {
                return;
              }
            } else {
              arrowId && this.webGlobe.viewer.entities.remove(arrowId);
            }
          });
        });
      }, 3000);
    },
    startFlow() {
      //如果需要缓存数据,就从缓存数据中获取流向信息
      //通过找与m3ds中匹配的图层名进行筛选
      const choosedLayer = treeUtil.filter(this.layerDataCopy, (item) => this.checkedKeys.indexOf(item.key) >= 0).map(item => item.name);
      this.flowEntities = [];
      let count = 0;
      if (this.cacheData) {
        this.indexDbHelper.ReadAllData('flowData', count, async (data) => {
          if (data === 'dataEmpty') {
            this.$message.warn('请先保存数据至本地');
            return;
          }
          const pointsData = JSON.parse(unescape(data));
          pointsData.forEach(pointData => {
            const {layerName, layerId} = pointData;
            const flowLines = this.createFlowLines(pointData);
            this.flowEntities.push({
              layerId,
              layerName,
              flowLines,
              visible: choosedLayer.indexOf(layerName) >= 0
            });
          });
          this.arrowListener();
          this.cameraListener();
        });
      } else {
        const pointsData = this.createPoints();
        pointsData.forEach(pointData => {
          const {layerName, layerId} = pointData;
          const flowLines = this.createFlowLines(pointData);
          this.flowEntities.push({
            layerId,
            layerName,
            flowLines,
            visible: true
          });
        });
        this.arrowListener();
        this.cameraListener();
      }
    },
    cameraListener() {
      const {viewer} = this.view;

      this.motivation = _.throttle(() => {
        const cameraPos = viewer.camera.position;
        const cameraPitch = Math.abs(viewer.camera.pitch * (180 / Math.PI));
        const cameraSin = Math.sin(Cesium.Math.toRadians(cameraPitch));
        // 角度越小，说明height也会越小，这时候需要对角度进行处理
        const {height} = this.emgManager.Cartesian3ToLat(cameraPos);
        const currentLevel = _.findKey(this.heightMapRepeat, (item) => {
          return height / Math.pow(cameraSin, 1.5) <= item.height;
        });
        if (!currentLevel) {
          viewer.entities.removeAll();
        } else {
          const repeatXRate = this.heightMapRepeat[currentLevel].repeatRate;
          this.arrowWidth = this.heightMapRepeat[currentLevel].arrowWidth;
          this.flowEntities.forEach(item => {
            //this.this.flowEntities 结构[{layerName,layerId,flowLines,visible}]
            item.visible && item.flowLines.forEach(flowLine => {
              let currentRepeatX = flowLine?.repeatX;
              let currentRepeatY = flowLine?.polyline?.material?._repeat?.y;
              currentRepeatX = Math.ceil(currentRepeatX * repeatXRate);
              flowLine.polyline.material._repeat = {x: currentRepeatX, y: currentRepeatY};
            });
          });
        }
      }, 300);
      this.view.viewer.camera.changed.addEventListener(this.motivation, this);
    }
  }
};
</script>

<style scoped>

</style>
