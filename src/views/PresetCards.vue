<template>
  <div class="page-root">
    <div class="page-head"><h1 class="page-title">Homepage Preset 卡片</h1></div>

    <div class="page-body">
      <!-- 提示条 -->
      <div class="info-bar">
        配置 Homepage 首页 Preset 卡片。Preset 卡片分为运营卡和效果卡，前端展示时先展示运营卡排序结果，再展示效果卡排序结果。排序值仅在当前卡片类型内生效。字体、颜色和按钮样式由前端固定，后台仅配置文案参数、媒体资源、排序、上线地区、按钮状态、绑定效果 / 跳转目标和上线状态。
      </div>

      <!-- 筛选区 -->
      <div class="filter-bar">
        <div class="filter-row">
          <div class="filter-item"><span class="filter-label">ID</span>
            <el-input v-model="f.keyword" placeholder="请输入 ID" clearable size="default" style="width:140px" />
          </div>
          <div class="filter-item"><span class="filter-label">卡片类型</span>
            <el-select v-model="f.cardType" placeholder="全部" clearable size="default" style="width:120px">
              <el-option v-for="t in presetCardTypeOptions" :key="t" :label="t" :value="t" />
            </el-select>
          </div>
          <div class="filter-item"><span class="filter-label">上线地区</span>
            <el-select v-model="f.region" placeholder="全部" clearable size="default" style="width:130px">
              <el-option v-for="r in presetRegionOptions" :key="r" :label="r" :value="r" />
            </el-select>
          </div>
          <div class="filter-item"><span class="filter-label">上线状态</span>
            <el-select v-model="f.enabled" placeholder="全部" clearable size="default" style="width:100px">
              <el-option label="启用" :value="true" />
              <el-option label="禁用" :value="false" />
            </el-select>
          </div>

          <el-button type="primary" size="default">查询</el-button>
          <el-button size="default" @click="resetFilter">重置</el-button>
          <el-button type="primary" size="default" @click="openAdd">新增</el-button>
        </div>
      </div>

      <!-- 列表 -->
      <div class="table-wrap">
        <div class="table-scroll">
          <el-table :data="pagedList" stripe border size="default" class="cards-table" max-height="600">
            <el-table-column label="基础信息" min-width="220">
              <template #default="s">
                <div class="base-info">
                  <div
                    v-if="s.row.mediaUrl"
                    class="mini-preview"
                    :class="s.row.mediaType==='video'?'prev-vid':'prev-img'"
                    :title="s.row.mediaUrl"
                  >{{ s.row.mediaType === 'video' ? '▶' : '🖼' }}</div>
                  <div v-else class="mini-preview empty-preview">—</div>
                  <div class="base-text">
                    <div class="base-title">{{ s.row.titleCn }}</div>
                    <div class="base-id">
                      <template v-if="s.row.cardType === '效果卡' && s.row.effectId">
                        ID: {{ s.row.id }} / effect: {{ s.row.effectId }}
                      </template>
                      <template v-else>ID: {{ s.row.id }}</template>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="卡片类型" width="80">
              <template #default="s">{{ s.row.cardType === '运营卡' ? '运营' : '效果' }}</template>
            </el-table-column>

            <el-table-column label="组内排序" width="80">
              <template #default="s">{{ s.row.enabled === false ? '—' : s.row.sort }}</template>
            </el-table-column>

            <el-table-column prop="descCn" label="描述" min-width="160" show-overflow-tooltip />

            <el-table-column label="翻译" width="80">
              <template #default="s">
                <span class="link" @click.stop="openTransPreview(s.row)">查看</span>
              </template>
            </el-table-column>

            <el-table-column label="卡片配置" width="160">
              <template #default="s">
                <template v-if="s.row.cardType === '运营卡'">
                  <span v-if="s.row.jumpTarget" class="cfg-text">{{ s.row.jumpTarget }}</span>
                  <span v-else class="muted">—</span>
                </template>
                <template v-else>
                  <div v-if="s.row.samplePhotos?.length" class="material-grid">
                    <div v-for="(photo, idx) in s.row.samplePhotos.slice(0, 3)" :key="photo.id || idx" class="material-thumb">🖼</div>
                  </div>
                  <span v-else class="muted">—</span>
                </template>
              </template>
            </el-table-column>

            <el-table-column label="原图" width="90">
              <template #default="s">
                <template v-if="s.row.cardType === '运营卡'">
                  <span class="muted">—</span>
                </template>
                <div v-else-if="s.row.originalImage" class="origin-thumb">🖼</div>
                <span v-else class="muted">—</span>
              </template>
            </el-table-column>

            <el-table-column label="平台类型" width="90">
              <template #default="s">
                <span v-if="s.row.cardType === '效果卡'">{{ s.row.platformType || '—' }}</span>
                <span v-else class="muted">—</span>
              </template>
            </el-table-column>

            <el-table-column label="权益策略code" min-width="160" show-overflow-tooltip>
              <template #default="s">
                <span v-if="s.row.cardType === '效果卡'">{{ rightsCode(s.row) }}</span>
                <span v-else class="muted">—</span>
              </template>
            </el-table-column>

            <el-table-column label="上线地区" width="100">
              <template #default="s">{{ formatRegions(s.row.regions) }}</template>
            </el-table-column>

            <el-table-column label="状态" width="140">
              <template #default="s">
                <div class="status-cell">
                  <span class="status-label" :class="{ on: s.row.enabled !== false }">{{ s.row.enabled === false ? '禁用' : '启用' }}</span>
                  <el-switch
                    :model-value="s.row.enabled !== false"
                    @change="(v) => setEnabled(s.row, v)"
                  />
                </div>
              </template>
            </el-table-column>

            <el-table-column label="修改人" width="150" show-overflow-tooltip>
              <template #default="s">{{ s.row.ownerEmail || s.row.modifier || '—' }}</template>
            </el-table-column>

            <el-table-column label="操作" width="200" fixed="right">
              <template #default="s">
                <span class="link" @click="openEdit(s.row)">编辑</span>
                <span class="link dark" @click="copyCard(s.row)">复制</span>
                <span class="link warn" @click="syncRelease(s.row)">同步Release</span>
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
    <el-dialog v-model="dlgVisible" :title="isAdd ? '新增 Homepage Preset 卡片' : '编辑 Homepage Preset 卡片'" width="750px" top="3vh">
      <el-form v-if="dlgForm" :model="dlgForm" :rules="dlgRules" label-width="80px" size="default">
        <el-form-item label="卡片类型" prop="cardType">
          <el-radio-group v-model="dlgForm.cardType" @change="onCardTypeChange">
            <el-radio value="运营卡">运营卡</el-radio>
            <el-radio value="效果卡">效果卡</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标题" prop="titleCn" style="width:100%">
          <div style="width:100%">
            <el-input v-model="dlgForm.titleCn" placeholder="卡片标题（中文或英文均可）" style="width:100%" />
            <div v-if="dlgForm.transStatus==='translated' && dlgForm.titleTrans" class="trans-preview" style="margin-top:8px">
              <div class="trans-title">翻译结果</div>
              <div v-for="(v, k) in dlgForm.titleTrans" :key="'pet'+k" class="trans-row"><span class="trans-lang">{{ k }}</span><span class="trans-val">{{ v }}</span></div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="描述" style="width:100%">
          <div style="width:100%">
            <el-input v-model="dlgForm.descCn" placeholder="卡片描述（中文或英文均可）" style="width:100%" />
            <div v-if="dlgForm.transStatus==='translated' && dlgForm.descTrans" class="trans-preview" style="margin-top:8px">
              <div class="trans-title">翻译结果</div>
              <div v-for="(v, k) in dlgForm.descTrans" :key="'ped'+k" class="trans-row"><span class="trans-lang">{{ k }}</span><span class="trans-val">{{ v }}</span></div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="展示物料" prop="mediaUrl">
          <div style="width:100%">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
              <el-button type="primary" size="default" @click="triggerMediaUpload">选择文件</el-button>
              <span style="font-size:12px;color:#909399">请上传 大小不超过 50MB 格式为 png / jpeg / jpg / webp / mp4 的文件</span>
              <input ref="mediaInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,video/mp4" style="display:none" @change="onMediaChange" />
            </div>
            <div style="font-size:11px;color:#909399;margin-bottom:8px">图片：png / jpeg / jpg / webp；视频：mp4 / webp（mp4 识别为视频，其余按图片处理）</div>
            <el-input v-model="dlgForm.mediaUrl" placeholder="上传后自动填入，也可手动粘贴 URL" />
            <div v-if="dlgForm.mediaUrl" style="margin-top:8px">
              <div v-if="isVideo(dlgForm.mediaUrl)" class="web-preview web-preview-vid">▶</div>
              <div v-else class="web-preview web-preview-img">🖼</div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="组内排序">
          <el-input-number v-model="dlgForm.sort" :min="1" :max="999" style="width:140px" />
          <span style="margin-left:8px;color:#909399;font-size:12px">数值越小越靠前，仅在同类型卡片内生效</span>
        </el-form-item>

        <!-- 效果卡：平台类型 -->
        <el-form-item v-if="dlgForm.cardType === '效果卡'" label="平台类型" prop="platformType">
          <el-select v-model="dlgForm.platformType" placeholder="请选择平台类型" style="width:100%">
            <el-option label="weave" value="weave" />
            <el-option label="formula" value="formula" />
          </el-select>
        </el-form-item>

        <!-- 效果卡：effect_id -->
        <el-form-item v-if="dlgForm.cardType === '效果卡'" label="effect_id" prop="effectId">
          <el-input v-model="dlgForm.effectId" placeholder="请输入 effect_id，例如 weave_flow_808" style="width:100%" />
        </el-form-item>

        <!-- 效果卡：结果类型 -->
        <el-form-item v-if="dlgForm.cardType === '效果卡'" label="结果类型" prop="resultType">
          <el-select v-model="dlgForm.resultType" placeholder="请选择结果类型" style="width:100%">
            <el-option label="图片" value="图片" />
            <el-option label="视频" value="视频" />
          </el-select>
        </el-form-item>

        <!-- 效果卡：结果数量 -->
        <el-form-item v-if="dlgForm.cardType === '效果卡'" label="结果数量" prop="resultCount">
          <el-input-number v-model="dlgForm.resultCount" :min="1" :max="999" :step="1" :precision="0" style="width:140px" />
        </el-form-item>

        <!-- 运营卡：跳转功能 -->
        <el-form-item v-if="dlgForm.cardType === '运营卡'" label="跳转功能" prop="jumpTarget">
          <el-select v-model="dlgForm.jumpTarget" placeholder="请选择已上线功能" style="width:100%">
            <el-option v-for="t in onlineFeatures" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>

        <!-- 效果卡：原图 -->
        <el-form-item v-if="dlgForm.cardType === '效果卡'" label="原图" prop="originalImage">
          <div style="width:100%">
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
              <el-button size="default" @click="triggerOriginUpload" :disabled="!!dlgForm.originalImage">上传原图</el-button>
              <span style="font-size:12px;color:#909399">仅需 1 张，PNG/JPG/JPEG/WebP，≤10MB</span>
              <input ref="originUploadInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" style="display:none" @change="onOriginUpload" />
            </div>
            <div v-if="dlgForm.originalImage" style="display:flex;align-items:flex-start;gap:8px">
              <div style="width:100px;height:140px;background:#ECF5FF;border:1px solid #d9ecff;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:24px;position:relative">🖼</div>
              <div>
                <div style="font-size:11px;color:#909399;margin-bottom:4px">{{ dlgForm.originalImage.name || '原图' }}</div>
                <span class="link" style="font-size:11px" @click="removeOriginImage">移除</span>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 效果卡：示例图片 -->
        <el-form-item v-if="dlgForm.cardType === '效果卡'" label="示例图片">
          <div style="width:100%">
            <div style="display:flex;gap:8px;margin-bottom:8px">
              <el-button type="primary" size="default" @click="openLibraryPicker" :disabled="(dlgForm.samplePhotos||[]).length >= 3">从素材库选择</el-button>
              <el-button size="default" @click="triggerPhotoUpload" :disabled="(dlgForm.samplePhotos||[]).length >= 3">上传新图片</el-button>
              <span style="font-size:12px;color:#909399;line-height:32px">需配置 3 张（{{ (dlgForm.samplePhotos||[]).length }}/3）</span>
              <input ref="photoUploadInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" style="display:none" @change="onPhotoUpload" />
            </div>
            <!-- 3 个图片位 -->
            <div style="display:flex;gap:12px;flex-wrap:wrap">
              <div v-for="(photo, idx) in dlgForm.samplePhotos" :key="photo.id || idx" style="display:flex;flex-direction:column;align-items:center;gap:2px;cursor:grab" draggable="true" @dragstart="dragPhotoIdx=idx" @dragover.prevent @drop.prevent="dropPhoto(idx)">
                <div style="width:100px;height:140px;background:#ECF5FF;border:1px solid #d9ecff;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:24px;position:relative">🖼</div>
                <div style="font-size:10px;color:#909399;max-width:100px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ photo.id }}</div>
                <div v-if="photo.tags && photo.tags.length" style="display:flex;flex-wrap:wrap;gap:2px;justify-content:center">
                  <span v-for="t in photo.tags" :key="t" style="background:#F0F2F5;color:#606266;padding:0 3px;border-radius:1px;font-size:9px">{{ t }}</span>
                </div>
                <span class="link" style="font-size:11px" @click="removeDlgPhoto(idx)">移除</span>
              </div>
              <!-- 空位 -->
              <div v-for="i in (3 - (dlgForm.samplePhotos||[]).length)" :key="'empty'+i" style="width:100px;height:140px;background:#FAFAFA;border:1px dashed #DCDFE6;border-radius:3px;display:flex;align-items:center;justify-content:center;color:#c0c4cc;font-size:12px">空位</div>
            </div>
          </div>
        </el-form-item>

        <!-- 素材库选择弹窗 -->
        <el-dialog v-model="libVisible" title="从 Sample Photo 库选择" width="800px" top="5vh">
          <div style="margin-bottom:12px;display:flex;gap:10px;align-items:center">
            <el-input v-model="libKeyword" placeholder="ID/名称/标签" clearable size="default" style="width:200px" />
            <el-button type="primary" size="default" @click="libKeyword=''">搜索</el-button>
            <span style="font-size:12px;color:#909399;margin-left:auto">已选 {{ libSelected.length }} 张（最多还能选 {{ 3 - (dlgForm.samplePhotos||[]).length }} 张）</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:12px;max-height:400px;overflow-y:auto">
            <div v-for="sp in libFiltered" :key="sp.id"
              :class="['lib-card', { 'lib-card-sel': libSelected.includes(sp.id), 'lib-card-disabled': !sp.enabled }]"
              @click="toggleLibSelect(sp)"
            >
              <div class="lib-thumb">🖼</div>
              <div style="font-size:9px;color:#c0c4cc;margin-top:2px">{{ sp.id }}</div>
              <div v-if="sp.tags && sp.tags.length" style="display:flex;flex-wrap:wrap;gap:2px;justify-content:center;margin-top:2px">
                <span v-for="t in sp.tags" :key="t" style="background:#F0F2F5;color:#606266;padding:0 3px;border-radius:1px;font-size:9px">{{ t }}</span>
              </div>
              <div v-if="!sp.enabled" style="font-size:9px;color:#f56c6c">已禁用</div>
              <div v-if="libSelected.includes(sp.id)" style="position:absolute;top:4px;right:4px;width:20px;height:20px;background:#409EFF;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px">✓</div>
            </div>
          </div>
          <template #footer>
            <el-button @click="libVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmLibSelect">确认（{{ libSelected.length }} 张）</el-button>
          </template>
        </el-dialog>

        <!-- 效果卡：权益配置 -->
        <el-form-item v-if="dlgForm.cardType === '效果卡'" label="权益配置" prop="benefitId">
          <el-select v-model="dlgForm.benefitId" placeholder="请选择" style="width:100%">
            <el-option v-for="b in benefitOptions" :key="b.id" :label="b.id + ' - ' + b.name" :value="b.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="上线地区" prop="regions">
          <el-select v-model="dlgForm.regions" multiple placeholder="请选择上线地区" style="width:100%">
            <el-option v-for="r in presetRegionOptions" :key="r" :label="r" :value="r" />
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

    <!-- ===== 翻译预览弹窗 ===== -->
    <el-dialog v-model="transVisible" title="翻译预览" width="580px" top="8vh">
      <template v-if="transRow">
        <div style="margin-bottom:16px">
          <div class="trans-title">标题翻译</div>
          <div v-if="transRow.titleTrans" class="trans-preview" style="margin-top:6px">
            <div v-for="(v, k) in transRow.titleTrans" :key="'ptv'+k" class="trans-row">
              <span class="trans-lang">{{ k }}</span>
              <span class="trans-val">{{ v }}</span>
            </div>
          </div>
          <div v-else style="color:#c0c4cc;font-size:12px;padding:8px 0">暂未翻译</div>
        </div>
        <div>
          <div class="trans-title">描述翻译</div>
          <div v-if="transRow.descTrans" class="trans-preview" style="margin-top:6px">
            <div v-for="(v, k) in transRow.descTrans" :key="'pdv'+k" class="trans-row">
              <span class="trans-lang">{{ k }}</span>
              <span class="trans-val">{{ v }}</span>
            </div>
          </div>
          <div v-else style="color:#c0c4cc;font-size:12px;padding:8px 0">暂未翻译</div>
        </div>
      </template>
    </el-dialog>

    <!-- 原图预览弹窗 -->
    <el-dialog v-model="originPreviewVisible" title="原图预览" width="600px" top="8vh">
      <div v-if="originPreviewUrl" style="text-align:center">
        <div style="width:100%;min-height:400px;background:#ECF5FF;border:1px solid #d9ecff;border-radius:3px;display:flex;align-items:center;justify-content:center;font-size:48px">🖼</div>
        <div style="font-size:12px;color:#909399;margin-top:8px;word-break:break-all">{{ originPreviewUrl }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { presetCards, presetCardTypeOptions, presetRegionOptions, presetJumpTargets, benefitOptions, samplePhotos } from '../mock/data.js'

const STORAGE_KEY = 'virash-preset-cards-v11'
function load() { return presetCards.map(c => ({ ...c })) }
function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }

