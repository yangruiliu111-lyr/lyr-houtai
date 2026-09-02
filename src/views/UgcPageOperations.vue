<template>
  <div class="page-root">
    <div class="page-head"><h1 class="page-title">UGC 页面运营</h1></div>
    <div class="page-body">
      <div class="info-bar">按平台创建 UGC 内容分组，并从现有 Hook 模版或 Homepage Preset 卡片中添加内容。展示观看数、排序和展示状态仅对当前分组生效。</div>

      <div class="filter-bar">
        <div class="filter-item"><span>分组名称</span><el-input v-model="filters.keyword" clearable placeholder="模糊搜索" style="width:200px" /></div>
        <div class="filter-item"><span>平台</span><el-select v-model="filters.platform" filterable allow-create default-first-option clearable placeholder="选择或输入平台" style="width:180px"><el-option v-for="item in platformSuggestions" :key="item" :label="item" :value="item" /></el-select></div>
        <div class="filter-item"><span>上线状态</span><el-select v-model="filters.enabled" clearable placeholder="全部" style="width:120px"><el-option label="启用" :value="true" /><el-option label="禁用" :value="false" /></el-select></div>
        <el-button type="primary">查询</el-button><el-button @click="resetFilters">重置</el-button><el-button @click="openGroupAdd">新增分组</el-button>
      </div>

      <div class="table-wrap">
        <el-table :data="filteredGroups" border stripe>
          <el-table-column label="分组信息" min-width="280">
            <template #default="scope">
              <div class="group-info">
                <div class="platform-icon" :class="platformClass(scope.row.platform)"><img v-if="scope.row.iconUrl" :src="scope.row.iconUrl" :alt="scope.row.platform" /><span v-else>{{ platformShort(scope.row.platform) }}</span></div>
                <div class="group-copy"><strong>{{ scope.row.title }}</strong><span>{{ scope.row.description || '—' }}</span><small>ID: {{ scope.row.id }}</small></div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="platform" label="平台" width="110" />
          <el-table-column label="内容标签" width="230"><template #default="s"><div class="content-label-preview"><b>{{ s.row.contentType }}</b><span>{{ s.row.contentLabel }}</span><em>🔥</em></div></template></el-table-column>
          <el-table-column label="模版数量" width="95"><template #default="s">{{ s.row.templates.length }}</template></el-table-column>
          <el-table-column prop="sort" label="排序" width="75" />
          <el-table-column label="上线地区" min-width="130" show-overflow-tooltip><template #default="s">{{ s.row.regions.join('、') }}</template></el-table-column>
          <el-table-column label="上线状态" width="120"><template #default="s"><div class="status-switch"><span :class="{active:!s.row.enabled}">禁用</span><el-switch v-model="s.row.enabled" @change="persist" /><span :class="{active:s.row.enabled}">启用</span></div></template></el-table-column>
          <el-table-column prop="modifier" label="修改人" width="90" />
          <el-table-column prop="modifyTime" label="修改时间" width="165" />
          <el-table-column label="操作" width="220" fixed="right"><template #default="s"><div class="operations"><span class="link" @click="openTemplateConfig(s.row)">配置模版</span><span class="link" @click="openGroupEdit(s.row)">编辑</span><span class="link" @click="copyGroup(s.row)">复制</span></div></template></el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="groupDialogVisible" :title="groupIsAdd ? '新增 UGC 分组' : '编辑 UGC 分组'" width="720px" top="5vh">
      <el-form v-if="groupForm" ref="groupFormRef" :model="groupForm" :rules="groupRules" label-width="120px">
        <el-form-item label="平台" prop="platform"><el-select v-model="groupForm.platform" filterable allow-create default-first-option placeholder="选择已有平台或输入新平台" style="width:100%"><el-option v-for="item in platformSuggestions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="分组图标">
          <div class="group-icon-field">
            <button type="button" class="group-icon-upload" @click="chooseGroupIcon">
              <img v-if="groupForm.iconUrl" :src="groupForm.iconUrl" alt="分组图标" />
              <span v-else><el-icon :size="24"><Plus /></el-icon><small>上传图片</small></span>
            </button>
            <div class="group-icon-actions"><el-button type="primary" link @click="chooseGroupIcon">{{ groupForm.iconUrl ? '更换图片' : '上传图片' }}</el-button><el-button v-if="groupForm.iconUrl" type="danger" link @click="removeGroupIcon">删除</el-button><p>最多 1 张，支持 PNG、JPG、JPEG、WebP，建议使用方形图片，大小不超过 10MB。</p></div>
            <input ref="groupIconInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" class="hidden-input" @change="onGroupIconChange" />
          </div>
        </el-form-item>
        <el-form-item label="卡片平台标识图">
          <div class="group-icon-field">
            <button type="button" class="group-icon-upload platform-badge-upload" @click="choosePlatformBadge">
              <img v-if="groupForm.platformBadgeUrl" :src="groupForm.platformBadgeUrl" alt="卡片平台标识图" />
              <span v-else><el-icon :size="24"><Plus /></el-icon><small>上传图片</small></span>
            </button>
            <div class="group-icon-actions"><el-button type="primary" link @click="choosePlatformBadge">{{ groupForm.platformBadgeUrl ? '更换图片' : '上传图片' }}</el-button><el-button v-if="groupForm.platformBadgeUrl" type="danger" link @click="removePlatformBadge">删除</el-button><p>展示在每张模版卡片的观看数左侧，同一分组共用 1 张；支持 PNG、JPG、JPEG、WebP，大小不超过 10MB。</p></div>
            <input ref="platformBadgeInput" type="file" accept="image/png,image/jpeg,image/jpg,image/webp" class="hidden-input" @change="onPlatformBadgeChange" />
          </div>
        </el-form-item>
        <el-form-item label="分组名称" prop="title"><el-input v-model="groupForm.title" placeholder="例如 TikTok HOOK TopView" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="groupForm.description" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入分组说明" /></el-form-item>
        <el-form-item label="内容类型" prop="contentType"><el-radio-group v-model="groupForm.contentType" @change="onContentTypeChange"><el-radio-button label="Hook">Hook</el-radio-button><el-radio-button label="Viral Presets">Viral Presets</el-radio-button></el-radio-group></el-form-item>
        <el-form-item label="标签文案" prop="contentLabel"><el-input v-model="groupForm.contentLabel" maxlength="50" placeholder="例如 Conversion Booster" /></el-form-item>
        <el-form-item label="标签预览"><div class="content-label-preview preview-large"><b>{{ groupForm.contentType }}</b><span>{{ groupForm.contentLabel || 'Conversion Booster' }}</span><em>🔥</em></div></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="groupForm.sort" :min="0" :max="9999" /></el-form-item>
        <el-form-item label="上线地区" prop="regions"><el-select v-model="groupForm.regions" multiple style="width:100%"><el-option v-for="item in regionOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="上线状态"><el-radio-group v-model="groupForm.enabled"><el-radio :label="true">启用</el-radio><el-radio :label="false">禁用</el-radio></el-radio-group></el-form-item>
      </el-form>
      <template #footer><el-button @click="groupDialogVisible=false">取消</el-button><el-button type="primary" @click="saveGroup">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="templateDialogVisible" :title="`${activeGroup?.title || ''} · 模版配置`" width="1100px" top="4vh">
      <div class="template-toolbar"><div><strong>{{ activeGroup?.platform }}</strong><span>当前共 {{ activeGroup?.templates.length || 0 }} 个模版</span></div><el-button type="primary" @click="openPicker">添加模版</el-button></div>
      <el-table v-if="activeGroup" :data="activeGroup.templates" border>
        <el-table-column label="模版信息" min-width="240"><template #default="s"><div class="template-info"><div class="template-thumb"><img v-if="s.row.cover" :src="s.row.cover" /><span v-else>{{ s.row.type === 'Hook' ? 'H' : 'P' }}</span></div><div><strong>{{ s.row.title }}</strong><small>{{ s.row.sourceId }}</small></div></div></template></el-table-column>
        <el-table-column prop="type" label="模版类型" width="100"><template #default="s"><el-tag size="small" :type="s.row.type==='Hook'?'':'success'">{{ s.row.type }}</el-tag></template></el-table-column>
        <el-table-column label="展示观看数" width="155"><template #default="s"><el-input-number v-model="s.row.displayViews" :min="0" :max="999999999" size="small" controls-position="right" @change="touchActiveGroup" /></template></el-table-column>
        <el-table-column label="前端预览" width="110"><template #default="s"><span class="view-preview"><el-icon><View /></el-icon>{{ formatViews(s.row.displayViews) }}</span></template></el-table-column>
        <el-table-column label="排序" width="105"><template #default="s"><el-input-number v-model="s.row.sort" :min="0" :max="9999" size="small" controls-position="right" @change="touchActiveGroup" /></template></el-table-column>
        <el-table-column label="展示" width="75"><template #default="s"><el-switch v-model="s.row.visible" @change="touchActiveGroup" /></template></el-table-column>
        <el-table-column label="操作" width="80"><template #default="s"><span class="danger-link" @click="removeTemplate(s.$index)">移出</span></template></el-table-column>
      </el-table>
      <el-empty v-if="activeGroup && !activeGroup.templates.length" description="尚未添加模版" />
      <template #footer><el-button type="primary" @click="closeTemplateConfig">完成</el-button></template>
    </el-dialog>

    <el-dialog v-model="pickerVisible" :title="activeGroup?.contentType === 'Viral Presets' ? '添加 Viral Preset 卡片' : '添加 Hook 模版'" width="900px" top="6vh" append-to-body>
      <div class="picker-toolbar"><el-tag>{{ activeGroup?.contentType }}</el-tag><el-input v-model="pickerKeyword" clearable placeholder="搜索标题或 ID" style="width:240px" /></div>
      <div class="picker-grid">
        <label v-for="item in filteredCandidates" :key="`${item.type}-${item.id}`" :class="['picker-card',{selected:selectedCandidateIds.includes(candidateKey(item)),disabled:isAdded(item)}]">
          <el-checkbox :model-value="selectedCandidateIds.includes(candidateKey(item))" :disabled="isAdded(item)" @change="checked=>toggleCandidate(item,checked)" />
          <div class="picker-thumb"><img v-if="item.cover" :src="item.cover" /><span v-else>{{ item.type === 'Hook' ? 'H' : 'P' }}</span></div>
          <div class="picker-copy"><strong>{{ item.title }}</strong><span>{{ item.id }}</span><small>{{ isAdded(item) ? '已在当前分组' : item.type }}</small></div>
        </label>
      </div>
      <template #footer><el-button @click="pickerVisible=false">取消</el-button><el-button type="primary" :disabled="!selectedCandidateIds.length" @click="confirmAddTemplates">添加（{{ selectedCandidateIds.length }}）</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, View } from '@element-plus/icons-vue'
