const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  productionSourceMap: false,
  lintOnSave: true,
  publicPath: isProd ? '/production-sub-path/' : '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  indexPath: 'index.html',
  filenameHashing: true,
  devServer: {
    proxy: {
      '/': {
        target: 'http://localhost:8035',
        changeOrigin: true,
        pathRewrite: {
          '/': ''
        }
      }
    }
  },
  configureWebpack: (config) => {
    config.module.rules.push({
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/, //排除掉node_modules下的js文件，即不解析这个文件夹下的js文件
      query: {
        //presets: ["env"]
        presets: ["@babel/preset-env"]
      }
    })
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('@', resolve('./src'));
  },
  css: {
    extract: isProd,
    sourceMap: true,
    requireModuleExtension: true,
    loaderOptions: {
      scss: {
        implementation: require('sass')
      }
    }
  }
};