const list = reactive(load())

// 排序：运营卡在前按 sort，效果卡在后按 sort
// 运营卡固定置顶展示（按组内排序），效果卡排在其后；无单独「置顶」操作
const sortedList = computed(() => [...list].sort((a, b) => {
  const aOp = a.cardType === '运营卡' ? 0 : 1
  const bOp = b.cardType === '运营卡' ? 0 : 1
  if (aOp !== bOp) return aOp - bOp
  if ((a.enabled !== false) !== (b.enabled !== false)) return a.enabled === false ? 1 : -1
  return (a.sort ?? 0) - (b.sort ?? 0)
}))

const f = reactive({ keyword: '', cardType: '', region: '', enabled: null })
const page = ref(1), pageSize = ref(20)

const filtered = computed(() => sortedList.value.filter(c => {
  if (f.keyword && !c.key.toLowerCase().includes(f.keyword.toLowerCase())) return false
  if (f.cardType && c.cardType !== f.cardType) return false
  if (f.region && !(c.regions||[]).includes(f.region)) return false
  if (f.enabled !== null && f.enabled !== '' && c.enabled !== f.enabled) return false
  return true
}))
const pagedList = computed(() => { const s = (page.value-1)*pageSize.value; return filtered.value.slice(s, s+pageSize.value) })

