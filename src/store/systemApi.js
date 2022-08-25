import Service from "@/service/service";

class systemApi {
  constructor(client) {
    this.client = client;
    this.$serve = Service;
  }

  async getSystemConfig() {
    try {
      const { data } = await this.$serve.City.Plugin("Services").get(
        "systemconfig",
        {
          params: {
            client: this.client,
            _ts: Date.now(),
          },
        }
      );
      return data;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getMapSolution(id) {
    try {
      const { data } = await this.$serve.City.Plugin("Services").get(
        "mapsolution",
        {
          params: {
            id,
          },
        }
      );
      if (data && data.length) {
        data[0].configJSON = JSON.parse(data[0].configJSON);
        return data[0];
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getThreeDMapServices() {
    try {
      const { data: threeDlayers } = await this.$serve.City.Plugin('OMS').get(
        'D_GetThreeDService'
      );
      return threeDlayers;
    } catch (error) {
      return [];
    }
  }

  //兼容127.0.0.1和localhost
  async getThreeDUrl(url) {
    if (!url.includes('http')) {
      if (!this.threeDServices) {
        this.threeDServices = await this.getThreeDMapServices();
      }

      const ser = this.threeDServices.find((t) => t.IGSServerName == url);
      if (ser) {
        url = `http://${ser.IP}:${ser.Port}/igs/rest/g3d/${ser.IGSServerName}`;
      }
    }

    if (['localhost', '127.0.0.1'].some((ip) => url.includes(ip))) {
      if (this.$serve?.City?.baseURL) {
        url =
          this.$serve.City.baseURL.substring(0, this.$serve.City.baseURL.lastIndexOf(':')) +
          url.substring(url.lastIndexOf(':'), url.length);
      }
    }

    return url;
  }
}

export default systemApi;
