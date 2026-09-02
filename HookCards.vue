<template>
  <div class="page-root">
    <div class="page-head"><h1 class="page-title">Hook 模版</h1></div>
    <div class="page-body">
      <div class="info-bar">为每个 Hook 模版配置标题、描述及展示物料。Avatar、Product、Scene 每种最多上传 1 张，也可以全部留空。</div>
      <div class="filter-bar"><div class="filter-row">
        <div class="filter-item"><span class="filter-label">ID</span><el-input v-model="filters.id" clearable style="width:150px" /></div>
        <div class="filter-item"><span class="filter-label">标题</span><el-input v-model="filters.title" placeholder="模糊搜索" clearable style="width:210px" /></div>
        <div class="filter-item"><span class="filter-label">上线地区</span><el-select v-model="filters.region" placeholder="全部" clearable style="width:150px"><el-option v-for="region in regionOptions" :key="region" :label="region" :value="region" /></el-select></div>
        <div class="filter-item"><span class="filter-label">置顶</span><el-select v-model="filters.pinned" placeholder="全部" clearable style="width:120px"><el-option label="是" :value="true" /><el-option label="否" :value="false" /></el-select></div>
        <div class="filter-item"><span class="filter-label">上线状态</span><el-select v-model="filters.enabled" placeholder="全部" clearable style="width:120px"><el-option label="启用" :value="true" /><el-option label="禁用" :value="false" /></el-select></div>
        <el-button type="primary" @click="applyFilters">查询</el-button><el-button @click="resetFilters">重置</el-button><el-button @click="openAdd">新增</el-button><el-button @click="toggleSort">排序</el-button>
      </div></div>
      <div class="table-wrap">
        <el-table :data="filteredList" stripe border>
          <el-table-column label="基础信息" width="245" fixed="left">
            <template #default="s">
              <div class="basic-info">
                <div class="basic-thumb"><img v-if="firstMaterialUrl(s.row)" :src="firstMaterialUrl(s.row)" :alt="s.row.title" /><span v-else>—</span></div>
                <div class="basic-copy">
                  <div class="basic-title" :title="s.row.title">{{ s.row.title }}</div>
                  <div class="basic-meta">ID: {{ s.row.id }}</div>
                  <div class="basic-meta" :title="s.row.effectId">Hook_id: {{ s.row.effectId || '—' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="sort" label="排序" width="75"><template #default="s">{{ s.row.sort ?? 0 }}</template></el-table-column>
          <el-table-column prop="description" label="描述" width="230" show-overflow-tooltip><template #default="s">{{ s.row.description || '—' }}</template></el-table-column>
          <el-table-column label="翻译" width="80"><template #default="s"><span class="link" @click="openTranslation(s.row)">查看</span></template></el-table-column>
          <el-table-column v-for="item in materialTypes" :key="item.key" :label="`${item.label}图`" width="90"><template #default="s"><material-state :value="s.row[item.key]" :material-key="item.key" /></template></el-table-column>
          <el-table-column prop="platformType" label="平台类型" width="100" />
          <el-table-column prop="rightsStrategyCode" label="权益策略 code" width="190" show-overflow-tooltip />
          <el-table-column label="上线地区" width="130" show-overflow-tooltip><template #default="s">{{ (s.row.regions || ['全部国家']).join('、') }}</template></el-table-column>
          <el-table-column label="状态" width="145"><template #default="s"><div class="table-status"><span :class="{ active: s.row.enabled === false }">禁用</span><el-switch v-model="s.row.enabled" @change="updateEnabled(s.row)" /><span :class="{ active: s.row.enabled !== false }">启用</span></div></template></el-table-column>
          <el-table-column prop="modifier" label="修改人" width="90" /><el-table-column prop="modifyTime" label="修改时间" width="165" />
          <el-table-column label="操作" width="215" fixed="right"><template #default="s"><div class="operation-list"><span class="link" @click="openEdit(s.row)">编辑</span><span class="link" @click="togglePinned(s.row)">{{ s.row.pinned ? '取消置顶' : '置顶' }}</span><span class="link" @click="copyHook(s.row)">复制</span></div></template></el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isAdd ? '新增 Hook 模版' : '编辑 Hook 模版'" width="900px" top="4vh" destroy-on-close>
      <el-form v-if="form" ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="标题" prop="title"><el-input v-model="form.title" placeholder="请输入前端展示标题" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" maxlength="300" show-word-limit placeholder="请输入前端展示描述" /></el-form-item>
        <el-form-item label="展示物料" required>
          <div class="display-material-field">
            <div class="display-upload-line"><el-button type="primary" @click="chooseDisplayMaterial">选择文件</el-button><span>请上传 大小不超过 <b>50MB</b>，格式为 <b>png / jpg / jpeg / webp / mp4</b> 的文件</span></div>
            <div class="display-upload-tip">支持图片 png / jpg / jpeg / webp、视频 mp4；最多上传 1 个（{{ form.displayMaterial.previewUrl ? '1/1' : '0/1' }}）</div>
            <div class="display-preview-wrap">
              <button type="button" class="display-preview" @click="chooseDisplayMaterial">
                <video v-if="form.displayMaterial.previewUrl && form.displayMaterial.type === 'video'" :src="form.displayMaterial.previewUrl" muted />
                <img v-else-if="form.displayMaterial.previewUrl" :src="form.displayMaterial.previewUrl" alt="展示物料" />
                <span v-else class="display-empty"><el-icon :size="26"><Plus /></el-icon><span>空位</span></span>
              </button>
              <el-button v-if="form.displayMaterial.previewUrl" type="danger" link @click="removeDisplayMaterial">删除</el-button>
            </div>
            <input ref="displayMaterialInput" type="file" accept="image/png,image/jpeg,image/webp,video/mp4" class="hidden-input" @change="onDisplayMaterialChange" />
          </div>
        </el-form-item>
        <el-form-item label="置顶">
          <div class="switch-setting"><span :class="{ active: !form.pinned }">否</span><el-switch v-model="form.pinned" /><span :class="{ active: form.pinned }">是</span></div>
        </el-form-item>
        <el-form-item label="默认示例" required>
          <div class="materials-field">
            <div class="sample-summary">最多一张，默认 3:4；Avatar 必须上传，Product 与 Scene 可配置展示规则</div>
            <div class="material-grid">
              <div v-for="item in materialTypes" :key="item.key" class="material-card">
                <div class="material-card-head">
                  <span v-if="item.key === 'avatar'" class="required-star">*</span><span class="material-name">{{ item.label }}</span>
                </div>
                <div class="material-upload">
                  <button type="button" class="upload-slot" :class="{ filled: form[item.key].previewUrl }" @click="chooseFile(item.key)">
                    <img v-if="form[item.key].previewUrl" :src="form[item.key].previewUrl" :alt="item.label" />
                    <span v-else class="slot-empty"><el-icon :size="25"><Plus /></el-icon><span>选择图片</span></span>
                  </button>
                  <div class="slot-footer"><span class="slot-status">{{ form[item.key].previewUrl ? '1 / 1' : '0 / 1' }}</span><el-button v-if="form[item.key].previewUrl" type="danger" link @click="removeMaterial(item.key)">删除</el-button><el-button v-else type="primary" link @click="chooseFile(item.key)">上传</el-button></div>
                </div>
                <div class="status-description">{{ statusDescription(form[item.key].slotStatus) }}</div>
                <div v-if="item.key === 'avatar'" class="avatar-required-badge">必填</div>
                <el-radio-group v-else v-model="form[item.key].slotStatus" size="small" @change="value => onSlotStatusChange(item.key, value)">
                  <el-radio-button value="required">必填</el-radio-button>
                  <el-radio-button value="optional">可选</el-radio-button>
                  <el-radio-button value="hidden">禁用</el-radio-button>
                </el-radio-group>
                <input :ref="el => setFileInput(item.key, el)" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" class="hidden-input" @change="e => onFileChange(item.key, e)" />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="新增示例">
          <div class="custom-samples-field">
            <div class="sample-summary">选填，最多新增 3 个，默认 3:4</div>
            <div class="custom-sample-grid">
              <div v-for="(sample, index) in form.customSamples" :key="index" class="custom-sample-card">
                <el-input v-model="sample.name" maxlength="30" placeholder="自定义名称" />
                <button type="button" class="custom-upload-slot" @click="chooseCustomSample(index)">
                  <img v-if="sample.previewUrl" :src="sample.previewUrl" :alt="sample.name || `新增示例 ${index + 1}`" />
                  <span v-else class="slot-empty"><el-icon :size="25"><Plus /></el-icon><span>上传</span></span>
                </button>
                <div class="slot-footer"><span class="slot-status">{{ sample.previewUrl ? '1 / 1' : '0 / 1' }}</span><el-button v-if="sample.previewUrl" type="danger" link @click="removeCustomSample(index)">删除</el-button><el-button v-else type="primary" link @click="chooseCustomSample(index)">上传</el-button></div>
                <input :ref="el => setCustomFileInput(index, el)" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" class="hidden-input" @change="event => onCustomSampleChange(index, event)" />
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="提示词" prop="prompt">
          <el-input v-model="form.prompt" type="textarea" :rows="5" maxlength="2000" show-word-limit placeholder="请输入提示词" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" :max="9999" :step="1" step-strictly />
        </el-form-item>
        <el-form-item label="Hook_id" prop="effectId">
          <el-input v-model="form.effectId" placeholder="请输入 Hook_id，例如 weave_flow_840" />
        </el-form-item>
        <el-form-item label="平台类型" prop="platformType">
          <el-select v-model="form.platformType" placeholder="请选择平台类型" style="width:100%">
            <el-option v-for="platform in platformOptions" :key="platform" :label="platform" :value="platform" />
          </el-select>
        </el-form-item>
        <el-form-item label="权益策略 code" prop="rightsStrategyCode">
          <el-input v-model="form.rightsStrategyCode" placeholder="请输入权益策略 code，例如 vr.rights.weave.flow.840" />
        </el-form-item>
        <el-form-item label="上线地区" prop="regions">
          <el-select v-model="form.regions" multiple collapse-tags collapse-tags-tooltip placeholder="请选择上线地区" style="width:100%">
            <el-option v-for="region in regionOptions" :key="region" :label="region" :value="region" />
          </el-select>
        </el-form-item>
        <el-form-item label="上线状态">
          <el-radio-group v-model="form.enabled"><el-radio :value="true">启用</el-radio><el-radio :value="false">禁用</el-radio></el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button type="primary" @click="saveForm">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="translationVisible" title="翻译预览" width="620px" top="8vh">
      <div v-if="translationRow" class="translation-preview">
        <div class="translation-item"><span class="translation-lang">原文</span><div><strong>{{ translationRow.title }}</strong><p>{{ translationRow.description || '—' }}</p></div></div>
        <div v-for="item in translatedContents" :key="item.lang" class="translation-item"><span class="translation-lang">{{ item.lang }}</span><div><strong>{{ item.title }}</strong><p>{{ item.description }}</p></div></div>
      </div>
      <template #footer><el-button type="primary" @click="translationVisible = false">关闭</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const STORAGE_KEY = 'virash-hook-cards-v2'
const initialList = [
  { id: 'HOOK-001', name: 'Problem → Solution', title: 'Turn a problem into a solution', description: 'Show the challenge first, then reveal how the product solves it.', pinned: true, sort: 1, effectId: 'weave_flow_840', platformType: 'weave', rightsStrategyCode: 'vr.rights.weave.flow.840', regions: ['全部国家'], enabled: true, avatar: null, product: null, scene: null, modifier: 'admin', modifyTime: '2026/08/24 14:20' },
  { id: 'HOOK-002', name: 'Before & After', title: 'See the transformation', description: 'Create a strong before-and-after opening for the video.', pinned: false, sort: 2, effectId: 'weave_before_after_841', platformType: 'weave', rightsStrategyCode: 'vr.rights.weave.before_after.841', regions: ['美国', '巴西'], enabled: true, avatar: { url: 'https://picsum.photos/seed/avatar/240/300', slotStatus: 'required' }, product: { url: '', slotStatus: 'optional' }, scene: { url: 'https://picsum.photos/seed/scene/240/300', slotStatus: 'hidden' }, modifier: 'admin', modifyTime: '2026/08/24 13:48' },
  { id: 'HOOK-003', name: 'Product Close-up', title: 'Put your product in focus', description: '', pinned: false, sort: 3, effectId: 'weave_product_842', platformType: 'weave', rightsStrategyCode: 'vr.rights.weave.product.842', regions: ['全部国家'], enabled: false, avatar: { url: '', slotStatus: 'hidden' }, product: { url: 'https://picsum.photos/seed/product/240/300', slotStatus: 'required' }, scene: { url: '', slotStatus: 'optional' }, modifier: 'admin', modifyTime: '2026/08/23 18:10' },
]
function loadList() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialList } catch (_) { return initialList } }

