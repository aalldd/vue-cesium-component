/************************************************************************************************
 * Copyright ©, 2018-2020, MapGIS
 * @Description: 常用正则表达式
 * @Author: Chenzilong
 * @History: 1、初始版本 2018-09-12 Chenzilong
 * @Usage:
 ************************************************************************************************/


//手机号码
const PhoneNumber = new RegExp(/^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/);
//http或https地址
const HttpOrHttps = new RegExp(/^http(s)?:\/\//i);
//坐标，分隔符为半角逗号/全角逗号/空格，分隔符前后可以有任意个空格
const Coordinate = new RegExp(/^(-?\d+(\.\d+)?\s*)(,?|，?|\s)(\s*-?\d+(\.\d+)?)$/);
//带图片后缀
const ImageSuffix = new RegExp(/.(gif|jpeg|png|jpg|bmp)$/i);
//文件名非法字符
const IllegalFileNameChars = new RegExp(/[\\\\/:*?\"<>|]/);

export {
  PhoneNumber,
  HttpOrHttps,
  Coordinate,
  ImageSuffix,
  IllegalFileNameChars
}
