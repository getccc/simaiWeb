<template>
  <div class="simAnalysis-container">
    <section class="analysis-left">
      <a-card
        :bordered="false"
        class="analysis-left-card"
        title="Simulators trained here:"
        :extra="
          h(
            'a-tag',
            { color: 'blue', bordered: false, class: 'status-tag' },
            () => '运行中'
          )
        "
      >
        <a-list
          :data-source="simulators"
          class="simulator-list"
          :renderItem="renderSimulator"
        />
      </a-card>
    </section>

    <section class="analysis-right">
      <a-row :gutter="[16, 16]" class="overview-row">
        <a-col v-for="item in overviewCards" :key="item.title" :xs="24" :sm="12" :xl="6">
          <a-card :bordered="false" class="overview-card">
            <div class="overview-card__icon" :style="{ background: item.gradient }">
              <span>{{ item.icon }}</span>
            </div>
            <div class="overview-card__body">
              <div class="overview-card__title">{{ item.title }}</div>
              <div class="overview-card__desc">{{ item.description }}</div>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="[16, 16]">
        <a-col :xs="24" :xl="9">
          <a-card title="仿真基础信息" :bordered="false" class="base-info-card">
            <template #extra>
              <div class="card-extra">基础信息</div>
            </template>
            <a-row :gutter="[12, 12]">
              <a-col v-for="item in baseParameters" :key="item.label" :span="24" class="base-info-item">
                <div class="base-info-item__icon">{{ item.icon }}</div>
                <div class="base-info-item__content">
                  <div class="base-info-item__label">{{ item.label }}</div>
                  <div class="base-info-item__value">{{ item.value }}</div>
                  <div class="base-info-item__hint">{{ item.hint }}</div>
                </div>
              </a-col>
            </a-row>
          </a-card>
        </a-col>

        <a-col :xs="24" :xl="15">
          <a-card title="机台参数" :bordered="false" class="machine-card">
            <a-row :gutter="[12, 12]">
              <a-col v-for="item in machineParameters" :key="item.name" :xs="12" :lg="8">
                <div class="machine-card__item">
                  <div class="machine-card__header">{{ item.name }}</div>
                  <div class="machine-card__value">{{ item.value }}</div>
                  <div class="machine-card__hint">{{ item.hint }}</div>
                </div>
              </a-col>
            </a-row>
          </a-card>
        </a-col>
      </a-row>

      <a-row :gutter="[16, 16]" class="performance-row">
        <a-col :span="24">
          <a-card title="核心产能指标" :bordered="false" class="performance-card">
            <div class="performance-card__content">
              <div class="performance-card__visual">
                <div class="performance-card__visual-number">
                  <div class="performance-card__visual-title">总处理晶圆数</div>
                  <div class="performance-card__visual-value">{{ totalThroughput }} 片</div>
                  <div class="performance-card__visual-hint">累计完成 {{ totalBatches }} 批仿真</div>
                </div>
              </div>
              <div class="performance-card__metrics">
                <a-row :gutter="[12, 12]">
                  <a-col v-for="metric in performanceMetrics" :key="metric.label" :xs="24" :md="12" :xl="6">
                    <div class="metric-card">
                      <div class="metric-card__label">{{ metric.label }}</div>
                      <div class="metric-card__value">{{ metric.optimized }}</div>
                      <div class="metric-card__sub">
                        <span class="metric-card__trend" :class="metric.trend > 0 ? 'up' : metric.trend < 0 ? 'down' : ''">
                          {{ metric.trend > 0 ? `↑ ${metric.trend}%` : metric.trend < 0 ? `↓ ${Math.abs(metric.trend)}%` : '持平' }}
                        </span>
                        <span class="metric-card__baseline">原逻辑 {{ metric.baseline }}</span>
                      </div>
                    </div>
                  </a-col>
                </a-row>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </section>
  </div>
</template>

<script setup>
import { h, reactive, computed } from "vue";

const simulators = reactive([
  {
    name: "实验室1",
    total: "645M",
    used: "426.8M",
    assigned: "339.1M",
    progress: 78
  },
  {
    name: "实验室2",
    total: "426.8M",
    used: "426.8M",
    assigned: "426.8M (100%)",
    progress: 100
  },
  {
    name: "实验室3",
    total: "426.8M",
    used: "426.8M",
    assigned: "226.3M (45%)",
    progress: 45
  },
  {
    name: "实验室4",
    total: "645M",
    used: "426.8M",
    assigned: "339.1M (78%)",
    progress: 78
  },
  {
    name: "实验室5",
    total: "645M",
    used: "426.8M",
    assigned: "339.1M (78%)",
    progress: 78
  }
]);

