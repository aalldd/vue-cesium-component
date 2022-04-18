module.exports = {
  title: 'Municipal-Cesium-Components',
  description: '一个基于webclient-vue-cesium库二次封装的组件库',
  dest: "dist-docs",
  base: '/vue-cesium-components/',
  locales: {
    "/": {
      lang: "zh-CN",
      title: "中地数码",
      description: "Municipal-Cesium-Components"
    }
  },
  themeConfig: {
    displayAllHeaders: true,
    locales: {
      "/": {
        // 多语言下拉菜单的标题
        selectText: "选择语言",
        // 该语言在下拉菜单中的标签
        label: "简体中文",
        // 编辑链接文字
        editLinkText: "在 GitHub 上编辑此页",
        // Service Worker 的配置
        serviceWorker: {
          updatePopup: {
            message: "发现新内容可用.",
            buttonText: "刷新"
          }
        },
        // 当前 locale 的 algolia docsearch 选项
        algolia: {},
        nav: [
          {
            text: "开始",
            link: "/get-started/"
          },
          {
            text: "组件",
            link: "/components/"
          },
          {
            text: "WebClient",
            link: "http://develop.smaryun.com"
          },
          { text: "开源", link: "https://github.com/MapGIS/WebClient-Vue" }
        ],

      }
    },
    sidebar: [
      {
        title: "指南",
        collapsable: false,
        children: [
          ["/get-started/", "快速上手"],
          ["/get-started/introduction.md", "产品介绍"],
          ["/get-started/basemap.md", "基础地图"]
        ]
      },
      {
        title: "组件",
        collapsable: false,
        children: [
          {
            title: "基本工具",
            collapsable: true,
            sidebarDepth: 0,
            children:[
              "/components/common/cursorTip.md",
              "/components/common/panel.md",
              "/components/common/result.md",
              "/components/common/layer.md",
              "/components/common/planManager.md"
            ]
          },

          {
            title: "场景",
            collapsable: true,
            sidebarDepth: 0,
            children:[
              "/components/",
              "/components/layer/m3d.md",
              "/components/layer/commonLayer.md"
            ]
          },

          {
            title: "地图工具",
            collapsable: true,
            sidebarDepth: 0,
            children:[
              "/components/tools/tool.md",
              "/components/tools/measure.md",
              "/components/tools/draw.md",
              "/components/tools/fullScreen.md",
              "/components/tools/tianmap.md",
              "/components/tools/home.md",
              "/components/tools/clickQuery.md"
            ]
          },

          {
            title: "空间分析",
            collapsable: true,
            sidebarDepth: 0,
            children:[
              "/components/analysis/flood.md",
              "/components/analysis/dynacut.md",
              "/components/analysis/tunnel.md",
              "/components/analysis/flow.md",
              "/components/analysis/squib.md"
            ]
          },

          {
            title: "漫游",
            collapsable: true,
            sidebarDepth: 0,
            children:[
              "/components/roam/fixroam.md"
            ]
          }
        ]
      }
    ]
  },
  serviceWorker: true,
  head: [
    [
      "script",
      {
        src:
          "https://cdn.jsdelivr.net/npm/react@16.6.3/umd/react.production.min.js"
      }
    ],
    [
      "script",
      {
        src:
          "https://cdn.jsdelivr.net/npm/react-dom@16.6.3/umd/react-dom.production.min.js"
      }
    ],
    ["script", { src: "https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js" }],
    [
      "script",
      { src: "https://cdn.jsdelivr.net/npm/@babel/standalone/babel.min.js" }
    ],
    [
      "script",
      { src: "https://cdn.jsdelivr.net/npm/numerify/lib/index.umd.min.js" }
    ],
    [
      "link",
      {
        href:
          "http://develop.smaryun.com/static/libs/cdn/zondyclient/npm/webclient-vue-cesium.css",
        rel: "stylesheet",
        type: "text/css"
      }
    ],
    [
      "script",
      {
        src:
          "http://develop.smaryun.com/static/libs/cdn/zondyclient/npm/webclient-vue-cesium.umd.js"
      }
    ]
  ],
  plugins: [
    [
      "demo-block",
      {
        settings: {
          jsLibs: [],
          cssLibs: [],
          jsfiddle: true, // 是否显示 jsfiddle 链接
          codepen: true, // 是否显示 codepen 链接
          horizontal: false // 是否展示为横向样式
        }
      }
    ]
  ]
};
