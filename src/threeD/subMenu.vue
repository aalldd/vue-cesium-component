<template>
  <a-sub-menu :key="menuInfo.key">
        <span slot="menuName">
          <a-icon type="mail" /><span>{{ menuInfo.menuName }}</span>
        </span>
    <template v-for="item in menuInfo.children">
      <a-menu-item v-if="!item.children" :key="item.key">
        <a-icon type="pie-chart" />
        <span>{{ item.menuName }}</span>
      </a-menu-item>
      <sub-menu v-else :key="item.key" :menu-info="item" />
    </template>
  </a-sub-menu>
</template>

<script>
import { Menu } from 'ant-design-vue';
export default {
  name: "subMenu",
  isSubMenu: true,
  props: {
    ...Menu.SubMenu.props,
    // Cannot overlap with properties within Menu.SubMenu.props
    menuInfo: {
      type: Object,
      default: () => ({}),
    },
  }
};
</script>

<style scoped>

</style>
