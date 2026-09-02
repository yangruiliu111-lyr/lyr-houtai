// ============ 模型列表 ============
const VIDEO_MODELS = ['kling-3.0-omni', 'kling-2.6', 'kling-2.5-turbo']
const IMAGE_MODELS = ['nano-banana-2', 'nano-banana-pro', 'kling-o1']
const EDIT_MODELS = ['nano-banana', 'nano-banana-2', 'nano-banana-pro']

// ============ 功能 + 效果定义 ============
const FUNCTIONS = [
  {
    name: 'Generate everything', taskType: 'AI Generation',
    models: IMAGE_MODELS,
    params: [{ ratio: '1:1', style: 'premium_gold' }],
    outputSample: { type: 'image', count: 1, label: '生成结果' }
  },
  {
    name: 'Recreate Vid', taskType: 'Video Generation',
    models: VIDEO_MODELS,
    params: [{ ratio: '9:16', duration: '5s', resolution: '720P' }, { ratio: '9:16', duration: '10s', resolution: '1080P' }],
    outputSample: { type: 'video', count: 1, duration: '00:15', label: '生成视频' }
  },
  {
    name: 'Clone ID', taskType: 'Identity Generation',
    models: VIDEO_MODELS,
    params: [{ ratio: '9:16', duration: '30s', resolution: '1080P' }],
    outputSample: { type: 'video', count: 1, duration: '00:30', label: '生成视频' }
  },
  {
    name: 'URL to Vid', taskType: 'Video Generation',
    models: EDIT_MODELS,
    params: [{ ratio: '9:16', operation: 'URL Convert', quality: 'Standard' }],
    outputSample: { type: 'video', count: 1, duration: '00:30', label: '生成视频' }
  },
  // 效果类（与前四个功能一并进入任务汇总）
  {
    name: 'HD Reveal', taskType: 'Effect',
    models: IMAGE_MODELS,
    params: [{ ratio: '9:16', effect: 'HD Reveal' }],
    outputSample: { type: 'video', count: 1, duration: '00:08', label: '效果视频' }
  },
  {
    name: 'Brazilian Flip Dance', taskType: 'Effect',
    models: VIDEO_MODELS,
    params: [{ ratio: '9:16', effect: 'Brazilian Flip Dance', duration: '8s' }],
    outputSample: { type: 'video', count: 1, duration: '00:08', label: '效果视频' }
  },
  {
    name: 'Beach Grid', taskType: 'Effect',
    models: IMAGE_MODELS,
    params: [{ ratio: '9:16', effect: 'Beach Grid' }],
    outputSample: { type: 'video', count: 1, duration: '00:06', label: '效果视频' }
  },
  {
    name: 'Sparkling Accs', taskType: 'Effect',
    models: IMAGE_MODELS,
    params: [{ ratio: '9:16', effect: 'Sparkling Accs' }],
    outputSample: { type: 'video', count: 1, duration: '00:06', label: '效果视频' }
  },
  {
    name: 'Freeze Motion', taskType: 'Effect',
    models: VIDEO_MODELS,
    params: [{ ratio: '9:16', effect: 'Freeze Motion', duration: '5s' }],
    outputSample: { type: 'video', count: 1, duration: '00:05', label: '效果视频' }
  },
  {
    name: 'Oversized Hair Clip', taskType: 'Effect',
    models: IMAGE_MODELS,
    params: [{ ratio: '9:16', effect: 'Oversized Hair Clip' }],
    outputSample: { type: 'video', count: 1, duration: '00:06', label: '效果视频' }
  },
]

// ============ 国家 ============
const COUNTRIES = [
  { code: 'US', name: '美国', region: 'California', ip: '98.96.223.' },
  { code: 'US', name: '美国', region: 'Texas', ip: '72.55.180.' },
  { code: 'US', name: '美国', region: 'Florida', ip: '47.198.67.' },
  { code: 'BR', name: '巴西', region: 'São Paulo', ip: '177.68.142.' },
  { code: 'BR', name: '巴西', region: 'Rio de Janeiro', ip: '189.26.55.' },
  { code: 'DE', name: '德国', region: 'Berlin', ip: '91.65.130.' },
  { code: 'DE', name: '德国', region: 'Munich', ip: '79.204.45.' },
  { code: 'GB', name: '英国', region: 'London', ip: '82.27.110.' },
  { code: 'GB', name: '英国', region: 'Manchester', ip: '146.90.33.' },
  { code: 'FR', name: '法国', region: 'Paris', ip: '37.165.88.' },
  { code: 'ES', name: '西班牙', region: 'Madrid', ip: '88.12.45.' },
  { code: 'IT', name: '意大利', region: 'Milan', ip: '151.30.72.' },
  { code: 'CA', name: '加拿大', region: 'Toronto', ip: '99.230.15.' },
  { code: 'AU', name: '澳大利亚', region: 'Sydney', ip: '121.44.190.' },
]

const MEMBERS = ['免费用户', '月卡会员', '年卡会员']

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function pad(n, len) { return String(n).padStart(len, '0') }

const STATUS_POOL = [
  'success','success','success','success','success','success','success','success',
  'failed','failed',
  'blocked','blocked',
  'timeout','timeout',
  'external_model_failed',
]

