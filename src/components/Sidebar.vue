<template>
  <div class="sidebar-root">
    <div class="brand">
      <span class="brand-icon">V</span>
      <span class="brand-text">Virash</span>
    </div>
    <div class="menu-list">
      <div
        v-for="sub in currentSubs"
        :key="sub.path"
        :class="['menu-row', { active: isOn(sub.path) }]"
        @click="go(sub.path)"
      >
        <el-icon v-if="sub.icon" :size="16"><component :is="sub.icon" /></el-icon>
        <span>{{ sub.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({ activeModule: String })
const route = useRoute()
const router = useRouter()

function isOn(path) { return route.path === path }
function go(path) { if (path) router.push(path) }

const moduleSubs = {
  agent: [
    { path: '/agent/room', label: 'Virash 房间', icon: 'Monitor' },
    { path: '/agent/stream-err', label: 'Virash 流式错误', icon: 'Warning' },
  ],
  effects: [
    { path: '/effects/bubbles', label: 'Workspace 快捷气泡', icon: 'ChatLineSquare' },
    { path: '/effects/media-cards', label: 'Workspace 媒体卡片', icon: 'Picture' },
    { path: '/effects/homepage-cards', label: 'Homepage 功能卡片', icon: 'Picture' },
    { path: '/effects/preset-cards', label: 'Homepage Preset 卡片', icon: 'Tickets' },
    { path: '/effects/hook-cards', label: 'Hook 模版', icon: 'Connection' },
    { path: '/effects/sample-photos', label: 'Sample Photo 库', icon: 'FolderOpened' },
  ],
  aigc: [
    { path: '/aigc/overview', label: '数据概览', icon: 'DataAnalysis' },
    { path: '/aigc/tasks', label: '任务列表', icon: 'List' },
  ],
  ops: [
    { path: '/ops/ugc-pages', label: 'UGC 页面运营', icon: 'Grid' },
    { path: '/ops/homepage-banner', label: 'Homepage 活动 Banner', icon: 'Picture' },
    { path: '/ops/invite-redeem', label: '邀请码兑换', icon: 'Promotion' },
  ],
  billing: [
    { path: '/billing/free-benefits', label: '免费权益', icon: 'Ticket' },
    { path: '/billing/coin-pricing', label: '工具积分定价', icon: 'Coin' },
    { path: '/billing/consumption', label: '积分消耗明细', icon: 'Tickets' },
  ],
}

const currentSubs = computed(() => moduleSubs[props.activeModule] || [])
</script>

<style scoped>
.sidebar-root {
  height: 100%; background: #26343B; display: flex; flex-direction: column; user-select: none;
}
.brand {
  display: flex; align-items: center; gap: 10px; height: 56px; padding: 0 20px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.brand-icon {
  width: 30px; height: 30px; background: #ED1D7A; border-radius: 4px;
  color: #fff; font-size: 16px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.brand-text { color: #fff; font-size: 17px; font-weight: 600; }
.menu-list { flex: 1; padding: 6px 0; }
.menu-row {
  display: flex; align-items: center; gap: 10px; height: 42px; padding: 0 20px;
  color: rgba(255,255,255,0.6); cursor: pointer; font-size: 14px;
  border-left: 3px solid transparent; transition: all 0.15s;
}
.menu-row:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.04); }
.menu-row.active {
  color: #fff; background: rgba(237,29,122,0.15); border-left-color: #ED1D7A;
}
</style>
