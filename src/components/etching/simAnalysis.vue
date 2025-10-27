<template>
  <div class="simAnalysis-container">
    <section class="analysis-left">
      <a-card
        :bordered="false"
        class="analysis-left-card"
        title="Simulators trained here:"
      >
        <template #extra>
          <a-tag style="border-radius: 25px;" color="processing">
            <template #icon>
              <div class="dot"></div>
            </template>
            运行中
          </a-tag>
        </template>

        <div class="simulator-list" v-for="simulator in simulators" :key="simulator.name" @click="example = simulator.id"  :class="[simulator.id === example && 'simulator-list-selected']">
          <div class="simulator-item__header" >
            <div class="">
              <img :src="tj" width="16px" height="16px" ></img>
              {{ simulator.name }}
            </div> 
            <div class="simulator-value">
              {{ simulator.total }}M
              <FormOutlined @click="handleUpdate(simulator)" :style="{fontSize: '15px'}" />
              <DeleteOutlined @click="handleDelete(simulator)" :style="{fontSize: '15px'}" />
            </div>
          </div>
          <div class="simulator-item__body">
            <div class="simulator-metric">
               <div>{{ simulator.total }}M</div>
                <div>{{ simulator.used }}M({{ simulator.progress }}%)</div>
            </div>
            <div>
              <a-progress :percent="simulator.progress" :show-info="false" size="small" />
            </div>
          </div>
        </div>

      </a-card>
    </section>

    <section class="analysis-right">
      <a-row :gutter="[16, 16]" class="overview-row">
        <a-col v-for="item in overviewCards" :key="item.title" :xs="24" :sm="12" :xl="6">
          <div :bordered="false" class="overview-card" @click="menu = item.name" :class="[menu === item.name && 'overview-card_selected']">
            <div class="overview-card__body">
              <div class="overview-card__title">{{ item.title }}</div>
              <div class="overview-card__desc">{{ item.description }}</div>
            </div>
            <div class="overview-card__icon" :style="{ background: item.gradient }">
              <img :src="item.icon" alt="icon" style="width: 100%; height: 100%;" />
            </div>
          </div>
        </a-col>
      </a-row>

      <BaseInfo v-if="menu === 'baseInfo'" />
      <Throughput v-if="menu === 'overview2'" />
      <DeviceUtilization v-if="menu === 'overview3'" />
      <WaitingTime v-if="menu === 'overview4'" />
    </section>
  </div>
</template>

<script setup>
import { h, onMounted, ref, defineEmits } from "vue";
import { FormOutlined, DeleteOutlined } from "@ant-design/icons-vue";
import BaseInfo from "./components/BaseInfo.vue";
import DeviceUtilization from './components/DeviceUtilization.vue';
import Throughput from "./components/Throughput.vue";
import WaitingTime from "./components/WaitingTime.vue";
import tj from "@/assets/images/analysis/1.png";
import jcxx from "@/assets/images/analysis/2.png";
import xnzb from "@/assets/images/analysis/3.png";
import sbzb from "@/assets/images/analysis/4.png";
import jysj from "@/assets/images/analysis/5.png";
import { message } from 'ant-design-vue';
import { getLatestByParameterSetId } from '@/utils/utils';
import { getParameter, delParameterById } from '@/api/etching/parameter';
import { createRuns, getRuns, getRunsById, cancelRunsById } from '@/api/etching/runs';

const emit = defineEmits(['updateParam'])
const menu = ref("baseInfo");
const example = ref(1);
const overviewCards = [
  {
    name: "baseInfo",
    title: "仿真基础信息",
    description: "基础信息",
    icon: jcxx,
    gradient: "linear-gradient(135deg, #e0f3ff 0%, #ffffff 100%)"
  },
  {
    name: "overview2",
    title: "核心性能指标",
    description: "性能趋势、WPH、晶圆处理周期",
    icon: xnzb,
    gradient: "linear-gradient(135deg, #e0f3ff 0%, #ffffff 100%)"
  },
  {
    name: "overview3",
    title: "设备利用率分析",
    description: "等待时间、设备利用率",
    icon: sbzb,
    gradient: "linear-gradient(135deg, #e0f3ff 0%, #ffffff 100%)"
  },
  {
    name: "overview4",
    title: "晶圆等待时间分析",
    description: "等待时间分布、占比、队列变化",
    icon: jysj,
    gradient: "linear-gradient(135deg, #e0f3ff 0%, #ffffff 100%)"
  }
];
const simulators = ref([]);

// ----------------------------------------------- 接口调用 -------------------------------------------------------
const getData = async () => {
  const data = await getParameter();
  const run = await getRuns()
  const items = getLatestByParameterSetId(run.items);
  let arr = [];
  data.forEach(t => {
    const obj = items.find(v => v.parameter_set_id === t.id);
    if(obj) {
      arr.push({ ...obj, name: t.name });
    }
  })
  simulators.value = arr.map(t => {
    return { 
      id: t.id, 
      parameter_set_id: t.parameter_set_id,
      name: t.name, 
      total: t.event_count, 
      used: t.event_count * t.progress, 
      assigned: t.event_count, 
      progress: t.progress * 100  
    } 
  })
}

