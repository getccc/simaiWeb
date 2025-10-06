<template>
  <div class="simAnalysis-base">
    <a-row :gutter="[16, 16]">
        <a-col :xs="24" :xl="9">
            <a-card title="基础模型参数" headStyle="border-bottom: 0px solid" class="base-info-card">
                <a-row :gutter="[12, 12]">
                    <a-col v-for="item in baseParameters" :key="item.label" :span="24" class="base-info-item">
                        <div class="base-info-item__icon">
                            <img :src="item.icon" alt="icon" style="width: 46px; height: 46px;" />
                            <div class="base-info-item__label">{{ item.label }}</div>
                        </div>
                        <div class="base-info-item__content">
                            <div class="base-info-item__value">{{ item.value }}</div>
                            <div class="base-info-item__unit">{{ item.unit }}</div>
                        </div>
                    </a-col>
                </a-row>
            </a-card>
        </a-col>

        <a-col :xs="24" :xl="15">
            <a-card title="机台参数" headStyle="border-bottom: 0px solid" class="machine-card">
                <div class="chamber_box">
                    <div class="chamber">
                        <a-col v-for="item in chamber.children" :key="item.name" :xs="2" :lg="7">
                            <div class="chamber__item">
                                <div>
                                    <img :src="item.icon" alt="icon" style="width: 60px; height: 60px; margin-right: 6px;" />
                                </div>
                                <div>
                                    <div>
                                        <span class="chamber__value">{{ item.value }}</span>
                                        <span class="chamber__unit"> {{ item.unit }}</span>
                                    </div>
                                    <div class="chamber__hint">{{ item.hint }}</div>
                                </div>
                            </div>
                        </a-col>
                        <div class="chamber_name">{{ chamber.name }}</div>
                    </div>
                </div>
                <a-row :gutter="[12, 12]" style="align-self: end;">
                    <a-col v-for="item in machineParameters" :key="item.name" :xs="12" :lg="8">
                        <div class="machine-card__item">
                            <div class="machine-card__content">
                                <img :src="item.icon" alt="icon" style="width: 60px; height: 60px; margin-right: 6px;" />
                                <div>
                                    <div class="machine-card__num">
                                        <div class="machine-card__value">{{ item.value }}</div>
                                        <div class="machine-card__unit">{{ item.unit }}</div>
                                    </div>
                                    <div class="machine-card__hint">{{ item.hint }}</div>
                                </div>
                            </div>
                            <div class="machine-card__header">{{ item.name }}</div>
                        </div>
                    </a-col>
                </a-row>
            </a-card>
        </a-col>
    </a-row>

    <a-row :gutter="[16, 16]" class="performance-row">
        <a-col :span="24">
            <a-card title="核心产能指标" headStyle="border-bottom: 0px solid" class="performance-card">
                <div class="performance-card__content">
                    <div class="performance-card__visual">
                        <div class="performance-card__visual-number">
                            <div class="performance-card__visual-value">{{ totalThroughput }}</div>
                            <div class="performance-card__visual-hint">优化后平均值/片</div>
                        </div>
                        <div class="performance-card__visual-number">
                            <div class="performance-card__visual-value">{{ totalBatches }}</div>
                            <div class="performance-card__visual-hint">原逻辑平均值/片</div>
                        </div>
                        <div>
                            <img :src="jyz" alt="icon" style="width: 240px; height: 240px;" />
                            <div class="performance-card__visual-title">总处理晶圆数</div>
                        </div>
                    </div>
                    <div class="performance-card__metrics">
                       <div class="metric-card" v-for="metric in performanceMetrics" :key="metric.label">
                            <div>
                                <img :src="metric.icon" alt="icon" style="width: 48px; height: 48px;" />
                                <div class="metric-card__label">{{ metric.label }}</div>
                            </div>
                            <div>
                                <div class="metric-card__label">{{ metric.optTitle }}</div>
                                <div class="metric-card__value">{{ metric.optimized }}</div>
                                <span class="metric-card__trend" :class="metric.trend > 0 ? 'up' : metric.trend < 0 ? 'down' : ''">
                                    {{ metric.trend > 0 ? `↑ ${metric.trend}%` : metric.trend < 0 ? `↓ ${Math.abs(metric.trend)}%` : '持平' }}
                                </span>
                            </div>
                            <div>
                                <div class="metric-card__label">{{ metric.baseTitle }}</div>
                                <div class="metric-card__value">{{ metric.baseline }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </a-card>
        </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed } from "vue";
import jc from "@/assets/images/analysis/6.png";
import jt from "@/assets/images/analysis/7.png";
import cs from "@/assets/images/analysis/8.png";
import jyz from "@/assets/images/analysis/9.png";
import jys from "@/assets/images/analysis/10.png";
import clsc from "@/assets/images/analysis/11.png";
import ghcs from "@/assets/images/analysis/12.png";
import zdsc from "@/assets/images/analysis/13.png";

const baseParameters = [
  {
    label: "时间单位转换",
    value: "1440",
    unit: "分钟 (24小时)",
    icon: jc
  },
  {
    label: "仿真时长",
    value: "30",
    unit: "天 (43200分钟)",
    icon: jc
  },
  {
    label: "晶圆到达速率",
    value: "1-2",
    unit: "片/分钟",
    icon: jc
  }
];

