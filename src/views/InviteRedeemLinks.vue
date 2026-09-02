<template>
  <div class="page-root">
    <div class="page-head"><h1 class="page-title">邀请码兑换</h1></div>

    <div class="page-body">
      <div class="info-bar">
        配置邀请注册链接与兑换权益。链接拼接内容需全局唯一；结束时间可不填（代表长期有效）。权益可配置为积分或会员。
      </div>

      <div class="filter-bar">
        <div class="filter-row">
          <div class="filter-item">
            <span class="filter-label">活动名称</span>
            <el-input v-model="f.keyword" placeholder="搜索活动名称 / slug" clearable size="default" style="width:200px" />
          </div>
          <div class="filter-item">
            <span class="filter-label">权益类型</span>
            <el-select v-model="f.benefitTypes" placeholder="全部" clearable multiple collapse-tags size="default" style="width:170px">
              <el-option v-for="t in inviteBenefitTypeOptions" :key="t.value" :label="t.label" :value="t.value" />
            </el-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">状态</span>
            <el-select v-model="f.status" placeholder="全部" clearable size="default" style="width:110px">
              <el-option label="上线" value="online" />
              <el-option label="下线" value="offline" />
            </el-select>
          </div>
          <el-button type="primary" size="default">查询</el-button>
          <el-button size="default" @click="resetFilter">重置</el-button>
          <el-button type="primary" size="default" @click="openCreate">创建</el-button>
        </div>
      </div>

      <div class="table-wrap">
        <el-table :data="pagedList" stripe border size="default" style="width:100%">
          <el-table-column prop="id" label="ID" width="90" />
          <el-table-column prop="name" label="活动名称" min-width="140" show-overflow-tooltip />
          <el-table-column label="素材" width="90">
            <template #default="s">
              <div v-if="s.row.mediaUrl" class="mini-preview" :class="s.row.mediaType === 'video' ? 'prev-vid' : 'prev-img'" :title="s.row.mediaId || s.row.mediaUrl">
                {{ s.row.mediaType === 'video' ? '▶' : '🖼' }}
              </div>
              <span v-else style="color:#c0c4cc">—</span>
            </template>
          </el-table-column>
          <el-table-column label="链接拼接内容" min-width="160">
            <template #default="s">
              <div class="slug-cell">
                <code>{{ s.row.slug }}</code>
                <span class="link" @click="copyLink(s.row)">复制链接</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="有效时间" min-width="200">
            <template #default="s">
              <div class="time-cell">
                <div>{{ s.row.startAt || '—' }}</div>
                <div class="time-sep">至</div>
                <div>{{ s.row.endAt || '无结束时间' }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="redeemActivityId" label="兑换码活动 ID" min-width="150" show-overflow-tooltip />
          <el-table-column label="权益" width="140">
            <template #default="s">{{ formatInviteBenefit(s.row) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="s">
              <el-tag :type="s.row.status === 'online' ? 'success' : 'info'" size="small">
                {{ s.row.status === 'online' ? '上线' : '下线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="modifier" label="操作人" width="90" />
          <el-table-column prop="createdAt" label="创建时间" width="160" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="s">
              <span class="link" @click="openEdit(s.row)">编辑</span>
              <span class="link" @click="toggleStatus(s.row)">{{ s.row.status === 'online' ? '下线' : '上线' }}</span>
            </template>
          </el-table-column>
        </el-table>

        <div class="pager-row">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :total="filteredList.length"
            layout="total, prev, pager, next"
            background
            small
          />
        </div>
      </div>
    </div>

    <!-- 创建 / 编辑 -->
    <el-dialog
      v-model="dlgOpen"
      :title="dlgMode === 'create' ? '邀请注册链接创建' : '邀请注册链接编辑'"
      width="600px"
      destroy-on-close
      align-center
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="invite-form">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入活动名称" maxlength="60" show-word-limit />
        </el-form-item>

        <el-form-item label="链接拼接内容（需要唯一）" prop="slug">
          <el-input v-model="form.slug" placeholder="例如 spring2026" maxlength="40" />
          <div class="field-hint">完整链接预览：{{ linkPreview }}</div>
        </el-form-item>

        <el-form-item label="活动有效时间" required>
          <div class="range-row">
            <el-form-item prop="startAt" class="range-item">
              <el-date-picker
                v-model="form.startAt"
                type="datetime"
                placeholder="开始时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width:100%"
              />
            </el-form-item>
            <span class="range-dash">—</span>
            <el-form-item prop="endAt" class="range-item">
              <el-date-picker
                v-model="form.endAt"
                type="datetime"
                placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width:100%"
              />
            </el-form-item>
          </div>
          <div class="field-hint">（不填代表无结束时间）</div>
        </el-form-item>

        <el-form-item label="订阅中台兑换码活动 id" prop="redeemActivityId">
          <el-input v-model="form.redeemActivityId" placeholder="请输入中台兑换码活动 ID" />
        </el-form-item>

        <el-form-item label="素材选择" prop="mediaUrl">
          <div class="media-field">
            <div class="media-actions">
              <el-button type="primary" size="default" @click="openLibraryPicker">从素材库选择</el-button>
              <el-button size="default" @click="triggerMediaUpload">上传新素材</el-button>
              <span class="field-hint-inline">png / jpeg / jpg / webp / mp4，≤50MB</span>
              <input
                ref="mediaInput"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,video/mp4"
                style="display:none"
                @change="onMediaUpload"
              />
            </div>
            <div v-if="form.mediaUrl" class="media-selected">
              <div class="media-thumb" :class="form.mediaType === 'video' ? 'prev-vid' : 'prev-img'">
                {{ form.mediaType === 'video' ? '▶' : '🖼' }}
              </div>
              <div class="media-meta">
                <div class="media-id">{{ form.mediaId || '自定义上传' }}</div>
                <div class="media-url" :title="form.mediaUrl">{{ form.mediaUrl }}</div>
                <span class="link" @click="clearMedia">移除</span>
              </div>
            </div>
            <div v-else class="media-empty">尚未选择素材</div>
          </div>
        </el-form-item>

        <el-form-item label="具体权益" prop="benefitTypes">
          <el-checkbox-group v-model="form.benefitTypes">
            <el-checkbox
              v-for="t in inviteBenefitTypeOptions"
              :key="t.value"
              :label="t.value"
            >{{ t.label }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item
          v-if="form.benefitTypes.includes('credits')"
          label="积分数量"
          prop="creditAmount"
        >
          <el-input-number v-model="form.creditAmount" :min="1" :max="100000" :step="10" controls-position="right" style="width:100%" />
        </el-form-item>

        <el-form-item
          v-if="form.benefitTypes.includes('credits')"
          label="积分有效期限"
          prop="creditExpiryDays"
        >
          <el-select v-model="form.creditExpiryDays" placeholder="请选择" style="width:160px">
            <el-option
              v-for="d in expiryDayValues"
              :key="d"
              :label="`${d} 天`"
              :value="d"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="form.benefitTypes.includes('membership')"
          label="会员权益"
          prop="membershipPlan"
        >
          <el-select v-model="form.membershipPlan" placeholder="请选择会员方案" style="width:100%">
            <el-option
              v-for="p in inviteMembershipPlanOptions"
              :key="p.value"
              :label="p.label"
              :value="p.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="form.benefitTypes.includes('membership')"
          label="会员有效期限"
          prop="membershipExpiryDays"
        >
          <el-select v-model="form.membershipExpiryDays" placeholder="请选择" style="width:160px">
            <el-option
              v-for="d in expiryDayValues"
              :key="d"
              :label="`${d} 天`"
              :value="d"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="form.benefitTypes.includes('free')"
          label="免费生图次数"
          prop="freeImageCount"
        >
          <el-input-number v-model="form.freeImageCount" :min="0" :max="100" :step="1" controls-position="right" style="width:100%" />
          <div class="field-hint">0 表示不赠送免费生图权益</div>
        </el-form-item>

        <el-form-item
          v-if="form.benefitTypes.includes('free')"
          label="免费视频次数"
          prop="freeVideoCount"
        >
          <el-input-number v-model="form.freeVideoCount" :min="0" :max="100" :step="1" controls-position="right" style="width:100%" />
          <div class="field-hint">0 表示不赠送免费视频权益</div>
        </el-form-item>

        <el-form-item
          v-if="form.benefitTypes.includes('free')"
          label="免费权益有效期限"
          prop="freeExpiryDays"
        >
          <el-select v-model="form.freeExpiryDays" placeholder="请选择" style="width:160px">
            <el-option
              v-for="d in expiryDayValues"
              :key="d"
              :label="`${d} 天`"
              :value="d"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dlgOpen = false">取消</el-button>
        <el-button type="primary" @click="submitForm">{{ dlgMode === 'create' ? '创建' : '保存' }}</el-button>
      </template>
    </el-dialog>

    <!-- 素材库选择 -->
    <el-dialog v-model="libVisible" title="从 Sample Photo 库选择" width="800px" top="8vh" append-to-body>
      <div class="lib-toolbar">
        <el-input v-model="libKeyword" placeholder="搜索 ID" clearable size="default" style="width:200px" />
        <span class="field-hint-inline">单选 1 张素材用于邀请活动展示</span>
      </div>
      <div class="lib-grid">
        <div
          v-for="sp in libFiltered"
          :key="sp.id"
          :class="['lib-card', { 'lib-card-sel': libSelectedId === sp.id, 'lib-card-disabled': !sp.enabled }]"
          @click="selectLibItem(sp)"
        >
          <div class="lib-thumb">🖼</div>
          <div class="lib-id">{{ sp.id }}</div>
        </div>
        <div v-if="!libFiltered.length" class="lib-empty">暂无可用素材</div>
      </div>
      <template #footer>
        <el-button @click="libVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!libSelectedId" @click="confirmLibSelect">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  inviteRedeemLinks,
  inviteBenefitTypeOptions,
  inviteMembershipPlanOptions,
  nextInviteLinkId,
  buildInviteLinkUrl,
  formatInviteBenefit,
} from '../mock/inviteRedeem.js'
import { samplePhotos } from '../mock/data.js'

const f = reactive({ keyword: '', benefitTypes: [], status: '' })
const page = ref(1)
const pageSize = ref(20)
const expiryDayValues = [7, 30, 90, 180, 365]
const list = ref(inviteRedeemLinks.map((row) => ({ ...row })))

const filteredList = computed(() => {
  const kw = f.keyword.trim().toLowerCase()
  return list.value.filter((row) => {
    if (kw && !`${row.name} ${row.slug}`.toLowerCase().includes(kw)) return false
    if (f.benefitTypes.length && !(row.benefitTypes || []).some((t) => f.benefitTypes.includes(t))) return false
    if (f.status && row.status !== f.status) return false
    return true
  })
})

const pagedList = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

function resetFilter() {
  Object.assign(f, { keyword: '', benefitTypes: [], status: '' })
  page.value = 1
}

const dlgOpen = ref(false)
const dlgMode = ref('create')
const formRef = ref(null)
const editingId = ref('')
const mediaInput = ref(null)

const form = reactive({
  name: '',
  slug: '',
  startAt: '',
  endAt: '',
  redeemActivityId: '',
  benefitTypes: ['credits'],
  creditAmount: 200,
  creditExpiryDays: 30,
  membershipPlan: 'pro_30d',
  membershipExpiryDays: 90,
  freeImageCount: 0,
  freeVideoCount: 0,
  freeExpiryDays: 30,
  mediaId: '',
  mediaUrl: '',
  mediaType: 'image',
})

const linkPreview = computed(() => buildInviteLinkUrl(form.slug.trim()))

const libVisible = ref(false)
const libKeyword = ref('')
const libSelectedId = ref('')

const libFiltered = computed(() => {
  const kw = libKeyword.value.trim().toLowerCase()
  return samplePhotos.filter((sp) => {
    if (!sp.enabled) return false
    if (kw && !String(sp.id).toLowerCase().includes(kw)) return false
    return true
  })
})

function isVideoUrl(url = '') {
  return /\.mp4($|\?)/i.test(url) || String(url).includes('/video/')
}

function openLibraryPicker() {
  libSelectedId.value = form.mediaId || ''
  libKeyword.value = ''
  libVisible.value = true
}

function selectLibItem(sp) {
  if (!sp.enabled) return
  libSelectedId.value = sp.id
}

function confirmLibSelect() {
  const sp = samplePhotos.find((item) => item.id === libSelectedId.value)
  if (!sp) {
    ElMessage.warning('请选择素材')
    return
  }
  form.mediaId = sp.id
  form.mediaUrl = sp.url
  form.mediaType = isVideoUrl(sp.url) ? 'video' : 'image'
  libVisible.value = false
  ElMessage.success(`已选择素材 ${sp.id}`)
}

function triggerMediaUpload() {
  mediaInput.value?.click()
}

function onMediaUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 50 * 1024 * 1024) {
    ElMessage.warning('素材大小不能超过 50MB')
    e.target.value = ''
    return
  }
  const isVideo = file.type.startsWith('video/') || /\.mp4$/i.test(file.name)
  const newId = `UP-${Date.now().toString(36).toUpperCase()}`
  const fakeUrl = `https://example.com/invite/${encodeURIComponent(file.name)}`
  form.mediaId = newId
  form.mediaUrl = fakeUrl
  form.mediaType = isVideo ? 'video' : 'image'
  ElMessage.success('素材已上传并绑定')
  e.target.value = ''
}

function clearMedia() {
  form.mediaId = ''
  form.mediaUrl = ''
  form.mediaType = 'image'
}

const rules = {
  name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }],
  slug: [
    { required: true, message: '请输入链接拼接内容', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        const slug = String(value || '').trim()
        if (!/^[a-zA-Z0-9_-]+$/.test(slug)) {
          callback(new Error('仅支持字母、数字、下划线和短横线'))
          return
        }
        const duplicated = list.value.some(
          (row) => row.slug.toLowerCase() === slug.toLowerCase() && row.id !== editingId.value,
        )
        if (duplicated) {
          callback(new Error('链接拼接内容需唯一'))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],
  startAt: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  redeemActivityId: [{ required: true, message: '请输入兑换码活动 id', trigger: 'blur' }],
  mediaUrl: [{ required: true, message: '请选择或上传素材', trigger: 'change' }],
  benefitTypes: [
    {
      validator: (_rule, value, callback) => {
        if (!value || !value.length) return callback(new Error('请至少选择一种权益类型'))
        callback()
      },
      trigger: 'change',
    },
  ],
  creditAmount: [
    {
      validator: (_rule, value, callback) => {
        if (!form.benefitTypes.includes('credits')) return callback()
        if (!value || value < 1) return callback(new Error('请填写积分数量'))
        callback()
      },
      trigger: 'change',
    },
  ],
  creditExpiryDays: [
    {
      validator: (_rule, value, callback) => {
        if (!form.benefitTypes.includes('credits')) return callback()
        if (!value) return callback(new Error('请选择积分有效期限'))
        callback()
      },
      trigger: 'change',
    },
  ],
  membershipPlan: [
    {
      validator: (_rule, value, callback) => {
        if (!form.benefitTypes.includes('membership')) return callback()
        if (!value) return callback(new Error('请选择会员方案'))
        callback()
      },
      trigger: 'change',
    },
  ],
  membershipExpiryDays: [
    {
      validator: (_rule, value, callback) => {
        if (!form.benefitTypes.includes('membership')) return callback()
        if (!value) return callback(new Error('请选择会员有效期限'))
        callback()
      },
      trigger: 'change',
    },
  ],
  freeExpiryDays: [
    {
      validator: (_rule, value, callback) => {
        if (!form.benefitTypes.includes('free')) return callback()
        if (!value) return callback(new Error('请选择免费权益有效期限'))
        callback()
      },
      trigger: 'change',
    },
  ],
}

function blankForm() {
  Object.assign(form, {
    name: '',
    slug: '',
    startAt: '',
    endAt: '',
    redeemActivityId: '',
    benefitTypes: ['credits'],
    creditAmount: 200,
    creditExpiryDays: 30,
    membershipPlan: 'pro_30d',
    membershipExpiryDays: 90,
    freeImageCount: 0,
    freeVideoCount: 0,
    freeExpiryDays: 30,
    mediaId: '',
    mediaUrl: '',
    mediaType: 'image',
  })
}

function openCreate() {
  dlgMode.value = 'create'
  editingId.value = ''
  blankForm()
  dlgOpen.value = true
}

function openEdit(row) {
  dlgMode.value = 'edit'
  editingId.value = row.id
  Object.assign(form, {
    name: row.name,
    slug: row.slug,
    startAt: row.startAt,
    endAt: row.endAt || '',
    redeemActivityId: row.redeemActivityId,
    benefitTypes: [...(row.benefitTypes || ['credits'])],
    creditAmount: row.creditAmount || 200,
    creditExpiryDays: row.creditExpiryDays || 30,
    membershipPlan: row.membershipPlan || 'pro_30d',
    membershipExpiryDays: row.membershipExpiryDays || 90,
    freeImageCount: row.freeImageCount || 0,
    freeVideoCount: row.freeVideoCount || 0,
    freeExpiryDays: row.freeExpiryDays || 30,
    mediaId: row.mediaId || '',
    mediaUrl: row.mediaUrl || '',
    mediaType: row.mediaType || 'image',
  })
  dlgOpen.value = true
}

async function submitForm() {
  const ok = await formRef.value?.validate().catch(() => false)
  if (!ok) return

  if (form.endAt && form.startAt && form.endAt < form.startAt) {
    ElMessage.warning('结束时间不能早于开始时间')
    return
  }

  const payload = {
    name: form.name.trim(),
    slug: form.slug.trim(),
    startAt: form.startAt,
    endAt: form.endAt || '',
    redeemActivityId: form.redeemActivityId.trim(),
    benefitTypes: [...form.benefitTypes],
    creditAmount: form.benefitTypes.includes('credits') ? Number(form.creditAmount) : 0,
    creditExpiryDays: form.benefitTypes.includes('credits') ? Number(form.creditExpiryDays) : 0,
    membershipPlan: form.benefitTypes.includes('membership') ? form.membershipPlan : '',
    membershipExpiryDays: form.benefitTypes.includes('membership') ? Number(form.membershipExpiryDays) : 0,
    freeImageCount: form.benefitTypes.includes('free') ? Number(form.freeImageCount) : 0,
    freeVideoCount: form.benefitTypes.includes('free') ? Number(form.freeVideoCount) : 0,
    freeExpiryDays: form.benefitTypes.includes('free') ? Number(form.freeExpiryDays) : 0,
    mediaId: form.mediaId,
    mediaUrl: form.mediaUrl,
    mediaType: form.mediaType,
  }

  if (dlgMode.value === 'create') {
    list.value.unshift({
      id: nextInviteLinkId(),
      ...payload,
      status: 'online',
      createdAt: formatNow(),
      modifier: 'admin',
    })
    ElMessage.success('创建成功')
  } else {
    const idx = list.value.findIndex((r) => r.id === editingId.value)
    if (idx >= 0) {
      list.value[idx] = {
        ...list.value[idx],
        ...payload,
        modifier: 'admin',
      }
    }
    ElMessage.success('保存成功')
  }
  dlgOpen.value = false
}

function toggleStatus(row) {
  row.status = row.status === 'online' ? 'offline' : 'online'
  ElMessage.success(row.status === 'online' ? '已上线' : '已下线')
}

async function copyLink(row) {
  const url = buildInviteLinkUrl(row.slug)
  try {
    await navigator.clipboard.writeText(url)
    ElMessage.success('链接已复制')
  } catch {
    ElMessage.info(url)
  }
}

function formatNow() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}
</script>

