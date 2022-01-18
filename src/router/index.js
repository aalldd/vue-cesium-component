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
          path: '/flood2',
          name: 'flood2',
          component: ()=>import('../components/analysis/flood2')
        }
      ]
    }
  ]
})
