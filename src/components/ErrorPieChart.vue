<template>
  <VChart :option="option" style="height: 280px;" autoresize />
</template>

<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TooltipComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, PieChart, TooltipComponent, LegendComponent])

const props = defineProps({
  data: { type: Array, required: true }
})

const colors = ['#f56c6c', '#e6a23c', '#f7ba2a', '#909399', '#b88230']

const option = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c} 次 ({d}%)' },
  legend: { orient: 'vertical', right: 10, top: 'center' },
  series: [{
    type: 'pie',
    radius: ['45%', '75%'],
    center: ['40%', '50%'],
    avoidLabelOverlap: false,
    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
    label: { show: false },
    emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
    data: props.data.map((d, i) => ({ ...d, itemStyle: { color: colors[i % colors.length] } }))
  }]
}))
</script>
