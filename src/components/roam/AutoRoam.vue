<template>
  <div>
    <municipal-panel
      :title="title"
      :draggable="draggable"
      @close="$emit('onClose')"
      :closable="closable"
      :need-expand="expandable"
      :panel-style="panelStyle"
      :panel-class-name="panelClassName"
    >
      <template v-slot:content>
        <a-row class="input-item">
          <a-col :span="24" style="display: flex; justify-content: flex-start">
            <div style="display: flex; justify-content: flex-start">
              <municipal-draw
                :vueKey="vueKey"
                :enable-menu-control="false"
                @load="onDrawLoad"
                @drawcreate="handleDraw"
              >
                <municipal-icon
                  name="-vector-point"
                  style="cursor: pointer"
                  @click="activeDraw"
                ></municipal-icon>
              </municipal-draw>
            </div>
            请在地图上选择漫游的开始位置
          </a-col>
        </a-row>
        <a-row
          class="input-item"
          v-for="(item, index) in autoRoamDataCopy"
          :key="index"
        >
          <a-col :span="8">
            <span class="input-tag">{{ item.title }}</span>
          </a-col>
          <a-col :span="16" v-if="item.uniKey === 'title'">
            <a-input style="width: 100%" v-model="item.value"></a-input>
          </a-col>
          <a-col
            :span="16"
            style="display: flex; justify-content: flex-start"
            v-if="item.uniKey === 'model'"
          >
            <a-select
              style="width: 100%"
              @change="modelChange"
              :default-value="modelList[0].name"
            >
              <a-select-option
                v-for="(jitem, index) in modelList"
                :value="jitem.value"
                :key="index"
              >
                {{ jitem.name }}
              </a-select-option>
            </a-select>
          </a-col>
          <a-col
            :span="16"
            style="display: flex; justify-content: flex-start"
            v-if="item.uniKey === 'view'"
          >
            <a-select
              style="width: 100%"
              @change="viewChange"
              :default-value="viewList[0].name"
            >
              <a-select-option
                v-for="(jitem, index) in viewList"
                :value="jitem.value"
                :key="index"
              >
                {{ jitem.name }}
              </a-select-option>
            </a-select>
          </a-col>
          <a-col
            :span="16"
            v-if="
              ['speed', 'pitch', 'heading', 'distance'].indexOf(item.uniKey) >=
              0
            "
          >
            <a-row style="align-items: center; display: flex; width: 100%">
              <a-col :span="12">
                <a-slider
                  v-model="item.value"
                  :min="-180"
                  :max="180"
                  style="min-width: 100px"
                />
              </a-col>
              <a-col :span="12">
                <a-input-number
                  v-model="item.value"
                  :min="-180"
                  :max="180"
                  style="margin-left: 4px"
                />
              </a-col>
            </a-row>
          </a-col>
        </a-row>
        <a-row class="input-item">
          <a-col :span="24" style="display: flex; justify-content: flex-end">
            <div style="display: flex; justify-content: flex-start">
              <a-button style="margin-right: 10px" @click="startRoam">
                开始漫游
              </a-button>
              <a-button @click="stopRoam" style="margin-right: 10px">
                结束漫游
              </a-button>
            </div>
          </a-col>
        </a-row>
      </template>
    </municipal-panel>
    <municipal-auto-steer :activedButton="flag"></municipal-auto-steer>
  </div>
</template>

