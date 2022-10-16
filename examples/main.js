import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import "../packages";
import * as echarts from "echarts";
import 'echarts/extension/bmap/bmap'
// import 'echarts/map/'

const app = createApp(App);
app.config.globalProperties.$echarts = echarts;
app.mount("#app");
