import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    nowThemeInfo: 'default-theme', //当前主题
    themes: ['default', 'red'] //所有主题
  },
  mutations: {
    SET_THEMEINFO(theme){
      this.state.nowThemeInfo = theme + '-theme';
    }
  },
  actions: {},
  modules: {},
});
