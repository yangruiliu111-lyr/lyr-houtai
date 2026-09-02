<template>
  <div class="page-root">
    <div class="page-head"><h1 class="page-title">Workspace 快捷气泡</h1></div>

    <div class="page-body">
      <div class="info-bar">
        <span class="info-icon">i</span>
        <span>
          配置出现在「Generate everything」默认输入框上方的快捷气泡。标题与 Prompt 支持任意语言（由 Melcat 自动翻译）；
          App 图片必填；H5 媒体（图片 / 视频）可选。前台仅展示「正常 + 上线」的气泡。
        </span>
      </div>

      <div class="filter-bar">
        <div class="filter-row">
          <div class="filter-item">
            <span class="filter-label">关键词</span>
            <el-input v-model="f.keyword" placeholder="标题 / prompt / URL" clearable size="default" style="width:220px" />
          </div>
          <div class="filter-item">
            <span class="filter-label">状态</span>
            <el-select v-model="f.status" placeholder="全部" clearable size="default" style="width:110px">
              <el-option v-for="o in workspaceBubbleStatusOptions" :key="o.value" :label="o.label" :value="o.value" />
            </el-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">上线</span>
            <el-select v-model="f.online" placeholder="全部" clearable size="default" style="width:110px">
              <el-option label="上线" :value="true" />
              <el-option label="下线" :value="false" />
            </el-select>
          </div>
          <el-button type="primary" size="default">查询</el-button>
          <el-button size="default" @click="openCreate">新增</el-button>
        </div>
      </div>

      <div class="table-wrap">
        <el-table :data="pagedList" stripe border size="default" style="width:100%">
          <el-table-column prop="id" label="ID" width="70" />
          <el-table-column prop="sort" label="排序" width="70" />
          <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
          <el-table-column label="翻译预览" width="100">
            <template #default="s">
              <span class="link" @click="openTransPreview(s.row)">查看</span>
            </template>
          </el-table-column>
          <el-table-column label="App 图片" width="100">
            <template #default="s">
              <div v-if="s.row.appImageUrl" class="thumb app-thumb" :title="s.row.appImageUrl">🖼</div>
              <span v-else class="muted">—</span>
            </template>
          </el-table-column>
          <el-table-column label="H5 媒体" width="100">
            <template #default="s">
              <div
                v-if="s.row.h5MediaUrl"
                class="thumb"
                :class="s.row.h5MediaType === 'video' ? 'vid-thumb' : 'app-thumb'"
                :title="s.row.h5MediaUrl"
              >{{ s.row.h5MediaType === 'video' ? '▶' : '🖼' }}</div>
              <span v-else class="muted">—</span>
            </template>
          </el-table-column>
          <el-table-column prop="prompt" label="Prompt" min-width="220" show-overflow-tooltip />
          <el-table-column label="平台类型" width="100">
            <template #default="s">{{ s.row.platformType || '—' }}</template>
          </el-table-column>
          <el-table-column label="权益策略code" min-width="180" show-overflow-tooltip>
            <template #default="s">{{ s.row.rightsKey || '—' }}</template>
          </el-table-column>
          <el-table-column label="上线地区" width="110">
            <template #default="s">{{ (s.row.regions && s.row.regions.length) ? s.row.regions.join('、') : '—' }}</template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="s">
              <el-tag :type="s.row.status === 'normal' ? 'success' : 'info'" size="small" effect="light">
                {{ s.row.status === 'normal' ? '正常' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="上线" width="90">
            <template #default="s">
              <el-switch :model-value="!!s.row.online" @change="(v) => setOnline(s.row, v)" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="s">
              <span class="link" @click="openEdit(s.row)">编辑</span>
              <span class="link warn" @click="syncRelease(s.row)">同步Release</span>
              <span class="link danger" @click="removeRow(s.row)">删除</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="pager-row">
          <el-pagination
            v-model:current-page="page"
            :page-size="pageSize"
            :total="filtered.length"
            layout="total, prev, pager, next"
            background
            small
          />
        </div>
      </div>
    </div>

    <!-- 新增 / 编辑 -->
    <el-dialog
      v-model="dlgOpen"
      :title="dlgMode === 'create' ? '新增快捷气泡' : '编辑快捷气泡'"
      width="760px"
      top="5vh"
      destroy-on-close
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="bubble-form">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" maxlength="80" show-word-limit />
        </el-form-item>

        <el-form-item label="App 图片" prop="appImageUrl">
          <div class="upload-block">
            <div class="upload-row">
              <el-button type="primary" size="default" @click="triggerAppUpload">选取文件</el-button>
              <span class="hint">
                请上传 大小不超过 <em>10MB</em> 格式为 <em>png/jpg/jpeg/webp</em> 的文件
              </span>
              <input
                ref="appInput"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                style="display:none"
                @change="onAppUpload"
              />
            </div>
            <el-input v-model="form.appImageUrl" placeholder="上传后自动填入，也可手动粘贴 URL" />
            <div v-if="form.appImageUrl" class="preview-lg app-thumb">🖼</div>
          </div>
        </el-form-item>

        <el-form-item label="H5 媒体">
          <div class="upload-block">
            <div class="upload-row">
              <el-button type="primary" size="default" @click="triggerH5Upload">选取文件</el-button>
              <span class="hint">
                请上传 大小不超过 <em>50MB</em> 格式为 <em>png/jpg/jpeg/webp/mp4</em> 的文件
              </span>
              <input
                ref="h5Input"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,video/mp4"
                style="display:none"
                @change="onH5Upload"
              />
            </div>
            <div class="hint sub">可选；图片：png / jpg / jpeg / webp；视频：mp4 / webp。留空表示 H5 不单独配置</div>
            <el-input v-model="form.h5MediaUrl" placeholder="上传后自动填入，也可手动粘贴 URL" />
            <div v-if="form.h5MediaUrl" class="preview-lg" :class="form.h5MediaType === 'video' ? 'vid-thumb' : 'app-thumb'">
              {{ form.h5MediaType === 'video' ? '▶' : '🖼' }}
            </div>
          </div>
        </el-form-item>

        <el-form-item label="Prompt" prop="prompt">
          <el-input
            v-model="form.prompt"
            type="textarea"
            :rows="3"
            placeholder="请输入 Prompt"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="effect_id" prop="effectId">
          <el-input
            v-model="form.effectId"
            placeholder="例如 weave_flow_952"
            @blur="syncRightsFromEffect"
          />
        </el-form-item>

        <el-form-item label="平台类型" prop="platformType">
          <el-select v-model="form.platformType" placeholder="请选择平台类型" style="width:100%">
            <el-option v-for="p in workspaceBubblePlatformOptions" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>

        <el-form-item label="权益策略code" prop="rightsKey">
          <el-input v-model="form.rightsKey" placeholder="例如 vr.rights.weave.flow.952" />
        </el-form-item>

        <el-form-item label="上线地区" prop="regions">
          <el-select
            v-model="form.regions"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择上线地区"
            style="width:100%"
          >
            <el-option v-for="r in workspaceBubbleRegionOptions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>

        <el-form-item label="翻译预览">
          <div class="trans-box">
            <div class="trans-block">
              <div class="trans-title">标题</div>
              <div v-for="(v, k) in previewTitleTrans" :key="'t'+k" class="trans-row">
                <span class="trans-lang">{{ k }}</span>
                <span class="trans-val">{{ v }}</span>
              </div>
            </div>
            <div class="trans-block">
              <div class="trans-title">Prompt</div>
              <div v-for="(v, k) in previewPromptTrans" :key="'p'+k" class="trans-row">
                <span class="trans-lang">{{ k }}</span>
                <span class="trans-val">{{ v }}</span>
              </div>
            </div>
            <div class="trans-note">保存成功后列表会刷新最新翻译</div>
          </div>
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="999" />
          <span class="inline-hint">数值越小越靠前</span>
        </el-form-item>

        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio value="normal">正常</el-radio>
            <el-radio value="disabled">停用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="上线状态">
          <el-radio-group v-model="form.online">
            <el-radio :value="true">上线</el-radio>
            <el-radio :value="false">下线</el-radio>
          </el-radio-group>
          <div class="hint sub">前台仅展示「正常 + 上线」的气泡</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dlgOpen = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 列表翻译预览 -->
    <el-dialog v-model="transOpen" title="翻译预览" width="640px" destroy-on-close>
      <div v-if="transRow" class="trans-box">
        <div class="trans-block">
          <div class="trans-title">标题</div>
          <div v-for="(v, k) in (transRow.titleTrans || {})" :key="'lt'+k" class="trans-row">
            <span class="trans-lang">{{ k }}</span>
            <span class="trans-val">{{ v }}</span>
          </div>
        </div>
        <div class="trans-block">
          <div class="trans-title">Prompt</div>
          <div v-for="(v, k) in (transRow.promptTrans || {})" :key="'lp'+k" class="trans-row">
            <span class="trans-lang">{{ k }}</span>
            <span class="trans-val">{{ v }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  workspaceBubbles,
  workspaceBubbleStatusOptions,
  workspaceBubblePlatformOptions,
  workspaceBubbleRegionOptions,
  nextBubbleId,
  buildBubbleDraftTrans,
  buildRightsKeyFromEffectId,
} from '../mock/workspaceBubbles.js'

const list = ref(workspaceBubbles.map((row) => ({ ...row })))
const f = reactive({ keyword: '', status: '', online: null })
const page = ref(1)
const pageSize = ref(20)

const filtered = computed(() => {
  const kw = f.keyword.trim().toLowerCase()
  return [...list.value]
    .filter((row) => {
      if (kw) {
        const hay = `${row.title} ${row.prompt} ${row.appImageUrl} ${row.h5MediaUrl}`.toLowerCase()
        if (!hay.includes(kw)) return false
      }
      if (f.status && row.status !== f.status) return false
      if (f.online !== null && f.online !== '' && row.online !== f.online) return false
      return true
    })
    .sort((a, b) => (a.sort - b.sort) || (b.id - a.id))
})

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const dlgOpen = ref(false)
const dlgMode = ref('create')
const formRef = ref(null)
const editingId = ref(null)
const appInput = ref(null)
const h5Input = ref(null)

const form = reactive({
  title: '',
  appImageUrl: '',
  h5MediaUrl: '',
  h5MediaType: '',
  prompt: '',
  effectId: '',
  platformType: '',
  rightsKey: '',
  regions: ['全部国家'],
  sort: 0,
  status: 'normal',
  online: true,
  titleTrans: null,
  promptTrans: null,
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  appImageUrl: [{ required: true, message: '请上传 App 图片', trigger: 'change' }],
  prompt: [{ required: true, message: '请输入 Prompt', trigger: 'blur' }],
  // effect_id / 平台类型 / 权益策略code 为非必选
  regions: [{ type: 'array', required: true, min: 1, message: '请选择上线地区', trigger: 'change' }],
}

function syncRightsFromEffect() {
  const next = buildRightsKeyFromEffectId(form.effectId)
  if (next && (!form.rightsKey || form.rightsKey.startsWith('vr.rights.'))) {
    form.rightsKey = next
  }
}

const previewTitleTrans = computed(() => {
  if (form.titleTrans) return form.titleTrans
  return buildBubbleDraftTrans(form.title || '—', form.prompt || '—').titleTrans
})

const previewPromptTrans = computed(() => {
  if (form.promptTrans) return form.promptTrans
  return buildBubbleDraftTrans(form.title || '—', form.prompt || '—').promptTrans
})

function blankForm() {
  Object.assign(form, {
    title: '',
    appImageUrl: '',
    h5MediaUrl: '',
    h5MediaType: '',
    prompt: '',
    effectId: '',
    platformType: '',
    rightsKey: '',
    regions: ['全部国家'],
    sort: 0,
    status: 'normal',
    online: true,
    titleTrans: null,
    promptTrans: null,
  })
}

function openCreate() {
  dlgMode.value = 'create'
  editingId.value = null
  blankForm()
  dlgOpen.value = true
}

function openEdit(row) {
  dlgMode.value = 'edit'
  editingId.value = row.id
  Object.assign(form, {
    title: row.title,
    appImageUrl: row.appImageUrl,
    h5MediaUrl: row.h5MediaUrl || '',
    h5MediaType: row.h5MediaType || '',
    prompt: row.prompt,
    effectId: row.effectId || '',
    platformType: row.platformType || '',
    rightsKey: row.rightsKey || '',
    regions: [...(row.regions || ['全部国家'])],
    sort: row.sort ?? 0,
    status: row.status || 'normal',
    online: !!row.online,
    titleTrans: row.titleTrans || null,
    promptTrans: row.promptTrans || null,
  })
  dlgOpen.value = true
}

function isVideo(url = '', fileType = '') {
  return fileType.startsWith('video/') || /\.mp4($|\?)/i.test(url)
}

function triggerAppUpload() { appInput.value?.click() }
function triggerH5Upload() { h5Input.value?.click() }

function onAppUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    ElMessage.warning('App 图片大小不能超过 10MB')
    e.target.value = ''
    return
  }
  form.appImageUrl = `https://virash-storage-pre.stariidata.com/default/${Date.now().toString(16)}${file.name}`
  e.target.value = ''
}

function onH5Upload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.warning('H5 媒体大小不能超过 50MB')
    e.target.value = ''
    return
  }
  const url = `https://virash-storage-pre.stariidata.com/default/${Date.now().toString(16)}${file.name}`
  form.h5MediaUrl = url
  form.h5MediaType = isVideo(url, file.type) ? 'video' : 'image'
  e.target.value = ''
}

