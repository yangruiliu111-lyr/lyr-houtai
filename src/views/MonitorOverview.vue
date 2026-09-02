<template>
  <div class="page-root">
    <div class="page-head"><h1 class="page-title">数据概览</h1></div>

    <div class="filter-box">
      <div class="filter-row">
        <div class="filter-item"><span class="filter-label">创建时间</span>
          <el-date-picker v-model="f.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" size="default" style="width:240px" />
        </div>
        <div class="filter-item"><span class="filter-label">功能名称</span>
          <el-select v-model="f.funcName" placeholder="全部" clearable size="default" style="width:170px">
            <el-option v-for="n in funcOptions" :key="n" :label="n" :value="n" />
          </el-select>
        </div>
        <div class="filter-item"><span class="filter-label">国家</span>
          <el-select v-model="f.country" placeholder="全部" clearable size="default" style="width:100px">
            <el-option v-for="c in countryCodeOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </div>
        <div class="filter-item"><span class="filter-label">会员状态</span>
          <el-select v-model="f.member" placeholder="全部" clearable size="default" style="width:110px">
            <el-option v-for="m in memberOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </div>
        <el-button type="primary" size="default">查询</el-button>
        <el-button size="default" @click="resetFilter">重置</el-button>
      </div>
    </div>

    <div class="hint-text">当前数据量较小，以下指标主要用于任务健康度观察和异常排查，需结合具体用户任务进一步判断。</div>

    <div class="metrics-box">
      <div class="m-item" v-for="m in metrics" :key="m.label" @click="m.click && m.click()">
        <div class="m-label">{{ m.label }}</div>
        <div class="m-value" :style="{ color: m.color || '#303133' }">{{ m.value }}</div>
      </div>
    </div>

    <div class="chart-panel">
      <div class="panel-title">功能任务状态分布</div>
      <v-chart :option="barOpt" style="height:300px" autoresize />
    </div>

    <div class="table-panel">
      <div class="panel-title">任务汇总</div>
      <el-table :data="aggList" stripe border size="default" style="width:100%">
        <el-table-column prop="funcName" label="名称" width="180" />
        <el-table-column prop="total" label="任务量" width="70" />
        <el-table-column prop="successRate" label="成功率" width="70">
          <template #default="s">{{ s.row.successRate }}%</template>
        </el-table-column>
        <el-table-column prop="failCount" label="失败" width="55" />
        <el-table-column prop="blockedCount" label="拦截" width="55" />
        <el-table-column prop="timeoutCount" label="超时" width="55" />
        <el-table-column prop="extFailCount" label="外采失败" width="70" />
        <el-table-column prop="avgDuration" label="典型耗时" width="80">
          <template #default="s">{{ fmtDur(s.row.avgDuration) }}</template>
        </el-table-column>
        <el-table-column prop="totalCost" label="总实际消耗豆数" width="120">
          <template #default="s">{{ (s.row.totalCost||0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column prop="totalBenefitQuota" label="总消耗权益次数" width="120">
          <template #default="s">{{ (s.row.totalBenefitQuota||0).toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80">
          <template #default="s"><span class="link" @click="goTasksFiltered({ funcName: s.row.funcName })">查看任务</span></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { tasks, funcOptions, countryCodeOptions, memberOptions } from '../mock/data.js'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent])

const router = useRouter()
const f = reactive({ dateRange: null, funcName: '', country: '', member: '' })

const filtered = computed(() => tasks.filter(t => {
  if (f.funcName && t.funcName !== f.funcName) return false
  if (f.country && t.country !== f.country) return false
  if (f.member && t.member !== f.member) return false
  return true
}))

