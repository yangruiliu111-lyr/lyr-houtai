<template>
  <div class="page-root">
    <div class="page-head"><h1 class="page-title">免费权益</h1></div>

    <!-- 筛选区 -->
    <div class="filter-box">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">用户 ID</span>
          <el-input v-model="f.uid" placeholder="请输入" size="default" style="width:160px" clearable />
        </div>
        <div class="filter-item">
          <span class="filter-label">统计时间</span>
          <el-date-picker
            v-model="f.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="default"
            style="width:240px"
          />
        </div>
        <div class="filter-item">
          <span class="filter-label">国家／地区</span>
          <el-select
            v-model="f.country"
            placeholder="全部"
            clearable
            size="default"
            style="width:120px"
          >
            <el-option
              v-for="c in countryCodeOptions"
              :key="c"
              :label="c"
              :value="c"
            />
          </el-select>
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">权益使用状态</span>
          <el-select
            v-model="f.benefitStatus"
            placeholder="全部"
            clearable
            size="default"
            style="width:130px"
          >
            <el-option
              v-for="s in benefitStatusOptions"
              :key="s.value"
              :label="s.label"
              :value="s.value"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">当前会员状态</span>
          <el-select
            v-model="f.currentMember"
            placeholder="全部"
            clearable
            size="default"
            style="width:130px"
          >
            <el-option
              v-for="m in memberOptions"
              :key="m"
              :label="m"
              :value="m"
            />
          </el-select>
        </div>
        <el-button type="primary" size="default" :loading="loading" @click="fetchData">
          查询
        </el-button>
        <el-button size="default" @click="resetFilter">重置</el-button>
      </div>
    </div>

    <!-- 页面说明及统计口径 -->
    <div class="hint-box">
      <p class="hint-text">
        统计所选时间范围内获得基础免费权益用户的使用及耗尽情况，用于观察免费体验和后续转化潜力。当前基础权益为免费生图 {{ FREE_IMAGE_QUOTA }} 次、免费视频 {{ FREE_VIDEO_QUOTA }} 次。
      </p>
      <p class="scope-text">
        按免费权益发放时间统计，使用数据为截至当前的累计使用情况。
      </p>
    </div>

    <!-- 最后更新时间 -->
    <div class="update-time-bar">
      <span class="update-time-label">最后更新时间：</span>
      <span class="update-time-value">{{ lastUpdateTime }}</span>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="state-box">
      <el-icon class="is-loading" :size="24"><Loading /></el-icon>
      <span class="state-text">加载中...</span>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="loadError" class="state-box">
      <span class="state-text">数据加载失败，请重试</span>
      <el-button type="primary" size="default" style="margin-left:12px" @click="fetchData">
        重新加载
      </el-button>
    </div>

    <!-- 正常内容 -->
    <template v-else>
      <!-- 核心指标 -->
      <div class="metrics-box">
        <div class="m-item">
          <div class="m-label">获得基础权益人数</div>
          <div class="m-value">{{ fmtNum(metrics.totalGrantees) }}</div>
        </div>
        <div class="m-item">
          <div class="m-label">免费生图使用人数／使用率</div>
          <div class="m-value">{{ fmtNum(metrics.freeImageUsers) }} 人</div>
          <div class="m-sub">{{ fmtRate(metrics.freeImageUsageRate) }}</div>
        </div>
        <div class="m-item">
          <div class="m-label">用完 {{ FREE_IMAGE_QUOTA }} 次免费生图人数／耗尽率</div>
          <div class="m-value">{{ fmtNum(metrics.freeImageExhausted) }} 人</div>
          <div class="m-sub">{{ fmtRate(metrics.freeImageExhaustRate) }}</div>
        </div>
        <div class="m-item">
          <div class="m-label">使用免费视频人数／使用率</div>
          <div class="m-value">{{ fmtNum(metrics.freeVideoUsers) }} 人</div>
          <div class="m-sub">{{ fmtRate(metrics.freeVideoUsageRate) }}</div>
        </div>
        <div class="m-item">
          <div class="m-label">用完全部基础权益人数／耗尽率</div>
          <div class="m-value">{{ fmtNum(metrics.allBenefitsExhausted) }} 人</div>
          <div class="m-sub">{{ fmtRate(metrics.allBenefitsExhaustRate) }}</div>
        </div>
      </div>

      <!-- 用户明细 -->
      <div class="table-panel">
        <div class="panel-title">免费权益用户明细</div>

        <!-- 无数据 -->
        <div v-if="filteredUsers.length === 0" class="state-box">
          <span class="state-text">暂无符合条件的数据</span>
        </div>

        <template v-else>
          <el-table :data="pagedUsers" stripe border size="default" style="width:100%">
            <el-table-column prop="uid" label="UID" min-width="140" />
            <el-table-column prop="country" label="国家／地区" width="110" />
            <el-table-column prop="registerTime" label="注册时间" width="120" />
            <el-table-column prop="currentMember" label="当前会员状态" width="120" />
            <el-table-column label="免费生图已用" width="120">
              <template #default="s">
                {{ s.row.freeImageUsed }} / {{ FREE_IMAGE_QUOTA }}
              </template>
            </el-table-column>
            <el-table-column label="免费视频已用" width="110">
              <template #default="s">
                {{ s.row.freeVideoUsed }} / {{ FREE_VIDEO_QUOTA }}
              </template>
            </el-table-column>
            <el-table-column label="基础权益状态" width="120">
              <template #default="s">
                <el-tag
                  v-if="s.row.benefitStatus === 'all_exhausted'"
                  type="danger"
                  size="small"
                >全部用完</el-tag>
                <el-tag
                  v-else-if="s.row.benefitStatus === 'using'"
                  type="warning"
                  size="small"
                >使用中</el-tag>
                <el-tag
                  v-else
                  type="info"
                  size="small"
                >未使用</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="110">
              <template #default="s">
                <span class="link" @click="goToUsageDetail(s.row)">
                  查看使用明细
                </span>
              </template>
            </el-table-column>
          </el-table>
          <div class="pager-row">
            <el-pagination
              v-model:current-page="page"
              v-model:page-size="pageSize"
              :total="filteredUsers.length"
              layout="total, prev, pager, next"
              background
              small
            />
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import {
  countryCodeOptions,
  memberOptions,
  freeBenefitUsers as rawUsers,
  computeFreeBenefitMetrics,
  FREE_IMAGE_QUOTA,
  FREE_VIDEO_QUOTA,
} from '../mock/data.js'

