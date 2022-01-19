import * as MapComponents from './components'


const MyComponents = {
  install: function (Vue) {
    for(let name in MapComponents){
      const com=MapComponents[name]
      Vue.component(com.options ? com.options.name : com.name, com)
    }
  }
};

export default MyComponents;

export * from './components'