const statsData = computed(() => {
  const list = filtered.value
  const total = list.length || 1
  return {
    total,
    sCnt: list.filter(t => t.status === 'success').length,
    fCnt: list.filter(t => t.status === 'failed').length,
    bCnt: list.filter(t => t.status === 'blocked').length,
    tCnt: list.filter(t => t.status === 'timeout').length,
    eCnt: list.filter(t => t.status === 'external_model_failed').length,
    totalCost: list.reduce((s, t) => s + (t.cost || 0), 0),
    totalBenefitQuota: list.reduce((s, t) => s + (t.benefitQuotaCost || 0), 0),
  }
})

const metrics = computed(() => {
  const s = statsData.value
  return [
    { label: '任务总量', value: s.total.toLocaleString(), click: () => goTasksFiltered({}) },
    { label: '成功率', value: ((s.sCnt / s.total) * 100).toFixed(1) + '%', color: '#67C23A', click: () => goTasksFiltered({ status: 'success' }) },
    { label: '失败任务数', value: s.fCnt, color: '#F56C6C', click: () => goTasksFiltered({ status: 'failed' }) },
    { label: '拦截任务数', value: s.bCnt, color: '#E6A23C', click: () => goTasksFiltered({ status: 'blocked' }) },
    { label: '超时任务数', value: s.tCnt, color: '#E6A23C', click: () => goTasksFiltered({ status: 'timeout' }) },
    { label: '外采失败', value: s.eCnt, color: '#F56C6C', click: () => goTasksFiltered({ status: 'external_model_failed' }) },
    { label: '总实际消耗豆数', value: s.totalCost.toLocaleString() },
    { label: '总消耗权益次数', value: s.totalBenefitQuota.toLocaleString() },
  ]
})

function resetFilter() { Object.assign(f, { dateRange: null, funcName: '', country: '', member: '' }) }

const barOpt = computed(() => {
  const m = {}
  filtered.value.forEach(t => {
    if (!m[t.funcName]) m[t.funcName] = { name: t.funcName, total: 0, success: 0, failed: 0, blocked: 0, timeout: 0, extFailed: 0 }
    m[t.funcName].total++
    if (t.status === 'success') m[t.funcName].success++
    else if (t.status === 'failed') m[t.funcName].failed++
    else if (t.status === 'blocked') m[t.funcName].blocked++
    else if (t.status === 'timeout') m[t.funcName].timeout++
    else if (t.status === 'external_model_failed') m[t.funcName].extFailed++
  })
  const data = funcOptions
    .filter((name) => m[name])
    .map((name) => m[name])
  return {
    tooltip: {
      trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const d = data[params[0].dataIndex]
        if (!d) return ''
        const total = d.total || 1
        const rate = ((d.success / total) * 100).toFixed(1)
        return `<b>${d.name}</b><br/>
          <span style="color:#67C23A">成功率 ${rate}%</span><br/>
          总任务量：${d.total}<br/>
          成功：${d.success} · 失败：${d.failed} · 拦截：${d.blocked} · 超时：${d.timeout} · 外采失败：${d.extFailed}`
      }
    },
    legend: { data: ['成功', '失败', '拦截', '超时', '外采模型失败'], top: 0 },
    grid: { top: 36, left: 40, right: 20, bottom: 24 },
    xAxis: { type: 'category', data: data.map(d => d.name), axisLabel: { fontSize: 10 } },
    yAxis: { type: 'value', name: '任务数', minInterval: 1 },
    series: [
      { name: '成功', type: 'bar', stack: 'total', data: data.map(d => d.success), itemStyle: { color: '#95D475' }, barWidth: '55%' },
      { name: '失败', type: 'bar', stack: 'total', data: data.map(d => d.failed), itemStyle: { color: '#F89898' } },
      { name: '拦截', type: 'bar', stack: 'total', data: data.map(d => d.blocked), itemStyle: { color: '#F0C060' } },
      { name: '超时', type: 'bar', stack: 'total', data: data.map(d => d.timeout), itemStyle: { color: '#D4A070' } },
      { name: '外采模型失败', type: 'bar', stack: 'total', data: data.map(d => d.extFailed), itemStyle: { color: '#C0C0C0' } },
    ]
  }
})

