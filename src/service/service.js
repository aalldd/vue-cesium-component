/************************************************************************************************
 * Copyright ©, 2018-2020, MapGIS
 * @Description: 服务管理
 * @Author: Chenzilong
 * @History: 1、初始版本 2018-08-29 Chenzilong
 * @Usage:
 * import Service from '@/common/core/service';
 * //获取服务插件地址
 * Service.City.URL(); //服务器根目录
 * Service.City.URL("ImageServer"); //3.0服务插件地址
 * Service.City.URL("CityServer_WorkFlow/REST/WorkFlowREST"); //2.0服务插件地址
 *
 * //插件路径请求
 * //3.0插件
 * const ImageServer = Service.City.Plugin("ImageServer"); //构造axios对象
 * ImageServer.get("getmehod", config); //发送get请求
 * ImageServer.post("postmethod", data, config); //发送post请求
 * //2.0插件
 * const WorkFlowREST = Service.City.Plugin("CityServer_WorkFlow/REST/WorkFlowREST"); //构造axios对象
 * WorkFlowREST.get("getmehod", config); //发送get请求
 * WorkFlowREST.post("postmethod", data, config); //发送post请求
 *
 * //自定义路径请求
 * const CityServer = Service.City.Plugin(); //构造axios对象
 * CityServer.get("xxx/xxx/xxxx", config); //发送get请求
 * CityServer.post("xxx/xxx/xxxx", data, config); //发送post请求
 ************************************************************************************************/

import axios from 'axios';
import io from 'socket.io-client';
import parse from 'url-parse';
import { HttpOrHttps } from './regexp';

function isHost(origin) {
  return origin.toLowerCase().indexOf("localhost") >= 0 || origin.indexOf("127.0.0.1") >= 0;
}

