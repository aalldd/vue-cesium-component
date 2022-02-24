import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

const router=new Router({
  routes: [
    {
      path: '/',
      name: 'root',
      component: ()=>import('../threeD/Menu'),
      children:[
        {
          path: '/flood',
          name: 'flood',
          component: ()=>import('../components/analysis/Flood')
        },
        {
          path: '/clickQuery',
          name: 'clickQuery',
          component: ()=>import('../components/query/clickQuery')
        },
        {
          path: '/dynacut',
          name: 'dynacut',
          component: ()=>import('../pages/DynacutAna')
        },
        {
          path: '/tunnel',
          name: 'tunnel',
          component: ()=>import('../pages/TunnelAna')
        },
        {
          path: '/fixedRoam',
          name: 'fixedRoam',
          component: ()=>import('../pages/FixRoamAna')
        },
        {
          path: '/autoRoam',
          name: 'autoRoam',
          component: ()=>import('../pages/AutoRoamAna')
        }
      ]
    }
  ]
})

export default router