const aggList = computed(() => {
  const m = {}
  filtered.value.forEach(t => {
    if (!m[t.funcName]) m[t.funcName] = { funcName: t.funcName, total: 0, success: 0, failed: 0, blocked: 0, timeout: 0, extFailed: 0, durations: [], costs: [], benefitQuotas: [] }
    m[t.funcName].total++
    if (t.status === 'success') m[t.funcName].success++
    else if (t.status === 'failed') m[t.funcName].failed++
    else if (t.status === 'blocked') m[t.funcName].blocked++
    else if (t.status === 'timeout') m[t.funcName].timeout++
    else if (t.status === 'external_model_failed') m[t.funcName].extFailed++
    if (t.duration) m[t.funcName].durations.push(t.duration)
    m[t.funcName].costs.push(t.cost || 0)
    m[t.funcName].benefitQuotas.push(t.benefitQuotaCost || 0)
  })
  return funcOptions
    .filter((name) => m[name])
    .map((name) => {
      const r = m[name]
      return {
        funcName: r.funcName, total: r.total, success: r.success, failed: r.failed, blocked: r.blocked, timeout: r.timeout, extFailed: r.extFailed,
        successRate: r.total ? ((r.success / r.total) * 100).toFixed(1) : '0.0',
        failCount: r.failed, blockedCount: r.blocked, timeoutCount: r.timeout, extFailCount: r.extFailed,
        avgDuration: r.durations.length ? Math.floor(r.durations.reduce((a, b) => a + b, 0) / r.durations.length) : 0,
        totalCost: r.costs.reduce((a, b) => a + b, 0),
        totalBenefitQuota: r.benefitQuotas.reduce((a, b) => a + b, 0),
      }
    })
})

function fmtDur(ms) {
  if (!ms) return '-'
  if (ms >= 60000) return Math.floor(ms / 60000) + 'm' + Math.floor((ms % 60000) / 1000) + 's'
  return (ms / 1000).toFixed(1) + 's'
}

function goTasksFiltered(extra) {
  const params = {}
  if (extra && extra.funcName) params.func = extra.funcName
  else if (f.funcName) params.func = f.funcName
  if (extra && extra.status) params.status = extra.status
  if (f.country) params.country = f.country
  if (f.member) params.member = f.member
  sessionStorage.setItem('monitor-overview-filter', JSON.stringify(params))
  router.push('/aigc/tasks')
}
</script>

<style scoped>
.page-root { padding: 0; max-width: 100%; overflow-x: hidden; }
.page-head { background: #fff; padding: 20px 24px 0; border-bottom: 1px solid #EBEEF5; }
.page-title { font-size: 26px; font-weight: 600; color: #303133; margin-bottom: 14px; }
.filter-box { background: #fff; margin: 12px 24px; border: 1px solid #EBEEF5; border-radius: 2px; padding: 10px 16px; }
.filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.filter-item { display: inline-flex; align-items: center; white-space: nowrap; }
.filter-label { font-size: 13px; color: #606266; margin-right: 6px; }
.hint-text { margin: 0 24px 12px; font-size: 12px; color: #909399; }
.metrics-box { display: flex; align-items: center; margin: 0 24px 12px; background: #fff; border: 1px solid #EBEEF5; border-radius: 2px; padding: 16px 20px; }
.m-item { flex: 1; text-align: center; }
.m-label { font-size: 12px; color: #909399; margin-bottom: 4px; }
.m-value { font-size: 20px; font-weight: 600; color: #303133; }
.chart-panel { margin: 0 24px 12px; background: #fff; border: 1px solid #EBEEF5; border-radius: 2px; padding: 14px 18px; }
.table-panel { margin: 0 24px 24px; background: #fff; border: 1px solid #EBEEF5; border-radius: 2px; padding: 14px 18px; }
.panel-title { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 4px; }
.link { color: #409EFF; cursor: pointer; font-size: 13px; }
.link:hover { color: #66b1ff; }
</style>
