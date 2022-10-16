<script>
import { ref, computed } from "vue";
import Pie from "./components/Pie.vue";
import Scatter from "./components/Scatter.vue";
import LinesMap from "./components/LinesMap.vue";
import HeatMap from "./components/HeatMap.vue";
import FlyChart from "./components/FlyChart.vue";

export default {
  components: { Pie, Scatter, LinesMap, HeatMap, FlyChart },
  data() {
    return {
      type: 'Scatter'
    }
  }
}
</script>

<template>
  <div class="tab">
    <div @click="type = 'Scatter'" :class="{ active: type === 'Scatter' }">
      Scatter
    </div>
    <div @click="type = 'Pie'" :class="{ active: type === 'Pie' }">Pie</div>
    <div @click="type = 'LinesMap'" :class="{ active: type === 'LinesMap' }">
      LinesMap
    </div>
    <div @click="type = 'HeatMap'" :class="{ active: type === 'HeatMap' }">
      HeatMap
    </div>
    <div @click="type = 'FlyChart'" :class="{ active: type === 'FlyChart' }">
      FlyChart
    </div>
  </div>
  <KeepAlive>
    <component :is="type"></component>
  </KeepAlive>
  <!-- <Scatter v-if="type === 1" />
  <Pie v-if="type === 2" />
  <LinesMap v-if="type === 3" />
  <HeatMap v-if="type === 4" />
  <FlyChart v-if="type === 5" /> -->
</template>

<style scoped>
.tab {
  display: flex;
  position: fixed;
  top: 0;
  z-index: 9999;
  cursor: pointer;
}
.tab div {
  border: 1px solid #999;
  padding: 10px;
}
.tab div:hover {
  background: pink;
}
.active {
  background: pink;
}
</style>