function makeTask(id, func, status, dateStr) {
  const country = pick(COUNTRIES)
  const member = pick(MEMBERS)
  const isSuccess = status === 'success'
  const isFailed = status === 'failed'
  const isBlocked = status === 'blocked'
  const isTimeout = status === 'timeout'
  const isExternalFailed = status === 'external_model_failed'
  const model = pick(func.models)
  const params = { ...pick(func.params) }

  const duration = isTimeout ? rand(90000, 180000)
    : isFailed ? rand(2000, 30000)
    : isBlocked ? rand(500, 3000)
    : isExternalFailed ? rand(10000, 60000)
    : func.taskType === 'Text Generation' ? rand(1000, 10000)
    : func.taskType === 'Video Generation' || func.taskType === 'Effect' ? rand(15000, 120000)
    : rand(5000, 90000)

  const queueTime = rand(1, 30)
  const execTime = duration ? (duration - queueTime * 1000) : null

  // 成功任务二选一扣费：要么扣豆，要么扣权益次数（0/1），禁止同时消耗
  let cost = 0
  let benefitQuotaCost = 0
  if (isSuccess) {
    const useBenefitQuota = Math.random() < 0.38
    if (useBenefitQuota) {
      benefitQuotaCost = 1
      cost = 0
    } else {
      benefitQuotaCost = 0
      // 图片类 ~70，视频类 ~200，身份类 ~45
      cost = func.taskType === 'AI Generation' ? rand(60, 80)
        : func.taskType === 'Video Generation' ? rand(180, 220)
        : func.taskType === 'Identity Generation' ? rand(30, 60)
        : func.taskType === 'Effect' ? rand(40, 90)
        : rand(60, 80)
    }
  }

  let failReason = null, errorCode = null
  if (isFailed) {
    const r = pick([
      { reason: '素材解析失败', code: 'ERR_PARSE_400' },
      { reason: '模型服务异常', code: 'ERR_MODEL_503' },
    ])
    failReason = r.reason; errorCode = r.code
  } else if (isBlocked) {
    const r = pick([
      { reason: '内容审核拦截', code: 'ERR_MODERATION_403' },
      { reason: '敏感词命中', code: 'ERR_SENSITIVE_423' },
    ])
    failReason = r.reason; errorCode = r.code
  } else if (isExternalFailed) {
    const r = pick([
      { reason: '外采模型超时', code: 'ERR_EXTERNAL_TIMEOUT' },
      { reason: '外采模型返回异常', code: 'ERR_EXTERNAL_500' },
    ])
    failReason = r.reason; errorCode = r.code
  }

  // 状态流水
  const toState = isSuccess ? 'completed' : isFailed ? 'failed' : isBlocked ? 'blocked' : isTimeout ? 'timeout' : 'external_failed'
  const flowAction = isSuccess ? 'model_completed' : isFailed ? 'model_failed' : isBlocked ? 'content_blocked' : isTimeout ? 'task_timeout' : 'external_model_failed'
  const flow = [
    { id: `FL-${id}-01`, from: '-', to: 'created', action: 'task_created', remark: '用户提交任务', time: `${dateStr} ${String(rand(8,17)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}` },
    { id: `FL-${id}-02`, from: 'created', to: 'queued', action: 'task_queued', remark: '进入队列等待调度', time: `${dateStr} ${String(rand(8,18)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}` },
    { id: `FL-${id}-03`, from: 'queued', to: 'running', action: 'model_started', remark: `模型 ${model} 开始推理`, time: `${dateStr} ${String(rand(9,19)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}` },
    { id: `FL-${id}-04`, from: 'running', to: toState, action: flowAction, remark: isSuccess ? '任务执行成功' : failReason, time: `${dateStr} ${String(rand(10,20)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}` },
  ]

  // 创作设置
  let creatorSettings = null
  if (func.name === 'Recreate Vid' || func.name === 'Clone ID') {
    creatorSettings = { ratio: pick(['9:16', '1:1', '16:9']), duration: pick(['5s', '10s', '15s', '30s']), resolution: pick(['720P', '1080P']), mode: func.name === 'Clone ID' ? pick(['Fit Check / OOTD', 'Before / After', 'Motion from Reference']) : 'Face Swap' }
  } else if (func.name === 'Generate everything') {
    creatorSettings = { ratio: '1:1', cardStyle: pick(['Premium Gold', 'Diamond']), effect: '360° Rotation' }
  } else if (func.name === 'URL to Vid') {
    creatorSettings = { operation: pick(['Background Remove', 'Style Transfer', 'Super Resolution']), ratio: pick(['1:1', '9:16']) }
  } else if (func.name === 'Clone ID') {
    creatorSettings = { hookStyle: pick(['Curiosity', 'Shock', 'Emotional']), count: 3 }
  } else if (func.name === 'Clone ID') {
    creatorSettings = { platform: pick(['TikTok', 'Instagram', 'YouTube']), count: 15, language: 'en' }
  } else if (func.name === 'URL to Vid') {
    creatorSettings = { analysis: 'Full Structure', segments: 5 }
  } else if (func.taskType === 'Effect') {
    creatorSettings = { ratio: '9:16', effect: func.name, duration: pick(['5s', '6s', '8s']) }
  }

  let inputContent, outputContent
  if (func.name === 'Generate everything') {
    inputContent = {
      materials: [{ type: 'image', label: '人物照片' }, { type: 'image', label: '参考图' }], summary: '图片 × 2',
      fullText: null,
    }
    outputContent = isSuccess ? {
      materials: [{ type: 'image', label: '3D球星卡正面' }, { type: 'image', label: '3D球星卡背面' }, { type: 'image', label: '360°旋转帧1' }, { type: 'image', label: '360°旋转帧2' }, { type: 'image', label: '360°旋转帧3' }], summary: '图片 × 1',
      fullText: null,
    } : null
  } else if (func.name === 'Recreate Vid') {
    inputContent = {
      materials: [{ type: 'image', label: '人物照片' }, { type: 'video', label: '参考视频', duration: '00:08' }], summary: '图片 × 1 · 参考视频 × 1',
      fullText: '将视频中人物面部替换为目标人脸，保持自然光影和表情同步。参考视频中的头部姿态和表情变化将应用到源视频中。',
    }
    outputContent = isSuccess ? {
      materials: [{ type: 'video', label: '生成视频', duration: '00:15' }], summary: '视频 × 1',
      fullText: null,
    } : null
  } else if (func.name === 'Clone ID') {
    inputContent = {
      materials: [{ type: 'image', label: '产品图1' }, { type: 'image', label: '产品图2' }, { type: 'image', label: '产品图3' }, { type: 'video', label: '模特视频', duration: '00:12' }], summary: '图片 × 2 · 参考视频 × 1',
      fullText: '智能手表产品展示视频。目标受众为 25-40 岁都市白领。风格要求：快节奏、科技感、突出心率监测和睡眠分析功能。背景音乐：电子科技风。',
    }
    outputContent = isSuccess ? {
      materials: [{ type: 'video', label: '生成视频', duration: '00:30' }], summary: '视频 × 1',
      fullText: null,
    } : null
  } else if (func.name === 'URL to Vid') {
    inputContent = {
      materials: [{ type: 'video', label: '输入视频', duration: '00:45' }], summary: '视频 × 1',
      fullText: '输入 Reels 链接：https://www.instagram.com/reel/example_viral_001\n\n要求：完整拆解该爆款视频的结构、节奏和转场策略。',
    }
    outputContent = isSuccess ? {
      type: 'breakdown', summary: '拆解报告',
      hook: '前3秒使用悬念式开头"你绝对想不到..."引发强烈好奇心，配合快速缩放镜头制造紧张感',
      rhythm: '快节奏剪辑风格，平均 1.5 秒/镜头切换，总计 28 个镜头。前 10 秒为高潮段落，中间穿插 2 处慢镜头缓冲',
      shots: '特写（产品细节）→ 全景（使用场景）→ 特写（用户体验表情）的三镜循环结构，共 5 组循环',
      cta: '结尾 3 秒引导"点击主页了解更多"，配合箭头动画指向个人主页链接',
      fullText: '完整拆解报告：\n\n一、Hook 分析\n前3秒使用悬念式开头引发好奇心...\n\n二、节奏分析\n快节奏剪辑，平均1.5秒/镜头切换...\n\n三、镜头语言\n特写→全景→特写的三镜结构...\n\n四、CTA策略\n结尾引导点赞收藏，转化率预估提升25%...',
    } : null
  } else if (func.name === 'Clone ID') {
    inputContent = {
      materials: [{ type: 'text', label: '新款运动鞋产品介绍...' }], summary: '文本 × 1',
      fullText: '产品：新款轻量跑鞋，主打缓震科技和时尚外观。\n目标平台：TikTok / Instagram Reels\n目标受众：18-30 岁潮流运动人群\n视频时长：15-30 秒\n风格偏好：活力、年轻化、快节奏\n现有问题：开头过于平淡，用户前3秒流失率高',
    }
    outputContent = isSuccess ? {
      hooks: [
        '你敢相信这双鞋只卖199？上脚效果绝了！',
        '运动鞋圈的惊天秘密，99% 的人不知道缓震可以这样做',
        '我穿了 30 天这双鞋，膝盖竟然不疼了——真实测评',
        '跑鞋测评博主的私藏推荐，这双直接封神',
        '别再买千元跑鞋了，这双百元级吊打全场',
      ],
    } : null
  } else if (func.name === 'Clone ID') {
    inputContent = {
      materials: [{ type: 'text', label: '毕业季校园回忆视频...' }], summary: '文本 × 1',
      fullText: '视频主题：大学毕业季校园回忆混剪\n内容：图书馆、操场、食堂、宿舍、毕业典礼等场景\n背景音乐：《起风了》\n情感方向：青春、感动、不舍\n目标平台：TikTok，希望获得高曝光和互动',
    }
    outputContent = isSuccess ? {
      tags: ['#graduation', '#classof2026', '#毕业季', '#校园回忆', '#青春', '#起风了', '#毕业快乐', '#大学时光', '#校园vlog', '#毕业典礼', '#青春不散场', '#FYP', '#viral', '#trending', '#foryou'],
    } : null
  } else if (func.name === 'URL to Vid') {
    inputContent = {
      materials: [{ type: 'image', label: '原始图片' }, { type: 'image', label: '参考风格1' }, { type: 'image', label: '参考风格2' }], summary: '图片 × 2 · 参考模式',
      fullText: '将原始图片按照参考风格进行转换，保留原图人物主体和构图，只改变色调、光影和艺术风格。参考风格为日系胶片风。',
    }
    outputContent = isSuccess ? {
      materials: [{ type: 'image', label: '编辑后图片（日系胶片风）' }, { type: 'image', label: '编辑后图片（电影级调色）' }], summary: '图片 × 1',
      fullText: null,
    } : null
  } else if (func.taskType === 'Effect') {
    const outDuration = func.outputSample?.duration || '00:06'
    inputContent = {
      materials: [{ type: 'image', label: '人物照片' }],
      summary: '图片 × 1',
      fullText: `效果：${func.name}\n上传单张人像照片，生成对应效果视频。`,
    }
    outputContent = isSuccess ? {
      materials: [{ type: 'video', label: `${func.name} 效果视频`, duration: outDuration }],
      summary: '视频 × 1',
      fullText: null,
    } : null
  }

  let outputDisplay = null
  if (isSuccess) {
    if (func.taskType === 'Effect') outputDisplay = `${func.name} 效果视频`
    else if (func.name === 'Clone ID') outputDisplay = '#graduation #classof2026 +13'
    else if (func.name === 'Clone ID') outputDisplay = '已生成 3 条 Hook'
    else if (func.name === 'URL to Vid') outputDisplay = '拆解报告'
    else outputDisplay = outputContent?.summary || '生成完成'
  } else if (isFailed) outputDisplay = '无输出'
  else if (isBlocked) outputDisplay = '拦截，无输出'
  else if (isTimeout) outputDisplay = '任务超时，无输出'
  else if (isExternalFailed) outputDisplay = '外采模型失败，无输出'
  else outputDisplay = '生成中'

  return {
    id, uid: `30000${rand(100000, 999999)}`,
    funcName: func.name, taskType: func.taskType,
    creatorSettings, status, duration,
    cost, benefitQuotaCost, failReason, errorCode,
    country: country.name,
    countryCode: country.code,
    region: country.region,
    ip: country.ip + rand(1, 254),
    member,
    inputContent, outputContent, outputDisplay,
    createdAt: `${dateStr} ${String(rand(8,20)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}:${String(rand(0,59)).padStart(2,'0')}`,
  }
}

