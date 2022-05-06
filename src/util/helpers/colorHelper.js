import _ from 'lodash'
export const colorRGB2Hex=(color)=>{
  let rgb = color.split(',');
  let r = parseInt(rgb[0].split('(')[1]);
  let g = parseInt(rgb[1]);
  let b = parseInt(rgb[2].split(')')[0]);

  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export const hexToRgba=(hex, opacity)=>{
  let RGBA = "rgba(" + parseInt("0x" + hex.slice(1, 3)) + "," + parseInt("0x" + hex.slice(3, 5)) + "," + parseInt( "0x" + hex.slice(5, 7)) + "," + opacity + ")";
  return {
    red: parseInt("0x" + hex.slice(1, 3)),
    green: parseInt("0x" + hex.slice(3, 5)),
    blue: parseInt("0x" + hex.slice(5, 7)),
    rgba: RGBA
  }
}

export const rgbToRgba=(color,opacity)=>{
  let rgb = color.split(',');
  let r = parseInt(rgb[0].split('(')[1]);
  let g = parseInt(rgb[1]);
  let b = parseInt(rgb[2].split(')')[0]);
  let RGBA = "rgba(" + r + "," + b + "," + a + "," + opacity + ")";
  return {
    red: r,
    green: g,
    blue: b,
    rgba: RGBA
  }
}

export const handleColorType=(color)=> {
  color = color.replace(/rgba\(/, '')
  color = color.replace(/\)/, '')
  let colorArr = color.split(',');
  let colorArr2 = new Array(colorArr.length).fill(0);
  for(let i = 0; i < colorArr.length - 1; i ++) {
    colorArr2[i] = + colorArr[i] / 255
  }
  colorArr2[colorArr.length - 1] = + colorArr[colorArr.length - 1]
  return colorArr2;
}

//任意颜色转cesium类型的颜色
export const handleColor=(color,opacity=1)=>{
  let targetColor
  //hex转rgba
  if(_.startsWith(color,'#')){
    targetColor=hexToRgba(color,opacity).rgba
    //  rgb转rgba
  }else if(_.startsWith(color,'rgb') && !_.startsWith(color,'rgba')){
    targetColor=rgbToRgba(color,opacity)
  }else if(_.startsWith(color,'rgba')){
    targetColor=color
  }
  console.log(targetColor);
  targetColor=handleColorType(targetColor)
  return targetColor
}
