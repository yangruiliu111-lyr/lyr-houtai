<template>
  <div class="page-root">
    <div class="page-head"><h1 class="page-title">Homepage 功能卡片</h1></div>

    <div class="page-body">
      <div class="info-bar">配置 Homepage 首页功能卡片。后台支持配置多张功能卡，前端仅展示启用状态下排序前 5 张卡片。字体、颜色、按钮样式由前端固定，后台仅配置文案参数、媒体资源、排序、上线地区、按钮状态和跳转目标。翻译为异步处理，保存后自动创建翻译任务。</div>

      <div class="filter-bar">
        <div class="filter-row">
          <div class="filter-item"><span class="filter-label">ID</span>
            <el-input v-model="f.keyword" placeholder="请输入 ID" clearable size="default" style="width:160px" />
          </div>
          <div class="filter-item"><span class="filter-label">上线地区</span>
            <el-select v-model="f.region" placeholder="全部" clearable size="default" style="width:130px">
              <el-option v-for="r in homepageRegionOptions" :key="r" :label="r" :value="r" />
            </el-select>
          </div>
          <div class="filter-item"><span class="filter-label">上线状态</span>
            <el-select v-model="f.enabled" placeholder="全部" clearable size="default" style="width:100px">
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </div>
          <div class="filter-item"><span class="filter-label">绑定功能</span>
            <el-select v-model="f.jumpTarget" placeholder="全部" clearable size="default" style="width:170px">
              <el-option v-for="t in onlineFeatures" :key="t" :label="t" :value="t" />
            </el-select>
          </div>
          <el-button type="primary" size="default">查询</el-button>
          <el-button size="default" @click="resetFilter">重置</el-button>
          <el-button type="primary" size="default" @click="openAdd">新增</el-button>
          <el-button size="default" @click="openSortDialog">排序</el-button>
          <span class="enabled-tip">已启用 {{ enabledCount }} 张</span>
          <span v-if="enabledCount > 5" class="over-limit-tip">当前启用卡片超过 5 张，前端仅展示排序前 5 张</span>
        </div>
      </div>

      <div class="table-wrap">
        <div class="table-scroll">
          <el-table :data="pagedList" stripe border size="default" class="cards-table" max-height="600">
            <el-table-column label="基础信息" min-width="240">
              <template #default="s">
                <div style="display:flex;align-items:flex-start;gap:10px">
                  <div v-if="s.row.webMediaUrl" class="mini-preview" :class="s.row.webMediaType==='video'?'prev-vid':'prev-img'" :title="s.row.webMediaUrl" style="flex-shrink:0">
                    {{ s.row.webMediaType === 'video' ? '▶' : '🖼' }}
                  </div>
                  <div v-else class="mini-preview" style="background:#f5f7fa;color:#c0c4cc;flex-shrink:0">—</div>
                  <div style="min-width:0;flex:1">
                    <div style="font-size:12px;color:#909399;margin-bottom:2px">ID: {{ s.row.id }}</div>
                    <div style="font-size:13px;color:#303133;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ s.row.titleCn }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="展示顺序" width="80">
              <template #default="s">{{ s.row.enabled ? s.row.sort : '—' }}</template>
            </el-table-column>
            <el-table-column prop="descCn" label="描述" width="180" show-overflow-tooltip />
            <!-- 翻译状态 -->
            <el-table-column label="翻译状态" width="120">
              <template #default="s">
                <div style="display:flex;align-items:center;gap:4px">
                  <el-tag :type="transStatusTag(s.row.transStatus)" size="small">{{ transStatusLabel(s.row.transStatus) }}</el-tag>
                  <span v-if="s.row.transStatus==='translated'" class="link" style="font-size:11px" @click.stop="openTransPreview(s.row)">查看</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="上线地区" width="120">
              <template #default="s">{{ (s.row.regions||[]).join('、') }}</template>
            </el-table-column>
            <el-table-column label="绑定功能" width="170" show-overflow-tooltip>
              <template #default="s">{{ s.row.jumpTarget || '—' }}</template>
            </el-table-column>
            <el-table-column label="上线状态" width="100">
              <template #default="s">
                <el-tag :type="s.row.enabled?'success':'info'" size="small">{{ s.row.enabled ? '启用' : '禁用' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="modifier" label="修改人" width="100" />
            <el-table-column prop="modifyTime" label="修改时间" width="160" />
            <el-table-column label="操作" width="160">
              <template #default="s">
                <span class="link" @click="openEdit(s.row)">编辑</span>
                <span class="link" style="margin-left:8px" @click="toggleCard(s.row)">{{ s.row.enabled ? '禁用' : '启用' }}</span>
                <span class="link" style="margin-left:8px" @click="copyCard(s.row)">复制</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="pager-row">
          <el-pagination v-model:current-page="page" :page-size="pageSize" :total="filtered.length" layout="total,prev,pager,next" background size="default" />
        </div>
      </div>
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dlgVisible" :title="isAdd ? '新增 Homepage 功能卡片' : '编辑 Homepage 功能卡片'" width="720px" top="3vh">
      <el-form v-if="dlgForm" :model="dlgForm" :rules="dlgRules" label-width="80px" size="default">
        <el-form-item label="标题" prop="titleCn" style="width:100%">
          <div style="width:100%">
            <el-input v-model="dlgForm.titleCn" placeholder="卡片标题（中文或英文均可）" style="width:100%" />
            <div v-if="dlgForm.transStatus==='translated' && dlgForm.titleTrans" class="trans-preview" style="margin-top:8px">
              <div class="trans-title">翻译结果</div>
              <div v-for="(v, k) in dlgForm.titleTrans" :key="'het'+k" class="trans-row"><span class="trans-lang">{{ k }}</span><span class="trans-val">{{ v }}</span></div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="描述" prop="descCn" style="width:100%">
          <div style="width:100%">
            <el-input v-model="dlgForm.descCn" placeholder="卡片描述（中文或英文均可）" style="width:100%" />
            <div v-if="dlgForm.transStatus==='translated' && dlgForm.descTrans" class="trans-preview" style="margin-top:8px">
              <div class="trans-title">翻译结果</div>
              <div v-for="(v, k) in dlgForm.descTrans" :key="'hed'+k" class="trans-row"><span class="trans-lang">{{ k }}</span><span class="trans-val">{{ v }}</span></div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="Web 媒体" prop="webMediaUrl">
          <div style="width:100%">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
              <el-button type="primary" size="default" @click="triggerUpload">选择文件</el-button>
              <span style="font-size:12px;color:#909399">请上传 大小不超过 50MB 格式为 png / jpeg / jpg / webp / mp4 的文件</span>
              <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,video/mp4" style="display:none" @change="onFileChange" />
            </div>
            <div style="font-size:11px;color:#909399;margin-bottom:8px">图片：png / jpeg / jpg / webp；视频：mp4 / webp（mp4 识别为视频，其余按图片处理）</div>
            <el-input v-model="dlgForm.webMediaUrl" placeholder="上传后自动填入，也可手动粘贴 URL" />
            <div v-if="dlgForm.webMediaUrl" style="margin-top:10px">
              <div v-if="isVideoUrl(dlgForm.webMediaUrl)" class="web-preview web-preview-vid">▶</div>
              <div v-else class="web-preview web-preview-img">🖼</div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="上线地区" prop="regions">
          <el-select v-model="dlgForm.regions" multiple placeholder="请选择上线地区" style="width:100%">
            <el-option v-for="r in homepageRegionOptions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="绑定功能" prop="jumpTarget">
          <el-select v-model="dlgForm.jumpTarget" placeholder="请选择绑定功能" style="width:100%">
            <el-option v-for="t in onlineFeatures" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="上线状态">
          <el-radio-group v-model="dlgForm.enabled">
            <el-radio :value="true">启用</el-radio>
            <el-radio :value="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlgVisible = false">取消</el-button>
        <el-button type="primary" @click="saveDlg">保存</el-button>
      </template>
    </el-dialog>

    <!-- 排序弹窗 -->
    <el-dialog v-model="sortVisible" title="功能卡片排序" width="860px" top="5vh">
      <div v-if="sortCards.length === 0" class="sort-empty">暂无已上架功能卡片，请先启用功能卡片后再进行排序。</div>
      <template v-else>
        <div v-if="sortCards.length > 5" class="sort-hint"><span style="color:#67C23A">●</span> 前 5 张将在前端展示 &nbsp;&nbsp; <span style="color:#909399">●</span> 第 6 张及之后暂不展示</div>
        <div class="sort-grid">
          <div v-for="(card, i) in sortCards" :key="card.id" class="sort-card" :class="{ 'sort-card-visible': i < 5, 'sort-card-hidden': i >= 5 }" draggable="true" @dragstart="onDragStart(i, $event)" @dragover.prevent="onDragOver(i, $event)" @dragend="onDragEnd" @drop.prevent="onDrop(i)">
            <div class="sort-card-num">{{ i + 1 }}</div>
            <div class="sort-card-preview" :class="card.webMediaType==='video'?'prev-vid':'prev-img'">{{ card.webMediaType === 'video' ? '▶' : '🖼' }}</div>
            <div class="sort-card-title">{{ card.titleCn }}</div>
            <div class="sort-card-tag"><span v-if="i < 5" style="color:#67C23A;font-size:11px">前端展示</span><span v-else style="color:#909399;font-size:11px">暂不展示</span></div>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button @click="cancelSort">取消</el-button>
        <el-button type="primary" @click="saveSort" :disabled="sortCards.length === 0">保存排序</el-button>
      </template>
    </el-dialog>

    <!-- 翻译预览弹窗 -->
    <el-dialog v-model="transVisible" title="翻译预览" width="580px" top="8vh">
      <template v-if="transRow">
        <div style="margin-bottom:16px">
          <div class="trans-title">标题翻译</div>
          <div v-if="transRow.titleTrans" class="trans-preview" style="margin-top:6px">
            <div v-for="(v, k) in transRow.titleTrans" :key="'ttv'+k" class="trans-row"><span class="trans-lang">{{ k }}</span><span class="trans-val">{{ v }}</span></div>
          </div>
          <div v-else style="color:#c0c4cc;font-size:12px;padding:8px 0">暂未翻译</div>
        </div>
        <div>
          <div class="trans-title">描述翻译</div>
          <div v-if="transRow.descTrans" class="trans-preview" style="margin-top:6px">
            <div v-for="(v, k) in transRow.descTrans" :key="'tdv'+k" class="trans-row"><span class="trans-lang">{{ k }}</span><span class="trans-val">{{ v }}</span></div>
          </div>
          <div v-else style="color:#c0c4cc;font-size:12px;padding:8px 0">暂未翻译</div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { homepageCards, homepageRegionOptions, homepageJumpTargets } from '../mock/data.js'

const STORAGE_KEY = 'virash-homepage-cards-v7'
function load() { return homepageCards.map(c => ({ ...c })) }
function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

const list = reactive(load())
const onlineFeatures = ['Generate everything', 'Recreate Vid', 'Clone ID', 'URL to Vid']

const sortedList = computed(() => [...list].sort((a, b) => {
  if (a.enabled && !b.enabled) return -1
  if (!a.enabled && b.enabled) return 1
  if (a.enabled) return a.sort - b.sort
  const ta = a.modifyTime || '', tb = b.modifyTime || ''
  return tb.localeCompare(ta)
}))

const f = reactive({ keyword: '', region: '', enabled: null, jumpTarget: '' })
const page = ref(1), pageSize = ref(20)

const filtered = computed(() => sortedList.value.filter(c => {
  if (f.keyword && !String(c.id).includes(f.keyword.toLowerCase())) return false
  if (f.region && !(c.regions||[]).includes(f.region)) return false
  if (f.enabled !== null && f.enabled !== '' && c.enabled !== f.enabled) return false
  if (f.jumpTarget && c.jumpTarget !== f.jumpTarget) return false
  return true
}))
const pagedList = computed(() => { const s = (page.value-1)*pageSize.value; return filtered.value.slice(s, s+pageSize.value) })
const enabledCount = computed(() => list.filter(c => c.enabled).length)

function resetFilter() { Object.assign(f, { keyword: '', region: '', enabled: null, jumpTarget: '' }) }

// ===== 翻译状态 =====
function transStatusTag(s) { return { pending:'info', translating:'', completed:'success', translated:'success', failed:'danger' }[s] || 'info' }
function transStatusLabel(s) { return { pending:'待翻译', translating:'翻译中', completed:'翻译成功', translated:'已翻译', failed:'翻译失败' }[s] || '待翻译' }

// ===== 新增/编辑 =====
const dlgVisible = ref(false), isAdd = ref(false), dlgForm = ref(null)
const dlgRules = {
  titleCn: [{ required: true, message: '请输入中文标题' }],
  descCn: [{ required: true, message: '请输入中文描述' }],
  webMediaUrl: [{ required: true, message: '请填写 Web 媒体 URL' }],
  regions: [{ required: true, message: '请选择至少一个地区', trigger: 'change' }],
  jumpTarget: [{ required: true, message: '请选择跳转目标' }],
}

const detectType = url => url && (url.endsWith('.mp4') || url.includes('mp4')) ? 'video' : 'image'
const isVideoUrl = url => url && (url.endsWith('.mp4') || url.includes('mp4'))

// 翻译变更追踪（titleCn/descCn 变化时重置翻译状态）
let origTitleCn = '', origDescCn = ''

const fileInput = ref(null)
function triggerUpload() { fileInput.value?.click() }
function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 50 * 1024 * 1024) { ElMessage.warning('文件大小不能超过 50MB'); return }
  const fakeUrl = `https://example.com/uploads/${file.name}`
  if (dlgForm.value) { dlgForm.value.webMediaUrl = fakeUrl; dlgForm.value.webMediaType = detectType(fakeUrl) }
}
const nowStr = () => new Date().toLocaleString('zh-CN')

