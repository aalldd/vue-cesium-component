<template>
  <div class="steering">
    <div
      class="buttonWrapper"
      v-for="(button, index) in buttonRander"
      :key="index"
    >
      <div v-if="button === ''"></div>
      <div style="position: relative" v-if="button != ''">
        <a-button
          :class="`${
            Object.values(activedButton)[
              Object.keys(activedButton).indexOf(button)
            ] === true
              ? 'commonBtn active'
              : 'commonBtn steeringButton'
          }`"
        >
          <a-icon :type="iconMap[button]" />
        </a-button>
        <!-- <div
          :class="`${
            Object.values(activedButton)[
              Object.keys(activedButton).indexOf(button)
            ] === true
              ? 'maskActive'
              : 'mask'
          }`"
        ></div> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "municipal-auto-steer",
  data() {
    return {
      buttonRander: [
        "",
        "moveUp",
        "",
        "moveLeft",
        "",
        "moveRight",
        "",
        "moveDown",
        "",
      ],
      iconMap: {
        moveUp: "caret-up",
        moveLeft: "caret-left",
        moveRight: "caret-right",
        moveDown: "caret-down",
      },
    };
  },
  props: {
    activedButton: {
      type: Object,
    },
  },
  methods: {
    onBtnClick(btn) {
      console.log(btn);
      this.activedButton = btn;
    },
  },
};
</script>

<style scoped lang='scss'>
.steering {
  width: 200px;
  height: 200px;
  position: absolute;
  left: 100px;
  bottom: 60px;
  display: flex;
  align-items: center;
  // background-color: fade(@highlight-color,50%);
  justify-content: center;
  align-items: center;
  box-shadow: 0px 0px 15px #fff;
  border-radius: 50%;
  color: #000;
  border: none !important;
  .buttonWrapper {
    width: 200px;
    height: 200px;
    display: grid;
    border-radius: 50%;
    grid-template-columns: repeat(3, 1fr);
    grid-template-columns: repeat(3, 1fr);
    grid-template-columns: repeat(3, 1fr);
    .commonBtn {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 3;
    }
    .steeringButton {
      background-color: rgba(0, 0, 0, 0);
      border: none;
      overflow: hidden;
    }
    .active {
      background-color: rgba(0, 0, 0, 0);
      border: none;
      overflow: hidden;
      // :global {
      //   .anticon {
      //     svg {
      //       height: 2em;
      //       width: 2em;
      //       color: #007acc;
      //     }
      //   }
      // }
    }
    ::v-deep {
      .anticon {
        svg {
          height: 2em;
          width: 2em;
          color: #fff;
          box-shadow: none;
        }
      }
    }
  }
}
</style>