import { presetCards } from '../mock/data.js'

const STORAGE_KEY = 'virash-ugc-page-operations-v1'
const HOOK_STORAGE_KEY = 'virash-hook-cards-v2'
const regionOptions = ['全部国家', '美国', '加拿大', '巴西', '英国', '法国', '德国', '西班牙', '意大利', '日本', '韩国', '泰国', '澳大利亚']
const initialGroups = [
  { id:'UGC-TT-001', platform:'TikTok', title:'TikTok HOOK TopView', description:'Generate a hook from a template', contentType:'Hook', contentLabel:'Conversion Booster', sort:1, regions:['全部国家'], enabled:true, modifier:'admin', modifyTime:'2026/09/01 10:30', templates:[
    { sourceId:'HOOK-001', type:'Hook', title:'Problem → Solution', cover:'https://picsum.photos/seed/ugc-hook-1/240/320', displayViews:999, sort:1, visible:true },
    { sourceId:'HOOK-002', type:'Hook', title:'Before & After', cover:'https://picsum.photos/seed/ugc-hook-2/240/320', displayViews:860, sort:2, visible:true },
    { sourceId:'HOOK-003', type:'Hook', title:'Product Close-up', cover:'https://picsum.photos/seed/ugc-hook-3/240/320', displayViews:1280, sort:3, visible:true },
  ]},
  { id:'UGC-IG-001', platform:'Instagram', title:'Instagram Reels Inspiration', description:'Create your next reel from a proven template', contentType:'Viral Presets', contentLabel:'Reels Trending', sort:2, regions:['美国','英国'], enabled:true, modifier:'admin', modifyTime:'2026/09/01 10:10', templates:[] },
  { id:'UGC-PIN-001', platform:'Pinterest', title:'Pinterest Creative Ideas', description:'Turn inspiration into a new creation', contentType:'Viral Presets', contentLabel:'Creative Ideas', sort:3, regions:['全部国家'], enabled:false, modifier:'admin', modifyTime:'2026/09/01 09:40', templates:[] },
]
function loadGroups(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));const source=saved||initialGroups;return source.map(item=>({...item,contentType:legacyContentType(item),contentLabel:legacyContentLabel(item),templates:(item.templates||[]).map(({pinned,...template})=>template)}))}catch(_){return initialGroups}}
const groups = reactive(loadGroups())
const platformSuggestions=computed(()=>Array.from(new Set(['TikTok','Instagram','Pinterest',...groups.map(item=>String(item.platform||'').trim()).filter(Boolean)])))
const filters = reactive({keyword:'',platform:'',enabled:''})
const groupDialogVisible=ref(false), groupIsAdd=ref(false), groupForm=ref(null), groupFormRef=ref(null), groupIconInput=ref(null), platformBadgeInput=ref(null)
const templateDialogVisible=ref(false), activeGroup=ref(null), pickerVisible=ref(false), pickerKeyword=ref(''), selectedCandidateIds=ref([])
const groupRules={platform:[{required:true,message:'请选择或输入平台',trigger:'change'}],title:[{required:true,message:'请输入分组名称',trigger:'blur'}],contentType:[{required:true,message:'请选择内容类型',trigger:'change'}],contentLabel:[{required:true,message:'请输入标签文案',trigger:'blur'}],regions:[{required:true,type:'array',min:1,message:'请选择上线地区',trigger:'change'}]}
const filteredGroups=computed(()=>groups.filter(item=>{
  if(filters.keyword&&!`${item.title} ${item.id}`.toLowerCase().includes(filters.keyword.toLowerCase()))return false
  if(filters.platform&&!String(item.platform||'').toLowerCase().includes(filters.platform.trim().toLowerCase()))return false
  if(filters.enabled!==''&&item.enabled!==filters.enabled)return false
  return true
}).sort((a,b)=>(a.sort||0)-(b.sort||0)))
function resetFilters(){Object.assign(filters,{keyword:'',platform:'',enabled:''})}
function platformShort(platform){return {TikTok:'TT',Instagram:'IG',Pinterest:'P'}[platform]||platform.slice(0,2)}
function platformClass(platform){return `platform-${platform.toLowerCase()}`}
function nowStr(){return new Date().toLocaleString('zh-CN')}
function persist(){localStorage.setItem(STORAGE_KEY,JSON.stringify(groups))}
function legacyContentType(row){return row.contentType||(/^viral presets/i.test(row.contentBadge||'')?'Viral Presets':'Hook')}
function legacyContentLabel(row){if(row.contentLabel)return row.contentLabel;return String(row.contentBadge||'').replace(/^(Hook|Viral Presets)\s*/i,'').trim()||'Conversion Booster'}
function emptyGroup(row={}){return{id:row.id||'',platform:row.platform||'TikTok',iconUrl:row.iconUrl||'',platformBadgeUrl:row.platformBadgeUrl||'',title:row.title||'',description:row.description||'',contentType:legacyContentType(row),contentLabel:legacyContentLabel(row),sort:Number.isFinite(row.sort)?row.sort:0,regions:row.regions?.length?[...row.regions]:['全部国家'],enabled:row.enabled!==false,templates:row.templates?JSON.parse(JSON.stringify(row.templates)):[]}}
function openGroupAdd(){groupIsAdd.value=true;groupForm.value=emptyGroup();groupDialogVisible.value=true}
function openGroupEdit(row){groupIsAdd.value=false;groupForm.value=emptyGroup(row);groupDialogVisible.value=true}
function chooseGroupIcon(){groupIconInput.value?.click()}
function onGroupIconChange(event){const file=event.target.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)){ElMessage.warning('仅支持 PNG、JPG、JPEG、WebP 图片');return}if(file.size>10*1024*1024){ElMessage.warning('图片大小不能超过 10MB');return}const reader=new FileReader();reader.onload=()=>{groupForm.value.iconUrl=String(reader.result||'')};reader.readAsDataURL(file);event.target.value=''}
function removeGroupIcon(){groupForm.value.iconUrl='';if(groupIconInput.value)groupIconInput.value.value=''}
function choosePlatformBadge(){platformBadgeInput.value?.click()}
function onPlatformBadgeChange(event){const file=event.target.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)){ElMessage.warning('仅支持 PNG、JPG、JPEG、WebP 图片');return}if(file.size>10*1024*1024){ElMessage.warning('图片大小不能超过 10MB');return}const reader=new FileReader();reader.onload=()=>{groupForm.value.platformBadgeUrl=String(reader.result||'')};reader.readAsDataURL(file);event.target.value=''}
function removePlatformBadge(){groupForm.value.platformBadgeUrl='';if(platformBadgeInput.value)platformBadgeInput.value.value=''}
function templateTypeForContentType(contentType){return contentType==='Viral Presets'?'Preset':'Hook'}
function onContentTypeChange(){const expectedType=templateTypeForContentType(groupForm.value.contentType);const hasOtherType=groupForm.value.templates.some(item=>item.type!==expectedType);if(hasOtherType){groupForm.value.templates=[];ElMessage.warning('内容类型已变更，原有不匹配的模版关联已清空，请重新配置')}}
async function saveGroup(){try{await groupFormRef.value.validate()}catch(_){return}const payload={...groupForm.value,id:groupForm.value.id||`UGC-${Date.now().toString(36).toUpperCase()}`,modifier:'admin',modifyTime:nowStr()};const index=groups.findIndex(item=>item.id===payload.id);if(index>=0)groups[index]=payload;else groups.unshift(payload);persist();groupDialogVisible.value=false;ElMessage.success('UGC 分组保存成功')}
function copyGroup(row){const copy=JSON.parse(JSON.stringify(row));copy.id=`UGC-${Date.now().toString(36).toUpperCase()}`;copy.title=`${row.title}（副本）`;copy.enabled=false;copy.modifier='admin';copy.modifyTime=nowStr();groups.unshift(copy);persist();ElMessage.success('分组复制成功')}
function openTemplateConfig(row){activeGroup.value=row;templateDialogVisible.value=true}
function closeTemplateConfig(){touchActiveGroup();templateDialogVisible.value=false}
function touchActiveGroup(){if(!activeGroup.value)return;activeGroup.value.modifier='admin';activeGroup.value.modifyTime=nowStr();persist()}
function removeTemplate(index){activeGroup.value.templates.splice(index,1);touchActiveGroup();ElMessage.success('已移出当前分组')}
function formatViews(value){const n=Number(value)||0;if(n>=1000000)return`${(n/1000000).toFixed(n>=10000000?0:1)}M`;if(n>=1000)return`${(n/1000).toFixed(n>=10000?0:1)}K`;return String(n)}