const router = useRouter()

const loading = ref(false)
const loadError = ref(false)

const f = reactive({ uid: '', dateRange: null, country: '', benefitStatus: '', currentMember: '' })
const page = ref(1)
const pageSize = ref(20)

const benefitStatusOptions = [
  { label: '未使用', value: 'unused' },
  { label: '使用中', value: 'using' },
  { label: '全部用完', value: 'all_exhausted' },
]

/** 当前展示数据（模拟 fetch） */
const currentData = ref([...rawUsers])

const lastUpdateTime = ref('2026/8/5 14:30:20')

// ---- 过滤 ----
const filteredUsers = computed(() => {
  let list = [...currentData.value]

  // 按发放时间筛选
  if (f.dateRange && f.dateRange.length === 2) {
    const [start, end] = f.dateRange
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
    const e = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).getTime()
    list = list.filter((u) => u.grantTimeTs >= s && u.grantTimeTs <= e)
  }

  // 按国家筛选
  if (f.country) {
    list = list.filter((u) => u.country === f.country)
  }

  // 按用户 ID 筛选
  if (f.uid) {
    list = list.filter((u) => u.uid.includes(f.uid))
  }

  // 按权益使用状态筛选
  if (f.benefitStatus) {
    list = list.filter((u) => {
      const imgUsed = u.freeImageUsed >= FREE_IMAGE_QUOTA
      const vidUsed = u.freeVideoUsed >= FREE_VIDEO_QUOTA
      if (f.benefitStatus === 'all_exhausted') return imgUsed && vidUsed
      if (f.benefitStatus === 'unused') return u.freeImageUsed === 0 && u.freeVideoUsed === 0
      if (f.benefitStatus === 'using') return !(imgUsed && vidUsed) && !(u.freeImageUsed === 0 && u.freeVideoUsed === 0)
      return true
    })
  }

  // 按当前会员状态筛选
  if (f.currentMember) {
    list = list.filter((u) => u.currentMember === f.currentMember)
  }

  // 排序：最后使用时间倒序（非 null 在前），未使用按发放时间倒序
  list.sort((a, b) => {
    const aUsed = a.lastUsedTime ? a.lastUsedTime.ts : 0
    const bUsed = b.lastUsedTime ? b.lastUsedTime.ts : 0
    if (aUsed && bUsed) return bUsed - aUsed
    if (aUsed && !bUsed) return -1
    if (!aUsed && bUsed) return 1
    // both unused — by grant time desc
    return b.grantTimeTs - a.grantTimeTs
  })

  // 附加 benefitStatus
  return list.map((u) => {
    const imgUsed = u.freeImageUsed
    const vidUsed = u.freeVideoUsed
    let benefitStatus
    if (imgUsed >= FREE_IMAGE_QUOTA && vidUsed >= FREE_VIDEO_QUOTA) {
      benefitStatus = 'all_exhausted'
    } else if (imgUsed === 0 && vidUsed === 0) {
      benefitStatus = 'unused'
    } else {
      benefitStatus = 'using'
    }
    return { ...u, benefitStatus }
  })
})