const tasks = []
let idx = 1
const dates = []
for (let d = 0; d < 5; d++) {
  const dt = new Date(); dt.setDate(dt.getDate() - d)
  dates.push(`${dt.getFullYear()}/${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')}`)
}
const dateStr = (d) => {
  const dt = new Date(); dt.setDate(dt.getDate() - d)
  return `${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,'0')}${String(dt.getDate()).padStart(2,'0')}`
}

// 各功能 / 效果任务量
const funcTaskCounts = {
  'Generate everything': 58,
  'Recreate Vid': 52,
  'Clone ID': 48,
  'URL to Vid': 42,
  'HD Reveal': 36,
  'Brazilian Flip Dance': 34,
  'Beach Grid': 32,
  'Sparkling Accs': 30,
  'Freeze Motion': 28,
  'Oversized Hair Clip': 26,
}

FUNCTIONS.forEach(func => {
  const count = funcTaskCounts[func.name] || 14
  for (let i = 0; i < count; i++) {
    const status = pick(STATUS_POOL)
    const d = pick([0, 1, 2, 3, 4])
    const id = 'T' + dateStr(d) + rand(14,23) + String(rand(0,5)).padStart(2,'0') + String(rand(0,5)).padStart(2,'0') + pad(idx, 3)
    tasks.push(makeTask(id, func, status, dates[d]))
    idx++
  }
})
tasks.sort((a, b) => b.id.localeCompare(a.id))

export { tasks, FUNCTIONS }