const fallbackHooks=[
  {id:'HOOK-001',title:'Turn a problem into a solution',displayMaterial:{url:'https://picsum.photos/seed/candidate-hook-1/240/320',type:'image'},enabled:true},
  {id:'HOOK-002',title:'See the transformation',displayMaterial:{url:'https://picsum.photos/seed/candidate-hook-2/240/320',type:'image'},enabled:true},
  {id:'HOOK-003',title:'Put your product in focus',displayMaterial:{url:'https://picsum.photos/seed/candidate-hook-3/240/320',type:'image'},enabled:true},
]
function loadHooks(){try{return JSON.parse(localStorage.getItem(HOOK_STORAGE_KEY))||fallbackHooks}catch(_){return fallbackHooks}}
const hookCandidates=computed(()=>loadHooks().filter(item=>item.enabled!==false).map(item=>({id:item.id,type:'Hook',title:item.title||item.name||item.id,cover:item.displayMaterial?.type==='image'?item.displayMaterial.url:item.avatar?.url||item.product?.url||item.scene?.url||''})))
const presetCandidates=computed(()=>presetCards.filter(item=>item.enabled!==false).map(item=>({id:item.id||item.key,type:'Preset',title:item.titleCn||item.title||item.key,cover:item.mediaType==='image'?item.mediaUrl:''})))
const allowedTemplateType=computed(()=>templateTypeForContentType(activeGroup.value?.contentType))
const filteredCandidates=computed(()=>{
  const source=allowedTemplateType.value==='Hook'?hookCandidates.value:presetCandidates.value
  const keyword=pickerKeyword.value.trim().toLowerCase()
  return keyword?source.filter(item=>`${item.title} ${item.id}`.toLowerCase().includes(keyword)):source
})
function candidateKey(item){return`${item.type}:${item.id}`}
function isAdded(item){return activeGroup.value?.templates.some(template=>template.type===item.type&&template.sourceId===item.id)}
function openPicker(){selectedCandidateIds.value=[];pickerKeyword.value='';pickerVisible.value=true}
function toggleCandidate(item,checked){if(item.type!==allowedTemplateType.value)return;const key=candidateKey(item);if(checked&&!selectedCandidateIds.value.includes(key))selectedCandidateIds.value.push(key);if(!checked)selectedCandidateIds.value=selectedCandidateIds.value.filter(id=>id!==key)}
function confirmAddTemplates(){const source=allowedTemplateType.value==='Hook'?hookCandidates.value:presetCandidates.value;const start=activeGroup.value.templates.length;let added=0;selectedCandidateIds.value.forEach(key=>{const item=source.find(candidate=>candidateKey(candidate)===key);if(item&&item.type===allowedTemplateType.value&&!isAdded(item)){activeGroup.value.templates.push({sourceId:item.id,type:item.type,title:item.title,cover:item.cover,displayViews:0,sort:start+added+1,visible:true});added+=1}});if(!added){ElMessage.warning('未找到与当前内容类型匹配的模版');return}touchActiveGroup();pickerVisible.value=false;ElMessage.success('模版添加成功')}
</script>

