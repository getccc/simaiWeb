<template>
  <div class="simAnalysis-device">
  <a-row :gutter="[8, 8]" class="device-row">
      <a-col :xs="24" :xl="9">
        <a-card title="各环节等待时间分布" :headStyle="{ borderBottom: '0px solid' }" class="device-info-card fixed-card">
            <chart :option="trendOption" :chartData="trendData" />
        </a-card>
      </a-col>

      <a-col :xs="24" :xl="15">
        <a-card title="各环节等待时间占比图" :headStyle="{ borderBottom: '0px solid' }" class="machine-card fixed-card">
            <chart :option="throughputOption" :chartData="throughputData" />
        </a-card>
      </a-col>
    </a-row>

  <a-row :gutter="[8, 8]">
        <a-col :xs="24">
          <a-card title="清洗腔室等待队列变化" :headStyle="{ borderBottom: '0px solid' }" class="machine-card gantt-card fixed-card">
              <chart :option="ganttOption" :chartData="ganttData" />
          </a-card>
        </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed } from "vue";
import chart from "@/components/common/chart.vue";

// Generated sample data and options for charts so the page shows values
// Trend chart (line)
const trendData = [
  { name: 'utilization', data: Array.from({length: 12}, (_, i) => ({ x: `${i}h`, y: +(60 + Math.random() * 30).toFixed(2) })) }
]
const trendOption = {
  xAxis: { type: 'category', data: trendData[0].data.map(d=>d.x) },
  yAxis: { type: 'value' },
  series: [{ name: trendData[0].name, type: 'line', data: trendData[0].data.map(d=>d.y) }],
  tooltip: { trigger: 'axis' }
}

// Throughput chart (bar)
const throughputData = [
  { name: 'wph', data: Array.from({length: 24}, (_, i) => ({ x: `${i}h`, y: +(10 + Math.random() * 40).toFixed(2) })) }
]
const throughputOption = {
  xAxis: { type: 'category', data: throughputData[0].data.map(d=>d.x) },
  yAxis: { type: 'value' },
  series: [{ name: throughputData[0].name, type: 'bar', data: throughputData[0].data.map(d=>d.y) }],
  tooltip: { trigger: 'axis' }
}

// Simplified Gantt-like stacked bar sample (using bar series)
const ganttData = [
  { name: 'chamberA', children: [{ name: 'job1', start: 1, end: 4 }, { name: 'job2', start: 5, end: 8 }] },
]
const ganttOption = {
  tooltip: { formatter: function(params){ return params.name + ': ' + params.value } },
  xAxis: { type: 'value', min: 0, max: 24 },
  yAxis: { type: 'category', data: ganttData.map(d=>d.name) },
  series: [{ type: 'bar', stack: 'total', data: [4], label: { show: true } }]
}
</script>

<style scoped>
.simAnalysis-device {
  padding: 6px;
}

.simAnalysis-device :deep(.ant-card-body) {
    padding: 4px;
}

.device-row {
  margin-bottom: 6px;
}
.fixed-card {
  height: 330px;
  display: flex;
  flex-direction: column;
}
.fixed-card >>> .chart-root {
  flex: 1;
  min-height: 180px;
}
</style>
