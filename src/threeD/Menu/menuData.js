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
        menuName: '填挖方分析',
        menuRoute: 'cutfill',
        key: '4-1'
      },
      {
        menuName: '开挖分析',
        menuRoute: 'dynacut',
        key: '4-2'
      },
      {
        menuName: '流向分析',
        menuRoute: 'flow',
        key: '4-3'
      },
      {
        menuName: '卷帘分析',
        menuRoute: 'roll',
        key: '4-4'
      },
      {
        menuName: '爆管分析',
        menuRoute: 'squib',
        key: '4-5'
      },
      {
        menuName: '隧道分析',
        menuRoute: 'tunnel',
        key: '4-6'
      }
    ]
  }
];

export default menuData;
