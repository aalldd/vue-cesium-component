import Vue from 'vue'
import Router from 'vue-router'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'root',
      component: ()=>import('../threeD/Menu'),
      children:[
        {
          path: '/flood',
          name: 'flood',
          component: ()=>import('../components/analysis/flood')
        },
        {
          path: '/clickQuery',
          name: 'clickQuery',
          component: ()=>import('../components/query/clickQuery')
        },
        {
          path: '/dynacut',
          name: 'dynacut',
          component: ()=>import('../components/analysis/Dynacut')
        }
      ]
    }
  ]
})