const handleUpdate = (value) => {
  console.log(value)
  emit('updateParam', value.parameter_set_id)
}

const handleDelete = async (value) => {
  await delParameterById(value.parameter_set_id);
  getData();
  message.success('删除成功！')
}

onMounted(async () => {
  getData()
});


</script>

<style scoped>
.simAnalysis-container {
  display: flex;
  gap: 16px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  background: #f3f5f9;
  min-height: 100%;
}

.analysis-left {
  width: 300px;
  min-width: 280px;
}

.analysis-left-card {
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.08);
  height: 100%;
}

.analysis-left-card :deep(.ant-card-body) {
  padding: 16px;
}

.analysis-left :deep(.ant-card-head) {
  padding-left: 24px;
  padding-right: 0px;
}

.status-tag {
  font-size: 12px;
  padding: 0 6px;
  border-radius: 12px;
}

.simulator-list {
  background-color: rgba(250, 250, 250, 1);
  border-radius: 4px;
  height: 102px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
}

.simulator-list:hover {
  border: solid 1px #0086FF;
  /* background: #E6F1FE; */
}

.simulator-list-selected {
  border: solid 1px #0086FF;
  background: #E6F1FE;
}

.simulator-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px dashed #e8edf7;
}

.simulator-item:last-child {
  border-bottom: none;
}

.simulator-item__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.simulator-item__name {
  font-weight: 600;
  color: #1f2a44;
}

.simulator-value {
  font-size: 13px;
  color: #000000;
  width: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.simulator-item__body {
  display: flex;
  flex-direction: column;
  margin-top: 12px;
}

.simulator-metric {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #4a5775;
}

.simulator-metric strong {
  color: #1677ff;
}

.simulator-progress {
  height: 6px;
}

.analysis-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.overview-card {
  /* border-radius: 14px; */
  min-height: 120px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 6px 16px rgba(31, 42, 68, 0.05);
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.85);
  padding: 8px 16px;
  cursor: pointer;
}

.overview-card_selected {
  border-bottom: solid 3px #0086FF;
}

.overview-card__icon {
  width: 140px;
  height: 82px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.overview-card__title {
  font-weight: 600;
  color: #1f2a44;
  margin-bottom: 12px;
  font-size: 18px;
}

.overview-card__desc {
  color: #6c7a9a;
  font-size: 12px;
  line-height: 1.4;
}

.base-info-card,
.machine-card {
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(31, 42, 68, 0.05);
}

.card-extra {
  font-size: 12px;
  color: #6c7a9a;
}

.base-info-item {
  display: flex;
  gap: 12px;
}

.base-info-item + .base-info-item {
  margin-top: 12px;
}

.base-info-item__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #e0f3ff 0%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.base-info-item__label {
  color: #4a5775;
  font-size: 13px;
}

.base-info-item__value {
  font-weight: 600;
  color: #1f2a44;
  margin: 4px 0;
}

.base-info-item__hint {
  font-size: 12px;
  color: #8c9bb8;
}

.machine-card__item {
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, rgba(255, 255, 255, 0.8) 100%);
  padding: 14px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.machine-card__header {
  font-weight: 600;
  color: #1f2a44;
}

.machine-card__value {
  font-size: 18px;
  color: #1677ff;
}

.machine-card__hint {
  font-size: 12px;
  color: #6c7a9a;
}

.performance-card {
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(31, 42, 68, 0.08);
}

.performance-card__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 992px) {
  .performance-card__content {
    flex-direction: row;
  }
}

.performance-card__visual {
  flex: 1;
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.performance-card__visual-number {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.performance-card__visual-title {
  color: #4a5775;
}

.performance-card__visual-value {
  font-size: 28px;
  font-weight: 700;
  color: #1677ff;
}

.performance-card__visual-hint {
  font-size: 13px;
  color: #6c7a9a;
}

.performance-card__metrics {
  flex: 2;
}

.metric-card {
  border-radius: 12px;
  background: #f8fbff;
  padding: 16px;
  min-height: 130px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: inset 0 0 0 1px rgba(22, 119, 255, 0.06);
}

.metric-card__label {
  font-size: 13px;
  color: #4a5775;
}

.metric-card__value {
  font-size: 20px;
  font-weight: 600;
  color: #1f2a44;
}

.metric-card__sub {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6c7a9a;
}

.metric-card__trend.up {
  color: #16a085;
}

.metric-card__trend.down {
  color: #ff4d4f;
}

.panel-module-list :deep(.ant-list-item) {
  padding: 12px 16px;
}

.panel-module-item span:first-child {
  color: #1f2a44;
}

.panel-module-link {
  color: #1677ff;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #0086FF;
  border-radius: 50%; 
  display: inline-block; 
}

@media (max-width: 1024px) {
  .simAnalysis-container {
    flex-direction: column;
  }

  .analysis-left {
    width: 100%;
  }
}
</style>