const chamber = { name: "晶圆盒 (原料端)", children: 
        [
            {value: "4", icon: jt, unit: '个', hint: "数量"},
            {value: "10", icon: jt, unit: '片/盒', hint: "单盒容量"},
            {value: "10", icon: cs, unit: '分钟/次', hint: "更换耗时"},
        ] 
    }

const machineParameters = [
  { name: "寻边器 (1个)", icon: cs, value: "10", unit: '秒/片', hint: "单次寻边耗时" },
  { name: "大气机械臂 (双臂)", icon: cs, value: "0.3-0.5", unit: '分钟', hint: "工位间搬运耗时" },
  { name: "真空过渡腔 (1个)", icon: cs, value: "2", unit: '片', hint: "容量" },
  { name: "真空机械臂 (双臂)", icon: cs, value: "0.3-0.4", unit: '分钟', hint: "工位间搬运耗时" },
  { name: "刻蚀腔 (6个)", icon: cs, value: "8-12", unit: '分钟', hint: "单次刻蚀耗时" },
  { name: "清洗腔 (2个)", icon: cs, value: "3-5", unit: '分钟', hint: "单次清洗耗时" }
];

const performanceMetrics = [
  {
    icon: jys,
    label: "日均处理晶圆数",
    optTitle: '优化后平均值/片',
    optimized: "342.9",
    baseTitle: '原逻辑平均值/片',
    baseline: "299.1",
    trend: 14.6
  },
  {
    icon: clsc,
    label: "晶圆平均总处理时长",
    optTitle: '优化后平均值/分钟',
    optimized: "19.2",
    baseTitle: '原逻辑平均值/分钟',
    baseline: "22.8",
    trend: 14.6
  },
  {
    icon: ghcs,
    label: "晶圆盒更换总次数",
    optTitle: '优化后平均值/次',
    optimized: "1029",
    baseTitle: '原逻辑平均值/次',
    baseline: "898",
    trend: -15.8
  },
  {
    icon: zdsc,
    label: "更换中断时长",
    optTitle: '优化后平均值/小时',
    optimized: "171.5",
    baseTitle: '原逻辑平均值/小时',
    baseline: "149.7",
    trend: 14.6
  }
];

const totalThroughput = computed(() => 10286);
const totalBatches = computed(() => 972);

</script>

<style scoped>
.simAnalysis-base {
  width: 100%;
  box-sizing: border-box;
  background: #f3f5f9;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.simAnalysis-base :deep(.ant-card-body) {
    padding: 0 24px 24px 24px;
}

.base-info-card,
.machine-card {
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(31, 42, 68, 0.05);
}

.machine-card :deep(.ant-card-body) {
  display: flex;
}

.chamber_box {
    width: 200px;
    height: 288px;
    background: linear-gradient(to bottom, #ffffff 0%, #ffffff 50%, #E6F3FF 90%, #D0E7FF 100%);
    padding: 8px;
    margin-right: 16px;
}

.chamber {
    display: flex;
    flex-direction: column;
}

.chamber__item {
    display: flex;
    width: 200px;
    margin-bottom: 16px;
}

.chamber__value {
    font-size: 26px;
    color: #000000;
    margin-right: 6px;
}

.chamber__unit {
    font-weight: 400;
    font-size: 12px;
    color: #999999;
}

.chamber__hint {
    font-weight: 400;
    font-size: 14px;
    color: #666666;
}

.chamber_name {
    font-size: 14px;
    font-weight: 600;
    color: #1f2a44;
    /* background: linear-gradient(to bottom, #E6F3FF 0%, #D0E7FF 100%); */
    padding: 8px;
}

.card-extra {
  font-size: 12px;
  color: #6c7a9a;
}

.base-info-item {
  display: flex;
  gap: 12px;
  border-left: solid 3px #0086FF;
  /* background: #F3F5F8; */
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, rgba(255, 255, 255, 0.8) 100%);
  padding: 8px 0px;
}

.base-info-item + .base-info-item {
  margin-top: 8px;
}

.base-info-item__icon {
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  display: flex;
  flex-direction: column;
  width: 78px;
  height: 66px;
}

.base-info-item__label {
  color: #000000;
  font-size: 13px;
  font-weight: 500;
}

.base-info-item__content {
    display: flex;
    justify-content: center;
    align-items: center;
}

.base-info-item__value {
  font-weight: 600;
  font-size: 24px;
  color: #1f2a44;
  margin: 0 12px;
}

.base-info-item__unit {
    color: #1a1a1a91;
}

.base-info-item__hint {
  font-size: 12px;
  color: #8c9bb8;
}

.machine-card__item {
  border-radius: 12px;
  /* background: linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, rgba(255, 255, 255, 0.8) 100%); */
  background: linear-gradient(to bottom, #ffffff 0%, #ffffff 50%, #E6F3FF 80%, #D0E7FF 100%);
  padding: 14px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.machine-card__content {
    display: flex;
}

.machine-card__header {
  font-weight: 600;
  color: #1f2a44;
  margin-left: 8px;
}

.machine-card__num {
    display: flex;
}

.machine-card__value {
    font-size: 26px;
    color: #000000;
    margin-right: 8px;
}

.machine-card__unit {
    display: flex;
    justify-content: center;
    align-self: center;
    font-weight: 400;
    font-size: 12px;
    color: #999999;
}

.machine-card__hint {
    font-weight: 400;
    font-size: 14px;
    color: #666666;
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

@media (max-width: 1024px) {
  .simAnalysis-container {
    flex-direction: column;
  }

  .analysis-left {
    width: 100%;
  }
}
</style>
