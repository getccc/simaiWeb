<template>
  <div class="chart-root">
    <div class="main" :id='id'></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { onMounted, watch, defineExpose, ref } from 'vue'
import { computed } from 'vue'
const id = Date.now() + Math.random()
const emit = defineEmits(['change'])
const props = defineProps({
  option: {
    type: Object,
    default: () => {}
  },
  chartData: {
    type: Array,
    default: () => null
  },
  click: {
    type: Boolean,
    default: false
  }
})

let myChart = null
const childFlag = ref(false)
const chartOption = ref(null)

const builtOption = computed(() => {
  if (props.option && Object.keys(props.option).length) return props.option
  if (props.chartData && Array.isArray(props.chartData) && props.chartData.length) {
    const series = props.chartData.map(item => {
      if (item.data && Array.isArray(item.data)) {
        if (item.data.length && typeof item.data[0] === 'object' && 'x' in item.data[0]) {
          return { name: item.name, type: 'line', data: item.data.map(d => d.y) }
        }
        return { name: item.name, type: 'line', data: item.data }
      }
      return { name: item.name, type: 'line', data: [] }
    })
    const xAxis = (props.chartData[0].data && props.chartData[0].data.map(d => d.x)) || []
    return {
      xAxis: { type: 'category', data: xAxis },
      yAxis: { type: 'value' },
      series,
      tooltip: { trigger: 'axis' }
    }
  }
  return null
})

const refreshChart = () => {
  if (chartOption.value && myChart) {
    // ensure a small default grid so chart content uses more space
    const opt = JSON.parse(JSON.stringify(chartOption.value))
    opt.grid = opt.grid || { left: 8, right: 8, top: 12, bottom: 20 }
    myChart.setOption(opt)
  }
}

onMounted(() => {
  const chartDom = document.getElementById(id);
  myChart = echarts.init(chartDom, null, {
    renderer: 'svg'
  });
  if (props.click) {
    myChart.on('click', function (params) {
      if (params.componentType === 'series') {
        showChildChart(params.name)
      }
    });
  }
  refreshChart()
})

// Watch incoming props and update chartOption
watch(() => props.option, (v) => {
  if (v && Object.keys(v).length) {
    chartOption.value = v
    refreshChart()
  }
}, { immediate: true, deep: true })

watch(() => props.chartData, (v) => {
  if (v) {
    const opt = builtOption.value
    if (opt) {
      chartOption.value = opt
      refreshChart()
    }
  }
}, { immediate: true, deep: true })

function parseThousand(number) {
  let result = (parseFloat(number) / 10000)
  result = Math.max(result, 0.01)
  return number == 0 ? 0 : result.toFixed(2)
}

function showChildChart(targetName) {
  childFlag.value = true
  const data = props.chartData.find(item => item.name == targetName)?.children.map(data => {
    return {
      value: parseThousand(data.emissions), name: `${data.name}_${data.percent}%_${parseThousand(data.emissions)}`
    }
  }) || null
  if (data) {
    chartOption.value.series.forEach(item => {
      item.data = data
    })
    chartOption.value.color = chartOption.value.childColor || chartOption.value.color
  }
  emit('change',{ name: targetName})
  refreshChart()
}

defineExpose({refreshChart})
</script>

<style lang="less" scoped>
.chart-root {
  position: relative;
  width: 100%;
  height: 100%;
  .main {
    width: 100%;
    height: 100%;
  }
  .back-div {
    cursor: pointer;
    position: absolute;
    top: -10px;
    left: 0;
    font-size: 12px;
    color: #FFFFFF;
    line-height: 17px;
    z-index: 2;
    img {
      width: 14px;
      height: 14px;
    }
  }
}
</style>