function resetFilter() { Object.assign(f, { keyword: '', cardType: '', region: '', enabled: null }) }

const isVideo = url => url && (url.endsWith('.mp4') || url.includes('mp4'))
const detectType = url => isVideo(url) ? 'video' : 'image'
const nowStr = () => new Date().toLocaleString('zh-CN')
function formatRegions(regions) {
  if (!regions?.length) return '—'
  return regions.map((r) => (r === '全球' ? '全部国家' : r)).join('、')
}
function rightsCode(row) {
  if (row.rightsKey) return row.rightsKey
  if (row.effectId) return `vr.rights.${String(row.effectId).replace(/_/g, '.')}`
  return row.benefitId || '—'
}
function setEnabled(row, enabled) {
  row.enabled = enabled
  row.modifyTime = nowStr()
  save(list)
  ElMessage.success(enabled ? '已启用' : '已禁用')
}
function syncRelease(row) {
  ElMessage.success(`已触发同步 Release：${row.titleCn || row.id}`)
}
const autoEffectName = jt => jt ? jt.replace(/\s+/g, ' ') : ''


// 新增/编辑
const dlgVisible = ref(false), isAdd = ref(false), dlgForm = ref(null)
const mediaInput = ref(null)

const dlgRules = {
  regions: [{ required: true, message: '请选择至少一个地区', trigger: 'change' }],
}

