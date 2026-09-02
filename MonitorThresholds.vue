<template>
  <div class="page-root">
    <div class="page-head"><h1 class="page-title">功能阈值配置</h1></div>

    <div class="page-body">
      <!-- 说明 -->
      <div class="desc-text">配置不同前台功能的任务超时判定标准。当任务总耗时超过该功能对应的超时阈值时，任务生成状态将标记为"超时"。</div>

      <!-- 筛选区 + 新增按钮 -->
      <div class="top-bar">
        <div class="filter-row">
          <div class="filter-item"><span class="filter-label">功能名称</span>
            <el-select v-model="f.funcName" placeholder="全部" clearable size="default" style="width:170px">
              <el-option v-for="n in thresholdFuncOptions" :key="n" :label="n" :value="n" />
            </el-select>
          </div>
          <div class="filter-item"><span class="filter-label">功能类型</span>
            <el-select v-model="f.funcType" placeholder="全部" clearable size="default" style="width:160px">
              <el-option v-for="t in thresholdTypeOptions" :key="t" :label="t" :value="t" />
            </el-select>
          </div>
          <div class="filter-item"><span class="filter-label">状态</span>
            <el-select v-model="f.enabled" placeholder="全部" clearable size="default" style="width:110px">
              <el-option v-for="s in thresholdStatusOptions" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </div>
          <el-button type="primary" size="default">查询</el-button>
          <el-button size="default" @click="resetFilter">重置</el-button>
        </div>
      </div>

      <!-- 表格 -->
      <div class="table-wrap">
        <el-table :data="paged" stripe border size="default" style="width:100%;min-width:1100px" max-height="550">
          <el-table-column prop="funcName" label="功能名称" width="190" />
          <el-table-column prop="funcType" label="功能类型" width="150" />
          <el-table-column label="超时阈值" width="100">
            <template #default="s">{{ s.row.timeout }} 秒</template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="s">
              <el-tag :type="s.row.enabled ? 'success' : 'info'" size="small">{{ s.row.enabled ? '启用' : '停用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip>
            <template #default="s">
              <span v-if="s.row.remark" style="font-size:12px;color:#606266">{{ s.row.remark }}</span>
              <span v-else style="color:#c0c4cc">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="modifier" label="修改人" width="100" />
          <el-table-column prop="modifyTime" label="修改时间" width="160" />
          <el-table-column label="操作" width="150">
            <template #default="s">
              <span class="link" @click="openEdit(s.row)">编辑</span>
              <span class="link" style="margin-left:10px" @click="toggleEnable(s.row)">
                {{ s.row.enabled ? '停用' : '启用' }}
              </span>
            </template>
          </el-table-column>
        </el-table>
        <div class="pager-row">
          <el-pagination v-model:current-page="page" :page-size="pageSize" :total="list.length" layout="total,prev,pager,next" background size="default" />
        </div>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="dlgVisible" title="编辑阈值配置" width="520px">
      <el-form v-if="dlgForm" ref="formRef" :model="dlgForm" label-width="120px" size="default">
        <el-form-item label="功能名称">
          <el-input :model-value="dlgForm.funcName" disabled />
        </el-form-item>
        <el-form-item label="功能类型">
          <el-input :model-value="dlgForm.funcType || '—'" disabled />
        </el-form-item>
        <el-form-item label="超时阈值">
          <el-input-number v-model="dlgForm.timeout" :min="1" :step="5" :max="600" style="width:180px" />
          <span style="margin-left:8px;color:#909399;font-size:12px">秒</span>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dlgForm.enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dlgForm.remark" type="textarea" :rows="3" placeholder="填写备注说明" maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlgVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDlg">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { thresholdList, thresholdFuncOptions, thresholdTypeOptions, thresholdStatusOptions } from '../mock/data.js'

// localStorage 持久化
const STORAGE_KEY = 'virash-threshold-list-v3'
function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch (e) {}
  return thresholdList.map(t => ({ ...t }))
}
function saveData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

const list = reactive(loadData())

const f = reactive({ funcName: '', funcType: '', enabled: null })
const page = ref(1), pageSize = ref(20)

const filtered = computed(() => list.filter(t => {
  if (f.funcName && t.funcName !== f.funcName) return false
  if (f.funcType && t.funcType !== f.funcType) return false
  if (f.enabled !== null && f.enabled !== '' && t.enabled !== f.enabled) return false
  return true
}))
const paged = computed(() => {
  const s = (page.value - 1) * pageSize.value
  return filtered.value.slice(s, s + pageSize.value)
})
function resetFilter() { Object.assign(f, { funcName: '', funcType: '', enabled: null }) }

// 编辑
const dlgVisible = ref(false), dlgForm = ref(null), formRef = ref(null)

function openEdit(row) {
  dlgForm.value = reactive({ ...row })
  dlgVisible.value = true
}

function saveDlg() {
  if (!dlgForm.value.timeout || dlgForm.value.timeout < 1) { ElMessage.warning('超时阈值必须为正整数'); return }
  const now = new Date().toLocaleString('zh-CN')
  const idx = list.findIndex(t => t.id === dlgForm.value.id)
  if (idx !== -1) {
    Object.assign(list[idx], {
      timeout: dlgForm.value.timeout, enabled: dlgForm.value.enabled,
      remark: dlgForm.value.remark || '', modifier: 'admin', modifyTime: now,
    })
    ElMessage.success('阈值配置已保存')
  }
  saveData(list)
  dlgVisible.value = false
}

// 启用/停用
function toggleEnable(row) {
  const action = row.enabled ? '停用' : '启用'
  const tip = row.enabled
    ? '停用后，该功能将不再按当前阈值自动判定超时。确认停用吗？'
    : '启用后，该功能将按当前超时阈值进行超时判定。确认启用吗？'
  ElMessageBox.confirm(tip, `确认${action}`, { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
    .then(() => {
      const idx = list.findIndex(t => t.id === row.id)
      if (idx !== -1) {
        const now = new Date().toLocaleString('zh-CN')
        list[idx].enabled = !list[idx].enabled
        list[idx].modifier = 'admin'
        list[idx].modifyTime = now
        saveData(list)
        ElMessage.success(`${action}成功`)
      }
    })
    .catch(() => {})
}
</script>

<style scoped>
.page-root { padding: 0; max-width: 100%; overflow-x: hidden; }
.page-head { background: #fff; padding: 20px 24px 0; border-bottom: 1px solid #EBEEF5; }
.page-title { font-size: 26px; font-weight: 600; color: #303133; margin-bottom: 14px; }
.page-body { margin: 16px 24px; }
.desc-text { font-size: 13px; color: #909399; margin-bottom: 12px; line-height: 1.6; }

.top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.filter-item { display: inline-flex; align-items: center; white-space: nowrap; }
.filter-label { font-size: 13px; color: #606266; margin-right: 6px; }

.table-wrap { background: #fff; border: 1px solid #EBEEF5; border-radius: 2px; padding: 14px 18px; }
.pager-row { display: flex; justify-content: flex-end; margin-top: 12px; }

.link { color: #409EFF; cursor: pointer; font-size: 13px; }
.link:hover { color: #66b1ff; }
</style>