// ---- 指标 ----
const metrics = computed(() =>
  computeFreeBenefitMetrics(filteredUsers.value, { country: '' }),
)

// ---- 分页 ----
const pagedUsers = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
})

// ---- 格式化 ----
function fmtNum(v) {
  if (v == null) return '0'
  return Number(v).toLocaleString()
}

function fmtRate(v) {
  if (v == null) return '-'
  return `${v.toFixed(1)}%`
}

// ---- 操作 ----
function fetchData() {
  loading.value = true
  loadError.value = false
  // 模拟异步请求
  setTimeout(() => {
    try {
      // 模拟 5% 概率失败
      if (Math.random() < 0.05) {
        loadError.value = true
      } else {
        currentData.value = [...rawUsers]
        // 模拟更新时间刷新
        const now = new Date()
        const y = now.getFullYear()
        const m = String(now.getMonth() + 1).padStart(2, '0')
        const d = String(now.getDate()).padStart(2, '0')
        const hh = String(now.getHours()).padStart(2, '0')
        const mm = String(now.getMinutes()).padStart(2, '0')
        const ss = String(now.getSeconds()).padStart(2, '0')
        lastUpdateTime.value = `${y}/${m}/${d} ${hh}:${mm}:${ss}`
      }
    } catch {
      loadError.value = true
    }
    page.value = 1
    loading.value = false
  }, 400)
}

function resetFilter() {
  f.uid = ''
  f.dateRange = null
  f.country = ''
  f.benefitStatus = ''
  f.currentMember = ''
  page.value = 1
  currentData.value = [...rawUsers]
}

function goToUsageDetail(row) {
  const params = {}
  if (row.uid) params.uid = row.uid
  params.member = row.currentMember
  sessionStorage.setItem('monitor-overview-filter', JSON.stringify(params))
  router.push('/aigc/tasks')
}
</script>

<style scoped>
.page-root { padding: 0; max-width: 100%; overflow-x: hidden; }
.page-head { background: #fff; padding: 20px 24px 0; border-bottom: 1px solid #EBEEF5; }
.page-title { font-size: 26px; font-weight: 600; color: #303133; margin-bottom: 14px; }

/* 筛选区 */
.filter-box { background: #fff; margin: 12px 24px; border: 1px solid #EBEEF5; border-radius: 2px; padding: 10px 16px; }
.filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
.filter-row:first-child { margin-top: 0; }
.filter-item { display: inline-flex; align-items: center; white-space: nowrap; }
.filter-label { font-size: 13px; color: #606266; margin-right: 6px; }

/* 说明文案 */
.hint-box { margin: 0 24px 8px; }
.hint-text { font-size: 13px; color: #606266; margin: 0 0 4px; }
.scope-text { font-size: 12px; color: #909399; margin: 0; }

/* 更新时间 */
.update-time-bar { margin: 0 24px 12px; font-size: 12px; color: #909399; }
.update-time-label { color: #909399; }
.update-time-value { color: #606266; }

/* 指标卡片 */
.metrics-box {
  display: flex;
  align-items: stretch;
  gap: 8px;
  margin: 0 24px 12px;
  background: #fff;
  border: 1px solid #EBEEF5;
  border-radius: 2px;
  border-left: 3px solid #E6A23C;
  padding: 14px 16px;
  flex-wrap: wrap;
}
.m-item {
  flex: 1 1 160px;
  min-width: 150px;
  text-align: center;
  padding: 12px 8px;
  background: #FCF8F2;
  border: 1px solid #F3E6D4;
  border-radius: 4px;
}
.m-label { font-size: 12px; color: #909399; margin-bottom: 4px; }
.m-value { font-size: 20px; font-weight: 600; color: #303133; }
.m-sub { margin-top: 4px; font-size: 12px; color: #A8ABB2; }

/* 表格 */
.table-panel { margin: 0 24px 24px; background: #fff; border: 1px solid #EBEEF5; border-radius: 2px; padding: 14px 18px; }
.panel-title { font-size: 14px; font-weight: 600; color: #303133; margin-bottom: 10px; }
.pager-row { display: flex; justify-content: flex-end; margin-top: 12px; }

/* 状态区块 */
.state-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: #fff;
  margin: 0 24px 12px;
  border: 1px solid #EBEEF5;
  border-radius: 2px;
  color: #909399;
  gap: 8px;
}
.state-text { font-size: 14px; }

.link { color: #409EFF; cursor: pointer; font-size: 13px; }
.link:hover { color: #66b1ff; }
</style>
