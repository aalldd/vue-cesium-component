<template>
  <municipal-layer :loading="loading"
                   :layerData="layerData"
                   :checkedKeys="checkedKeys"
                   :title="title"
                   :draggable="draggable"
                   @onClose="$emit('onClose')"
                   :closable="closable"
                   :need-expand="expandable"
                   :panel-style="panelStyle"
                   @check="check"
                   :panel-class-name="panelClassName">
    <div style="display: flex;align-items: center;justify-content: flex-end">
      <a-button type="primary" @click="queryData" style="margin-right: 10px">请求数据</a-button>
      <a-button @click="startFlow">开始分析</a-button>
    </div>
  </municipal-layer>
</template>

<script>
import {treeUtil} from "@/util/helpers/helper";
import panelOptions from "@/util/options/panelOptions";
import indexedDBHelper from "@/util/operators/indexDB";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
import _ from "lodash";

//到时候通过这个索引来拿数据
const outFields = '流向,起点地面高程,终点地面高程,管长,管径';
export default {
  name: "municipal-flow",
  mixins: [loadingM3ds],
  data() {
    return {
      checkedKeys: [],
      layerData: [],
      loading: false,
      arrowWidth: 15,
      heightMapRepeat: {
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
      }
    };
  },
  props: {
    ...panelOptions,
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
    }
  },
  watch: {
    flowData: {
      handler() {
        if (this.flowData.length > 0 && this.cacheData) {
          this.cacheDataToDB();
        }
      }
    }
  },
  mounted() {
    this.loading = true;
    const scopedSlots = {title: 'title'};
    const reaskedData = () => {
      if (window.commonConfig && window.m3ds) {
        //从commonConfig里面可以拿到完整的图层树
        const layerGroupNamesTree = [window.commonConfig?.globalConfig?.layerGroupNamesTree] || this.layerData;
        let treeData;
        let treeDataTotal = treeUtil.map(layerGroupNamesTree, (item) => {
          const {title, Id, opacity, ...rest} = item;
          return {
            ...rest,
            title,
            scopedSlots,
            name: title
          };
        });
        const keys = Object.keys(this.layerGroup);
        if (!keys) {
          treeData = treeDataTotal;
        } else {
          //从完整的图层树中筛选出用户传入的图层分组以及分组下的子图层
          treeData = treeUtil.filter(treeDataTotal, (item) => {
            //找到对应的管网 如果用户指定了layerIds,也就是需要具体的一些图层,就从m3ds中找到该图层添加进去
            if (keys.indexOf(item.title) >= 0) {
              const subLayers = this.layerGroup[item.title].subLayers;
              if (subLayers && subLayers.length > 0 && item.children) {
                const target = item.children.filter(jItem => subLayers.indexOf(jItem.title) >= 0);
                item.children = target;
                return item;
              } else {
                return item;
              }
            } else {
              return false;
            }
          });
        }

        const checkedKeys = [];
        const layers = [];
        //默认勾选全部
        treeUtil.forEach(treeData, (item) => {
          checkedKeys.push(item.key);
          item.name && layers.push(item.name);
        });
        this.layerIds = this.m3ds.filter((item, index) => layers.indexOf(item.name) >= 0).map(item => item.layerId);
        this.mapServerName = window.commonConfig?.globalConfig?.mapServerName || "";
        this.layerData = treeData;
        this.checkedKeys = checkedKeys;
        this.flowEntities = [];
        this.loading = false;
        if (this.cacheData) {
          this.indexDbHelper = new indexedDBHelper();
          this.indexDbHelper.OpenDB('flow', 'flowData');
          // 如果没有就会新建一个表
          this.indexDbHelper.CreateTable('flowData', {autoIncrement: false});
        }
        this.$emit('load', this);
        window.clearInterval(this.myInterval);
      }
    };
    this.reAskM3ds(reaskedData);
  },
  methods: {
    reAskM3ds(callback) {
      this.myInterval = window.setInterval(() => {
        setTimeout(callback);
      }, 3000);
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
      const choosedLayer = treeUtil.filter(this.layerData, (item) => checkedKeys.indexOf(item.key) >= 0).map(item => item.name);
      const choosedM3d = this.m3ds.filter((item, index) => choosedLayer.indexOf(item.name) >= 0);
      this.layerIds = choosedM3d.map(item => item.layerId);
      this.mapServerName = window.commonConfig?.globalConfig?.mapServerName || "";
    },
    queryData() {
      const params = {
        layerIds: this.layerIds,
        mapServerName: this.mapServerName
      };
      //点击请求数据,将请求参数传出去，让外面去调用服务
      this.$emit('query', params);
    },
    getWidth() {
      return 300;
    },
    startFlow() {
      //如果需要缓存数据,就从缓存数据中获取流向信息
      let count = 0;
      if (this.cacheData) {
        this.indexDbHelper.ReadAllData('flowData', count, async (data) => {
          if (data === 'dataEmpty') {
            this.$message.warn('请先保存数据至本地');
            return;
          }
          const pointsData = JSON.parse(unescape(data));
          pointsData.forEach((item) => {
            const materialUrl = item.url;
            let options = {
              image: materialUrl,
              color: Cesium.Color.YELLOW,
              duration: 800,
              direction: 1.0,
              repeat: new Cesium.Cartesian2(1.0, 1.0)
            };
            const points = item.points;
            points.length !== 0 && points.forEach((pointInfo, index) => {
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
                name: `line${index}`,
                id: `line${index}`,
                polyline:
                  new Cesium.PolylineGraphics({
                    show: true,
                    positions: Cesium.Cartesian3.fromDegreesArrayHeights(position),
                    width: this.arrowWidth,
                    material: material
                  })
              };
              flowLine.radius = radius;
              flowLine.repeatX = Math.ceil(long / 2);
              flowLine.position = {
                position3: {lng: lng1, lat: lat1, height: startHeight},
                position4: {lng: lng2, lat: lat2, height: endHeight}
              };
              this.flowEntities.push(flowLine);
            });
          });
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
            this.flowEntities.length && this.flowEntities.forEach((item, index) => {
              const {position3, position4} = item.position;
              const {lng: lng1, lat: lat1, height: startHeight} = position3;
              const {lng: lng2, lat: lat2, height: endHeight} = position4;
              const center = {lng: (lng1 + lng2) / 2, lat: (lat1 + lat2) / 2, height: (startHeight + endHeight) / 2};
              const arrowId = this.webGlobe.viewer.entities.getById(`line${index}`);
              // 筛选出管道两端在屏幕范围内的，防止出现屏幕离管道过近导致的管道在屏幕内而端点不在的情况，限制显示距离相机2000m范围内的管道，优化性能
              if (((pointInRange(position3) || pointInRange(position4)) || (nearCamera(center) <= 500)) && (nearCamera(center) <= 2000)) {
                if (!arrowId) {
                  this.webGlobe.viewer.entities.add(item);
                }
              } else {
                arrowId && this.webGlobe.viewer.entities.remove(arrowId);
              }
            });
          }, 3000);
          this.cameraListener();
        });
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
            let currentRepeatX = item?.repeatX;
            let currentRepeatY = item?.polyline?.material?._repeat?.y;
            currentRepeatX = Math.ceil(currentRepeatX * repeatXRate);
            item.polyline.material._repeat = {x: currentRepeatX, y: currentRepeatY};
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
