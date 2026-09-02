// ============ 邀请注册链接 / 邀请码兑换 ============

export const inviteBenefitTypeOptions = [
  { value: 'credits', label: '积分' },
  { value: 'membership', label: '会员' },
  { value: 'free', label: '免费权益' },
]

export const inviteMembershipPlanOptions = [
  { value: 'plus_7d', label: '7 Days of Plus' },
  { value: 'pro_7d', label: '7 Days of Pro' },
  { value: 'plus_30d', label: '30 Days of Plus' },
  { value: 'pro_30d', label: '30 Days of Pro' },
]

let inviteLinkSeq = 3

export const inviteRedeemLinks = [
  {
    id: 'IL001',
    name: '春季拉新活动',
    slug: 'spring2026',
    startAt: '2026-03-01 00:00:00',
    endAt: '2026-04-30 23:59:59',
    redeemActivityId: 'SUB-ACT-10086',
    benefitTypes: ['credits'],
    creditAmount: 200,
    creditExpiryDays: 30,
    membershipPlan: '',
    membershipExpiryDays: 0,
    freeImageCount: 0,
    freeVideoCount: 0,
    freeExpiryDays: 0,
    mediaId: 'SP-001',
    mediaUrl: 'https://example.com/sample/sp_001.webp',
    mediaType: 'image',
    status: 'online',
    createdAt: '2026/03/01 10:20:00',
    modifier: 'admin',
  },
  {
    id: 'IL002',
    name: '邀请好友送会员',
    slug: 'invite-pro',
    startAt: '2026-02-15 00:00:00',
    endAt: '',
    redeemActivityId: 'SUB-ACT-10099',
    benefitTypes: ['membership'],
    creditAmount: 0,
    creditExpiryDays: 0,
    membershipPlan: 'pro_30d',
    membershipExpiryDays: 90,
    freeImageCount: 0,
    freeVideoCount: 0,
    freeExpiryDays: 0,
    mediaId: 'SP-003',
    mediaUrl: 'https://example.com/sample/sp_003.webp',
    mediaType: 'image',
    status: 'online',
    createdAt: '2026/02/15 14:08:00',
    modifier: 'admin',
  },
  {
    id: 'IL003',
    name: '测试链接（已下线）',
    slug: 'test-link',
    startAt: '2026-01-01 00:00:00',
    endAt: '2026-01-31 23:59:59',
    redeemActivityId: 'SUB-ACT-90001',
    benefitTypes: ['credits'],
    creditAmount: 50,
    creditExpiryDays: 7,
    membershipPlan: '',
    membershipExpiryDays: 0,
    freeImageCount: 0,
    freeVideoCount: 0,
    freeExpiryDays: 0,
    mediaId: '',
    mediaUrl: '',
    mediaType: 'image',
    status: 'offline',
    createdAt: '2026/01/01 09:00:00',
    modifier: 'zhangsan',
  },
]

export function nextInviteLinkId() {
  inviteLinkSeq += 1
  return `IL${String(inviteLinkSeq).padStart(3, '0')}`
}

export function buildInviteLinkUrl(slug) {
  const base = 'https://virash.ai'
  return `${base}/?invite=${encodeURIComponent(slug || '')}`
}

export function formatInviteBenefit(row) {
  const parts = []
  const types = row.benefitTypes || []
  if (types.includes('credits')) {
    parts.push(`积分 · ${Number(row.creditAmount || 0).toLocaleString()} · ${row.creditExpiryDays || 0}天`)
  }
  if (types.includes('membership')) {
    const plan = inviteMembershipPlanOptions.find((p) => p.value === row.membershipPlan)
    const pname = plan ? `会员 · ${plan.label}` : '会员'
    parts.push(`${pname} · ${row.membershipExpiryDays || 0}天`)
  }
  if (types.includes('free')) {
    const freeParts = []
    if (row.freeImageCount) freeParts.push(`免费生图 ${row.freeImageCount}次`)
    if (row.freeVideoCount) freeParts.push(`免费视频 ${row.freeVideoCount}次`)
    const detail = freeParts.length ? freeParts.join(' + ') : '免费权益'
    parts.push(`${detail} · ${row.freeExpiryDays || 0}天`)
  }
  return parts.length ? parts.join(' + ') : '—'
}
