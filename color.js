const {generateTheme} = require('antd-theme-generator');
const path = require('path');
const options = {
  stylesDir: path.join(__dirname, './src/styles/theme'),   //主题文件所在文件夹
  antDir: path.join(__dirname, './node_modules/ant-design-vue'),  //antd包位置
  varFile: path.join(__dirname, './src/styles/theme/variables.less'), // 自定义默认的主题色
  themeVariables: ['@border-color-base','@layout-body-background',
    '@layout-header-background','@component-background',
    '@text-color','@title-color','@table-header-bg',
    '@ant-selected-color','@table-row-hover-bg',
    '@modal-heading-color','@page-ellipsis-color',
    '@empty-text-color','@date-last-next',
    '@cursor-text-color','@descriptions-title-color',
    '@descriptions-label-bg-color','@alarm-chart-bg-color',
    '@statistic-title-color','@dashboard-box-shadow'
  ], //要改变的主题变量
  indexFileName: 'index.html', // index.html所在位置
  outputFilePath: path.join(__dirname, './public/theme.less'), // 是否只生成一次
};
generateTheme(options).then(less => {
  console.log('Theme generated successfully');
})
  .catch(error => {
    console.log('Error', error);
  });