<style scoped>
.page-root { padding: 0; max-width: 100%; overflow-x: hidden; }
.page-head { background: #fff; padding: 20px 24px 0; border-bottom: 1px solid #EBEEF5; }
.page-title { font-size: 26px; font-weight: 600; color: #303133; margin-bottom: 14px; }
.page-body { padding: 12px 24px 24px; }
.info-bar {
  background: #F4F4F5; border: 1px solid #EBEEF5; border-radius: 2px;
  padding: 10px 14px; font-size: 12px; color: #606266; line-height: 1.6; margin-bottom: 12px;
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
.slug-cell { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.slug-cell code {
  background: #F5F7FA; border: 1px solid #EBEEF5; border-radius: 3px;
  padding: 1px 6px; font-size: 12px; color: #303133;
}
.time-cell { font-size: 12px; color: #606266; line-height: 1.5; }
.time-sep { color: #C0C4CC; }
.invite-form :deep(.el-form-item__label) {
  font-weight: 500; color: #303133; padding-bottom: 4px;
}
.field-hint { margin-top: 6px; font-size: 12px; color: #909399; line-height: 1.4; }
.range-row { display: flex; align-items: flex-start; gap: 8px; width: 100%; }
.range-item { flex: 1; margin-bottom: 0 !important; }
.range-dash { margin-top: 8px; color: #909399; }
.field-hint-inline { font-size: 12px; color: #909399; line-height: 32px; }
.media-field { width: 100%; }
.media-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.media-selected { display: flex; gap: 12px; align-items: flex-start; }
.media-thumb {
  width: 72px; height: 96px; border-radius: 4px; border: 1px solid #d9ecff;
  display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
}
.prev-img { background: #ECF5FF; }
.prev-vid { background: #FDF6EC; }
.media-meta { min-width: 0; flex: 1; }
.media-id { font-size: 13px; color: #303133; margin-bottom: 4px; }
.media-url {
  font-size: 12px; color: #909399; margin-bottom: 6px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.media-empty {
  height: 72px; border: 1px dashed #DCDFE6; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  color: #c0c4cc; font-size: 12px; background: #FAFAFA;
}
.mini-preview {
  width: 40px; height: 54px; border-radius: 3px; border: 1px solid #EBEEF5;
  display: flex; align-items: center; justify-content: center; font-size: 16px;
}
.lib-toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.lib-grid { display: flex; flex-wrap: wrap; gap: 12px; max-height: 420px; overflow-y: auto; }
.lib-card {
  width: 120px; padding: 8px; background: #fff; border: 1px solid #EBEEF5; border-radius: 3px;
  cursor: pointer; display: flex; flex-direction: column; align-items: center; transition: all 0.15s;
}
.lib-card:hover { border-color: #409EFF; }
.lib-card-sel { border-color: #409EFF; background: #ECF5FF; }
.lib-card-disabled { opacity: 0.4; cursor: not-allowed; }
.lib-thumb {
  width: 80px; height: 110px; background: #ECF5FF; border-radius: 2px;
  display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.lib-id { font-size: 11px; color: #909399; margin-top: 4px; }
.lib-empty { width: 100%; text-align: center; color: #909399; padding: 40px 0; font-size: 13px; }
</style>