function triggerMediaUpload() { mediaInput.value?.click() }

function autoMekey(field, id) { return id ? `homepage.preset.${id}.${field}` : '' }

function transStatusTag(s) { return { pending:'info', translating:'', completed:'success', translated:'success', failed:'danger' }[s] || 'info' }
function transStatusLabel(s) { return { pending:'待翻译', translating:'翻译中', completed:'翻译成功', translated:'已翻译', failed:'翻译失败' }[s] || '待翻译' }

function onMediaChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 50*1024*1024) { ElMessage.warning('文件大小不能超过 50MB'); return }
  const fakeUrl = `https://example.com/uploads/${file.name}`
  dlgForm.value.mediaUrl = fakeUrl
  dlgForm.value.mediaType = detectType(fakeUrl)
}

const onlineFeatures = ['Generate everything', 'Recreate Vid', 'Clone ID', 'URL to Vid']

function onCardTypeChange() {
  if (dlgForm.value) {
    dlgForm.value.jumpTarget = ''
    dlgForm.value.originalImage = null
    dlgForm.value.samplePhotos = []
    dlgForm.value.benefitId = ''
    dlgForm.value.benefitName = ''
    if (dlgForm.value.cardType === '运营卡') {
      // 从效果卡切换到运营卡：清空四个效果卡专属字段
      dlgForm.value.platformType = ''
      dlgForm.value.resultType = ''
      dlgForm.value.resultCount = 1
      dlgForm.value.effectId = ''
    } else {
      // 从运营卡切换到效果卡：恢复默认值
      dlgForm.value.platformType = 'weave'
      dlgForm.value.resultType = '图片'
      dlgForm.value.resultCount = 1
      dlgForm.value.effectId = ''
    }
  }
}