function openAdd() {
  isAdd.value = true
  const maxSort = Math.max(0, ...list.map(c => c.sort))
  dlgForm.value = reactive({ id: 0, titleCn: '', descCn: '', titleTrans: null, descTrans: null, webMediaUrl: '', webMediaType: 'image', sort: maxSort + 1, regions: ['全球'], jumpTarget: '', enabled: false })
  origTitleCn = ''; origDescCn = ''
  dlgVisible.value = true
}

function openEdit(row) {
  isAdd.value = false
  dlgForm.value = reactive({ ...row, regions: [...(row.regions||[])] })
  origTitleCn = row.titleCn || ''; origDescCn = row.descCn || ''
  dlgVisible.value = true
}

function saveDlg() {
  if (!dlgForm.value.titleCn) { ElMessage.warning('请输入中文标题'); return }
  if (!dlgForm.value.descCn) { ElMessage.warning('请输入中文描述'); return }
  if (!dlgForm.value.webMediaUrl) { ElMessage.warning('请填写 Web 媒体 URL'); return }
  if (!dlgForm.value.regions || dlgForm.value.regions.length === 0) { ElMessage.warning('请选择上线地区'); return }
  if (!dlgForm.value.jumpTarget) { ElMessage.warning('请选择跳转目标'); return }

  const time = nowStr()
  const cardId = isAdd.value ? (Math.max(0, ...list.map(c => c.id)) + 1) : dlgForm.value.id

  // 检查中文内容是否变化，决定是否重置翻译状态
  const titleChanged = isAdd.value || dlgForm.value.titleCn !== origTitleCn
  const descChanged = isAdd.value || dlgForm.value.descCn !== origDescCn
  const transStatus = (titleChanged || descChanged) ? 'pending' : (dlgForm.value.transStatus || 'pending')

  const base = {
    titleCn: dlgForm.value.titleCn, descCn: dlgForm.value.descCn,
    titleKey: autoMekey('title', cardId), descKey: autoMekey('desc', cardId),
    titleTrans: dlgForm.value.titleTrans || null, descTrans: dlgForm.value.descTrans || null,
    transStatus,
    webMediaUrl: dlgForm.value.webMediaUrl, webMediaType: detectType(dlgForm.value.webMediaUrl),
    regions: [...dlgForm.value.regions], jumpTarget: dlgForm.value.jumpTarget || '',
    enabled: dlgForm.value.enabled, modifier: 'admin', modifyTime: time,
  }

  if (isAdd.value) {
    list.push({ id: cardId, sort: dlgForm.value.sort, ...base })
    ElMessage.success('新增成功，翻译任务已创建')
  } else {
    const idx = list.findIndex(c => c.id === dlgForm.value.id)
    if (idx !== -1) { Object.assign(list[idx], { sort: dlgForm.value.sort, ...base }); ElMessage.success(titleChanged||descChanged ? '保存成功，翻译任务已创建' : '保存成功') }
  }
  save(list)
  dlgVisible.value = false
}