export const funcOptions = FUNCTIONS.map((func) => func.name)
export const modelOptions = [...new Set(FUNCTIONS.flatMap(f => f.models))]
export const statusOptions = [
  { value: 'success', label: '成功' }, { value: 'failed', label: '失败' },
  { value: 'blocked', label: '拦截' }, { value: 'timeout', label: '超时' },
  { value: 'external_model_failed', label: '外采模型失败' },
]
export const countryCodeOptions = ['美国', '巴西', '德国', '英国', '法国', '西班牙', '意大利', '加拿大', '澳大利亚']
export const memberOptions = MEMBERS

/** 免费基础权益额度（mock 口径） */
export const FREE_IMAGE_QUOTA = 3
export const FREE_VIDEO_QUOTA = 1

/**
 * 免费权益用户快照：用于「免费权益」页面。
 * grantTime – 免费权益成功发放时间，用于筛选；
 * freeImageUsed / freeVideoUsed – 截至当前的累计使用次数；
 * lastUsedTime – 最后一次使用免费权益的时间（用于排序），null 表示从未使用；
 * currentMember – 用户当前会员状态，可能已从免费用户升级。
 */
function makeBenefitGrantTime(index) {
  const now = Date.now()
  // spans last ~30 days, slightly more to earlier indices
  const daysAgo = Math.floor((index / 120) * 30) + rand(0, 2)
  const ts = new Date(now - daysAgo * 86400000 - rand(0, 86399) * 1000)
  const y = ts.getFullYear()
  const m = String(ts.getMonth() + 1).padStart(2, '0')
  const d = String(ts.getDate()).padStart(2, '0')
  const hh = String(ts.getHours()).padStart(2, '0')
  const mm = String(ts.getMinutes()).padStart(2, '0')
  const ss = String(ts.getSeconds()).padStart(2, '0')
  return { dateStr: `${y}/${m}/${d}`, fullStr: `${y}/${m}/${d} ${hh}:${mm}:${ss}`, ts }
}

export const freeBenefitUsers = (() => {
  const countries = countryCodeOptions
  const users = []
  for (let i = 0; i < 120; i++) {
    const imageRoll = Math.random()
    const freeImageUsed = imageRoll < 0.28 ? 0
      : imageRoll < 0.55 ? 1
      : imageRoll < 0.72 ? 2
      : FREE_IMAGE_QUOTA
    const videoRoll = Math.random()
    const freeVideoUsed = videoRoll < 0.48 ? 0 : FREE_VIDEO_QUOTA

    const grant = makeBenefitGrantTime(i)

    // registerTime: a few days before benefit grant
    const registerTs = new Date(grant.ts - rand(1, 90) * 86400000)
    const ry = registerTs.getFullYear()
    const rm = String(registerTs.getMonth() + 1).padStart(2, '0')
    const rd = String(registerTs.getDate()).padStart(2, '0')
    const registerTime = `${ry}/${rm}/${rd}`

    // lastUsedTime: for users who have used any benefit, set a time after grant
    let lastUsedTime = null
    if (freeImageUsed > 0 || freeVideoUsed > 0) {
      const hoursAgo = rand(1, 48)
      lastUsedTime = new Date(grant.ts + Math.min(rand(1, 120), 120) * 3600000)
      const y = lastUsedTime.getFullYear()
      const m = String(lastUsedTime.getMonth() + 1).padStart(2, '0')
      const d = String(lastUsedTime.getDate()).padStart(2, '0')
      const hh = String(lastUsedTime.getHours()).padStart(2, '0')
      const mm = String(lastUsedTime.getMinutes()).padStart(2, '0')
      const ss = String(lastUsedTime.getSeconds()).padStart(2, '0')
      lastUsedTime = { dateStr: `${y}/${m}/${d}`, fullStr: `${y}/${m}/${d} ${hh}:${mm}:${ss}`, ts: lastUsedTime.getTime() }
    }

    // currentMember: most stay free, some upgrade
    const memberRoll = Math.random()
    const currentMember = memberRoll < 0.70 ? '免费用户'
      : memberRoll < 0.88 ? '月卡会员'
      : '年卡会员'

    users.push({
      uid: `30001${String(100000 + i)}`,
      country: pick(countries),
      currentMember,
      freeImageUsed,
      freeVideoUsed,
      registerTime,
      grantTime: grant.dateStr,
      grantTimeFull: grant.fullStr,
      grantTimeTs: grant.ts,
      lastUsedTime,
    })
  }
  return users
})()

/** 按筛选条件汇总免费权益指标 */
export function computeFreeBenefitMetrics(userList, { country } = {}) {
  let list = userList
  if (country) list = list.filter((u) => u.country === country)

  const total = list.length
  const imageUsers = list.filter((u) => u.freeImageUsed > 0).length
  const imageExhausted = list.filter((u) => u.freeImageUsed >= FREE_IMAGE_QUOTA).length
  const videoUsers = list.filter((u) => u.freeVideoUsed > 0).length
  const allExhausted = list.filter(
    (u) => u.freeImageUsed >= FREE_IMAGE_QUOTA && u.freeVideoUsed >= FREE_VIDEO_QUOTA,
  ).length

  const pct = (n, d) => (d ? (n / d) * 100 : null)

  return {
    totalGrantees: total,
    freeImageUsers: imageUsers,
    freeImageUsageRate: pct(imageUsers, total),
    freeImageExhausted: imageExhausted,
    freeImageExhaustRate: pct(imageExhausted, total),
    freeVideoUsers: videoUsers,
    freeVideoUsageRate: pct(videoUsers, total),
    allBenefitsExhausted: allExhausted,
    allBenefitsExhaustRate: pct(allExhausted, total),
  }
}

const total = tasks.length
const sCnt = tasks.filter(t => t.status === 'success').length
const fCnt = tasks.filter(t => t.status === 'failed').length
const bCnt = tasks.filter(t => t.status === 'blocked').length
const tCnt = tasks.filter(t => t.status === 'timeout').length
const eCnt = tasks.filter(t => t.status === 'external_model_failed').length
const allCost = tasks.reduce((s, t) => s + (t.cost || 0), 0)

export const overviewStats = {
  total, successRate: ((sCnt/total)*100).toFixed(1), failRate: ((fCnt/total)*100).toFixed(1),
  sCnt, fCnt, bCnt, tCnt, eCnt,
  totalCost: allCost,
}

