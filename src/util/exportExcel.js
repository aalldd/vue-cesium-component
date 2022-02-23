/************************************************************************************************
 * Copyright ©, 2018-2020, MapGIS
 * @Description: 分多个sheet页导出excel
 * @Author: Wangshiyang
 * @History: 1、初始版本 2021-10-19 Wangshiyang
 * @Usage:
 * 数据示例 sheetdatas为每一个sheet页的数据 sheetNames为每一个sheet页的名字，要对应起来
 * let sheetdatas = [[{ department: "行政部", count: 2 }, { department: "前端部", count: 2 }],
 *  [{ name: "张三", do: "整理文件" }, { name: "李四", do: "打印" }],
 *  [{ name: "张大人", do: "vue" }, { name: "李大人", do: "react" }]
 * ];
 * let sheetNames=[
 *  "部门统计","行政部","前端部"
 * ]
 * 返回一个a标签，然后自动触发这个a标签的点击事件
 ************************************************************************************************/
const XLSX =require('xlsx')

const exportXLSX = (sheetDatas, sheetNames, fileName) => {
  // 将workbook装化成blob对象
  const workbook2blob = (workbook) => {
    // 生成excel的配置项
    const wopts = {
      // 要生成的文件类型
      bookType: "xlsx",
      // // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
      bookSST: false,
      type: "binary"
    };
    const wbout = XLSX.write(workbook, wopts);
    // 将字符串转ArrayBuffer
    const s2ab = (s) => {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
      return buf;
    };
    const blob = new Blob([s2ab(wbout)], {
      type: "application/octet-stream"
    });
    return blob;
  };

  // 将blob对象创建bloburl，然后用a标签实现弹出下载框
  const openDownloadDialog = (blob, fileName) => {
    if (typeof blob == "object" && blob instanceof Blob) {
      blob = URL.createObjectURL(blob); // 创建blob地址
    }
    const aLink = document.createElement("a");
    aLink.href = blob;
    // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，有时候 file:///模式下不会生效
    aLink.download = fileName || "";
    let event;
    if (window.MouseEvent) event = new MouseEvent("click");
    //   移动端
    else {
      event = document.createEvent("MouseEvents");
      event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
  };
  /* create a new blank workbook */
  const wb = XLSX.utils.book_new();
  sheetDatas.length && sheetNames.length && sheetDatas.forEach((sheetData, index) => {
    const sheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, sheet, sheetNames[index] || 'null');
  });
  const workbookBlob = workbook2blob(wb);

  return openDownloadDialog(workbookBlob, `${fileName}.xlsx`);
};

export default exportXLSX;
