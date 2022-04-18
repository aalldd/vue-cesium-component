module.exports = {
  plugins: {
    'postcss-px-to-viewport': {
      unitToConvert: 'px', //需要转换的单位
      viewportWidth: '1920', //视窗的宽度，对应设计稿的宽度 理想视口宽度为375  （高清屏一个点为两个像素）
      viewportHeight: '1000',//视窗的高度，对应设计搞的高度
      viewportUnit: 'vw',//转换的视窗单位
      minPixelValue: 1,//小于或者等于1px 不转换
      mediaQuery: false,//是否允许媒体查询中转换px
      unitPrecision: 5,//转换后的精度，即小数点
    }
  }
};