function requestInterceptor(config) {
  if (!config.multipart) {
    if (config.method == "post") { //post请求时实现application/x-www-form-urlencoded格式数据传递（FormData)
      let headers = config.headers || {};
      config.headers = { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" ,...headers};
      const isFormData = config.headers['Content-Type'] === 'application/x-www-form-urlencoded; charset=UTF-8'
      if(isFormData){
        config.transformRequest = [transformData];
      }
    }
  }
  return config;
}

function transformData(data) {
  let keyValues = [];
  //post输入数据防止sql注入
  const reg = /\b(select|update|or|delete|insert|trancate|declare|exec|drop|execute)\b/gi;
  Object.keys(data).forEach(k => {
    let value = (data[k] !== undefined) ? data[k] : '';

    //value = (typeof (value) == 'string' && value.constructor === String) ? value.replace(reg, '') : value;

    keyValues.push(`${encodeURIComponent(k)}=${encodeURIComponent(value)}`);
  });
  return keyValues.join("&");
}

function responseInterceptor(response) {
  return response;
}

function errorInterceptor(error) {
  if (axios.isCancel(error)) {
    console.log("Request canceled");
  } else {
    console.log(error);
  }
  return Promise.reject(error);
}

class Server {
  baseURL = "";
  Plugins = {}; //插件axios实例缓存

  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  URL(svcName, suffix = "") {
    if (svcName) {
      const lowerCaseName = svcName.toLowerCase();
      if (lowerCaseName.indexOf("/") < 0) { // 3.0插件地址
        if (lowerCaseName == "services") {
          return `${this.baseURL}/rest/${svcName}.svc/${suffix}`;
        } else {
          return `${this.baseURL}/rest/services/${svcName}.svc/${suffix}`;
        }
      } else { //2.0插件地址
        return `${this.baseURL}/Services/${svcName}.svc/${suffix}`;
      }
    } else {
      return this.baseURL;
    }
  }

  Plugin(svcName, suffix = "") {
    const baseURL = this.URL(svcName, suffix);
    const lowerCaseName = baseURL.toLowerCase();
    let instance = this.Plugins[lowerCaseName];
    if (!instance) {
      instance = axios.create({ baseURL });
      //注册请求拦截器
      instance.interceptors.request.use(requestInterceptor, errorInterceptor);
      //注册响应拦截器
      instance.interceptors.response.use(responseInterceptor, errorInterceptor);
      this.Plugins[lowerCaseName] = instance;
    }
    return instance;
  }

  //自定义Server实例地址
  URL2(suffix = "") {
    if (suffix) {
      return `${this.baseURL}/${suffix}`;
    } else {
      return this.baseURL;
    }
  }

  Plugin2(suffix = "") {
    const key = suffix || "_default_";
    let instance = this.Plugins[key];
    if (!instance) {
      instance = axios.create({ baseURL: this.URL2(suffix) });
      //注册请求拦截器
      instance.interceptors.request.use(requestInterceptor, errorInterceptor);
      //注册响应拦截器
      instance.interceptors.response.use(responseInterceptor, errorInterceptor);
      this.Plugins[key] = instance;
    }
    return instance;
  }
}

class WebSocketServer extends Server {
  URL(suffix = "") {
    return `${this.baseURL}/${suffix}`;
  }

  Plugin(suffix, options) {
    return io(this.URL(suffix), options);
  }
}

class Service {
  City = null; //应用服务器
  GIS = null; //GIS服务器
  File = null; //文件服务器
  Socket = null; //消息服务器

  CancelToken = axios.CancelToken;

  constructor() {
    //注册请求拦截器
    axios.interceptors.request.use(requestInterceptor, errorInterceptor);
    //注册响应拦截器
    axios.interceptors.response.use(responseInterceptor, errorInterceptor);
    const origin = location.origin;
    //默认设置
    axios.defaults.baseURL = origin;
  }

  async init(client) {
    //初始化服务地址
    try {
      const result = await this.initAsync();
      return result;
    } catch (e) {
      if ("open2three" == client) {
        return await this.initOpen2threeConfig();
      }
      return { success: false, servers: [], expiration: 720 };
    }
  }

  initAsync() {
    let svrs = [];
    const origin = location.origin;
    return axios.get("/config/config.json", {
      params: { _ts: Date.now() },
      baseURL: origin
    }).then(({ data: { initialized, dev, servers, ...rest } }) => {
      svrs = servers || [];
      const serverCount = svrs.length;
      //如果只有一个配置/本机访问 取第一个，如果有多个，按origin域名进行匹配（适用于内外网，可只发布一个站点）
      const config = (serverCount == 1 || isHost(origin)) ? svrs[0] : (serverCount > 1 ? svrs.find(d => d.origin.toLowerCase() == origin.toLowerCase()) : null);
      if (config && initialized == 1) {
        this.City = new Server(config.cityServer);
        this.GIS = new Server(config.gisServer);
        this.File = new Server(config.fileServer);
        this.Socket = new WebSocketServer(config.wsServer);
        return Promise.resolve({ success: true, dev, servers: svrs, expiration: 720, ...rest });
      } else {
        return Promise.resolve({ success: false, dev, servers: svrs, expiration: 720, ...rest });
      }
    })
  }
  initOpen2threeConfig() {

    const servers = [{
      "origin": "default",
      "cityServer": location.origin + "/CityInterface",
      "gisServer": location.origin + "/CityInterface",
      "fileServer": location.origin + "/CityInterface",
      "wsServer": ""
    }];

    const config = servers[0];
    this.City = new Server(config.cityServer);
    this.GIS = new Server(config.gisServer);
    this.File = new Server(config.fileServer);
    this.Socket = new WebSocketServer(config.wsServer);


    return Promise.resolve({ success: true, servers: servers, expiration: 720 });
  }

  create() {
    return axios.create.apply(axios, arguments);
  }

  get() {
    return axios.get.apply(axios, arguments);
  }

  post() {
    return axios.post.apply(axios, arguments);
  }

  all() {
    return axios.all.apply(axios, arguments);
  }

  spread() {
    return axios.spread.apply(axios, arguments);
  }

  isCancel() {
    return axios.isCancel.apply(axios, arguments);
  }

  UploadURL(suffix) {
    let url;
    if (HttpOrHttps.test(suffix)) {
      url = suffix;
    } else {
      url = this.File.URL("FileDownload", "upload") + "/" + suffix;
    }
    const urlObject = parse(url, true);
    urlObject.set("query", Object.assign({}, urlObject.query, query));
    return urlObject.href;
  }

  DownloadURL(suffix, query) {
    return this.FileURL('download', suffix, query);
  }

  FileURL(serviceName, suffix, query) {
    let url;
    if (HttpOrHttps.test(suffix)) {
      url = suffix;
    } else {
      url = this.File.URL("FileDownload", serviceName) + "/" + suffix;
    }
    const urlObject = parse(url, true);
    urlObject.set("query", Object.assign({}, urlObject.query, query));
    return urlObject.href;
  }

  async UploadFile(file, path, options, query) {
    try {
      const formData = new FormData();
      formData.append("filedata", file);
      const { data } = await this.File.Plugin("FileDownload").post(`upload/${path}/${file.name}`, formData, { multipart: true, ...options });
      if (data.success) {
        return { path: data.path, url: this.DownloadURL(data.path, query) };
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }

  async UploadFile2(file, path, options, query) {
    try {
      const formData = new FormData();
      formData.append("filedata", file);
      const { data } = await this.File.Plugin("FileDownload").post(`uploadFile/${path}/${file.name}`, formData, { multipart: true, ...options });
      if (data.success) {
        return { path: `${path}/${file.name}` };
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  }

  LayerURL(lyr) {
    const gisServer = this.GIS.URL();
    const cityServer = this.City.URL();
    const someOrigin = /^\//.test(lyr.url);
    const noProtocol = !HttpOrHttps.test(lyr.url);
    const noPlaceHolder = !["{cityorigin}", "{gisorigin}"].some(placeholder => lyr.url.toLowerCase().includes(placeholder));
    if (!someOrigin && noProtocol && noPlaceHolder) { //GIS服务器5.0
      switch (lyr.type) {
        case "vector-tile":
          return `${gisServer}/rest/services/${lyr.url}/VectorTileServer`;
        case "scene":
          return `${gisServer}/rest/services/${lyr.url}/SenceServer`;
        case "feature":
          return `${gisServer}/rest/services/${lyr.url}/FeatureServer`;
        case "elevation":
          return `${gisServer}/rest/services/${lyr.url}/ImageServer`;
        default:
          return `${gisServer}/rest/services/${lyr.url}/MapServer`;
      }
    } else {
      const { origin: gisorigin } = parse(gisServer);
      const { origin: cityorigin } = parse(cityServer);
      return lyr.url.replace(/\{cityorigin\}/i, cityorigin).replace(/\{gisorigin\}/i, gisorigin);
    }
  }

  LayerServiceName(lyr) {
    const noProtocol = !HttpOrHttps.test(lyr.url);
    const noPlaceHolder = !["{cityorigin}", "{gisorigin}"].some(placeholder => lyr.url.toLowerCase().includes(placeholder));
    if (noProtocol && noPlaceHolder) { //GIS服务器5.0
      return lyr.url;
    } else { //4.0
      return lyr.url.split("/").pop();
    }
  }

  LayerServer(lyr) {
    return this.create({ baseURL: this.LayerURL(lyr) })
  }
}

const instance = new Service();
export default instance;