export const funcAgg = (() => {
  const m = {}
  tasks.forEach(t => {
    const k = `${t.funcName}|${t.model}`
    if(!m[k]) m[k]={funcName:t.funcName,model:t.model,total:0,success:0,failed:0,blocked:0,timeout:0,extFailed:0,durations:[],costs:[]}
    m[k].total++
    if(t.status==='success')m[k].success++
    else if(t.status==='failed')m[k].failed++
    else if(t.status==='blocked')m[k].blocked++
    else if(t.status==='timeout')m[k].timeout++
    else if(t.status==='external_model_failed')m[k].extFailed++
    if(t.duration)m[k].durations.push(t.duration); m[k].costs.push(t.cost||0)
  })
  return Object.values(m).map(r=>({
    ...r, successRate: r.total?((r.success/r.total)*100).toFixed(1):'0.0',
    failCount: r.failed, blockedCount: r.blocked, timeoutCount: r.timeout, extFailCount: r.extFailed,
    avgDuration: r.durations.length?Math.floor(r.durations.reduce((a,b)=>a+b,0)/r.durations.length):0,
    totalCost: r.costs.reduce((a,b)=>a+b,0),
  }))
})()

// ============ 功能阈值配置 Mock 数据 ============
export const thresholdList = [
  { id: 1, funcName: 'Generate everything', funcType: 'AI Generation', timeout: 180, enabled: true, remark: '综合生成入口，按任务总耗时判断', modifier: 'admin', modifyTime: '2026/07/09 14:30' },
  { id: 2, funcName: 'Recreate Vid', funcType: 'Video Generation', timeout: 180, enabled: true, remark: '视频复刻任务，按任务总耗时判断', modifier: 'zhangsan', modifyTime: '2026/07/09 14:35' },
  { id: 3, funcName: 'Clone ID', funcType: 'Identity Generation', timeout: 120, enabled: true, remark: '身份克隆相关任务，按任务总耗时判断', modifier: 'admin', modifyTime: '2026/07/09 14:40' },
  { id: 4, funcName: 'URL to Vid', funcType: 'Video Generation', timeout: 180, enabled: true, remark: 'URL 转视频任务，按任务总耗时判断', modifier: 'admin', modifyTime: '2026/07/09 14:45' },
]

export const thresholdFuncOptions = ['Generate everything', 'Recreate Vid', 'Clone ID', 'URL to Vid']
export const thresholdTypeOptions = ['AI Generation', 'Video Generation', 'Identity Generation']
export const thresholdStatusOptions = [
  { value: true, label: '启用' },
  { value: false, label: '停用' },
]

// 功能名称 → 功能类型映射
export const funcTypeMap = {
  'Generate everything': 'Image Generation',
  'Recreate Vid': 'Video Generation',
  'Clone ID': 'Video Generation',
  'URL to Vid': 'Video Analysis',
  'Clone ID': 'Text Generation',
  'Clone ID': 'Text Generation',
  'URL to Vid': 'Image Edit',
}

