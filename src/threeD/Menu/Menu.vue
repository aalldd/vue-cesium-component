<template>
  <div class="topBanner">
    <a-menu mode="horizontal">
      <a-sub-menu v-for="item in menuData" :key="item.key">
        <span slot="title" class="submenu-title-wrapper">
          <a-icon type="setting"/>{{ item.menuName }}</span>
        <a-menu-item v-for="jItem in item.children" :key="jItem.key">
          <div v-if="jItem.menuRoute.endsWith('page')" style="width: 100%;height: 100%"
               @click="openNewPage(jItem.menuRoute)">{{
              jItem.menuName
            }}
          </div>
          <router-link :to="jItem.menuRoute" v-else>{{ jItem.menuName }}</router-link>
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
  },
  methods: {
    openNewPage(route) {
      let newUrl = this.$router.resolve({
        path: `/${route}`
      });
      window.open(newUrl.href, "_blank");
    }
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
