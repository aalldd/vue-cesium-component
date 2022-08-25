import Vue from 'vue'
import Vuex from 'vuex'
import configs from "@/store/modules/configs";
import createLogger from "@/util/logger";

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    configs
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