// ===== 示例图片：素材库选择 + 上传 + 拖拽 =====
const libVisible = ref(false), libKeyword = ref(''), libSelected = ref([])
const photoUploadInput = ref(null)
const dragPhotoIdx = ref(-1)
const originUploadInput = ref(null)

const libFiltered = computed(() => {
  const kw = libKeyword.value.toLowerCase()
  return samplePhotos.filter(sp => {
    if (!sp.enabled) return false
    // Exclude already selected in current form
    const currentIds = (dlgForm.value?.samplePhotos||[]).map(p => p.id)
    if (currentIds.includes(sp.id)) return false
    if (kw && !sp.id.toLowerCase().includes(kw) && !sp.name.toLowerCase().includes(kw) && !(sp.tags||[]).some(t => t.toLowerCase().includes(kw))) return false
    return true
  })
})

function openLibraryPicker() {
  if ((dlgForm.value?.samplePhotos||[]).length >= 3) return
  libSelected.value = []
  libKeyword.value = ''
  libVisible.value = true
}

function toggleLibSelect(sp) {
  if (!sp.enabled) return
  const idx = libSelected.value.indexOf(sp.id)
  const remaining = 3 - (dlgForm.value?.samplePhotos||[]).length
  if (idx >= 0) { libSelected.value.splice(idx, 1) }
  else if (libSelected.value.length < remaining) { libSelected.value.push(sp.id) }
  else { ElMessage.warning(`最多还能选 ${remaining} 张`) }
}