const list = reactive(loadList()), dialogVisible = ref(false), isAdd = ref(false), form = ref(null), formRef = ref(null), translationVisible = ref(false), translationRow = ref(null), sortAscending = ref(true), displayMaterialInput = ref(null)
const filters = reactive({ id: '', title: '', region: '', pinned: '', enabled: '' })
const fileInputs = {}, customFileInputs = {}
const materialTypes = [{ key: 'avatar', label: 'Avatar' }, { key: 'product', label: 'Product' }, { key: 'scene', label: 'Scene' }]
const platformOptions = ['Agent中台', 'weave', 'formula']
const regionOptions = ['全部国家', '美国', '加拿大', '巴西', '英国', '法国', '德国', '西班牙', '意大利', '日本', '韩国', '泰国', '澳大利亚']
const rules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }], prompt: [{ required: true, message: '请输入提示词', trigger: 'blur' }], effectId: [{ required: true, message: '请输入 Hook_id', trigger: 'blur' }], platformType: [{ required: true, message: '请选择平台类型', trigger: 'change' }], rightsStrategyCode: [{ required: true, message: '请输入权益策略 code', trigger: 'blur' }], regions: [{ required: true, type: 'array', min: 1, message: '请选择上线地区', trigger: 'change' }] }
const slotStatusLabels = { hidden: '不出现', optional: '可选', required: '必填' }
const MaterialState = defineComponent({ props: { value: Object, materialKey: String }, setup(props) { return () => {
  const status = props.materialKey === 'avatar' ? 'required' : props.value?.url && props.value?.slotStatus === 'required' ? 'required' : props.value?.url ? 'optional' : 'hidden'
  const preview = props.value?.url ? h('img', { src: props.value.url }) : h('span', { class: 'empty-material' }, '—')
  return h('div', { class: 'table-material' }, [preview, h('span', { class: `material-status status-${status}` }, slotStatusLabels[status])])
} } })
const filteredList = computed(() => list.filter(item => {
  if (filters.id && !String(item.id || '').toLowerCase().includes(filters.id.trim().toLowerCase())) return false
  if (filters.title && !String(item.title || '').toLowerCase().includes(filters.title.trim().toLowerCase())) return false
  if (filters.region && !(item.regions || []).includes(filters.region)) return false
  if (filters.pinned !== '' && item.pinned !== filters.pinned) return false
  if (filters.enabled !== '' && (item.enabled !== false) !== filters.enabled) return false
  return true
}).sort((a, b) => sortAscending.value ? (a.sort || 0) - (b.sort || 0) : (b.sort || 0) - (a.sort || 0)))

