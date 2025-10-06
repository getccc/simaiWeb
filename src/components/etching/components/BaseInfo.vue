<template>
  <div class="simAnalysis-base">
    <a-row :gutter="[16, 16]" class="base-row">
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
              <a-col v-for="item in chamber.children" :key="item.hint" :xs="2" :lg="7">
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

    <a-row :gutter="[16, 16]">
      <a-col :span="24">
        <a-card title="核心产能指标" headStyle="border-bottom: 0px solid" class="performance-card">
          <div class="core-metrics">
            <div class="core-summary">
              <div class="core-summary__stats">
                <div class="core-summary__primary">
                  <div class="core-summary__value">{{ totalThroughput }}</div>
                  <div class="core-summary__meta">
                    <span class="core-summary__label">优化后平均值/片</span>
                    <span
                      v-if="!totalTrendMeta.isFlat"
                      class="core-summary__trend"
                      :class="`trend-${totalTrendMeta.direction}`"
                    >
                      <span class="core-summary__trend-icon">
                        {{ totalTrendMeta.direction === 'down' ? '▼' : '▲' }}
                      </span>
                      <span>{{ totalTrendMeta.sign }}{{ totalTrendMeta.display }}%</span>
                    </span>
                    <span v-else class="core-summary__trend trend-flat">持平</span>
                  </div>
                </div>
                <div class="core-summary__baseline">
                  <div class="core-summary__baseline-value">{{ totalBatches }}</div>
                  <div class="core-summary__baseline-label">原逻辑平均值/片</div>
                </div>
              </div>
              <div class="core-summary__visual">
                <img :src="jyz" alt="总处理晶圆数" />
                <div class="core-summary__badge">总处理晶圆数</div>
              </div>
            </div>

            <div class="core-metrics__grid">
              <div class="core-metrics-card" v-for="metric in metricsWithMeta" :key="metric.label">
                <div class="core-metrics-card__header">
                  <div class="core-metrics-card__icon">
                    <img :src="metric.icon" :alt="metric.label" />
                  </div>
                  <div class="core-metrics-card__title">{{ metric.label }}</div>
                </div>
                <span class="core-metrics-card__divider"></span>
                <div class="core-metrics-card__body">
                  <div class="core-metrics-card__column core-metrics-card__column--primary">
                    <div class="core-metrics-card__caption">{{ metric.optTitle }}</div>
                    <div class="core-metrics-card__value">
                        {{ metric.optimized }}
                        <div class="core-metrics-card__trend" :class="`trend-${metric.trendDirection}`">
                            <span class="core-metrics-card__trend-icon">
                            {{ metric.trendDirection === 'down' ? '▼' : '▲' }}
                            </span>
                            <span>{{ metric.trendSign }}{{ metric.trendDisplay }}%</span>
                        </div>
                    </div>

                  </div>
                  <div class="core-metrics-card__column core-metrics-card__column--secondary">
                    <div class="core-metrics-card__caption">{{ metric.baseTitle }}</div>
                    <div class="core-metrics-card__value core-metrics-card__value--secondary">
                      {{ metric.baseline }}
                    </div>
                  </div>
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

const chamber = {
  name: "晶圆仓(原料仓)",
  children: [
    { value: "4", icon: jt, unit: "个", hint: "数量" },
    { value: "10", icon: jt, unit: "片/盒", hint: "单盒容量" },
    { value: "10", icon: cs, unit: "分钟/次", hint: "更换耗时" }
  ]
};

const machineParameters = [
  { name: "寻边机(1台)", icon: cs, value: "10", unit: "分钟/次", hint: "单次寻边耗时" },
  { name: "大气机械手(双臂)", icon: cs, value: "0.3-0.5", unit: "分钟", hint: "工位间搬运耗时" },
  { name: "真空过渡仓(1台)", icon: cs, value: "2", unit: "个", hint: "容量" },
  { name: "真空机械手(双臂)", icon: cs, value: "0.3-0.4", unit: "分钟", hint: "工位间搬运耗时" },
  { name: "刻蚀腔体(6台)", icon: cs, value: "8-12", unit: "分钟", hint: "单次刻蚀耗时" },
  { name: "清洗腔体(2台)", icon: cs, value: "3-5", unit: "分钟", hint: "单次清洗耗时" }
];