// ============ Homepage 功能卡片 ============
export const homepageCards = [
{
    id: 1, key: 'tab1', sort: 1,
    titleKey: 'homepage.featurecard.tab5.title', descKey: 'homepage.featurecard.tab5.desc', titleCn: '图片编辑神器', titleTrans: {'简体中文（原文）': '图片编辑神器', '英语': 'Photo Editor Pro', '日语': '写真編集プロ', '泰语': 'โปรแกรมแก้ไขรูปภาพ', '巴西葡萄牙语': 'Editor de Fotos Pro', '墨西哥西班牙语': 'Editor de Fotos Pro'}, descCn: 'AI 智能编辑，一键去背景换风格', descTrans: {'简体中文（原文）': 'AI 智能编辑，一键去背景换风格', '英语': 'AI smart editing, one-click background removal', '日语': 'AIスマート編集、ワンクリックで背景除去', '泰语': 'การแก้ไขอัจฉริยะ AI ลบพื้นหลังด้วยคลิกเดียว', '巴西葡萄牙语': 'Edição inteligente IA, remoção de fundo com um clique', '墨西哥西班牙语': 'Edición inteligente IA, eliminación de fondo con un clic'},
    webMediaUrl: 'https://example.com/homepage_feature_tab1.webp', webMediaType: 'image',
    regions: ['全部地区'], hasButton: true, buttonKey: 'homepage.featurecard.tab1.button',
    transStatus: 'translated',
    modifier: 'admin', modifyTime: '2026/07/09 10:30:00',
  },
{
    id: 2, key: 'tab2', sort: 2,
    titleKey: 'homepage.featurecard.tab6.title', descKey: 'homepage.featurecard.tab6.desc', titleCn: '开口优化', titleTrans: {'简体中文（原文）': '开口优化', '英语': 'Hook Optimizer', '日语': 'フック最適化', '泰语': 'เครื่องมือเพิ่มประสิทธิภาพ', '巴西葡萄牙语': 'Otimizador de Gancho', '墨西哥西班牙语': 'Optimizador de Gancho'}, descCn: '优化视频开头，提升完播率', descTrans: {'简体中文（原文）': '优化视频开头，提升完播率', '英语': 'Optimize video hooks, boost retention', '日语': '動画のフックを最適化し、視聴維持率を向上', '泰语': 'ปรับปรุง hooks วิดีโอ เพิ่มการรักษาผู้ชม', '巴西葡萄牙语': 'Otimize ganchos de vídeo, aumente a retenção', '墨西哥西班牙语': 'Optimiza los ganchos de video, aumenta la retención'},
    webMediaUrl: 'https://example.com/homepage_feature_tab2.mp4', webMediaType: 'video',
    regions: ['全部地区'], hasButton: true, buttonKey: 'homepage.featurecard.tab2.button',
    jumpTarget: 'Clone ID', enabled: true,
    modifier: 'admin', modifyTime: '2026/07/09 09:15:00',
    transStatus: 'translated',
  },
  {
    id: 3, key: 'tab3', sort: 3,
    titleKey: 'homepage.featurecard.tab7.title', descKey: 'homepage.featurecard.tab7.desc', titleCn: '智能标签', titleTrans: {'简体中文（原文）': '智能标签', '英语': 'Smart Tags', '日语': 'スマートタグ', '泰语': 'แท็กอัจฉริยะ', '巴西葡萄牙语': 'Tags Inteligentes', '墨西哥西班牙语': 'Etiquetas Inteligentes'}, descCn: '自动生成高曝光标签组合', descTrans: {'简体中文（原文）': '自动生成高曝光标签组合', '英语': 'Auto-generate high-exposure tag combos', '日语': '高露出タグの組み合わせを自動生成', '泰语': 'สร้างชุดแท็กที่มีการเปิดเผยสูงโดยอัตโนมัติ', '巴西葡萄牙语': 'Gerar automaticamente combos de tags de alta exposição', '墨西哥西班牙语': 'Genera automáticamente combos de etiquetas de alta exposición'},
    webMediaUrl: 'https://example.com/homepage_feature_tab3.webp', webMediaType: 'image',
    regions: ['全部地区'], hasButton: true, buttonKey: 'homepage.featurecard.tab3.button',
    jumpTarget: 'Generate everything', enabled: true,
    modifier: 'admin', modifyTime: '2026/07/08 14:00:00',
    transStatus: 'pending',
  },
{
    id: 4, key: 'tab4', sort: 4,
    titleKey: 'homepage.featurecard.tab8.title', descKey: 'homepage.featurecard.tab8.desc', titleCn: '极速复刻', titleTrans: {'简体中文（原文）': '极速复刻', '英语': 'Quick Recreate', '日语': 'クイック再現', '泰语': 'สร้างใหม่ด่วน', '巴西葡萄牙语': 'Recriação Rápida', '墨西哥西班牙语': 'Recreación Rápida'}, descCn: '快速复刻任何视频风格', descTrans: {'简体中文（原文）': '快速复刻任何视频风格', '英语': 'Quickly recreate any video style', '日语': 'あらゆる動画スタイルを素早く再現', '泰语': 'สร้างสไตล์วิดีโอใหม่ได้อย่างรวดเร็ว', '巴西葡萄牙语': 'Recrie rapidamente qualquer estilo de vídeo', '墨西哥西班牙语': 'Recrea rápidamente cualquier estilo de video'},
    webMediaUrl: 'https://example.com/homepage_feature_tab4.webp', webMediaType: 'image',
    regions: ['全部地区'], hasButton: false, buttonKey: '',
    jumpTarget: 'URL to Vid', enabled: true,
    modifier: 'zhangsan', modifyTime: '2026/07/07 11:20:00',
    transStatus: 'translated',
  },
{
    id: 5, key: 'tab5', sort: 5,
    titleKey: 'homepage.featurecard.tab9.title', descKey: 'homepage.featurecard.tab9.desc', titleCn: '一键生成', titleTrans: {'简体中文（原文）': '一键生成', '英语': 'One-Click Generate', '日语': 'ワンクリック生成', '泰语': 'สร้างด้วยคลิกเดียว', '巴西葡萄牙语': 'Gerar com Um Clique', '墨西哥西班牙语': 'Generar con Un Clic'}, descCn: '多素材 AI 创作短视频', descTrans: {'简体中文（原文）': '多素材 AI 创作短视频', '英语': 'Multi-source AI short video creation', '日语': 'マルチソースAIショート動画作成', '泰语': 'การสร้างวิดีโอสั้น AI หลายแหล่ง', '巴西葡萄牙语': 'Criação de vídeos curtos IA multi-fonte', '墨西哥西班牙语': 'Creación de videos cortos IA multi-fuente'},
    webMediaUrl: 'https://example.com/homepage_feature_tab5.mp4', webMediaType: 'video',
    regions: ['全部地区'], hasButton: true, buttonKey: 'homepage.featurecard.tab5.button',
    jumpTarget: 'URL to Vid', enabled: true,
    modifier: 'admin', modifyTime: '2026/07/06 16:45:00',
    transStatus: 'pending',
  },
{
    id: 6, key: 'tab6', sort: 6,
    titleKey: 'homepage.featurecard.tab10.title', descKey: 'homepage.featurecard.tab10.desc', titleCn: '3D 球星卡 Pro', titleTrans: {'简体中文（原文）': '3D 球星卡 Pro', '英语': '3D Star Card Pro', '日语': '3Dスターカード Pro', '泰语': 'การ์ดสตาร์ 3D Pro', '巴西葡萄牙语': 'Cartão Estrela 3D Pro', '墨西哥西班牙语': 'Tarjeta Estrella 3D Pro'}, descCn: '限量版球星卡 360° 展示', descTrans: {'简体中文（原文）': '限量版球星卡 360° 展示', '英语': 'Limited edition star card 360° showcase', '日语': '限定版スターカード 360° 展示', '泰语': 'การ์ดสตาร์รุ่นลิมิเต็ดแสดงผล 360°', '巴西葡萄牙语': 'Vitrine 360° de cartão estrela edição limitada', '墨西哥西班牙语': 'Exhibición 360° de tarjeta estrella edición limitada'},
    webMediaUrl: 'https://example.com/homepage_feature_tab6.webp', webMediaType: 'image',
    regions: ['全部地区'], hasButton: true, buttonKey: 'homepage.featurecard.tab6.button',modifier: 'admin', modifyTime: '2026/07/05 10:00:00',
    transStatus: 'translated',
  },
{
    id: 7, key: 'tab7', sort: 7,
    titleKey: 'homepage.featurecard.tab1.title', descKey: 'homepage.featurecard.tab1.desc', titleCn: 'AI 视频复刻', titleTrans: {'简体中文（原文）': 'AI 视频复刻', '英语': 'AI Video Recreation', '日语': 'AIビデオ再現', '泰语': 'การสร้างวิดีโอ AI', '巴西葡萄牙语': 'Recriação de Vídeo AI', '墨西哥西班牙语': 'Recreación de Video IA'}, descCn: '将你的照片变成炫酷视频', descTrans: {'简体中文（原文）': '将你的照片变成炫酷视频', '英语': 'Turn your photos into stunning videos', '日语': '写真をスタイリッシュな動画に', '泰语': 'เปลี่ยนรูปภาพของคุณเป็นวิดีโอที่สวยงาม', '巴西葡萄牙语': 'Transforme suas fotos em vídeos incríveis', '墨西哥西班牙语': 'Convierte tus fotos en videos increíbles'},
    webMediaUrl: 'https://example.com/homepage_feature_tab7.mp4', webMediaType: 'video',
    regions: ['全部地区'], hasButton: false, buttonKey: '',
    jumpTarget: 'Clone ID', enabled: false,
    modifier: 'zhangsan', modifyTime: '2026/07/04 08:30:00',
    transStatus: 'pending',
  },
{
    id: 8, key: 'tab8', sort: 8,
    titleKey: 'homepage.featurecard.tab2.title', descKey: 'homepage.featurecard.tab2.desc', titleCn: '爆款视频生成', titleTrans: {'简体中文（原文）': '爆款视频生成', '英语': 'Viral Video Maker', '日语': 'バイラル動画生成', '泰语': 'เครื่องสร้างวิดีโอไวรัล', '巴西葡萄牙语': 'Criador de Vídeos Virais', '墨西哥西班牙语': 'Creador de Videos Virales'}, descCn: '一键生成 TikTok/Reels 爆款视频', descTrans: {'简体中文（原文）': '一键生成 TikTok/Reels 爆款视频', '英语': 'One-click viral video generator', '日语': 'ワンクリックでバイラル動画を生成', '泰语': 'สร้างวิดีโอไวรัลด้วยคลิกเดียว', '巴西葡萄牙语': 'Gerador de vídeos virais com um clique', '墨西哥西班牙语': 'Generador de videos virales con un clic'},
    webMediaUrl: 'https://example.com/homepage_feature_tab8.webp', webMediaType: 'image',
    regions: ['全部地区'], hasButton: true, buttonKey: 'homepage.featurecard.tab8.button',
    jumpTarget: 'Recreate Vid', enabled: false,
    modifier: 'admin', modifyTime: '2026/07/03 15:20:00',
    transStatus: 'translated',
  },
{
    id: 9, key: 'tab9', sort: 9,
    titleKey: 'homepage.featurecard.tab3.title', descKey: 'homepage.featurecard.tab3.desc', titleCn: '3D 球星卡', titleTrans: {'简体中文（原文）': '3D 球星卡', '英语': '3D Star Card', '日语': '3Dスターカード', '泰语': 'การ์ดสตาร์ 3D', '巴西葡萄牙语': 'Cartão Estrela 3D', '墨西哥西班牙语': 'Tarjeta Estrella 3D'}, descCn: '制作你的专属 3D 球星收藏卡', descTrans: {'简体中文（原文）': '制作你的专属3D球星收藏卡', '英语': 'Create your own 3D star collectible card', '日语': '自分だけの3Dスターカードを作成', '泰语': 'สร้างการ์ดสะสมสตาร์ 3D ของคุณเอง', '巴西葡萄牙语': 'Crie seu próprio cartão colecionável 3D', '墨西哥西班牙语': 'Crea tu propia tarjeta coleccionable 3D'},
    webMediaUrl: 'https://example.com/homepage_feature_tab9.mp4', webMediaType: 'video',
    regions: ['全部地区'], hasButton: false, buttonKey: '',
    jumpTarget: 'Clone ID', enabled: false,
    modifier: 'admin', modifyTime: '2026/07/02 12:00:00',
    transStatus: 'pending',
  },
{
    id: 10, key: 'tab10', sort: 10,
    titleKey: 'homepage.featurecard.tab4.title', descKey: 'homepage.featurecard.tab4.desc', titleCn: '视频拆解分析', titleTrans: {'简体中文（原文）': '视频拆解分析', '英语': 'Video Breakdown Analysis', '日语': '動画分解分析', '泰语': 'การวิเคราะห์รายละเอียดวิดีโอ', '巴西葡萄牙语': 'Análise de Detalhamento de Vídeo', '墨西哥西班牙语': 'Análisis de Desglose de Video'}, descCn: '深度分析爆款视频的成功秘诀', descTrans: {'简体中文（原文）': '深度分析爆款视频的成功秘诀', '英语': 'Deep analysis of viral video secrets', '日语': 'バイラル動画の成功の秘訣を深く分析', '泰语': 'วิเคราะห์เชิงลึกของความลับวิดีโอไวรัล', '巴西葡萄牙语': 'Análise profunda dos segredos dos vídeos virais', '墨西哥西班牙语': 'Análisis profundo de los secretos de videos virales'},
    webMediaUrl: 'https://example.com/homepage_feature_tab10.webp', webMediaType: 'image',
    regions: ['全部地区'], hasButton: true, buttonKey: 'homepage.featurecard.tab10.button',
    jumpTarget: 'Generate everything', enabled: false,
    modifier: 'admin', modifyTime: '2026/07/01 09:00:00',
  },
]

