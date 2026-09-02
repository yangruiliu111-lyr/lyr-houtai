<template>
  <div class="app-shell">
    <aside class="app-aside">
      <Sidebar :activeModule="activeModule" />
    </aside>
    <div class="app-right">
      <header class="app-topnav">
        <div class="topnav-tabs">
          <span
            v-for="mod in modules"
            :key="mod.id"
            :class="['topnav-item', { active: activeModule === mod.id }]"
            @click="switchModule(mod)"
          >{{ mod.label }}</span>
        </div>
        <div class="topnav-actions">
          <el-icon :size="18" style="cursor:pointer"><Bell /></el-icon>
          <el-avatar :size="28" icon="UserFilled" style="cursor:pointer;background:#c0c4cc" />
        </div>
      </header>
      <div class="app-body">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const route = useRoute()
const router = useRouter()

const modules = [
  { id: 'agent',      label: 'Agent 管理',   defaultPath: '/agent/room' },
  { id: 'aigc',       label: 'AIGC 推理',     defaultPath: '/aigc/overview' },
  { id: 'effects',    label: '效果配置',      defaultPath: '/effects/bubbles' },
  { id: 'ops',        label: '运营配置',      defaultPath: '/ops/ugc-pages' },
  { id: 'billing',    label: '积分管理',       defaultPath: '/billing/coin-pricing' },
]

function getModule(path) {
  if (path.startsWith('/agent')) return 'agent'
  if (path.startsWith('/effects')) return 'effects'
  if (path.startsWith('/aigc')) return 'aigc'
  if (path.startsWith('/ops')) return 'ops'
  if (path.startsWith('/billing')) return 'billing'
  return 'agent'
}

const activeModule = ref(getModule(route.path))
watch(() => route.path, (p) => { activeModule.value = getModule(p) })

function switchModule(mod) {
  activeModule.value = mod.id
  router.push(mod.defaultPath)
}
</script>

<style scoped>
.app-shell { display: flex; height: 100%; width: 100%; max-width: 100%; }
.app-aside { width: 220px; flex-shrink: 0; }
.app-right { flex: 1; display: flex; flex-direction: column; min-width: 0; max-width: 100%; overflow-x: hidden; }

.app-topnav {
  height: 48px; display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; background: #fff; border-bottom: 1px solid #e4e7ed; flex-shrink: 0;
}
.topnav-tabs { display: flex; align-items: center; gap: 0; overflow-x: auto; }
.topnav-item {
  padding: 12px 16px; font-size: 14px; color: #606266; cursor: pointer;
  border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.15s;
}
.topnav-item:hover { color: #ED1D7A; }
.topnav-item.active { color: #ED1D7A; border-bottom-color: #ED1D7A; font-weight: 600; }
.topnav-actions { display: flex; align-items: center; gap: 20px; }

.app-body { flex: 1; min-height: 0; background: #F5F5F5; }
</style>
