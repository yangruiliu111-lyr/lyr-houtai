<template>
  <div class="page-root">
    <!-- 标题 + Tab -->
    <div class="page-head">
      <h1 class="page-title">任务列表</h1>
    </div>

    <!-- 筛选区 -->
    <div class="filter-box">
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">任务 ID</span>
          <el-input v-model="f.taskId" placeholder="请输入" size="default" style="width:150px" clearable />
        </div>
        <div class="filter-item">
          <span class="filter-label">用户 ID</span>
          <el-input v-model="f.uid" placeholder="请输入" size="default" style="width:150px" clearable />
        </div>
        <div class="filter-item">
          <span class="filter-label">功能名称</span>
          <el-select v-model="f.funcName" placeholder="全部" size="default" style="width:170px" clearable>
            <el-option v-for="n in funcOptions" :key="n" :label="n" :value="n" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">执行状态</span>
          <el-select v-model="f.status" placeholder="全部" size="default" style="width:110px" clearable>
            <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
          </el-select>
        </div>
      </div>
      <div class="filter-row">
        <div class="filter-item">
          <span class="filter-label">创建时间</span>
          <el-date-picker v-model="f.dateRange" type="daterange" range-separator="至"
            start-placeholder="开始日期" end-placeholder="结束日期" size="default" style="width:240px" />
        </div>
        <div class="filter-item">
          <span class="filter-label">国家</span>
          <el-select v-model="f.country" placeholder="全部" size="default" style="width:100px" clearable>
            <el-option v-for="c in countryCodeOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </div>
        <div class="filter-item">
          <span class="filter-label">会员状态</span>
          <el-select v-model="f.member" placeholder="全部" size="default" style="width:110px" clearable>
            <el-option v-for="m in memberOptions" :key="m" :label="m" :value="m" />
          </el-select>
        </div>
        <el-button type="primary" size="default">查询</el-button>
        <el-button size="default" @click="resetFilter">重置</el-button>
      </div>
    </div>

    <!-- 表格区 -->
    <div class="table-area">
      <div class="table-scroll">
        <el-table :data="paged" stripe border size="default" class="task-table" max-height="550">
          <!-- 1. 基础信息 (fixed left) -->
          <el-table-column label="基础信息" width="230" fixed>
            <template #default="{row}">
              <div class="ci-box">
                <div class="ci-id">{{ row.id }}</div>
                <div class="ci-time">{{ row.createdAt }}</div>
                <div class="ci-uid">UID：{{ row.uid }} <span style="color:#c0c4cc">·</span> {{ row.member }}</div>
              </div>
            </template>
          </el-table-column>

          <!-- 2. 用户地区 (fixed left) -->
          <el-table-column label="用户地区" width="120" fixed>
            <template #default="{row}">
              <div class="cl-box">{{ formatRegion(row) }}</div>
            </template>
          </el-table-column>

          <!-- 3. 功能名称 -->
          <el-table-column label="功能名称" width="170">
            <template #default="{row}">
              <div class="cfn-box">
                <div class="cfn-name">{{ row.funcName }}</div>
                <div class="cfn-type">{{ row.taskType }}</div>
              </div>
            </template>
          </el-table-column>

          <!-- 4. 输入内容 -->
          <el-table-column label="输入内容" width="260">
            <template #default="{row}">
              <div class="cmedia-box" @click="openDetail(row)" style="cursor:pointer">
                <div class="cmedia-thumbs">
                  <template v-for="(m,i) in getInputMats(row)" :key="'in'+i">
                    <div v-if="m.type==='image'" class="thumb-i" :title="m.label">
                      <div class="thumb-placeholder">🖼</div>
                    </div>
                    <div v-else-if="m.type==='video'" class="thumb-v" :title="m.label">
                      <div class="thumb-placeholder">▶</div>
                      <span v-if="m.duration" class="v-dur">{{ m.duration }}</span>
                    </div>
                    <div v-else class="thumb-t" :title="m.label">{{ (m.label||'').slice(0, 28) }}{{ (m.label||'').length > 28 ? '...' : '' }}</div>
                  </template>
                </div>
                <div class="cmedia-summary">{{ row.inputContent?.summary }}</div>
              </div>
            </template>
          </el-table-column>

          <!-- 6. 输出结果 -->
          <el-table-column label="输出结果" width="260">
            <template #default="{row}">
              <div class="cmedia-box" @click="openDetail(row)" style="cursor:pointer">
                <template v-if="row.status==='success' && row.outputContent?.materials">
                  <div class="cmedia-thumbs">
                    <template v-for="(m,i) in row.outputContent.materials" :key="'o'+i">
                      <div v-if="m.type==='image'" class="thumb-o" :title="m.label">
                        <div class="thumb-placeholder">🖼</div>
                      </div>
                      <div v-else class="thumb-ov" :title="m.label">
                        <div class="thumb-placeholder">▶</div>
                        <span v-if="m.duration" class="v-dur">{{ m.duration }}</span>
                      </div>
                    </template>
                  </div>
                  <span class="compare-link" @click.stop="openCompare(row)">对比</span>
                </template>
                <template v-else-if="row.status==='success' && row.outputContent?.hooks">
                  <div class="out-text">
                    <div v-for="(h,i) in row.outputContent.hooks.slice(0,2)" :key="'h'+i" class="out-line">{{ h.slice(0, 32) }}{{ h.length > 32 ? '...' : '' }}</div>
                    <span v-if="row.outputContent.hooks.length > 2" class="plus">+{{ row.outputContent.hooks.length - 2 }}</span>
                  </div>
                </template>
                <template v-else-if="row.status==='success' && row.outputContent?.tags">
                  <div class="out-text">
                    <span>{{ row.outputContent.tags.slice(0,3).join(' ') }}</span>
                    <span v-if="row.outputContent.tags.length > 3" style="color:#909399;font-size:11px"> +{{ row.outputContent.tags.length - 3 }}</span>
                  </div>
                </template>
                <template v-else-if="row.status==='success' && row.outputContent?.type==='breakdown'">
                  <div class="out-text">
                    <div class="out-line">Hook · 节奏 · 镜头 · CTA</div>
                    <span style="font-size:10px;color:#909399">拆解报告</span>
                  </div>
                </template>
                <template v-else>
                  <span class="out-none">{{ row.outputDisplay }}</span>
                </template>
              </div>
            </template>
          </el-table-column>

          <!-- 7. 执行结果 -->
          <el-table-column label="执行结果" width="155">
            <template #default="{row}">
              <el-tag :type="stType(row.status)" size="small">{{ stLabel(row) }}</el-tag>
            </template>
          </el-table-column>

          <!-- 8. 任务耗时 -->
          <el-table-column label="任务耗时" width="90">
            <template #default="{row}">
              <span v-if="row.duration" class="dur">{{ fmtDur(row.duration) }}</span>
              <span v-else style="color:#c0c4cc">-</span>
            </template>
          </el-table-column>

          <!-- 9. 消耗豆数（与权益次数互斥） -->
          <el-table-column label="实际消耗豆数" width="100">
            <template #default="{row}">{{ formatConsumeValue(row.cost) }}</template>
          </el-table-column>

          <!-- 10. 消耗权益次数（0-1，与豆数互斥） -->
          <el-table-column label="消耗权益次数" width="110">
            <template #default="{row}">{{ formatConsumeValue(row.benefitQuotaCost) }}</template>
          </el-table-column>

          <!-- 11. 操作 -->
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{row}">
              <span class="detail-link" @click="openDetail(row)">查看详情</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pager-row">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="filtered.length"
          layout="total,prev,pager,next" background size="default" />
      </div>
    </div>

    <!-- ========== 详情弹窗 ========== -->
    <el-dialog v-model="dlg" title="任务详情" width="1050px" top="3vh">
      <template v-if="dlgTask">
        <!-- 1. 基础信息 -->
        <div class="dlg-section">基础信息</div>
        <el-descriptions :column="4" border size="small" style="margin-bottom:0">
          <el-descriptions-item label="任务 ID">{{ dlgTask.id }}</el-descriptions-item>
          <el-descriptions-item label="用户 ID">{{ dlgTask.uid }}</el-descriptions-item>
          <el-descriptions-item label="功能名称">{{ dlgTask.funcName }}</el-descriptions-item>
          <el-descriptions-item label="会员状态">{{ dlgTask.member }}</el-descriptions-item>
          <el-descriptions-item label="用户地区">{{ formatRegion(dlgTask) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ dlgTask.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="任务耗时">{{ dlgTask.duration?fmtDur(dlgTask.duration):'-' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 2. 完整输入内容 -->
        <div class="dlg-section">完整输入内容</div>
        <div class="media-gallery">
          <template v-for="(m, i) in (dlgTask.inputContent?.materials || [])" :key="'dlin'+i">
            <div v-if="m.type === 'image'" class="mg-card" @click="previewImg = i">
              <div class="mg-thumb" style="background:#ECF5FF;color:#409EFF">🖼</div>
              <div class="mg-label">{{ m.label }}</div>
            </div>
            <div v-else-if="m.type === 'video'" class="mg-card">
              <div class="mg-thumb" style="background:#FEF0F0;color:#F56C6C;position:relative">
                ▶<span class="mg-dur">{{ m.duration }}</span>
              </div>
              <div class="mg-label">{{ m.label }}</div>
            </div>
          </template>
          <div v-if="!dlgTask.inputContent?.materials?.length" style="color:#909399;font-size:13px">暂无输入素材</div>
        </div>
        <div v-if="dlgTask.inputContent?.fullText" class="text-block">
          <div class="text-block-label">完整文案 / Prompt</div>
          <pre class="text-block-content">{{ dlgTask.inputContent.fullText }}</pre>
        </div>

        <!-- 4. 完整输出结果 -->
        <div class="dlg-section">完整输出结果</div>
        <template v-if="dlgTask.status === 'success'">
          <!-- 素材输出 -->
          <div v-if="dlgTask.outputContent?.materials" class="media-gallery">
            <div v-for="(m, i) in dlgTask.outputContent.materials" :key="'dlo'+i" class="mg-card">
              <div v-if="m.type === 'image'" class="mg-thumb mg-thumb-out" style="background:#F0F9EB;color:#67C23A">🖼</div>
              <div v-else class="mg-thumb mg-thumb-out" style="background:#F0F9EB;color:#67C23A;position:relative">
                ▶<span class="mg-dur">{{ m.duration }}</span>
              </div>
              <div class="mg-label">{{ m.label }}</div>
            </div>
          </div>
          <!-- Hook 输出 -->
          <div v-if="dlgTask.outputContent?.hooks" class="text-list">
            <div v-for="(h, i) in dlgTask.outputContent.hooks" :key="'h'+i" class="text-row">{{ i + 1 }}. {{ h }}</div>
          </div>
          <!-- Hashtag 输出 -->
          <div v-if="dlgTask.outputContent?.tags" class="tags-wrap">
            <span v-for="(tag, i) in dlgTask.outputContent.tags" :key="'t'+i" class="tag-item">{{ tag }}</span>
          </div>
          <!-- 拆解报告 -->
          <div v-if="dlgTask.outputContent?.type === 'breakdown'" class="text-block">
            <div class="text-row"><b>Hook 分析</b>：{{ dlgTask.outputContent.hook }}</div>
            <div class="text-row"><b>节奏分析</b>：{{ dlgTask.outputContent.rhythm }}</div>
            <div class="text-row"><b>镜头语言</b>：{{ dlgTask.outputContent.shots }}</div>
            <div class="text-row"><b>CTA 策略</b>：{{ dlgTask.outputContent.cta }}</div>
            <div v-if="dlgTask.outputContent.fullText" class="text-block-content" style="margin-top:12px">{{ dlgTask.outputContent.fullText }}</div>
          </div>
        </template>
        <div v-else style="color:#909399;font-size:13px;padding:8px 0">{{ dlgTask.outputDisplay || '无输出' }}</div>

        <!-- 5. 任务生成状态与异常说明 -->
        <div class="dlg-section">任务生成状态与异常说明</div>
        <el-descriptions :column="2" border size="small" style="margin-bottom:0">
          <el-descriptions-item label="任务状态">
            <el-tag :type="stType(dlgTask.status)" size="small">{{ stLabel(dlgTask) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="任务耗时">{{ dlgTask.duration?fmtDur(dlgTask.duration):'-' }}</el-descriptions-item>
          <template v-if="dlgTask.failReason">
            <el-descriptions-item label="失败原因"><span style="color:#f56c6c">{{ dlgTask.failReason }}</span></el-descriptions-item>
            <el-descriptions-item label="错误码">{{ dlgTask.errorCode }}</el-descriptions-item>
          </template>
          <el-descriptions-item label="重试次数">0</el-descriptions-item>
          <el-descriptions-item label="扣费状态">{{ consumeStatusLabel(dlgTask) }}</el-descriptions-item>
        </el-descriptions>

        <!-- 6. 积分 / 权益信息（豆数与权益次数二选一） -->
        <div class="dlg-section">积分 / 权益信息</div>
        <el-descriptions :column="2" border size="small" style="margin-bottom:0">
          <el-descriptions-item label="实际消耗豆数">{{ formatConsumeValue(dlgTask.cost) }}</el-descriptions-item>
          <el-descriptions-item label="消耗权益次数">{{ formatConsumeValue(dlgTask.benefitQuotaCost) }}</el-descriptions-item>
          <el-descriptions-item label="扣费方式">{{ consumeModeLabel(dlgTask) }}</el-descriptions-item>
          <el-descriptions-item label="扣费状态">{{ consumeStatusLabel(dlgTask) }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <!-- ========== 对比弹窗 ========== -->
    <el-dialog v-model="cmpVisible" title="输入输出对比" width="900px" top="5vh">
      <div class="cmp-placeholder">
        <p style="text-align:center;color:#909399;padding:60px 0;font-size:14px">输入输出对比区域，后续接入已有对比组件。</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { tasks, funcOptions, statusOptions, countryCodeOptions, memberOptions } from '../mock/data.js'

const f = reactive({ taskId:'', uid:'', funcName:'', status:'', country:'', member:'', dateRange:null })

// 从数据概览跳转时读入筛选条件
onMounted(() => {
  try {
    const saved = sessionStorage.getItem('monitor-overview-filter')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.func) f.funcName = parsed.func
      if (parsed.status) f.status = parsed.status
      if (parsed.country) f.country = parsed.country
      if (parsed.member) f.member = parsed.member
      if (parsed.uid) f.uid = parsed.uid
      sessionStorage.removeItem('monitor-overview-filter')
    }
  } catch(e) {}
})
const page = ref(1), pageSize = ref(20)

const filtered = computed(() => tasks.filter(t => {
  if (f.taskId && !t.id.toLowerCase().includes(f.taskId.toLowerCase())) return false
  if (f.uid && !t.uid.includes(f.uid)) return false
  if (f.funcName && t.funcName !== f.funcName) return false
  if (f.status && t.status !== f.status) return false
  if (f.country && t.country !== f.country) return false
  if (f.member && t.member !== f.member) return false
  return true
}))

const paged = computed(() => {
  const s = (page.value-1)*pageSize.value
  return filtered.value.slice(s, s+pageSize.value)
})

function resetFilter() {
  Object.assign(f, { taskId:'', uid:'', funcName:'', status:'', country:'', member:'', dateRange:null })
}

function getInputMats(row) { return row.inputContent?.materials || [] }

function formatRegion(row) {
  const name = row?.country || '-'
  const code = row?.countryCode
  return code ? `${name} ${code}` : name
}

function paramsSummary(row) {
  const p = row.params || {}
  const parts = []
  if (p.ratio) parts.push(p.ratio)
  if (p.duration) parts.push(p.duration)
  if (p.resolution) parts.push(p.resolution)
  if (p.operation) parts.push(p.operation)
  if (p.analysis) parts.push(p.analysis)
  if (p.quality) parts.push(p.quality)
  if (p.platform) parts.push(p.platform)
  return parts.join(' · ') || ''
}

function stType(s) { return { success:'success', failed:'danger', blocked:'warning', timeout:'warning', external_model_failed:'danger' }[s]||'info' }
function stLabel(row) {
  if (row.status === 'success') return '成功'
  if (row.status === 'failed') return '失败：' + (row.failReason || '未知')
  if (row.status === 'blocked') return '拦截：' + (row.failReason || '内容审核')
  if (row.status === 'timeout') return '超时：超过 120 秒未返回'
  if (row.status === 'external_model_failed') return '外采模型失败：' + (row.failReason || '外采服务异常')
  return row.status
}
function fmtDur(ms) {
  if (!ms) return '-'
  if (ms >= 60000) return Math.floor(ms/60000)+'m'+Math.floor((ms%60000)/1000)+'s'
  return (ms/1000).toFixed(1)+'s'
}

/** 无消耗时展示 "-"，不展示 0。 */
function formatConsumeValue(value) {
  return value > 0 ? value : '-'
}

/** 成功任务只允许豆数或权益次数其一；失败任务两者均为 0。 */
function consumeModeLabel(task) {
  const beans = task?.cost || 0
  const quota = task?.benefitQuotaCost || 0
  if (beans > 0 && quota > 0) return '异常：同时消耗'
  if (quota > 0) return '权益次数'
  if (beans > 0) return '豆数'
  return '未消耗'
}

function consumeStatusLabel(task) {
  const beans = task?.cost || 0
  const quota = task?.benefitQuotaCost || 0
  if (beans > 0 && quota > 0) return '异常：同时扣费'
  if (quota > 0) return '已扣权益次数'
  if (beans > 0) return '已扣豆'
  if (task?.status === 'success') return '未扣费'
  return '无需退款'
}

const dlg = ref(false), dlgTask = ref(null), previewImg = ref(-1)
function openDetail(t) { dlgTask.value = t; previewImg.value = -1; dlg.value = true }

const cmpVisible = ref(false), cmpTask = ref(null)
function openCompare(t) { cmpTask.value = t; cmpVisible.value = true }

function formatKey(key) {
  return { ratio: '画幅比例', duration: '时长', resolution: '分辨率', mode: '功能模式', cardStyle: '卡片风格', effect: '特效', operation: '编辑操作', hookStyle: 'Hook 风格', count: '生成数量', platform: '目标平台', language: '语言', analysis: '分析类型', segments: '拆解片段数', quality: '质量' }[key] || key
}
</script>

<style scoped>
/* ===== 页面头部 ===== */
.page-root { padding: 0; max-width: 100%; overflow-x: hidden; }
.page-head { background: #fff; padding: 20px 24px 0; border-bottom: 1px solid #EBEEF5; }
.page-title { font-size: 26px; font-weight: 600; color: #303133; margin-bottom: 14px; }
/* ===== 筛选区 ===== */
.filter-box {
  background: #fff; margin: 12px 24px;
  border: 1px solid #EBEEF5; border-radius: 2px;
  padding: 10px 16px;
}
.filter-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.filter-row:first-child { margin-bottom: 6px; }
.filter-item { display: inline-flex; align-items: center; white-space: nowrap; }
.filter-label { font-size: 13px; color: #606266; margin-right: 6px; }

/* ===== 表格区 ===== */
.table-area { margin: 0 24px 24px; background: #fff; border: 1px solid #EBEEF5; border-radius: 2px; padding: 14px; }
.table-scroll { width: 100%; max-width: 100%; overflow-x: auto; overflow-y: hidden; }
.task-table { min-width: 1930px; }

.pager-row { display: flex; justify-content: flex-end; margin-top: 12px; }

/* ===== 基础信息 ===== */
.ci-box { font-size: 13px; line-height: 1.6; }
.ci-id { font-family: monospace; font-size: 12px; color: #303133; }
.ci-time { color: #909399; font-size: 12px; }
.ci-uid { color: #606266; font-size: 12px; }

/* ===== 地区 ===== */
.cl-box { font-size: 13px; line-height: 1.6; color: #303133; }

/* ===== 功能名称 ===== */
.cfn-box { line-height: 1.5; }
.cfn-name { font-size: 13px; color: #303133; }
.cfn-type { font-size: 11px; color: #909399; margin-top: 1px; }

/* ===== 模型 / 参数 ===== */
.cmp-box { font-size: 13px; line-height: 1.6; }
.cmp-detail { font-size: 11px; color: #909399; }

/* ===== 输入输出 ===== */
.cmedia-box { }
.cmedia-thumbs { display: flex; flex-wrap: wrap; gap: 6px; align-items: flex-start; }
.thumb-placeholder { font-size: 28px; line-height: 1; }

/* 输入缩略图：竖版 96×128 */
.thumb-i { width: 96px; height: 128px; background: #ECF5FF; color: #409EFF; border-radius: 3px; border: 1px solid #d9ecff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
.thumb-v { width: 96px; height: 128px; background: #FEF0F0; color: #F56C6C; border-radius: 3px; border: 1px solid #fde2e2; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; cursor: pointer; }
/* 输出缩略图：与输入同尺寸 96×128 */
.thumb-o { width: 96px; height: 128px; background: #F0F9EB; color: #67C23A; border-radius: 3px; border: 1px solid #e1f3d8; display: flex; align-items: center; justify-content: center; flex-shrink: 0; cursor: pointer; }
.thumb-ov { width: 96px; height: 128px; background: #F0F9EB; color: #67C23A; border-radius: 3px; border: 1px solid #e1f3d8; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0; cursor: pointer; }

.thumb-t { font-size: 12px; color: #606266; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: normal; line-height: 1.4; cursor: pointer; }
.v-dur { position: absolute; bottom: 3px; right: 3px; font-size: 10px; background: rgba(0,0,0,0.6); color: #fff; padding: 1px 4px; border-radius: 2px; font-weight: 500; }
.plus { font-size: 12px; color: #909399; font-weight: 600; cursor: pointer; }
.cmedia-summary { font-size: 11px; color: #909399; margin-top: 4px; }
.out-text { font-size: 12px; color: #606266; line-height: 1.5; cursor: pointer; }
.out-line { font-size: 11px; color: #606266; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; }
.out-none { font-size: 11px; color: #909399; }

.compare-link { display: inline-block; margin-top: 6px; padding: 3px 10px; color: #409EFF; cursor: pointer; font-size: 13px; background: #ECF5FF; border: 1px solid #b3d8ff; border-radius: 2px; }
.compare-link:hover { color: #fff; background: #409EFF; }
.out-none { color: #909399; font-size: 12px; }

.dur { font-size: 13px; font-family: monospace; color: #606266; }
.detail-link { color: #409EFF; cursor: pointer; font-size: 13px; }
.detail-link:hover { color: #66b1ff; }


/* ===== 详情弹窗 ===== */
.dlg-section { font-size: 14px; font-weight: 600; color: #303133; margin: 20px 0 8px; padding-bottom: 8px; border-bottom: 1px solid #EBEEF5; }
.dlg-section:first-child { margin-top: 0; }

/* 媒体宫格 */
.media-gallery { display: flex; flex-wrap: wrap; gap: 10px; padding: 8px 0; }
.mg-card { display: flex; flex-direction: column; align-items: center; cursor: default; }
.mg-card[clickable] { cursor: pointer; }
.mg-thumb { width: 90px; height: 68px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 24px; border: 1px solid #EBEEF5; flex-shrink: 0; position: relative; }
.mg-thumb-out { width: 110px; height: 82px; }
.mg-dur { position: absolute; bottom: 2px; right: 3px; font-size: 9px; background: rgba(0,0,0,0.55); color: #fff; padding: 0 3px; border-radius: 1px; }
.mg-label { font-size: 11px; color: #909399; margin-top: 4px; max-width: 110px; text-align: center; }

/* 文本块 */
.text-block { background: #F5F7FA; border: 1px solid #EBEEF5; border-radius: 3px; padding: 12px 16px; margin-top: 8px; }
.text-block-label { font-size: 12px; color: #909399; margin-bottom: 6px; font-weight: 600; }
.text-block-content { font-size: 13px; line-height: 1.7; color: #303133; white-space: pre-wrap; word-break: break-word; margin: 0; font-family: inherit; }

/* 文本列表 */
.text-list { padding: 4px 0; }
.text-row { font-size: 13px; line-height: 1.7; color: #303133; padding: 4px 0; border-bottom: 1px solid #F5F7FA; }

/* 标签墙 */
.tags-wrap { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 0; }
.tag-item { background: #F5F7FA; color: #606266; padding: 2px 10px; border-radius: 2px; font-size: 12px; border: 1px solid #EBEEF5; }
</style>
