//接受一个标准的gis服务返回的数据集Array，当前功能的名称,返回的数据格式一定是包含了tabName，columns，features，exportFileName这四个字段
export const dataFormatter = (data, funcName) => {
  let tabs = [];
  tabs = data.map(item => {
    //tab的名称
    const tabName = item.layerName;
    //表格的列
    let columns = [];
    for (let key in item.fieldAliases) {
      let attr = item.fieldAliases[key];
      columns.push({
        title: attr,
        dataIndex: attr,
        key: attr
      });
    }
    let features = item.features.map((feature, index) => {
      return Object.assign(feature.attributes, {geometry: feature.geometry, layerId: item.layerId, key: index});
    });
    let exportFileName = `${funcName}-${tabName}`;
    return {
      tabName,
      features,
      columns,
      exportFileName
    };
  });
  return tabs;
};