function confirmLibSelect() {
  if (!dlgForm.value) return
  const current = dlgForm.value.samplePhotos || []
  const newPhotos = libSelected.value.map(id => {
    const sp = samplePhotos.find(p => p.id === id)
    return { id: sp.id, url: sp.url, tags: sp.tags || [] }
  })
  dlgForm.value.samplePhotos = [...current, ...newPhotos].slice(0, 3)
  libVisible.value = false
  ElMessage.success(`已从素材库选择 ${newPhotos.length} 张`)
}

function triggerPhotoUpload() { photoUploadInput.value?.click() }
function onPhotoUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 10*1024*1024) { ElMessage.warning('图片大小不能超过 10MB，请压缩后重新上传'); return }
  const newId = 'SP-' + Date.now().toString(36).toUpperCase()
  // Add to samplePhotos library
  samplePhotos.push({ id: newId, url: `https://example.com/sample/${file.name}`, tags: [], enabled: true, modifyTime: nowStr() })
  // Add to current form
  const current = dlgForm.value.samplePhotos || []
  dlgForm.value.samplePhotos = [...current, { id: newId, url: `https://example.com/sample/${file.name}`, tags: [] }].slice(0, 3)
  ElMessage.success('图片已上传并自动绑定')
  e.target.value = ''
}

function removeDlgPhoto(idx) {
  if (dlgForm.value?.samplePhotos) dlgForm.value.samplePhotos.splice(idx, 1)
}

// 原图上传
const originPreviewVisible = ref(false), originPreviewUrl = ref('')
function previewOriginImage(row) { originPreviewUrl.value = row.originalImage?.url || ''; originPreviewVisible.value = true }
function triggerOriginUpload() { originUploadInput.value?.click() }
function onOriginUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 10*1024*1024) { ElMessage.warning('图片大小不能超过 10MB，请压缩后重新上传'); return }
  dlgForm.value.originalImage = { name: file.name, url: `https://example.com/origin/${file.name}` }
  e.target.value = ''
}
function removeOriginImage() { if (dlgForm.value) dlgForm.value.originalImage = null }

function dropPhoto(idx) {
  if (dragPhotoIdx.value < 0 || dragPhotoIdx.value === idx) return
  const arr = dlgForm.value.samplePhotos
  const item = arr.splice(dragPhotoIdx.value, 1)[0]
  arr.splice(idx, 0, item)
  dragPhotoIdx.value = -1
}

function openAdd() {
  isAdd.value = true
  dlgForm.value = reactive({
    id: 0, cardType: '运营卡', sort: 1, titleCn: '', descCn: '', titleTrans: null, descTrans: null, transStatus: 'pending',
    mediaUrl: '', mediaType: 'image', regions: ['全球'], enabled: true,
    jumpTarget: '', originalImage: null, samplePhotos: [], benefitId: '', benefitName: '',
    platformType: 'weave', resultType: '图片', resultCount: 1, effectId: '',
  })

  dlgVisible.value = true
}

