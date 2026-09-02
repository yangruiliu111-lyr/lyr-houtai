<template>
  <VChart :option="option" style="height: 280px;" autoresize />
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps({
  data: { type: Array, required: true }
})

const option = computed(() => ({
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      const p = params[0]
      return `${p.axisValue}<br/>平均耗时: <b>${(p.value / 1000).toFixed(1)}s</b><br/>任务数: <b>${props.data[p.dataIndex]?.count || 0}</b>`
    }
  },
  legend: { data: ['平均耗时'], bottom: 0 },
  grid: { top: 8, left: 40, right: 20, bottom: 30 },
  xAxis: {
    type: 'category',
    data: props.data.map(d => d.hour),
    axisLabel: { rotate: 45, fontSize: 11 },
    boundaryGap: false
  },
  yAxis: {
    type: 'value',
    name: 'ms',
    axisLabel: { formatter: v => (v / 1000).toFixed(0) + 's' }
  },
  series: [{
    name: '平均耗时',
    type: 'line',
    data: props.data.map(d => d.avgDuration),
    smooth: true,
    lineStyle: { color: '#409EFF', width: 2 },
    areaStyle: { color: 'rgba(64,158,255,0.1)' },
    itemStyle: { color: '#409EFF' },
    markLine: {
      silent: true,
      data: [{ yAxis: 30000, label: { formatter: '阈值 30s' }, lineStyle: { color: '#f56c6c', type: 'dashed' } }]
    }
  }]
}))
</script>