export const homepageRegionOptions = ['全部地区', '美国', '巴西', '英国', '德国', '墨西哥']
export const homepageJumpTargets = ['Recreate Vid', 'Clone ID', 'URL to Vid', 'Generate everything', 'URL to Vid', 'Clone ID', 'Clone ID']

// ============ Homepage Preset 卡片 ============
// 运营卡固定排在效果卡之前（列表置顶），不提供单独置顶操作
export const presetCards = [
  {
    id: 1, key: 'preset_operate_url_to_vid', cardType: '运营卡', sort: 0,
    titleKey: 'homepage.preset.1.title', descKey: 'homepage.preset.1.desc',
    titleCn: 'URL to Vid',
    titleTrans: { '英语': 'URL to Vid' },
    descCn: 'Paste any video URL and recreate it with your own materials',
    descTrans: { '英语': 'Paste any video URL and recreate it with your own materials' },
    originUrl: '', mediaUrl: 'https://example.com/preset/url_to_vid.webp', mediaType: 'image',
    regions: ['全部国家'], hasButton: true, buttonKey: 'homepage.preset.operational.tab1.button',
    jumpTarget: 'URL to Vid', enabled: true,
    samplePhotos: [], originalImage: null,
    benefitId: '', benefitName: '', platformType: '', resultType: '', resultCount: 1, effectId: '',
    rightsKey: '', ownerEmail: 'ops@meitu.com',
    transStatus: 'translated', modifier: 'ops', modifyTime: '2026/08/08 10:00',
  },
  {
    id: 2, key: 'preset_operate_recreate_vid', cardType: '运营卡', sort: 1,
    titleKey: 'homepage.preset.2.title', descKey: 'homepage.preset.2.desc',
    titleCn: 'Recreate Vid',
    titleTrans: { '英语': 'Recreate Vid' },
    descCn: 'Recreate viral videos with one click using your own photos',
    descTrans: { '英语': 'Recreate viral videos with one click using your own photos' },
    originUrl: '', mediaUrl: 'https://example.com/preset/recreate_vid.webp', mediaType: 'image',
    regions: ['全部国家'], hasButton: true, buttonKey: 'homepage.preset.operational.tab2.button',
    jumpTarget: 'Recreate Vid', enabled: true,
    samplePhotos: [], originalImage: null,
    benefitId: '', benefitName: '', platformType: '', resultType: '', resultCount: 1, effectId: '',
    rightsKey: '', ownerEmail: 'ops@meitu.com',
    transStatus: 'translated', modifier: 'ops', modifyTime: '2026/08/08 10:05',
  },
  {
    id: 31, key: 'preset_effect_hd_reveal', cardType: '效果卡', sort: 0,
    titleKey: 'homepage.preset.31.title', descKey: 'homepage.preset.31.desc',
    titleCn: 'HD Reveal',
    titleTrans: { '英语': 'HD Reveal' },
    descCn: 'A pixelated image transforms into a clear photo',
    descTrans: { '英语': 'A pixelated image transforms into a clear photo' },
    originUrl: '', mediaUrl: 'https://example.com/preset/hd_reveal.webp', mediaType: 'image',
    regions: ['全部国家'], hasButton: false, buttonKey: '',
    samplePhotos: [
      { id: 'SP-001', name: '素材1', url: 'https://example.com/sample/sp_001.webp' },
      { id: 'SP-002', name: '素材2', url: 'https://example.com/sample/sp_002.webp' },
      { id: 'SP-003', name: '素材3', url: 'https://example.com/sample/sp_003.webp' },
    ],
    originalImage: { name: '原图', url: 'https://example.com/origin/hd_reveal.webp' },
    benefitId: 'VP14089', benefitName: 'AI 写真生成',
    platformType: 'weave', resultType: '图片', resultCount: 1, effectId: 'weave_flow_952',
    rightsKey: 'vr.rights.weave.flow.952', ownerEmail: 'hxy9@meitu.com',
    enabled: true, transStatus: 'translated', modifier: 'hxy9', modifyTime: '2026/08/08 11:20',
  },
  {
    id: 30, key: 'preset_effect_brazilian_flip', cardType: '效果卡', sort: 1,
    titleKey: 'homepage.preset.30.title', descKey: 'homepage.preset.30.desc',
    titleCn: 'Brazilian Flip Dance',
    titleTrans: { '英语': 'Brazilian Flip Dance' },
    descCn: 'Turn one photo into a Brazilian flip dance video',
    descTrans: { '英语': 'Turn one photo into a Brazilian flip dance video' },
    originUrl: '', mediaUrl: 'https://example.com/preset/brazilian_flip.webp', mediaType: 'image',
    regions: ['全部国家'], hasButton: false, buttonKey: '',
    samplePhotos: [
      { id: 'SP-004', name: '素材1', url: 'https://example.com/sample/sp_004.webp' },
      { id: 'SP-006', name: '素材2', url: 'https://example.com/sample/sp_006.webp' },
      { id: 'SP-007', name: '素材3', url: 'https://example.com/sample/sp_007.webp' },
    ],
    originalImage: { name: '原图', url: 'https://example.com/origin/brazilian_flip.webp' },
    benefitId: 'VP12367', benefitName: '图生视频-街头采访',
    platformType: 'weave', resultType: '视频', resultCount: 1, effectId: 'weave_flow_948',
    rightsKey: 'vr.rights.weave.flow.948', ownerEmail: 'hxy9@meitu.com',
    enabled: true, transStatus: 'translated', modifier: 'hxy9', modifyTime: '2026/08/08 11:18',
  },
  {
    id: 25, key: 'preset_effect_hair_clip', cardType: '效果卡', sort: 2,
    titleKey: 'homepage.preset.25.title', descKey: 'homepage.preset.25.desc',
    titleCn: 'Oversized Hair Clip',
    titleTrans: { '英语': 'Oversized Hair Clip' },
    descCn: 'Upload any portrait and instantly generate a trendy oversized hair clip look',
    descTrans: { '英语': 'Upload any portrait and instantly generate a trendy oversized hair clip look' },
    originUrl: '', mediaUrl: 'https://example.com/preset/hair_clip.webp', mediaType: 'image',
    regions: ['全部国家'], hasButton: false, buttonKey: '',
    samplePhotos: [
      { id: 'SP-001', name: '素材1', url: 'https://example.com/sample/sp_001.webp' },
      { id: 'SP-003', name: '素材2', url: 'https://example.com/sample/sp_003.webp' },
      { id: 'SP-008', name: '素材3', url: 'https://example.com/sample/sp_008.webp' },
    ],
    originalImage: { name: '原图', url: 'https://example.com/origin/hair_clip.webp' },
    benefitId: 'VP11993', benefitName: '音符',
    platformType: 'weave', resultType: '视频', resultCount: 1, effectId: 'weave_flow_917',
    rightsKey: 'vr.rights.weave.flow.917', ownerEmail: 'hxy9@meitu.com',
    enabled: true, transStatus: 'translated', modifier: 'hxy9', modifyTime: '2026/08/07 16:40',
  },
]