function openEdit(row) {
  isAdd.value = false
  dlgForm.value = reactive({
    ...row,
    regions: [...(row.regions||[])],
    // 兼容旧数据：效果卡没有新字段时补充默认值
    platformType: row.platformType || (row.cardType === '效果卡' ? 'weave' : ''),
    resultType: row.resultType || (row.cardType === '效果卡' ? '图片' : ''),
    resultCount: row.resultCount != null ? row.resultCount : (row.cardType === '效果卡' ? 1 : 1),
    effectId: row.effectId || '',
  })
  dlgVisible.value = true
}

function saveDlg() {
  if (!dlgForm.value.mediaUrl) return ElMessage.warning('请输入或上传展示物料')
  if (!dlgForm.value.regions?.length) return ElMessage.warning('请选择上线地区')
  if (dlgForm.value.cardType === '运营卡' && !dlgForm.value.jumpTarget) return ElMessage.warning('请选择跳转功能')
  if (dlgForm.value.cardType === '效果卡' && !dlgForm.value.platformType) return ElMessage.warning('请选择平台类型')
  if (dlgForm.value.cardType === '效果卡' && !dlgForm.value.resultType) return ElMessage.warning('请选择结果类型')
  if (dlgForm.value.cardType === '效果卡' && (dlgForm.value.resultCount == null || dlgForm.value.resultCount < 1 || !Number.isInteger(dlgForm.value.resultCount))) return ElMessage.warning('请输入大于等于 1 的整数')
  if (dlgForm.value.cardType === '效果卡' && !dlgForm.value.originalImage) return ElMessage.warning('请上传原图')
  if (dlgForm.value.cardType === '效果卡' && (!dlgForm.value.samplePhotos || dlgForm.value.samplePhotos.length !== 3)) return ElMessage.warning('请配置 3 张示例图片')
  if (dlgForm.value.cardType === '效果卡' && !dlgForm.value.benefitId) return ElMessage.warning('请选择权益配置')
  // 效果卡启用时 effect_id 必填
  if (dlgForm.value.cardType === '效果卡' && dlgForm.value.enabled && !dlgForm.value.effectId?.trim()) return ElMessage.warning('请填写 effect_id 后再启用')

  const time = nowStr()
  const cardId = isAdd.value ? (Math.max(0, ...list.map(c => c.id)) + 1) : dlgForm.value.id
  const base = {
    titleCn: dlgForm.value.titleCn, descCn: dlgForm.value.descCn,
    titleKey: autoMekey('title', cardId), descKey: autoMekey('desc', cardId),
    titleTrans: dlgForm.value.titleTrans || null, descTrans: dlgForm.value.descTrans || null,
    mediaUrl: dlgForm.value.mediaUrl, mediaType: detectType(dlgForm.value.mediaUrl),
    regions: [...dlgForm.value.regions],
    jumpTarget: dlgForm.value.jumpTarget || '', transStatus: isAdd.value ? 'pending' : (dlgForm.value.transStatus || 'pending'),
    originalImage: dlgForm.value.originalImage || null,
    samplePhotos: dlgForm.value.samplePhotos || [],
    benefitId: dlgForm.value.benefitId || '',
    benefitName: dlgForm.value.cardType === '效果卡' ? (benefitOptions.find(b => b.id === dlgForm.value.benefitId)?.name || '') : '',
    platformType: dlgForm.value.cardType === '效果卡' ? (dlgForm.value.platformType || '') : '',
    resultType: dlgForm.value.cardType === '效果卡' ? (dlgForm.value.resultType || '') : '',
    resultCount: dlgForm.value.cardType === '效果卡' ? (dlgForm.value.resultCount || 1) : 1,
    effectId: dlgForm.value.cardType === '效果卡' ? (dlgForm.value.effectId?.trim() || '') : '',
    enabled: dlgForm.value.enabled, modifier: 'admin', modifyTime: time,
  }

  if (isAdd.value) {
    list.push({ id: cardId, cardType: dlgForm.value.cardType, sort: dlgForm.value.sort, ...base })
    ElMessage.success('新增成功')
  } else {
    const idx = list.findIndex(c => c.id === dlgForm.value.id)
    if (idx !== -1) { Object.assign(list[idx], { cardType: dlgForm.value.cardType, sort: dlgForm.value.sort, ...base }); ElMessage.success('保存成功') }
  }
  save(list)
  dlgVisible.value = false
}

function copyCard(row) {
  const maxSort = Math.max(0, ...list.map(c => c.sort))
  const newId = Math.max(0, ...list.map(c => c.id)) + 1
  const copy = { ...row, id: newId, sort: maxSort + 1, titleCn: row.titleCn + '(副本)', descCn: row.descCn + '(副本)', titleKey: autoMekey('title', newId), descKey: autoMekey('desc', newId), enabled: row.enabled, cardType: row.cardType, regions: [...(row.regions||[])], mediaUrl: row.mediaUrl, mediaType: row.mediaType, modifier: 'admin', modifyTime: nowStr() }
  list.push(copy); save(list); ElMessage.success('已复制')
}

