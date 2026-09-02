<template>
  <div class="page-root">
    <div class="page-head"><h1 class="page-title">Sample Photo 库</h1></div>
    <div class="page-body">
      <div class="info-bar">管理 Sample Photo 素材库。支持上传、启用/禁用。</div>
      <div class="filter-bar">
        <div class="filter-row">
          <div class="filter-item"><span class="filter-label">状态</span>
            <el-select v-model="f.enabled" placeholder="全部" clearable size="default" style="width:100px">
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </div>
          <el-button type="primary" size="default">查询</el-button>
          <el-button size="default" @click="resetFilter">重置</el-button>
          <el-button type="primary" size="default" @click="triggerDirectUpload">新增图片</el-button>
          <input ref="directUploadInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" multiple style="display:none" @change="onDirectUpload" />
        </div>
      </div>

      <div class="table-wrap">
        <div class="table-scroll">
          <el-table :data="pagedList" stripe border size="default" class="sp-table" max-height="600">
            <el-table-column prop="id" label="ID" width="100" />
            <el-table-column label="图片缩略图" width="110">
              <template #default="s"><div class="sp-thumb" :title="s.row.id">🖼</div></template>
            </el-table-column>
            <el-table-column label="状态" width="80">
              <template #default="s">
                <el-tag :type="s.row.enabled ? 'success' : 'info'" size="small">{{ s.row.enabled ? '启用' : '禁用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="modifyTime" label="修改时间" width="150" />
            <el-table-column label="操作" width="90">
              <template #default="s">
                <span class="link" @click="toggleSp(s.row)">{{ s.row.enabled ? '禁用' : '启用' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="pager-row">
          <el-pagination v-model:current-page="page" :page-size="pageSize" :total="filtered.length" layout="total,prev,pager,next" background size="default" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { samplePhotos } from '../mock/data.js'

const STORAGE_KEY = 'virash-sample-photos-v2'
function load() { try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s) } catch(e) {} return samplePhotos.map(p => ({ ...p })) }
function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

const list = reactive(load())
const f = reactive({ enabled: null })
const page = ref(1), pageSize = ref(20)

const filtered = computed(() => list.filter(p => {
  if (f.enabled !== null && f.enabled !== '' && p.enabled !== f.enabled) return false
  return true
}))
const pagedList = computed(() => { const s = (page.value-1)*pageSize.value; return filtered.value.slice(s, s+pageSize.value) })

function resetFilter() { Object.assign(f, { enabled: null }) }

// 直接上传
const directUploadInput = ref(null)
function triggerDirectUpload() { directUploadInput.value?.click() }
function onDirectUpload(e) {
  const files = e.target.files
  if (!files || files.length === 0) return
  const now = nowStr()
  let count = 0
  for (const file of files) {
    if (file.size > 10*1024*1024) { ElMessage.warning(`${file.name} 大小超过 10MB，已跳过`); continue }
    const id = 'SP-' + Date.now().toString(36).toUpperCase().slice(-6) + '-' + (list.length + 1)
    list.unshift({ id, url: `https://example.com/sample/${file.name}`, enabled: true, modifyTime: now })
    count++
  }
  if (count > 0) { save(list); ElMessage.success(`上传 ${count} 张图片成功`) }
  e.target.value = ''
}

// 启用/禁用
function toggleSp(row) {
  const act = row.enabled ? '禁用' : '启用'
  ElMessageBox.confirm(`确认${act}该 Sample Photo？`, `确认${act}`, { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
    .then(() => {
      const idx = list.findIndex(p => p.id === row.id)
      if (idx !== -1) { list[idx].enabled = !list[idx].enabled; list[idx].modifyTime = nowStr(); save(list); ElMessage.success(`${act}成功`) }
    }).catch(() => {})
}

const nowStr = () => new Date().toLocaleString('zh-CN')
</script>

<style scoped>
.page-root { padding: 0; max-width: 100%; overflow-x: hidden; }
.page-head { background: #fff; padding: 20px 24px 0; border-bottom: 1px solid #EBEEF5; }
.page-title { font-size: 26px; font-weight: 600; color: #303133; margin-bottom: 14px; }
.page-body { margin: 16px 24px; }
.info-bar { background: #F5F7FA; border: 1px solid #E4E7ED; border-radius: 2px; padding: 10px 16px; font-size: 12px; color: #909399; margin-bottom: 12px; }
.filter-bar { margin-bottom: 12px; }
.filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.filter-item { display: inline-flex; align-items: center; white-space: nowrap; }
.filter-label { font-size: 13px; color: #606266; margin-right: 6px; }
.table-wrap { background: #fff; border: 1px solid #EBEEF5; border-radius: 2px; padding: 14px 18px; }
.table-scroll { width: 100%; overflow-x: auto; }
.sp-table { min-width: 500px; }
.sp-thumb { width: 72px; height: 96px; background: #ECF5FF; border: 1px solid #d9ecff; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.pager-row { display: flex; justify-content: flex-end; margin-top: 12px; }
.link { color: #409EFF; cursor: pointer; font-size: 13px; }
.link:hover { color: #66b1ff; }
</style>
