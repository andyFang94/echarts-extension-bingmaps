import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
const { resolve } = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: "lib",
    lib: {
      entry: resolve(__dirname, "packages/index.js"), //指定组件编译入口文件
      name: "EchartsExtensionBingmaps",
      fileName: "echarts-extension-bingmaps",
    }, //库编译模式配置
    sourcemap: true,
    rollupOptions: {
      external: ["echarts"],
      output: {
        globals: {
          echarts: "echarts",
        },
      },
    },
  },
});
