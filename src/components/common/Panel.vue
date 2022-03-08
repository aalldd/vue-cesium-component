<template>
  <div style="width: 100%;height: 100%;position:absolute;left:0;top: 0;pointer-events:none">
    <vue-draggable-resizable :draggable="draggable" v-if="draggable" :style="{...panelStyle}" :w="width" :h="height"
                             :class="[panelClassName]">
      <div class="panel-container">
        <div class="top-wrapper">
          <div class="title" v-if="title" :style="{display:'flex',alignItems:'center'}">{{ title }}</div>
          <div class="right">
            <div class="extra" :style="{display:'flex',alignItems:'center'}">
              <slot name="extra"></slot>
            </div>
            <div class="expand" v-show="expandable" @click="expanded=!expanded">
              <municipal-icon :name="expandIcon"></municipal-icon>
            </div>
            <div class="close" v-show="closable" @click="onClose">
              <municipal-icon name="close"></municipal-icon>
            </div>
          </div>
        </div>
        <div class="content" v-show="!expanded">
          <slot name="content"></slot>
        </div>
        <slot></slot>
      </div>
    </vue-draggable-resizable>
    <div class="panel-container" v-if="!draggable" :style="{...panelStyle}" :class="[panelClassName]">
      <div class="top-wrapper">
        <div class="title" v-if="title" :style="{display:'flex',alignItems:'center'}">{{ title }}</div>
        <div class="right">
          <div class="extra" :style="{display:'flex',alignItems:'center'}">
            <slot name="extra"></slot>
          </div>
          <div class="expand" v-show="expandable" @click="expanded=!expanded">
            <municipal-icon :name="expandIcon"></municipal-icon>
          </div>
          <div class="close" v-show="closable" @click="onClose">
            <municipal-icon name="close"></municipal-icon>
          </div>
        </div>
      </div>
      <div class="content" v-show="!expanded">
        <slot name="content"></slot>
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import PanelOpts from '@/util/options/panelOptions';

export default {
  name: 'municipal-panel',
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
    ...PanelOpts,
    panelStyle: {
      type: Object,
      default: () => {
        return {
          position: 'absolute'
        };
      }
    }
  },
  methods: {
    onClose() {
      this.$emit('onClose');
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../var";

.panel-container {
  background-color: $panel-background;
  pointer-events: all;
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
      pointer-events: none;
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
        cursor: pointer;
      }

      .close {
        font-size: $font-size-base;
        padding-left: $panel-padding;
        cursor: pointer;
      }
    }
  }

  .content {
    padding: $panel-padding;
  }
}

</style>
