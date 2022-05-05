import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import * as path from "path";
export default defineConfig({
  plugins: [
    createVuePlugin(),
  ],
  server:{
    proxy:{
      '/': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        rewrite: {
          '/': ''
        }
      }
    }
  },
  resolve:{
    alias:[
      {
        find:'@',
        replacement:path.resolve(__dirname,'src')
      }
    ]
  }
})
