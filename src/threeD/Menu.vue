<template>
  <a-layout id="components-layout-demo-top-side-2">
    <a-layout-header class="header" :theme="theme">
      <div class="logo"/>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200" style="background: #fff" :theme="theme">
        <a-menu
          :theme="theme"
          mode="inline"
          :default-open-keys="openKeys"
          :style="{ height: '100%', borderRight: 0 }"
        >
          <a-sub-menu v-for="item in mockMenus" :key="item.key">
            <span slot="title"><a-icon type="user"/>{{ item.menuName }}</span>
            <a-menu-item v-for="jItem in item.children" :key="jItem.key">
              <router-link :to="jItem.menuRoute">{{ jItem.menuName }}</router-link>
            </a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-content
          :style="{ background: '#fff', margin: 0, minHeight: '280px' }"
        >
          <keep-alive>
            <ThreeD/>
          </keep-alive>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script>
import ThreeD from './ThreeD';

export default {
  components: {
    ThreeD
  },
  data() {
    return {
      mockMenus: [
        {
          menuName: '查询',
          menuRoute: 'query',
          key: '0',
          children: [
            {
              menuName: '点击查询',
              menuRoute: 'clickQuery',
              key: '0-0'
            }, {
              menuName: '快速查询',
              menuRoute: 'quickQuery',
              key: '0-1'
            }
          ]
        }, {
          menuName: '统计',
          menuRoute: 'statistic',
          key: '1'
        }, {
          menuName: '联动',
          menuRoute: 'link',
          key: '2'
        }, {
          menuName: '漫游',
          menuRoute: 'roam',
          key: '3',
          children: [
            {
              menuName: '场景漫游',
              menuRoute: 'fixedRoam',
              key: '3-0'
            },
            {
              menuName: '自主漫游',
              menuRoute: 'autoRoam',
              key: '3-1'
            }
          ]
        }, {
          menuName: '分析',
          menuRoute: 'analysis',
          key: '4',
          children: [
            {
              menuName: '淹没分析',
              menuRoute: 'flood',
              key: '4-0'
            },
            {
              menuName: '开挖分析',
              menuRoute: 'dynacut',
              key: '4-1'
            },
            {
              menuName: '隧道分析',
              menuRoute: 'tunnel',
              key: '4-2'
            },
            {
              menuName: '流向分析',
              menuRoute: 'flow',
              key: '4-3'
            },
            {
              menuName: '爆管分析',
              menuRoute: 'squib',
              key: '4-4'
            }
          ]
        }
      ],
      openKeys: ['0'],
      theme: 'dark',
      collapsed: false
    };
  }
};
</script>

<style lang="scss">
#components-layout-demo-top-side-2 {
  height: 100%;
}

#components-layout-demo-top-side-2 .logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 28px 16px 0;
  float: left;
}
</style>