const overviewCards = [
  {
    title: "仿真基础信息",
    description: "基础配置数据统计",
    icon: "📘",
    gradient: "linear-gradient(135deg, #e0f3ff 0%, #ffffff 100%)"
  },
  {
    title: "核心性能指标",
    description: "性能趋势、WPH、晶圆良率趋势",
    icon: "📊",
    gradient: "linear-gradient(135deg, #e6f7f2 0%, #ffffff 100%)"
  },
  {
    title: "设备利用率分析",
    description: "设备可用时间、负载利用率统计",
    icon: "🛠️",
    gradient: "linear-gradient(135deg, #f4f3ff 0%, #ffffff 100%)"
  },
  {
    title: "晶圆等待时间分析",
    description: "等待时长、瓶颈工序反馈",
    icon: "⏱️",
    gradient: "linear-gradient(135deg, #fff3f2 0%, #ffffff 100%)"
  }
];

const baseParameters = [
  {
    label: "时间单位转换",
    value: "1440 分钟 (24小时)",
    hint: "每日仿真节拍",
    icon: "🕒"
  },
  {
    label: "仿真时长",
    value: "30 天 (43200分钟)",
    hint: "一次完整仿真周期",
    icon: "📅"
  },
  {
    label: "晶圆到达速率",
    value: "1-2 片/分钟",
    hint: "根据生产排程动态调整",
    icon: "📈"
  }
];

const machineParameters = [
  { name: "晶圆盒 (原料端)", value: "数量 4 个", hint: "单盒容量 10 片" },
  { name: "寻边器 (1个)", value: "10 片/盒", hint: "单次处理时长 10 分钟" },
  { name: "大气机械臂 (双臂)", value: "0.3-0.5 分钟", hint: "工位间搬运耗时" },
  { name: "真空过渡腔 (2个)", value: "容量 2 片", hint: "单次换载时间 0.3-0.4 分钟" },
  { name: "刻蚀腔 (6个)", value: "8-12 分钟", hint: "单次刻蚀耗时" },
  { name: "清洗腔 (2个)", value: "3-5 分钟", hint: "单次清洗耗时" }
];

const performanceMetrics = [
  {
    label: "日均处理晶圆数",
    optimized: "342.9 片",
    baseline: "299.1",
    trend: 14.6
  },
  {
    label: "晶圆盒平均换盘次数",
    optimized: "1029 次",
    baseline: "898",
    trend: 14.6
  },
  {
    label: "晶圆平均处理时长",
    optimized: "19.2 分钟",
    baseline: "22.8",
    trend: -15.8
  },
  {
    label: "更换腔体时间长",
    optimized: "171.5 小时",
    baseline: "149.7",
    trend: 14.6
  }
];

const totalThroughput = computed(() => 10286);
const totalBatches = computed(() => 972);

const renderSimulator = ({ item }) =>
  h(
    "a-list-item",
    { class: "simulator-item" },
    {
      default: () => [
        h("div", { class: "simulator-item__header" }, [
          h("div", { class: "simulator-item__name" }, item.name),
          h(
            "a-space",
            { align: "center", size: 8 },
            {
              default: () => [
                h(
                  "a-tooltip",
                  { title: "查看详情" },
                  { default: () => h("a", { class: "simulator-link" }, "🔍") }
                ),
                h("span", { class: "simulator-value" }, item.total)
              ]
            }
          )
        ]),
        h("div", { class: "simulator-item__body" }, [
          h("div", { class: "simulator-metric" }, [
            h("span", "已处理"),
            h("strong", item.used)
          ]),
          h("div", { class: "simulator-metric" }, [
            h("span", "已分配"),
            h("strong", item.assigned)
          ]),
          h("a-progress", {
            percent: item.progress,
            strokeColor: "#1677ff",
            showInfo: false,
            class: "simulator-progress"
          })
        ])
      ]
    }
  );
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

.status-tag {
  font-size: 12px;
  padding: 0 6px;
  border-radius: 12px;
}

.simulator-list :deep(.ant-list-item) {
  padding: 12px 0;
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
  color: #5b6b8d;
}

.simulator-item__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  border-radius: 14px;
  min-height: 100px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 6px 16px rgba(31, 42, 68, 0.05);
}

.overview-card__icon {
  width: 54px;
  height: 54px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.overview-card__title {
  font-weight: 600;
  color: #1f2a44;
  margin-bottom: 4px;
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

@media (max-width: 1024px) {
  .simAnalysis-container {
    flex-direction: column;
  }

  .analysis-left {
    width: 100%;
  }
}
</style>
