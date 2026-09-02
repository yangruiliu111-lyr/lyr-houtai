import { createRouter, createWebHashHistory } from 'vue-router'
import MonitorOverview from '../views/MonitorOverview.vue'
import MonitorTasks from '../views/MonitorTasks.vue'
import FreeBenefits from '../views/FreeBenefits.vue'
import InviteRedeemLinks from '../views/InviteRedeemLinks.vue'
import HomepageCards from '../views/HomepageCards.vue'
import PresetCards from '../views/PresetCards.vue'
import HookCards from '../views/HookCards.vue'
import SamplePhotos from '../views/SamplePhotos.vue'
import WorkspaceBubbles from '../views/WorkspaceBubbles.vue'
import UgcPageOperations from '../views/UgcPageOperations.vue'

function makePlaceholder(title) {
  return {
    template: `<div style="padding:24px;background:#F5F5F5;height:100%"><div style="background:#fff;border:1px solid #EBEEF5;border-radius:2px;padding:24px"><el-empty description="${title}" /></div></div>`
  }
}

const routes = [
  { path: '/', redirect: '/agent/room' },

  // ===== Agent 管理 =====
  { path: '/agent', redirect: '/agent/room' },
  { path: '/agent/room', component: makePlaceholder('Virash 房间'), meta: { title: 'Agent 管理' } },
  { path: '/agent/stream-err', component: makePlaceholder('Virash 流式错误'), meta: { title: 'Agent 管理' } },

  // ===== 效果配置 =====
  { path: '/effects', redirect: '/effects/bubbles' },
  { path: '/effects/bubbles', component: WorkspaceBubbles, meta: { title: '效果配置' } },
  { path: '/effects/media-cards', component: makePlaceholder('Workspace 媒体卡片'), meta: { title: '效果配置' } },
  { path: '/effects/homepage-cards', component: HomepageCards, meta: { title: '效果配置' } },
  { path: '/effects/preset-cards', component: PresetCards, meta: { title: '效果配置' } },
  { path: '/effects/hook-cards', component: HookCards, meta: { title: '效果配置' } },
  { path: '/effects/sample-photos', component: SamplePhotos, meta: { title: '效果配置' } },

  // ===== AIGC 推理 =====
  { path: '/aigc', redirect: '/aigc/overview' },
  { path: '/aigc/overview', component: MonitorOverview, meta: { title: 'AIGC 推理' } },
  { path: '/aigc/tasks', component: MonitorTasks, meta: { title: 'AIGC 推理' } },

  // ===== 运营配置 =====
  { path: '/ops', redirect: '/ops/ugc-pages' },
  { path: '/ops/ugc-pages', component: UgcPageOperations, meta: { title: '运营配置' } },
  { path: '/ops/invite-redeem', component: InviteRedeemLinks, meta: { title: '运营配置' } },
  { path: '/ops/homepage-banner', component: makePlaceholder('Homepage 活动 Banner'), meta: { title: '运营配置' } },

  // ===== 积分管理 =====
  { path: '/billing', redirect: '/billing/coin-pricing' },
  { path: '/billing/coin-pricing', component: makePlaceholder('工具积分定价'), meta: { title: '积分管理' } },
  { path: '/billing/consumption', component: makePlaceholder('积分消耗明细'), meta: { title: '积分管理' } },
  { path: '/billing/free-benefits', component: FreeBenefits, meta: { title: '积分管理' } },

  // ===== Legacy redirects =====
  { path: '/roboneo-room', redirect: '/agent/room' },
  { path: '/roboneo-stream-err', redirect: '/agent/stream-err' },
  { path: '/roboneo/room', redirect: '/agent/room' },
  { path: '/roboneo/stream-err', redirect: '/agent/stream-err' },
  { path: '/roboneo', redirect: '/agent/room' },
  { path: '/workspace', redirect: '/effects/bubbles' },
  { path: '/workspace/bubbles', redirect: '/effects/bubbles' },
  { path: '/workspace/media-cards', redirect: '/effects/media-cards' },
  { path: '/homepage', redirect: '/effects/homepage-cards' },
  { path: '/homepage/cards', redirect: '/effects/homepage-cards' },
  { path: '/homepage/preset', redirect: '/effects/preset-cards' },
  { path: '/homepage-cards', redirect: '/effects/homepage-cards' },
  { path: '/monitor', redirect: '/aigc/tasks' },
  { path: '/monitor/overview', redirect: '/aigc/overview' },
  { path: '/monitor/tasks', redirect: '/aigc/tasks' },
  { path: '/monitor/thresholds', redirect: '/aigc/tasks' },
  { path: '/monitor/config', redirect: '/aigc/tasks' },
  { path: '/monitor/fm', redirect: '/aigc/tasks' },
  { path: '/monitor/free-benefits', redirect: '/billing/free-benefits' },
  { path: '/aigc/free-benefits', redirect: '/billing/free-benefits' },
  { path: '/admin/pricing', redirect: '/billing/coin-pricing' },
  { path: '/admin/consumption', redirect: '/billing/consumption' },
  { path: '/reelbuzz', redirect: '/agent/room' },
  { path: '/reelbuzz/sessions', redirect: '/agent/room' },
]

const router = createRouter({ history: createWebHashHistory(), routes })
export default router