<style scoped>
.page-root{height:100%;overflow:auto}.page-head{padding:20px 24px 0;background:#fff;border-bottom:1px solid #EBEEF5}.page-title{margin:0 0 14px;color:#303133;font-size:26px;font-weight:600}.page-body{margin:16px 24px}.info-bar{margin-bottom:12px;padding:10px 16px;color:#909399;font-size:12px;line-height:1.8;background:#fff;border:1px solid #E4E7ED}.filter-bar{display:flex;align-items:center;gap:10px;margin-bottom:12px}.filter-item{display:flex;align-items:center;gap:8px;color:#606266;font-size:13px}.table-wrap{padding:14px 18px;background:#fff;border:1px solid #EBEEF5}.group-info{display:flex;align-items:center;gap:12px}.platform-icon{display:flex;width:48px;height:48px;flex:0 0 48px;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:700;border-radius:10px}.platform-tiktok{background:#151515}.platform-instagram{background:linear-gradient(135deg,#6C4ED9,#E84A7F,#F4A246)}.platform-pinterest{background:#E60023}.group-copy{display:flex;min-width:0;flex-direction:column;gap:4px}.group-copy strong{overflow:hidden;color:#303133;font-size:14px;text-overflow:ellipsis;white-space:nowrap}.group-copy span{overflow:hidden;color:#606266;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.group-copy small{color:#A8ABB2}.status-switch{display:flex;align-items:center;gap:7px;color:#909399;font-size:12px}.status-switch .active{color:#409EFF;font-weight:600}.operations{display:flex;gap:12px;white-space:nowrap}.link{color:#409EFF;cursor:pointer}.danger-link{color:#F56C6C;cursor:pointer}.template-toolbar,.picker-toolbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.template-toolbar div{display:flex;align-items:center;gap:12px}.template-toolbar span{color:#909399;font-size:12px}.template-info{display:flex;align-items:center;gap:10px}.template-thumb,.picker-thumb{display:flex;overflow:hidden;align-items:center;justify-content:center;color:#909399;background:#F5F7FA;border:1px solid #E4E7ED;border-radius:4px}.template-thumb{width:42px;height:56px;flex:0 0 42px}.template-thumb img,.picker-thumb img{width:100%;height:100%;object-fit:cover}.template-info>div:last-child{display:flex;min-width:0;flex-direction:column;gap:5px}.template-info strong{overflow:hidden;color:#303133;font-size:13px;text-overflow:ellipsis;white-space:nowrap}.template-info small{color:#909399}.view-preview{color:#606266;font-size:13px}.picker-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;max-height:480px;overflow:auto}.picker-card{position:relative;display:flex;min-width:0;align-items:center;gap:10px;padding:12px;cursor:pointer;background:#fff;border:1px solid #E4E7ED;border-radius:5px}.picker-card.selected{background:#ECF5FF;border-color:#409EFF}.picker-card.disabled{cursor:not-allowed;opacity:.55}.picker-card :deep(.el-checkbox){position:absolute;top:8px;right:8px}.picker-thumb{width:54px;height:72px;flex:0 0 54px}.picker-copy{display:flex;min-width:0;flex-direction:column;gap:6px}.picker-copy strong,.picker-copy span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.picker-copy strong{color:#303133;font-size:13px}.picker-copy span,.picker-copy small{color:#909399;font-size:11px}@media(max-width:1000px){.filter-bar{flex-wrap:wrap}.picker-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
.view-preview{display:inline-flex;align-items:center;gap:5px}
.platform-icon img{width:100%;height:100%;object-fit:cover;border-radius:10px}.group-icon-field{display:flex;align-items:flex-end;gap:14px}.group-icon-upload{display:flex;width:96px;height:96px;padding:0;overflow:hidden;align-items:center;justify-content:center;cursor:pointer;background:#FAFAFA;border:1px dashed #CDD3DE;border-radius:8px}.group-icon-upload:hover{border-color:#409EFF}.group-icon-upload img{width:100%;height:100%;object-fit:cover}.group-icon-upload span{display:flex;flex-direction:column;align-items:center;gap:7px;color:#A8ABB2}.group-icon-upload small{font-size:12px}.group-icon-actions{display:flex;align-items:center;flex-wrap:wrap;padding-bottom:2px}.group-icon-actions p{width:100%;margin:4px 0 0;color:#909399;font-size:12px}.hidden-input{display:none}
.group-icon-upload.platform-badge-upload{width:150px;height:58px}.group-icon-upload.platform-badge-upload img{object-fit:contain}
.content-label-preview{display:inline-flex;max-width:100%;height:28px;align-items:center;overflow:hidden;background:#fff;border:1px solid #F0F0F0;border-radius:8px}.content-label-preview b{height:100%;padding:0 8px;color:#fff;font-size:12px;line-height:28px;white-space:nowrap;background:#FF5A1F}.content-label-preview span{overflow:hidden;padding-left:8px;color:#303133;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.content-label-preview em{padding:0 7px 0 4px;font-size:13px;font-style:normal}.content-label-preview.preview-large{height:36px;border-radius:10px}.content-label-preview.preview-large b{padding:0 11px;font-size:14px;line-height:36px}.content-label-preview.preview-large span{font-size:14px}
</style>
