<template>
  <div class="page_box">
    <div class="cont_box">
      <simModeling v-if="store.menuName === 'simModeling'" />
      <simAnalysis v-if="store.menuName === 'simAnalysis'" />
      <threeDSim   v-if="store.menuName === '3DSim'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import simModeling from "@/components/etching/simModeling.vue";
import simAnalysis from "@/components/etching/simAnalysis.vue";
import threeDSim from "@/components/etching/threeDSim.vue";
import { Etch } from '@/stores/etch';

const route = useRoute();
const store = Etch()

onMounted(() => {
});

</script>
<style scoped>
.page_box {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.cont_box {
  flex: 1;
  overflow-y: auto;
}
.header_view {
  height: 2.57rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0f2f5;
  user-select: none;
}
.header_view > div:nth-child(2) {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-bottom: 0.07rem solid #d5dbe0;
}
.header_left {
  display: flex;
  align-items: center;
}
.header_left > div {
  width: 5.85rem;
  height: 2.57rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #1a1a1a;
  border-top: 0.14rem solid #f0f2f5;
  border-bottom: 0.14rem solid #d5dbe0;
  border-right: 0.14rem solid #d5dbe0;
  cursor: pointer;
}
.header_left_ac {
  color: #2484fa !important;
  background: #fff;
  border-top: 0.14rem solid #2484fa !important;
  border-bottom: 0.14rem solid #fff !important;
}
.header_view > div:nth-child(2) > div {
  margin-right: 1.42rem;
  width: 1.14rem;
  height: 1.14rem;
  cursor: pointer;
}
</style>