const performanceMetrics = [
  {
    icon: jys,
    label: "日均处理晶圆数",
    optTitle: "优化后平均值/片",
    optimized: "342.9",
    baseTitle: "原逻辑平均值/片",
    baseline: "299.1",
    trend: 14.6,
    trendDirection: "up"
  },
  {
    icon: clsc,
    label: "晶圆平均总处理时长",
    optTitle: "优化后平均值/分钟",
    optimized: "19.2",
    baseTitle: "原逻辑平均值/分钟",
    baseline: "22.8",
    trend: 15.8,
    trendDirection: "down"
  },
  {
    icon: ghcs,
    label: "晶圆盒更换总次数",
    optTitle: "优化后平均值/次",
    optimized: "1029",
    baseTitle: "原逻辑平均值/次",
    baseline: "898",
    trend: 14.6,
    trendDirection: "up"
  },
  {
    icon: zdsc,
    label: "更换中断时长",
    optTitle: "优化后平均值/小时",
    optimized: "171.5",
    baseTitle: "原逻辑平均值/小时",
    baseline: "149.7",
    trend: 14.6,
    trendDirection: "up"
  }
];

const totalThroughput = computed(() => 10286);
const totalBatches = computed(() => 972);

const totalTrendValue = 14.6;
const totalTrendDirection = "up";

const formatTrend = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return "--";
  }
  const fixed = Math.abs(numeric).toFixed(1);
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
};

const resolveTrendDirection = (value, explicitDirection) => {
  if (explicitDirection) {
    return explicitDirection;
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric === 0) {
    return "flat";
  }
  return numeric > 0 ? "up" : "down";
};

const totalTrendMeta = computed(() => {
  const direction = resolveTrendDirection(totalTrendValue, totalTrendDirection);
  return {
    direction,
    sign: direction === "down" ? "-" : direction === "up" ? "+" : "",
    display: formatTrend(totalTrendValue),
    isFlat: direction === "flat"
  };
});

const metricsWithMeta = computed(() =>
  performanceMetrics.map((metric) => {
    const direction = resolveTrendDirection(metric.trend, metric.trendDirection);
    return {
      ...metric,
      trendDirection: direction,
      trendSign: direction === "down" ? "-" : direction === "up" ? "+" : "",
      trendDisplay: formatTrend(metric.trend),
      isFlat: direction === "flat"
    };
  })
);
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

.base-row {
    margin-bottom: 16px;
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
  background: linear-gradient(180deg, #ffffff 0%, #ffffff 48%, #e6f3ff 88%, #d0e7ff 100%);
  padding: 8px;
  margin-right: 16px;
  border-radius: 12px;
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
  color: #112347;
  margin-right: 6px;
  font-weight: 600;
}

.chamber__unit {
  font-weight: 400;
  font-size: 12px;
  color: #6a7a95;
}

.chamber__hint {
  font-weight: 400;
  font-size: 14px;
  color: #6c7a9a;
}

.chamber_name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2a44;
  padding: 8px;
}

.base-info-item {
  display: flex;
  gap: 12px;
  border-left: solid 3px #0086ff;
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, rgba(255, 255, 255, 0.82) 100%);
  padding: 8px 0;
}

.base-info-item + .base-info-item {
  margin-top: 8px;
}

.base-info-item__icon {
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 78px;
  height: 66px;
}

.base-info-item__label {
  color: #0f1f49;
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
  color: rgba(17, 35, 71, 0.56);
  font-size: 12px;
}

.machine-card__item {
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #ffffff 48%, #e6f3ff 88%, #d0e7ff 100%);
  padding: 14px;
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
  align-items: baseline;
  gap: 6px;
}

.machine-card__value {
  font-size: 26px;
  color: #0f1f49;
  font-weight: 600;
}

.machine-card__unit {
  font-size: 12px;
  color: #6a7a95;
}

