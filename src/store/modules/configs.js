import systemApi from "../systemApi";
import { treeUtil } from "@/util/helpers/helper";

const api = new systemApi("threeD");

const getGlobalConfig = (mapSolution) => {
  let D3ConfigGlobal = {},
    layerCheckedKeys = [];
  // 获取全局配置,新的全局配置从mapSolution中获取
  if (mapSolution?.configJSON?.config3d?.layers) {
    const config3d = mapSolution.configJSON.config3d;
    D3ConfigGlobal = config3d.globalConfig;
    if (config3d?.viewpoint?.hasOwnProperty("viewParam"))
      D3ConfigGlobal.viewParam = config3d.viewpoint?.viewParam;
    if (D3ConfigGlobal?.layerGroupNamesTree?.children) {
      treeUtil
        .flatten([D3ConfigGlobal.layerGroupNamesTree])
        .map((layerItem) => {
          layerItem.slider = 1;
          if (!layerItem.children) {
            layerItem.isVisible && layerCheckedKeys.push(layerItem.key);
          }
        });
    }
  }
  return D3ConfigGlobal;
};

const state = () => ({
  systemConfig: null,
  globalConfig: null,
  mapSolution: null,
  threeDUrls:null
});


// getters
const getters = {
  baseMap:(state)=>{return state.globalConfig?.baseMap},
  cutLayerIndexList:(state)=>{return state.globalConfig?.cutLayerIndexList},
  gdbp:(state)=>{return state.globalConfig?.gdbp},
  layerGroupNamesTree:(state)=>{return state.globalConfig?.layerGroupNamesTree},
  mapServerName:(state)=>{return state.globalConfig?.mapServerName},
  offset:(state)=>{return state.globalConfig?.offset},
  translateIndexs:(state)=>{return state.globalConfig?.translateIndexs},
  viewParam:(state)=>{return state.globalConfig?.viewParam},
};

// mutations
const mutations = {
  setSystemConfig(state, config) {
    state.systemConfig = config;
  },

  setMapSolution(state, mapSolution) {
    state.mapSolution = mapSolution;
  },

  setGlobalConfig(state, config) {
    state.globalConfig = config;
  },

  setThreeDUrl(state,url){
    state.threeDUrls = url;
  }
};


// actions
const actions = {
  // 获取系统配置
  async getSystemConfig({ commit,dispatch }) {
    const config = await api.getSystemConfig();
    if(config && config.mapConfigID>=0){
      dispatch('getMapSolution',config.mapConfigID)
      commit("setSystemConfig", config);
    }
  },

  async getMapSolution({commit, dispatch}, id) {
    const mapSolution = await api.getMapSolution(id);
    const layers=mapSolution?.configJSON?.config3d?.layers
    const globalConfig = getGlobalConfig(mapSolution);
    if (layers && layers.length) {
      const promises=layers.map((layer) => {
        if (layer.visible) {
            return api.getThreeDUrl(layer.url)
        }
      });
      const threeDUrls=await Promise.all(promises)
      console.log(threeDUrls);
      commit("setThreeDUrl", threeDUrls);
    }

    commit("setMapSolution", mapSolution);
    commit("setGlobalConfig", globalConfig);
  },

  async getThreeDUrl({commit}){

  }
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