<script>
import VueOptions from '@/util/options/vueOptions'
import PanelOpts from "@/util/options/panelOptions";
import loadingM3ds from "@/util/mixins/withLoadingM3ds";
export default {
  name: "municipal-auto-roam",
  inject: ["Cesium", "CesiumZondy", "webGlobe"],
  mixins: [loadingM3ds],
  data() {
    return {
      pathVisible: true,
      isRoaming: false,
      autoRoamDataCopy: [
        {
          title: "漫游模型",
          value: "",
          uniKey: "model",
        },
        {
          title: "漫游视角",
          value: 0,
          uniKey: "view",
        },
        {
          title: "漫游速度",
          value: 30,
          uniKey: "speed",
        },
      ],
      path: [],
      flag: {
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false,
      },
      hpRoll: null,
      position: null,
    };
  },
  props: {
    ...VueOptions,
    ...PanelOpts,
    modelList: {
      type: Array,
      default: () => {
        return [
          {
            name: "消防车",
            value: "",
          },
          {
            name: "小车",
            value: "",
          },
          {
            name: "特警车",
            value: "",
          },
          {
            name: "人",
            value: "",
          },
          {
            name: "无人机",
            value: "",
          },
        ];
      },
    },
    viewList: {
      type: Array,
      default: () => {
        return [
          {
            name: "自由视角",
            value: 1,
          },
          {
            name: "第一视角",
            value: 2,
          },
          {
            name: "上帝视角",
            value: 3,
          },
        ];
      },
    },
  },
  watch: {
    modelList: {
      handler() {
        if (this.modelList?.length && this.autoRoamDataCopy?.length) {
          this.autoRoamDataCopy = this.autoRoamDataCopy.map((item) => {
            if (item.uniKey === "model") {
              item.value = this.modelList[0].value;
            }
            return item;
          });
        }
      },
      immediate: true,
    },
    viewList: {
      handler() {
        if (this.viewList?.length && this.autoRoamDataCopy?.length) {
          this.autoRoamDataCopy = this.autoRoamDataCopy.map((item) => {
            if (item.uniKey === "view") {
              item.value = this.viewList[0].value;
            }
            return item;
          });
        }
      },
      immediate: true,
    },
    autoRoamDataCopy: {
      handler() {
        // if (this.autoRoamDataCopy?.length && this.isRoaming) {
        //   this.startRoam();
        // }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    modelChange(val) {
      this.changeFixedData(val, "model");
    },

    viewChange(val) {
      this.changeFixedData(val, "view");
    },

    changeFixedData(value, uniKey) {
      this.autoRoamDataCopy = this.autoRoamDataCopy.map((data) => {
        if (data.uniKey === uniKey) {
          data.value = value;
          return data;
        }
        return data;
      });
    },

    onDrawLoad(payload) {
      this.drawOper = payload;
    },

    findValue(uniKey) {
      return this.autoRoamDataCopy.find((item) => item.uniKey === uniKey)
        ?.value;
    },

    findName(uniKey) {
      return this.modelList.find(
        (item) => item.value === this.findValue(uniKey)
      )?.name;
    },

    handleDraw(result) {
      // 屏幕坐标转经纬度
      const postion = this.emgManager.Cartesian3ToLat(result);
      const { lng, lat, height } = postion;
      if (result) {
        // 每次点击左右键模型旋转的角度
        this.radian = Cesium.Math.toRadians(1.0);
        this.speedVector = new Cesium.Cartesian3();
        const currentModelUrl = this.findValue("model");
        const model = this.findName("model");
        if (model === "无人机") {
          this.position = Cesium.Cartesian3.fromDegrees(lng, lat, height + 300);
        } else if (model === "小车") {
          this.position = Cesium.Cartesian3.fromDegrees(lng, lat, height + 0.5);
        } else {
          this.position = Cesium.Cartesian3.fromDegrees(lng, lat, height);
        }
        this.hpRoll = new Cesium.HeadingPitchRoll();
        this.hpRoll.heading =
          this.webGlobe.viewer.camera.heading + Cesium.Math.toRadians(-90);

        // 添加模型
        this.mycar = this.webGlobe.viewer.entities.add({
          id: "car",
          position: new Cesium.CallbackProperty(this.getPositin, false),
          // 根据所提供的速度计算点
          orientation: new Cesium.CallbackProperty(this.getOrientation, false),
          model: {
            uri: currentModelUrl,
          },
        });
        this.drawElement && this.drawElement.stopDrawing();
      } else {
        this.emgManager.removeAll();
        this.drawElement && this.drawElement.stopDrawing();
      }
    },

    activeDraw() {
      this.drawOper && this.drawOper.enableDrawPoint();
    },

    //  上下左右 wasd控制车辆移动
    setFlagStatus(key, value) {
      switch (key.keyCode) {
        case 37:
          // 左
          this.flag.moveLeft = value;
          break;
        case 38:
          // 上
          this.flag.moveUp = value;
          break;
        case 39:
          // 右
          this.flag.moveRight = value;
          break;
        case 40:
          this.flag.moveDown = value;
          // 下
          break;
        case 65:
          this.flag.moveLeft = value;
          // 左
          break;
        case 68:
          this.flag.moveRight = value;
          // 右
          break;
        case 83:
          this.flag.moveDown = value;
          // 下
          break;
        case 87:
          this.flag.moveUp = value;
          // 下
          break;
      }
    },

    getPositin() {
      return this.position;
    },

    getOrientation() {
      return Cesium.Transforms.headingPitchRollQuaternion(
        this.position,
        this.hpRoll
      );
    },

    // 视角
    traceHandler() {
      const model = this.findName("model");
      const view = this.findValue("view");
      this.webGlobe.viewer.scene.screenSpaceCameraController.minimumZoomDistance = 0;
      let orientation = this.mycar.orientation.getValue(
        this.webGlobe.viewer.clock.currentTime
      );
      const { lng, lat, height } = this.changeToLat();
      const newCenter = this.emgManager.changeToCartesian3({
        lng,
        lat,
        height,
      });
      let transform = Cesium.Transforms.eastNorthUpToFixedFrame(newCenter);
      transform = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromQuaternion(orientation),
        newCenter
      );
      if (view === 0) {
        // 默认视角
        if (model === "人") {
          this.webGlobe.viewer.camera.lookAtTransform(
            transform,
            new Cesium.Cartesian3(-10, 0, height - 41)
          );
        } else if (model === "无人机") {
          this.webGlobe.viewer.camera.lookAtTransform(
            transform,
            new Cesium.Cartesian3(-60, 0, height - 300)
          );
        } else {
          this.webGlobe.viewer.camera.lookAtTransform(
            transform,
            new Cesium.Cartesian3(-60, 0, height - 30)
          );
        }
      } else if (view === 1) {
        this.webGlobe.viewer.trackedEntity = this.mycar;
      } else if (view === 2) {
        // 第一人称
        if (this.currentModel === "人") {
          // 这里不能用look了，要直接设置camera
          this.webGlobe.viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(lng, lat, height + 2),
            orientation: {
              // 指向  镜头随小车变化角度
              heading: this.hpRoll.heading + Cesium.Math.toRadians(90.0),
              // 视角固定
              pitch: Cesium.Math.toRadians(-15.0),
              roll: 0.0,
            },
          });
        } else {
          this.webGlobe.viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(lng, lat, height + 5),
            orientation: {
              // 指向  镜头随小车变化角度
              heading: this.hpRoll.heading + Cesium.Math.toRadians(90.0),
              // 视角固定
              pitch: Cesium.Math.toRadians(-15.0),
              roll: 0.0,
            },
          });
        }
      } else if (view === 3) {
        if (this.currentModel === "人") {
          // 上帝视角
          this.webGlobe.viewer.camera.lookAtTransform(
            transform,
            new Cesium.Cartesian3(-40, 0, 50)
          );
        } else {
          this.webGlobe.viewer.camera.lookAtTransform(
            transform,
            new Cesium.Cartesian3(-50, 0, 200)
          );
        }
      }
    },

    // 目前clock按照刷新率计算，所以一秒钟调用move 20次
    speedToDistance() {
      // 公里每秒转米每秒
      const speed = this.findValue("speed");
      let secondsPerMeter = speed / 3.6;
      // 20 fps 每一帧移动的距离
      return secondsPerMeter / 10;
    },

    // 为了计算坡度，需要预判下一个点的坐标
    getNextPointHeight(isUP, time) {
      const distance = this.speedToDistance();
      let postion = _.cloneDeep(this.position);
      let speedVector = new Cesium.Cartesian3();
      // 计算速度矩阵x轴方向
      if (isUP > 0) {
        speedVector = Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.UNIT_X,
          distance * 10 * time,
          speedVector
        );
      } else if (isUP < 0) {
        speedVector = Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.UNIT_X,
          -distance * 10 * time,
          speedVector
        );
      } else {
        speedVector = Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.UNIT_X,
          0,
          speedVector
        );
      }
      // 根据速度计算出下一个位置的坐标
      let fixedFrameTransforms =
        Cesium.Transforms.localFrameToFixedFrameGenerator("east", "north");
      let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        postion,
        this.hpRoll,
        Cesium.Ellipsoid.WGS84,
        fixedFrameTransforms
      );
      let position = Cesium.Matrix4.multiplyByPoint(
        modelMatrix,
        speedVector,
        new Cesium.Cartesian3()
      );
      // 拿到下一个点的地形高度
      const { height } = this.setHeight(position);
      return height;
    },

    moveCar(isUP) {
      const speed = this.findValue("speed");
      const clonePosition = _.cloneDeep(this.position);
      const distance = this.speedToDistance();
      let speedVectorX = new Cesium.Cartesian3();
      // 预判车子前面的路况
      let time = 4 / (speed / 3.6);
      const height1 = this.getNextPointHeight(isUP, time);
      const height2 = this.getNextPointHeight(isUP, time + 0.2);
      let heightDis = Math.abs(height2 - height1);

      if (height1 === undefined || height2 === undefined || heightDis >= 3) {
        return;
      }

      // 计算速度矩阵x轴方向
      if (isUP > 0) {
        speedVectorX = Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.UNIT_X,
          distance,
          speedVectorX
        );
      } else if (isUP < 0) {
        speedVectorX = Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.UNIT_X,
          -distance,
          speedVectorX
        );
      } else {
        speedVectorX = Cesium.Cartesian3.multiplyByScalar(
          Cesium.Cartesian3.UNIT_X,
          0,
          speedVectorX
        );
      }
      // 根据速度计算出下一个位置的坐标
      let fixedFrameTransforms =
        Cesium.Transforms.localFrameToFixedFrameGenerator("east", "north");
      let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
        clonePosition,
        this.hpRoll,
        Cesium.Ellipsoid.WGS84,
        fixedFrameTransforms
      );
      let position = Cesium.Matrix4.multiplyByPoint(
        modelMatrix,
        speedVectorX,
        new Cesium.Cartesian3()
      );

      if (isUP !== 0) {
        const { lng, lat } = this.changeToLat(position);
        let newHeight = height1;
        let newPosition;
        if (this.currentModel === "小车") {
          newPosition = { lng, lat, height: newHeight + 0.5 };
        } else {
          newPosition = { lng, lat, height: newHeight };
        }

        if (this.currentModel !== "无人机") {
          position = this.emgManager.changeToCartesian3(newPosition);
          this.calPitch(isUP, height1, height2);
        }
      }

      this.position = position;
      this.traceHandler();
    },

    // 调整模型角度
    calPitch(isUP, height1, height2) {
      const speed = this.findValue("speed");
      let heightDis = Math.abs(height2 - height1);
      let x = heightDis / (speed / (3.6 * 5));
      x >= 1 ? (x = 1) : (x = x);
      let angle = (Math.asin(x) * 180) / Math.PI;
      // 平滑处理，太小的角度就不变
      if (angle < 30 || angle >= 80) {
        angle = 0;
      }
      if (height2 - height1 >= 0) {
        if (isUP > 0) {
          this.hpRoll.pitch = Cesium.Math.toRadians(angle);
        } else {
          this.hpRoll.pitch = -Cesium.Math.toRadians(angle);
        }
      } else {
        // 下坡
        if (isUP > 0) {
          this.hpRoll.pitch = -Cesium.Math.toRadians(angle);
        } else {
          this.hpRoll.pitch = Cesium.Math.toRadians(angle);
        }
      }
    },

    // 取地形高程 会将模型高度也算进去
    setHeight(position) {
      const { lng, lat, height } = this.changeToLat(position);
      let carto = new Cesium.Cartographic.fromDegrees(lng, lat); //输入经纬度
      let h2 = this.webGlobe.viewer.scene.sampleHeight(carto);
      return { lng, lat, height: h2 };
    },

    // 笛卡尔3转经纬度
    changeToLat(position) {
      let center =
        position ||
        this.mycar.position.getValue(this.webGlobe.viewer.clock.currentTime);
      let cartesian3 = new Cesium.Cartesian3(center.x, center.y, center.z);
      let cartographic =
        this.webGlobe.viewer.scene.globe.ellipsoid.cartesianToCartographic(
          cartesian3
        );
      let lng = Cesium.Math.toDegrees(cartographic.longitude);
      let lat = Cesium.Math.toDegrees(cartographic.latitude);
      let height = cartographic.height;
      return { lng, lat, height };
    },

    removePlanes() {
      this.mouseEventManager &&
        this.mouseEventManager.unRegisterMouseEvent("LEFT_CLICK");
      this.mouseEventManager &&
        this.mouseEventManager.unRegisterMouseEvent("MOUSE_MOVE");
      this.mouseEventManager &&
        this.mouseEventManager.unRegisterMouseEvent("RIGHT_CLICK");
      this.stopRoam();
    },

    keyDonwCallback(e) {
      this.setFlagStatus(e, true);
    },

    keyUpCallback(e) {
      this.setFlagStatus(e, false);
    },

    startRoam() {
      let self = this;
      if (this.mycar) {
        // 根据键盘按键返回标志
        document.addEventListener("keydown", this.keyDonwCallback);
        document.addEventListener("keyup", this.keyUpCallback);
        this.moveCount = 0;
        this.webGlobe.viewer.clock.shouldAnimate = true;
        let countTime, moveTime;
        this.webGlobe.viewer.clock.onTick.addEventListener((clock) => {
          countTime = clock.currentTime.secondsOfDay;
          if (this.flag.moveUp) {
            self.moveCount += 1;
            if (this.flag.moveLeft) {
              self.hpRoll.heading -= this.radian;
              self.count += 1;
            }
            if (this.flag.moveRight) {
              self.hpRoll.heading += this.radian;
              self.count -= 1;
            }
            this.moveCar(1, clock.currentTime.secondsOfDay);
            moveTime = clock.currentTime.secondsOfDay;
          } else if (this.flag.moveDown) {
            self.moveCount -= 1;
            if (this.flag.moveLeft) {
              self.hpRoll.heading -= this.radian;
              self.count += 1;
            }
            if (this.flag.moveRight) {
              self.hpRoll.heading += this.radian;
              self.count -= 1;
            }
            this.moveCar(-1, clock.currentTime.secondsOfDay);
            moveTime = clock.currentTime.secondsOfDay;
          } else {
            if (this.flag.moveLeft) {
              self.hpRoll.heading -= this.radian;
              self.count += 1;
              this.moveCar(0);
            }
            if (this.flag.moveRight) {
              self.hpRoll.heading += this.radian;
              self.count -= 1;
              this.moveCar(0);
            }
          }
          if (Math.abs(countTime - moveTime) >= 0.3) {
            if (this.timer) {
              this.timer = null;
              window.clearTimeout(this.timer);
            }
          }
        });
        this.traceHandler();
      } else {
        this.$message.warn("请选择开始漫游的位置！");
      }
    },

    stopRoam() {
      this.webGlobe.viewer.entities.remove(this.mycar);
      this.mycar = null;
      // 去除相机视角锁定
      this.webGlobe.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      document.removeEventListener("keydown", this.keyDonwCallback);
      document.removeEventListener("keyup", this.keyUpCallback);
      this.webGlobe.viewer.clock.onTick.removeEventListener();
      this.webGlobe.viewer.clock.shouldAnimate = false;
      if (window?.commonConfig.globalConfig?.minimumZoomDistance) {
        this.webGlobe.viewer.scene.screenSpaceCameraController.minimumZoomDistance =
          window?.commonConfig.globalConfig?.minimumZoomDistance || 0; //相机的高度的最小值
      }
      this.timer = null;
      window.clearTimeout(this.timer);
    },
  },
};
</script>

<style scoped lang="scss">
.input-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
  min-height: 40px;

  .input-tag {
    display: flex;
    justify-content: flex-start;
  }
}

.tools {
  display: flex;
  align-items: center;
}

.icons {
  display: flex;
  justify-content: flex-start;
}

.activeTexture {
  background-color: #fff;
  border-radius: 50%;
  border: 1px solid blue;
}

.textrue {
  padding: 2px;
}

.sliderWrapper {
  display: flex;
}
</style>
