import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'root',
      component: () => import('../threeD/ThreeD'),
      children: [
        {
          path: '/flood',
          name: 'flood',
          component: () => import('../components/analysis/Flood')
        },
        {
          path: '/dynacut',
          name: 'dynacut',
          component: () => import('../pages/DynacutAna')
        },
        {
          path: '/tunnel',
          name: 'tunnel',
          component: () => import('../pages/TunnelAna')
        },
        {
          path: '/fixedRoam',
          name: 'fixedRoam',
          component: () => import('../pages/FixRoamAna')
        },
        {
          path: '/autoRoam',
          name: 'autoRoam',
          component: () => import('../pages/AutoRoamAna')
        },
        {
          path: '/flow',
          name: 'flow',
          component: () => import('../pages/FlowAna')
        },
        {
          path: '/squib',
          name: 'squib',
          component: () => import('../pages/SquibAna')
        },
        {
          path: '/roll',
          name: 'roll',
          component: () => import('../pages/RollingAna')
        },
        {
          path: '/cutFill',
          name: 'cutFill',
          component: () => import('../pages/CutFillAna')
        },
        {
          path: '/quickQuery',
          name: 'quickQuery',
          component: () => import('../pages/QuickQueryAna')
        },
        {
          path: '/conditionQuery',
          name: 'conditionQuery',
          component: () => import('../pages/ConditionQueryAna')
        },
        {
          path: '/pipeStatistic',
          name: 'pipeStatistic',
          component: () => import('../pages/PipeStatisticAna')
        }
      ]
    }
  ]
});

export default router;