export const presetCardTypeOptions = ['运营卡', '效果卡']
export const presetRegionOptions = ['全部国家', '全球', '美国', '巴西', '英国', '德国', '墨西哥', '日本', '印尼', '其他']
export const presetJumpTargets = ['Generate everything', 'Recreate Vid', 'Clone ID', 'URL to Vid', 'Baseball Game']

export const benefitOptions = [
  { id: 'VP11993', name: '音符' },
  { id: 'VP12367', name: '图生视频-街头采访' },
  { id: 'VP12812', name: '图生视频-食物冻结' },
  { id: 'VP13501', name: '图生视频-旅行日记' },
  { id: 'VP14089', name: 'AI 写真生成' },
]

// ============ Sample Photo 库 ============
export const samplePhotos = [
  { id: 'SP-001', url: 'https://example.com/sample/sp_001.webp', enabled: true, modifyTime: '2026/07/12 14:30' },
  { id: 'SP-002', url: 'https://example.com/sample/sp_002.webp', enabled: true, modifyTime: '2026/07/13 09:15' },
  { id: 'SP-003', url: 'https://example.com/sample/sp_003.webp', enabled: true, modifyTime: '2026/07/10 11:00' },
  { id: 'SP-004', url: 'https://example.com/sample/sp_004.webp', enabled: true, modifyTime: '2026/07/14 16:20' },
  { id: 'SP-005', url: 'https://example.com/sample/sp_005.webp', enabled: false, modifyTime: '2026/07/11 08:45' },
  { id: 'SP-006', url: 'https://example.com/sample/sp_006.webp', enabled: true, modifyTime: '2026/07/13 15:30' },
  { id: 'SP-007', url: 'https://example.com/sample/sp_007.webp', enabled: true, modifyTime: '2026/07/15 10:00' },
  { id: 'SP-008', url: 'https://example.com/sample/sp_008.webp', enabled: true, modifyTime: '2026/07/14 13:00' },
]

export const samplePhotoTags = ['人像','穿搭','美妆','商品','风景','宠物','食物','其他']
