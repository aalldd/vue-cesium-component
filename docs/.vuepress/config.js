module.exports = {
  title: 'Municipal-Cesium-Components',
  description: '一个基于webclient-vue-cesium库二次封装的组件库',
  dest: "dist-docs",
  base: '/vue-cesium-component/',
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
            collapsable: false
          },
          ["/components/common/cursorTip.md", "鼠标工具"],
          ["/components/common/panel.md", "基本面板"],
          ["/components/common/result.md", "结果面板"],
          ["/components/common/layer.md", "基本图层树"],

          {
            title: "场景",
            collapsable: false
          },
          ["/components/", "地图场景"],

          {
            title: "地图工具",
            collapsable: false
          },
          ["/components/tools/tool.md", "工具"],
          ["/components/tools/measure.md", "量测"],
          ["/components/tools/draw.md", "绘制"],
          ["/components/tools/fullScreen.md", "全屏"],
          ["/components/tools/tianmap.md", "天地图"],
          ["/components/tools/home.md", "复位"],

          {
            title: "空间分析",
            collapsable: false
          },
          ["/components/analysis/flood.md", "洪水淹没分析"],
          ["/components/analysis/dynacut.md", "开挖分析"],
          ["/components/analysis/tunnel.md", "隧道分析"],
          ["/components/analysis/flow.md", "流向分析"],

          {
            title: "漫游",
            collapsable: false
          },
          ["/components/roam/fixroam.md", "场景漫游"]
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