.machine-card__hint {
  font-weight: 400;
  font-size: 14px;
  color: #6c7a9a;
}

.performance-card {
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 32px 64px rgba(31, 42, 68, 0.14);
  border: none;
}

.core-metrics {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

@media (min-width: 1200px) {
  .core-metrics {
    flex-direction: row;
    align-items: stretch;
  }
}

.core-summary {
  position: relative;
  flex: 1 1 42%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 36px;
  border-radius: 24px;
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.96) 0%, rgba(227, 239, 255, 0.96) 54%, rgba(205, 228, 255, 0.96) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 28px 58px rgba(51, 86, 145, 0.18);
  overflow: hidden;
}

.core-summary::before {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

.core-summary__stats {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.core-summary__primary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.core-summary__value {
  font-size: 26px;
  font-weight: 700;
  color: #1677ff;
  letter-spacing: 1px;
}

.core-summary__meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.core-summary__label {
  font-size: 16px;
  font-weight: 400;
  color: #45608f;
}

.core-summary__trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.trend-up {
  color: #ff8a45;
}

.trend-down {
  color: #16c784;
}

.trend-flat {
  color: #9aa9c6;
}

.core-summary__trend-icon {
  font-size: 13px;
}

.core-summary__baseline {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.core-summary__baseline-value {
  font-size: 26px;
  font-weight: 600;
  color: #364260;
}

.core-summary__baseline-label {
  font-size: 16px;
  color: #6f7e9d;
}

.core-summary__visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.core-summary__visual img {
  width: 220px;
  height: auto;
}

.core-summary__badge {
  padding: 8px 20px;
  border-radius: 999px;
  background: linear-gradient(90deg, #2b79ff 0%, #5aa6ff 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 12px 24px rgba(43, 121, 255, 0.32);
}

.core-metrics__grid {
  flex: 1 1 58%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.core-metrics-card {
  position: relative;
  border-radius: 20px;
  padding: 16px;
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.97) 0%, rgba(236, 245, 255, 0.97) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 24px 48px rgba(31, 42, 68, 0.12);
  display: flex;
  /* flex-direction: column; */
  /* gap: 20px; */
  /* overflow: hidden; */
}

.core-metrics-card::before {
  content: "";
  position: absolute;
  inset: 1px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.55);
  pointer-events: none;
}

.core-metrics-card__header {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  width: 126px;
}

.core-metrics-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(43, 121, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.core-metrics-card__icon img {
  width: 32px;
  height: 32px;
}

.core-metrics-card__title {
    font-weight: 400;
    font-size: 14px;
    color: #1A1A1A;
}

.core-metrics-card__body {
  position: relative;
  display: flex;
  gap: 18px;
  margin: 16px 0px;
}

.core-metrics-card__column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.core-metrics-card__column--primary .core-metrics-card__value {
  font-size: 16px;
  color: #000000;
  font-weight: 600;
  display: flex;
  gap: 4px;
}

.core-metrics-card__column--secondary .core-metrics-card__value {
  font-size: 16px;
  font-weight: 600;
  color: #7a88a8;
  gap: 4px;
}

.core-metrics-card__caption {
  font-size: 12px;
  color: #7a88a8;
  margin: 8px 0px;
}

.core-metrics-card__trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.core-metrics-card__trend-icon {
  font-size: 12px;
}

.core-metrics-card__value--secondary {
  color: #6f7e9d;
}

.core-metrics-card__divider {
  width: 1px;
  background: linear-gradient(180deg, rgba(138, 164, 214, 0) 0%, rgba(138, 164, 214, 0.5) 50%, rgba(138, 164, 214, 0) 100%);
  margin: 16px;
}

@media (max-width: 1199px) {
  .core-summary {
    flex-direction: column;
    text-align: center;
    padding: 28px 24px 36px;
  }

  .core-summary__stats {
    align-items: center;
  }

  .core-summary__baseline {
    align-items: center;
  }

  .core-summary__visual {
    margin-top: 24px;
  }

  .core-metrics__grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 768px) {
  .core-metrics__grid {
    grid-template-columns: 1fr;
  }
}
</style>