async function submitForm() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return

  const draft = buildBubbleDraftTrans(form.title.trim(), form.prompt.trim())
  const payload = {
    title: form.title.trim(),
    prompt: form.prompt.trim(),
    appImageUrl: form.appImageUrl.trim(),
    h5MediaUrl: form.h5MediaUrl.trim(),
    h5MediaType: form.h5MediaUrl
      ? (form.h5MediaType || (isVideo(form.h5MediaUrl) ? 'video' : 'image'))
      : '',
    effectId: form.effectId.trim(),
    platformType: form.platformType,
    rightsKey: form.rightsKey.trim(),
    regions: [...form.regions],
    sort: Number(form.sort) || 0,
    status: form.status,
    online: !!form.online,
    titleTrans: draft.titleTrans,
    promptTrans: draft.promptTrans,
    modifier: 'admin',
    modifyTime: new Date().toLocaleString('zh-CN'),
  }

  if (dlgMode.value === 'create') {
    list.value.unshift({ id: nextBubbleId(), ...payload })
  } else {
    const idx = list.value.findIndex((r) => r.id === editingId.value)
    if (idx >= 0) list.value[idx] = { ...list.value[idx], ...payload }
  }
  dlgOpen.value = false
  ElMessage.success('保存成功')
}

function setOnline(row, online) {
  row.online = online
  row.modifyTime = new Date().toLocaleString('zh-CN')
  ElMessage.success(online ? '已上线' : '已下线')
}

