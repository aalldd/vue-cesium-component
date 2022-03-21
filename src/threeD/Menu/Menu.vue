<template>
  <div class="topBanner">
    <a-menu mode="horizontal">
      <a-sub-menu v-for="item in menuData" :key="item.key">
        <span slot="title" class="submenu-title-wrapper">
          <a-icon type="setting"/>{{ item.menuName }}</span>
        <a-menu-item v-for="jItem in item.children" :key="jItem.key">
          <router-link :to="jItem.menuRoute">{{ jItem.menuName }}</router-link>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script>
import menuData from "./menuData";

export default {
  name: "Menu",
  data() {
    return {
      current: '',
      menuData
    };
  }
};
</script>

<style scoped lang="less">
.topBanner {
  position: absolute;
  top: 0px;
  width: 100%;
  background-color: #fff;
  padding-left: 10px;
}
</style>