const transVisible = ref(false)
const transRow = ref(null)
function openTransPreview(row) { transRow.value = row; transVisible.value = true }

function toggleCard(row) {
  const act = row.enabled ? '禁用' : '启用'
  // 效果卡启用时 effect_id 必填
  if (row.cardType === '效果卡' && !row.enabled && !row.effectId?.trim()) {
    return ElMessage.warning('请填写 effect_id 后再启用')
  }
  const tip = row.enabled
    ? '确认禁用后，该 Homepage Preset 卡片将不再在前端展示，确认禁用吗？'
    : '确认启用后，该 Homepage Preset 卡片将按当前配置参与前端展示，确认启用吗？'
  ElMessageBox.confirm(tip, `确认${act}`, { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' })
    .then(() => {
      const idx = list.findIndex(c => c.id === row.id)
      if (idx !== -1) { list[idx].enabled = !list[idx].enabled; list[idx].modifier = 'admin'; list[idx].modifyTime = nowStr(); save(list); ElMessage.success(`${act}成功`) }
    }).catch(() => {})
}
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

.table-wrap { background: #fff; border: 1px solid #EBEEF5; border-radius: 2px; padding: 14px 18px; }
.table-scroll { width: 100%; overflow-x: auto; }
.cards-table { min-width: 1680px; }
.pager-row { display: flex; justify-content: flex-end; margin-top: 12px; }

.mini-preview { width: 48px; height: 48px; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 1px solid #EBEEF5; flex-shrink: 0; }
.prev-img { background: #ECF5FF; color: #409EFF; }
.prev-vid { background: #FEF0F0; color: #F56C6C; }

.web-preview { width: 120px; height: 213px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 32px; border: 1px solid #DCDFE6; }
.web-preview-img { background: #ECF5FF; color: #409EFF; }
.web-preview-vid { background: #FEF0F0; color: #F56C6C; }

/* 翻译预览 */
.trans-preview { margin-top: 10px; background: #F5F7FA; border: 1px solid #E4E7ED; border-radius: 3px; padding: 10px 14px; }
.trans-title { font-size: 12px; font-weight: 600; color: #606266; margin-bottom: 6px; }
.trans-row { display: flex; padding: 3px 0; font-size: 12px; line-height: 1.5; }
.trans-lang { color: #909399; width: 120px; flex-shrink: 0; }
.trans-val { color: #303133; }

.pop-trans-title { font-size: 12px; font-weight: 600; color: #606266; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #EBEEF5; }

.link { color: #409EFF; cursor: pointer; font-size: 13px; margin-right: 10px; }
.link:hover { color: #66b1ff; }
.link.dark { color: #303133; }
.link.dark:hover { color: #606266; }
.link.warn { color: #E6A23C; }
.link.warn:hover { color: #ebb563; }
.muted { color: #c0c4cc; font-size: 12px; }
.base-info { display: flex; align-items: flex-start; gap: 10px; }
.base-text { min-width: 0; flex: 1; }
.base-title { font-size: 13px; font-weight: 600; color: #303133; line-height: 1.35; margin-bottom: 4px; }
.base-id { font-size: 12px; color: #909399; line-height: 1.35; word-break: break-all; }
.empty-preview { background: #f5f7fa; color: #c0c4cc; }
.cfg-text { font-size: 12px; color: #303133; }
.material-grid { display: grid; grid-template-columns: repeat(2, 28px); gap: 4px; width: 60px; }
.material-thumb, .origin-thumb {
  width: 28px; height: 28px; background: #ECF5FF; border: 1px solid #d9ecff; border-radius: 2px;
  display: flex; align-items: center; justify-content: center; font-size: 12px;
}
.origin-thumb { width: 48px; height: 48px; font-size: 16px; }
.status-cell { display: flex; align-items: center; gap: 8px; }
.status-label { font-size: 12px; color: #909399; }
.status-label.on { color: #409EFF; }

/* 素材库选择 */
.lib-card { width: 120px; padding: 8px; background: #fff; border: 1px solid #EBEEF5; border-radius: 3px; cursor: pointer; display: flex; flex-direction: column; align-items: center; position: relative; transition: all 0.15s; }
.lib-card:hover { border-color: #409EFF; }
.lib-card-sel { border-color: #409EFF; background: #ECF5FF; }
.lib-card-disabled { opacity: 0.4; cursor: not-allowed; }
.lib-thumb { width: 80px; height: 110px; background: #ECF5FF; border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
</style>