function syncRelease(row) {
  ElMessage.success(`已触发同步 Release：${row.title}`)
}

async function removeRow(row) {
  try {
    await ElMessageBox.confirm(`确认删除快捷气泡「${row.title}」？`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    list.value = list.value.filter((r) => r.id !== row.id)
    ElMessage.success('已删除')
  } catch {
    // cancelled
  }
}

const transOpen = ref(false)
const transRow = ref(null)
function openTransPreview(row) {
  transRow.value = row
  transOpen.value = true
}
</script>

<style scoped>
.page-root { padding: 0; max-width: 100%; overflow-x: hidden; }
.page-head { background: #fff; padding: 20px 24px 0; border-bottom: 1px solid #EBEEF5; }
.page-title { font-size: 26px; font-weight: 600; color: #303133; margin-bottom: 14px; }
.page-body { padding: 12px 24px 24px; }

.info-bar {
  display: flex; gap: 8px; align-items: flex-start;
  background: #F5F7FA; border: 1px solid #E4E7ED; border-radius: 2px;
  padding: 10px 14px; font-size: 12px; color: #909399; line-height: 1.7; margin-bottom: 12px;
}
.info-icon {
  width: 16px; height: 16px; border-radius: 50%; background: #909399; color: #fff;
  display: inline-flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; margin-top: 2px;
}

.filter-bar {
  background: #fff; border: 1px solid #EBEEF5; border-radius: 2px;
  padding: 10px 16px; margin-bottom: 12px;
}
.filter-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.filter-item { display: inline-flex; align-items: center; white-space: nowrap; }
.filter-label { font-size: 13px; color: #606266; margin-right: 6px; }

.table-wrap {
  background: #fff; border: 1px solid #EBEEF5; border-radius: 2px; padding: 14px 18px;
}
.pager-row { display: flex; justify-content: flex-end; margin-top: 12px; }

.link { color: #409EFF; cursor: pointer; font-size: 13px; margin-right: 10px; }
.link:hover { color: #66b1ff; }
.link.warn { color: #E6A23C; }
.link.warn:hover { color: #ebb563; }
.link.danger { color: #F56C6C; }
.link.danger:hover { color: #f78989; }
.muted { color: #c0c4cc; font-size: 12px; }

.thumb {
  width: 44px; height: 44px; border-radius: 3px; border: 1px solid #EBEEF5;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.app-thumb { background: #ECF5FF; color: #409EFF; }
.vid-thumb { background: #FEF0F0; color: #F56C6C; }

.bubble-form :deep(.el-form-item__label) { color: #606266; }
.upload-block { width: 100%; }
.upload-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
.hint { font-size: 12px; color: #909399; line-height: 1.5; }
.hint em { color: #F56C6C; font-style: normal; font-weight: 600; }
.hint.sub { margin: 0 0 8px; }
.inline-hint { margin-left: 10px; font-size: 12px; color: #909399; }
.preview-lg {
  margin-top: 10px; width: 120px; height: 120px; border-radius: 4px; border: 1px solid #DCDFE6;
  display: flex; align-items: center; justify-content: center; font-size: 28px;
}

.trans-box {
  width: 100%; background: #F5F7FA; border: 1px solid #E4E7ED; border-radius: 4px; padding: 12px 14px;
}
.trans-block + .trans-block { margin-top: 12px; }
.trans-title { font-size: 12px; font-weight: 600; color: #606266; margin-bottom: 6px; }
.trans-row { display: flex; gap: 10px; padding: 3px 0; font-size: 12px; line-height: 1.5; }
.trans-lang { width: 130px; flex-shrink: 0; color: #909399; }
.trans-val { color: #303133; word-break: break-word; }
.trans-note { margin-top: 10px; font-size: 12px; color: #A8ABB2; }
</style>
