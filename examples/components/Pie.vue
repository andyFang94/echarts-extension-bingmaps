<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
const {
  appContext: {
    config: {
      globalProperties: { $echarts },
    },
  },
} = getCurrentInstance();
defineProps({
  msg: String,
});

const data = {
  北京: [10, 20, 30, 40],
  攀枝花: [15, 20, 36, 42],
  开封: [17, 42, 15, 31],
  上海: [46, 50, 59, 80],
  广州: [90, 45, 36, 15],
};
const geoCoords = {
  北京: [116.46, 39.92],
  攀枝花: [101.718637, 26.582347],
  开封: [114.35, 34.79],
  上海: [121.48, 31.22],
  广州: [113.23, 23.16],
};
const pieDimensions = ["A", "B", "C", "D"];
const pieSeries = [];
$echarts.util.each(data, function (values, name) {
  pieSeries.push({
    type: "pie",
    name: name,
    coordinateSystem: "bingmap",
    center: geoCoords[name],
    radius: 20,
    data: $echarts.util.map(values, function (value, idx) {
      return {
        name: pieDimensions[idx],
        value: value,
      };
    }),
    label: {
      show: false,
    },
    emphasis: {
      label: {
        show: true,
      },
      labelLine: {
        show: true,
        lineStyle: {
          color: "#fff",
        },
      },
    },
  });
});

const option = {
  bingmap: {
    viewOption: {
      center: [113.493471, 23.169598],
      zoom: 5,
    },
    // mapOption: {
    //   customMapStyle: midnightMapStyle,
    // },
  },
  tooltip: {
    trigger: "item",
  },
  animation: true,
  series: pieSeries,
};

function loadMapScenario() {
  // initialize chart
  const chart = $echarts.init(document.getElementById("myMap"));
  chart.setOption(option);
}
onMounted(() => {
  loadMapScenario();
  // const map = new Microsoft.Maps.Map(document.getElementById("myMap"), {});
});
</script>

<template>
  <div id="myMap" style="position: relative; width: 100vw; height: 100vh"></div>
</template>

<style scoped></style>
