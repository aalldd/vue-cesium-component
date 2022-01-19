<template>
  <div class="wapper">
    <vr v-if="draggable" :style="{height:'100%',...panelStyle}">
      <div class="panel-container" :class="[panelClassName]" :style="panelStyle">
        <div class="top-wrapper">
          <div class="title" v-if="title" :style="{display:'flex',alignItems:'center'}">{{ title }}</div>
          <div class="right">
            <div class="extra" :style="{display:'flex',alignItems:'center'}">
              <slot name="extra"></slot>
            </div>
            <div class="expand" v-show="needExpand" @click="expanded=!expanded">
              <m-icon :name="expandIcon"></m-icon>
            </div>
            <div class="close" v-show="needClose" @click="$emit('onClose')">
              <m-icon name="close"></m-icon>
            </div>
          </div>
        </div>
        <div class="content" v-show="!expanded">
          <slot name="content"></slot>
        </div>
      </div>
    </vr>
    <div v-else class="panel-container" :class="[panelClassName]" :style="panelStyle">
      <div class="top-wrapper">
        <div class="title" v-if="title" :style="{display:'flex',alignItems:'center'}">{{ title }}</div>

        <div class="right">
          <div class="extra" :style="{display:'flex',alignItems:'center'}">
            <slot name="extra"></slot>
          </div>
          <div class="expand" v-show="needExpand" @click="expanded=!expanded">
            <m-icon :name="expandIcon"></m-icon>
          </div>
          <div class="close" v-show="needClose" @click="$emit('onClose')">
            <m-icon name="close"></m-icon>
          </div>
        </div>
      </div>
      <div class="content" v-show="!expanded">
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from './Icon';
import VueDraggableResizable from 'vue-draggable-resizable';

export default {
  name: 'municipal-panel',
  components: {
    'm-icon': Icon,
    'vr': VueDraggableResizable
  },
  data() {
    return {
      expanded: false
    };
  },
  computed: {
    expandIcon() {
      return this.expanded ? 'up' : 'down';
    }
  },
  props: {
    title: {
      type: String,
      default:''
    },
    draggable: {
      type: Boolean,
      default: true
    },
    needExpand: {
      type: Boolean,
      default: true
    },
    needClose: {
      type: Boolean,
      default: true
    },
    panelClassName: {
      type: String
    },
    panelStyle: {
      type: Object,
      default: () => {
        return {
          width: 400
        };
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../var";

.wapper {
  .panel-container {
    background-color: $panel-background;
    pointer-events: all;
    max-height: 100%;
    border-radius: $panel-border-radius;
    display: flex;
    flex-flow: column;
    overflow: hidden;
    @include border();

    .top-wrapper {
      width: 100%;
      overflow: hidden;
      @include flex(nowrap, 'center', 'space-between');
      border-bottom: 1px solid #f0f0f0;
      border-radius: 2px 2px 0 0;
      padding: $panel-padding;

      .title {
        flex: 1;
        font-size: $font-size-base;
        color: $text-color;
        overflow: hidden;
      }

      .right {
        @include flex(nowrap, 'center', 'space-around');
        overflow: hidden;

        .extra {
          margin: 0 $panel-padding;
        }

        .expand {
          border-right: 1px solid #f0f0f0;
          font-size: $font-size-base;
          padding: 0 $panel-padding;
        }

        .close {
          font-size: $font-size-base;
          padding-left: $panel-padding;
        }
      }
    }

    .content {
      padding: $panel-padding;
    }
  }
}

</style>
