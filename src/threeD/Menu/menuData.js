const menuData = [
  {
    menuName: '查询',
    menuRoute: 'query',
    key: '0',
    children: [
      {
        menuName: '快速查询',
        menuRoute: 'quickQuery',
        key: '0-0'
      },
      {
        menuName: '条件查询',
        menuRoute: 'conditionQuery',
        key: '0-1'
      }
    ]
  }, {
    menuName: '统计',
    menuRoute: 'statistic',
    key: '1',
    children: [
      {
        menuName: '管线统计',
        menuRoute: 'pipelineStatistic',
        key: '1-0'
      },
      {
        menuName: '管点统计',
        menuRoute: 'pipePointStatistic',
        key: '1-1'
      }
    ]
  },  {
    menuName: '漫游',
    menuRoute: 'roam',
    key: '2',
    children: [
      {
        menuName: '场景漫游',
        menuRoute: 'fixedRoam',
        key: '2-0'
      },
      {
        menuName: '自主漫游',
        menuRoute: 'autoRoam',
        key: '2-1'
      }
    ]
  }, {
    menuName: '分析',
    menuRoute: 'analysis',
    key: '3',
    children: [
      {
        menuName: '淹没分析',
        menuRoute: 'flood',
        key: '3-0'
      },
      {
        menuName: '填挖方分析',
        menuRoute: 'cutfill',
        key: '3-1'
      },
      {
        menuName: '开挖分析',
        menuRoute: 'dynacut',
        key: '3-2'
      },
      {
        menuName: '流向分析',
        menuRoute: 'flow',
        key: '3-3'
      },
      {
        menuName: '卷帘分析',
        menuRoute: 'roll',
        key: '3-4'
      },
      {
        menuName: '爆管分析',
        menuRoute: 'squib',
        key: '3-5'
      },
      {
        menuName: '隧道分析',
        menuRoute: 'tunnel',
        key: '3-6'
      },
      {
        menuName: '覆土埋深分析',
        menuRoute: 'overburden',
        key: '3-7'
      },
      {
        menuName: '断面分析',
        menuRoute: 'horvercut',
        key: '3-8'
      },
      {
        menuName: '联通分析',
        menuRoute: 'connection',
        key: '3-9'
      },
      {
        menuName: '电子围栏',
        menuRoute: 'fence',
        key: '3-10'
      },
      {
        menuName: '动态剖切',
        menuRoute: 'section',
        key: '3-11'
      },
      {
        menuName: '碰撞分析',
        menuRoute: 'collision',
        key: '3-12'
      }
    ]
  }
];

export default menuData;