function configuredCount(row) { return materialTypes.filter(item => Boolean(row[item.key]?.url)).length }
function applyFilters() { ElMessage.success('查询完成') }
function resetFilters() { Object.assign(filters, { id: '', title: '', region: '', pinned: '', enabled: '' }) }
function toggleSort() { sortAscending.value = !sortAscending.value; ElMessage.success(sortAscending.value ? '已按排序值升序展示' : '已按排序值降序展示') }
function firstMaterialUrl(row) { return row.displayMaterial?.type === 'image' ? row.displayMaterial.url : row.avatar?.url || row.product?.url || row.scene?.url || '' }
function emptyMaterial(value, key) { const hasImage = Boolean(value?.url); return { previewUrl: value?.url || '', url: value?.url || '', fileName: '', file: null, slotStatus: key === 'avatar' ? 'required' : hasImage && value?.slotStatus === 'required' ? 'required' : hasImage ? 'optional' : 'hidden' } }
function emptyDisplayMaterial(value) { return { previewUrl: value?.url || '', url: value?.url || '', type: value?.type || 'image', fileName: '', file: null } }
function emptyCustomSample(value = {}) { return { name: value.name || '', previewUrl: value.url || '', url: value.url || '', fileName: '', file: null } }
function makeForm(row = {}) { const savedSamples = Array.isArray(row.customSamples) ? row.customSamples : []; return { id: row.id || '', name: row.name || '', title: row.title || row.name || '', description: row.description || '', displayMaterial: emptyDisplayMaterial(row.displayMaterial), pinned: Boolean(row.pinned), sort: Number.isFinite(row.sort) ? row.sort : 0, effectId: row.effectId || '', platformType: row.platformType || 'Agent中台', rightsStrategyCode: row.rightsStrategyCode || '', regions: row.regions?.length ? [...row.regions] : ['全部国家'], enabled: row.enabled !== false, prompt: row.prompt || '', customSamples: Array.from({ length: 3 }, (_, index) => emptyCustomSample(savedSamples[index])), avatar: emptyMaterial(row.avatar, 'avatar'), product: emptyMaterial(row.product, 'product'), scene: emptyMaterial(row.scene, 'scene') } }
function openAdd() { isAdd.value = true; form.value = makeForm(); dialogVisible.value = true }
function openEdit(row) { isAdd.value = false; form.value = makeForm(row); dialogVisible.value = true }
function setFileInput(key, el) { if (el) fileInputs[key] = el }
function setCustomFileInput(index, el) { if (el) customFileInputs[index] = el }
function chooseFile(key) { fileInputs[key]?.click() }
function chooseCustomSample(index) { customFileInputs[index]?.click() }
function chooseFirstEmpty() { chooseFile((materialTypes.find(item => !form.value[item.key].previewUrl) || materialTypes[0]).key) }
function onSlotStatusChange(key, value) {
  if (key === 'avatar') { form.value.avatar.slotStatus = 'required'; return }
  if (value !== 'hidden' && !form.value[key].previewUrl) {
    ElMessage.info(`请为 ${materialTypes.find(item => item.key === key)?.label || key} 上传示例图片`)
    chooseFile(key)
  }
}
function chooseDisplayMaterial() { displayMaterialInput.value?.click() }
function onDisplayMaterialChange(event) {
  const file = event.target.files?.[0]; if (!file) return
  if (!['image/png', 'image/jpeg', 'image/webp', 'video/mp4'].includes(file.type)) { ElMessage.warning('仅支持 png、jpg、jpeg、webp、mp4 文件'); return }
  if (file.size > 50 * 1024 * 1024) { ElMessage.warning('文件大小不能超过 50MB'); return }
  const material = form.value.displayMaterial
  if (material.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(material.previewUrl)
  material.file = file; material.fileName = file.name; material.type = file.type === 'video/mp4' ? 'video' : 'image'; material.previewUrl = URL.createObjectURL(file)
  material.url = `https://virash-storage-pre.example.com/hook/${form.value.id || 'draft'}/display-${Date.now()}.${material.type === 'video' ? 'mp4' : 'webp'}`
  event.target.value = ''
}
function removeDisplayMaterial() { const material = form.value.displayMaterial; if (material.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(material.previewUrl); form.value.displayMaterial = emptyDisplayMaterial(null); if (displayMaterialInput.value) displayMaterialInput.value.value = '' }
function statusDescription(status) { return { hidden: '前端完全隐藏该坑位，用户不可见', optional: '前端正常展示，用户可自主选择是否填写', required: '前端展示必填标识，提示用户必须填写' }[status] }
const translatedContents = computed(() => translationRow.value ? [
  { lang: 'English', title: translationRow.value.title, description: translationRow.value.description || '—' },
  { lang: '日本語', title: `${translationRow.value.title}（日本語）`, description: translationRow.value.description ? `${translationRow.value.description}（日本語）` : '—' },
  { lang: 'Português', title: `${translationRow.value.title} (PT)`, description: translationRow.value.description ? `${translationRow.value.description} (PT)` : '—' },
] : [])
function openTranslation(row) { translationRow.value = row; translationVisible.value = true }
function onFileChange(key, event) {
  const file = event.target.files?.[0]; if (!file) return
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { ElMessage.warning('仅支持 png、jpeg、jpg、webp 图片'); return }
  if (file.size > 50 * 1024 * 1024) { ElMessage.warning('图片大小不能超过 50MB'); return }
  const material = form.value[key]
  if (material.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(material.previewUrl)
  material.file = file; material.fileName = file.name; material.previewUrl = URL.createObjectURL(file)
  material.url = `https://virash-storage-pre.example.com/hook/${form.value.id || 'draft'}/${key}-${Date.now()}.webp`
  material.slotStatus = key === 'avatar' ? 'required' : material.slotStatus === 'hidden' ? 'optional' : material.slotStatus
  event.target.value = ''
}
function removeMaterial(key) { const material = form.value[key]; if (material.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(material.previewUrl); Object.assign(material, emptyMaterial(null, key)); if (fileInputs[key]) fileInputs[key].value = '' }
function onCustomSampleChange(index, event) {
  const file = event.target.files?.[0]; if (!file) return
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { ElMessage.warning('仅支持 png、jpeg、jpg、webp 图片'); return }
  if (file.size > 50 * 1024 * 1024) { ElMessage.warning('图片大小不能超过 50MB'); return }
  const sample = form.value.customSamples[index]
  if (sample.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(sample.previewUrl)
  sample.file = file; sample.fileName = file.name; sample.previewUrl = URL.createObjectURL(file)
  sample.url = `https://virash-storage-pre.example.com/hook/${form.value.id || 'draft'}/custom-${index + 1}-${Date.now()}.webp`
  event.target.value = ''
}
function removeCustomSample(index) { const sample = form.value.customSamples[index]; if (sample.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(sample.previewUrl); form.value.customSamples[index] = emptyCustomSample(); if (customFileInputs[index]) customFileInputs[index].value = '' }
function persistList() { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) }
function updateEnabled(row) { row.releaseDirty = true; row.modifier = 'admin'; row.modifyTime = new Date().toLocaleString('zh-CN'); persistList(); ElMessage.success(row.enabled ? '已启用，变更待同步 Release' : '已禁用，变更待同步 Release') }
function togglePinned(row) { row.pinned = !row.pinned; row.releaseDirty = true; row.modifier = 'admin'; row.modifyTime = new Date().toLocaleString('zh-CN'); persistList(); ElMessage.success(row.pinned ? '置顶成功，变更待同步 Release' : '已取消置顶，变更待同步 Release') }
function copyHook(row) {
  const copy = JSON.parse(JSON.stringify(row))
  copy.id = `HOOK-${Date.now().toString(36).toUpperCase()}`
  copy.name = `${row.name || row.title} Copy`
  copy.title = `${row.title} Copy`
  copy.pinned = false
  copy.releaseDirty = true
  copy.sort = (row.sort || 0) + 1
  copy.modifier = 'admin'
  copy.modifyTime = new Date().toLocaleString('zh-CN')
  list.unshift(copy); persistList(); ElMessage.success('Hook 模版复制成功')
}
async function saveForm() {
  if (!form.value) return
  try { await formRef.value.validate() } catch (_) { return }
  if (!form.value.displayMaterial.url) { ElMessage.warning('请上传展示物料'); return }
  if (!form.value.avatar.url) { ElMessage.warning('Avatar 图为必填，请上传内容'); return }
  const missingSamples = materialTypes.filter(item => item.key !== 'avatar' && form.value[item.key].slotStatus !== 'hidden' && !form.value[item.key].url)
  if (missingSamples.length) { ElMessage.warning(`请上传 ${missingSamples.map(item => item.label).join('、')} 示例图片，或将对应状态改为“不出现”`); return }
  const serializeMaterial = (material, key) => ({ url: material.url || '', slotStatus: key === 'avatar' ? 'required' : material.url ? (material.slotStatus === 'required' ? 'required' : 'optional') : 'hidden' })
  const title = form.value.title.trim()
  const invalidCustomSample = form.value.customSamples.find(sample => (sample.name.trim() && !sample.url) || (!sample.name.trim() && sample.url))
  if (invalidCustomSample) { ElMessage.warning('新增示例的自定义名称和图片需要同时填写'); return }
  const payload = { id: form.value.id || `HOOK-${Date.now().toString(36).toUpperCase()}`, name: form.value.name || title, title, description: form.value.description.trim(), displayMaterial: { url: form.value.displayMaterial.url, type: form.value.displayMaterial.type }, translationStatus: 'translated', pinned: form.value.pinned, sort: form.value.sort, effectId: form.value.effectId.trim(), platformType: form.value.platformType, rightsStrategyCode: form.value.rightsStrategyCode.trim(), regions: [...form.value.regions], enabled: form.value.enabled, prompt: form.value.prompt.trim(), customSamples: form.value.customSamples.filter(sample => sample.name.trim() && sample.url).map(sample => ({ name: sample.name.trim(), url: sample.url })), avatar: serializeMaterial(form.value.avatar, 'avatar'), product: serializeMaterial(form.value.product, 'product'), scene: serializeMaterial(form.value.scene, 'scene'), releaseDirty: true, releaseSyncedAt: list.find(item => item.id === form.value.id)?.releaseSyncedAt || '', modifier: 'admin', modifyTime: new Date().toLocaleString('zh-CN') }
  const index = list.findIndex(item => item.id === payload.id); if (index >= 0) list[index] = payload; else list.unshift(payload)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); dialogVisible.value = false; ElMessage.success('Hook 模版保存成功')
}
</script>

<style scoped>
.page-root{max-width:100%;overflow-x:hidden}.page-head{padding:20px 24px 0;background:#fff;border-bottom:1px solid #EBEEF5}.page-title{margin:0 0 14px;color:#303133;font-size:26px;font-weight:600}.page-body{margin:16px 24px}.info-bar{margin-bottom:12px;padding:10px 16px;color:#909399;font-size:12px;line-height:1.8;background:#fff;border:1px solid #E4E7ED;border-radius:2px}.filter-bar{margin-bottom:12px}.filter-row,.filter-item{display:flex;align-items:center;gap:10px}.filter-label{color:#606266;font-size:13px}.table-wrap{padding:14px 18px;background:#fff;border:1px solid #EBEEF5;border-radius:2px}.basic-info{display:flex;align-items:flex-start;gap:10px;min-width:0}.basic-thumb{display:flex;width:54px;height:72px;flex:0 0 54px;align-items:center;justify-content:center;overflow:hidden;color:#C0C4CC;background:#F5F7FA;border:1px solid #E4E7ED;border-radius:4px}.basic-thumb img{width:100%;height:100%;object-fit:cover}.basic-copy{min-width:0;padding-top:1px}.basic-title{overflow:hidden;color:#303133;font-size:13px;font-weight:500;text-overflow:ellipsis;white-space:nowrap}.basic-meta{max-width:160px;margin-top:6px;overflow:hidden;color:#909399;font-size:11px;text-overflow:ellipsis;white-space:nowrap}.link{color:#409EFF;cursor:pointer;font-size:13px}.operation-list{display:flex;align-items:center;gap:12px;white-space:nowrap}.table-status{display:flex;align-items:center;gap:8px;color:#909399;font-size:13px}.table-status .active{color:#409EFF;font-weight:600}.switch-setting{display:flex;align-items:center;gap:10px;color:#909399}.switch-setting .active{color:#409EFF;font-weight:600}.translation-preview{border-top:1px solid #EBEEF5}.translation-item{display:grid;grid-template-columns:90px 1fr;gap:16px;padding:14px 4px;border-bottom:1px solid #EBEEF5}.translation-lang{color:#909399;font-size:13px}.translation-item strong{color:#303133;font-size:14px}.translation-item p{margin:5px 0 0;color:#606266;font-size:13px;line-height:1.6}.materials-field,.custom-samples-field{width:100%;background:#fff}.sample-summary{margin-bottom:16px;color:#909399;font-size:12px}.material-grid,.custom-sample-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px}.material-card,.custom-sample-card{display:flex;min-width:0;flex-direction:column;align-items:center;padding:0 8px 8px;background:#fff;border:0}.material-card-head{display:flex;width:100%;min-height:28px;align-items:center;justify-content:center;gap:4px;margin-bottom:10px}.required-star{color:#F56C6C;font-weight:600}.material-name{color:#303133;font-size:16px;font-weight:600}.material-upload,.custom-upload-slot{width:min(100%,170px)}.upload-slot,.custom-upload-slot{display:flex;width:100%;aspect-ratio:3/4;padding:0;overflow:hidden;align-items:center;justify-content:center;background:#fff;border:1px dashed #CDD3DE;border-radius:6px;cursor:pointer;transition:border-color .18s}.upload-slot:hover,.custom-upload-slot:hover{border-color:#409EFF}.upload-slot img,.custom-upload-slot img{width:100%;height:100%;object-fit:cover}.slot-empty{display:flex;flex-direction:column;align-items:center;gap:7px;color:#A8ABB2;font-size:12px}.slot-footer{display:flex;width:100%;height:28px;align-items:center;justify-content:space-between;margin-top:3px}.material-upload .slot-footer{width:100%}.slot-status{color:#909399;font-size:11px}.status-description{min-height:34px;margin:8px 0;color:#909399;font-size:12px;line-height:1.5;text-align:center}.avatar-required-badge{display:inline-flex;height:28px;align-items:center;justify-content:center;padding:0 20px;color:#409EFF;font-size:12px;font-weight:600;background:#ECF5FF;border:1px solid #B3D8FF;border-radius:4px}.material-card :deep(.el-radio-group){display:flex;justify-content:center}.custom-sample-card :deep(.el-input){width:min(100%,170px);margin-bottom:8px}.custom-sample-card :deep(.el-input__wrapper){box-shadow:0 0 0 1px #B3D8FF inset}.hidden-input{display:none}:deep(.table-material){display:flex;min-height:66px;flex-direction:column;align-items:center;justify-content:center;gap:5px}:deep(.table-material img){width:42px;aspect-ratio:3/4;object-fit:cover;border:1px solid #E4E7ED;border-radius:3px}:deep(.empty-material){color:#C0C4CC}:deep(.material-status){font-size:11px;white-space:nowrap}:deep(.status-hidden){color:#909399}:deep(.status-optional){color:#409EFF}:deep(.status-required){color:#E6A23C;font-weight:600}@media(max-width:900px){.material-grid,.custom-sample-grid{grid-template-columns:1fr}.material-card,.custom-sample-card{padding-bottom:18px;border-bottom:1px solid #EBEEF5}.material-card:last-child,.custom-sample-card:last-child{border-bottom:0}.material-upload,.custom-upload-slot{width:140px}.status-description{min-height:0}}
.display-material-field{width:100%}.display-upload-line{display:flex;align-items:center;gap:10px;color:#606266;font-size:13px}.display-upload-line b{color:#F56C6C}.display-upload-tip{margin:10px 0 12px;color:#909399;font-size:12px}.display-preview-wrap{display:flex;align-items:flex-end;gap:10px}.display-preview{display:flex;width:112px;aspect-ratio:9/16;padding:0;overflow:hidden;align-items:center;justify-content:center;background:#fff;border:1px dashed #CDD3DE;border-radius:6px;cursor:pointer}.display-preview:hover{border-color:#409EFF}.display-preview img,.display-preview video{width:100%;height:100%;object-fit:cover}.display-empty{display:flex;flex-direction:column;align-items:center;gap:8px;color:#A8ABB2;font-size:12px}
.filter-row{width:100%}
</style>