function autoMekey(field, id) { return id ? `homepage.featurecard.${id}.${field}` : '' }

function copyCard(row) {
  const maxSort = Math.max(0, ...list.map(c => c.sort))
  const newId = Math.max(0, ...list.map(c => c.id)) + 1
  const copy = { ...row, id: newId, sort: maxSort + 1, enabled: false, titleCn: row.titleCn + '(副本)', descCn: row.descCn + '(副本)', titleKey: autoMekey('title', newId), descKey: autoMekey('desc', newId), transStatus: 'pending', modifier: 'admin', modifyTime: nowStr() }
  list.push(copy); save(list); ElMessage.success('已复制')
}

// ===== 启用/禁用 =====
function reindexEnabled() {
  const enabledCards = list.filter(c => c.enabled).sort((a, b) => a.sort - b.sort)
  enabledCards.forEach((c, i) => { c.sort = i + 1 })
}

function toggleCard(row) {
  const act = row.enabled ? '禁用' : '启用'
  const tip = row.enabled ? '确认禁用后，该 Homepage 功能卡片将不再在前端展示，确认禁用吗？' : '确认启用后，该 Homepage 功能卡片将按当前配置在前端展示，确认启用吗？'
  ElMessageBox.confirm(tip, `确认${act}`, { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
    .then(() => {
      const idx = list.findIndex(c => c.id === row.id)
      if (idx !== -1) {
        const card = list[idx]
        if (!card.enabled) { const maxSort = Math.max(0, ...list.filter(c => c.enabled).map(c => c.sort)); card.sort = maxSort + 1 }
        card.enabled = !card.enabled; card.modifier = 'admin'; card.modifyTime = nowStr()
        if (!card.enabled) reindexEnabled()
        save(list); ElMessage.success(`${act}成功`)
      }
    }).catch(() => {})
}

// ===== 排序弹窗 =====
const sortVisible = ref(false), sortCards = ref([])
let dragIdx = -1

function openSortDialog() {
  const enabled = list.filter(c => c.enabled).sort((a, b) => a.sort - b.sort)
  sortCards.value = enabled.length === 0 ? [] : enabled.map(c => ({ ...c }))
  sortVisible.value = true
}

function onDragStart(i, e) { dragIdx = i; e.dataTransfer.effectAllowed = 'move' }
function onDragOver(i, e) { e.dataTransfer.dropEffect = 'move'; e.currentTarget.style.transform = 'scale(1.03)' }
function onDragEnd(e) { dragIdx = -1; document.querySelectorAll('.sort-card').forEach(el => el.style.transform = '') }
function onDrop(i) { if (dragIdx < 0 || dragIdx === i) return; const item = sortCards.value.splice(dragIdx, 1)[0]; sortCards.value.splice(i, 0, item); dragIdx = -1 }
function cancelSort() { sortVisible.value = false }

function saveSort() {
  sortCards.value.forEach((c, i) => { const idx = list.findIndex(orig => orig.id === c.id); if (idx !== -1) { list[idx].sort = i + 1; list[idx].modifier = 'admin'; list[idx].modifyTime = nowStr() } })
  save(list); sortVisible.value = false; ElMessage.success('排序已保存')
}

const transVisible = ref(false), transRow = ref(null)
function openTransPreview(row) { transRow.value = row; transVisible.value = true }
</script>

<style scoped>
.page-root { padding: 0; max-width: 100%; overflow-x: hidden; }
.page-head { background: #fff; padding: 20px 24px 0; border-bottom: 1px solid #EBEEF5; }
.page-title { font-size: 26px; font-weight: 600; color: #303133; margin-bottom: 14px; }
.page-body { margin: 16px 24px; }
.info-bar { background: #F5F7FA; border: 1px solid #E4E7ED; border-radius: 2px; padding: 10px 16px; font-size: 12px; color: #909399; line-height: 1.8; margin-bottom: 12px; }
.filter-bar { margin-bottom: 12px; }
.filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.filter-item { display: inline-flex; align-items: center; white-space: nowrap; }
.filter-label { font-size: 13px; color: #606266; margin-right: 6px; }
.enabled-tip { margin-left: auto; font-size: 13px; color: #909399; }
.over-limit-tip { width: 100%; font-size: 12px; color: #E6A23C; margin-top: 4px; }
.table-wrap { background: #fff; border: 1px solid #EBEEF5; border-radius: 2px; padding: 14px 18px; }
.table-scroll { width: 100%; overflow-x: auto; }
.cards-table { min-width: 1550px; }
.pager-row { display: flex; justify-content: flex-end; margin-top: 12px; }
.mini-preview { width: 54px; height: 96px; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 1px solid #EBEEF5; }
.prev-img { background: #ECF5FF; color: #409EFF; }
.prev-vid { background: #FEF0F0; color: #F56C6C; }
.web-preview { width: 120px; height: 213px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 32px; border: 1px solid #DCDFE6; }
.web-preview-img { background: #ECF5FF; color: #409EFF; }
.web-preview-vid { background: #FEF0F0; color: #F56C6C; }
.trans-preview { margin-top: 10px; background: #F5F7FA; border: 1px solid #E4E7ED; border-radius: 3px; padding: 10px 14px; }
.trans-title { font-size: 12px; font-weight: 600; color: #606266; margin-bottom: 6px; }
.trans-row { display: flex; padding: 3px 0; font-size: 12px; line-height: 1.5; }
.trans-lang { color: #909399; width: 120px; flex-shrink: 0; }
.trans-val { color: #303133; }
.pop-trans-title { font-size: 12px; font-weight: 600; color: #606266; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #EBEEF5; }
.sort-empty { text-align: center; padding: 60px 0; color: #909399; font-size: 14px; }
.sort-hint { font-size: 12px; color: #606266; margin-bottom: 16px; padding: 8px 12px; background: #F5F7FA; border-radius: 2px; }
.sort-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
.sort-card { padding: 12px; background: #fff; border: 1px solid #EBEEF5; border-radius: 3px; cursor: grab; transition: all 0.15s; display: flex; flex-direction: column; align-items: center; gap: 6px; user-select: none; }
.sort-card:active { cursor: grabbing; }
.sort-card:hover { border-color: #409EFF; box-shadow: 0 2px 8px rgba(64,158,255,0.12); }
.sort-card-visible { background: #fff; }
.sort-card-hidden { background: #FAFAFA; opacity: 0.7; }
.sort-card-num { font-size: 12px; color: #909399; font-weight: 600; }
.sort-card-preview { width: 120px; height: 213px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 28px; border: 1px solid #EBEEF5; }
.sort-card-title { font-size: 13px; color: #303133; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
.sort-card-tag { font-size: 11px; }
.link { color: #409EFF; cursor: pointer; font-size: 13px; }
.link:hover { color: #66b1ff; }
</style>
