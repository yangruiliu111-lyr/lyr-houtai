export const workspaceBubbleStatusOptions = [
  { value: 'normal', label: '正常' },
  { value: 'disabled', label: '停用' },
]

export const workspaceBubblePlatformOptions = ['weave', 'formula']
export const workspaceBubbleRegionOptions = ['全部国家', '美国', '巴西', '英国', '德国', '墨西哥', '日本', '印尼']

export function buildRightsKeyFromEffectId(effectId = '') {
  const id = String(effectId || '').trim()
  if (!id) return ''
  return `vr.rights.${id.replace(/_/g, '.')}`
}

export const workspaceBubbles = [
  {
    id: 5,
    sort: 0,
    title: '3D Football Starcard',
    prompt: 'Generate a Football Star Card [01] Reels for me.',
    appImageUrl: 'https://example.com/bubbles/football_star.webp',
    h5MediaUrl: '',
    h5MediaType: '',
    status: 'normal',
    online: true,
    platformType: '',
    effectId: '',
    rightsKey: '',
    regions: ['全部国家'],
    titleTrans: {
      '简体中文（原文）': '3D Football Starcard',
      '英语': '3D Football Starcard',
      '日语': '3Dサッカースターカード',
      '泰语': 'การ์ดสตาร์ฟุตบอล 3D',
      '巴西葡萄牙语': 'Carta 3D de Craque do Futebol',
      '墨西哥西班牙语': 'Tarjeta de estrella de fútbol 3D',
    },
    promptTrans: {
      '简体中文（原文）': 'Generate a Football Star Card [01] Reels for me.',
      '英语': 'Generate a Football Star Card [01] Reels for me.',
      '日语': 'サッカースターカード[01]のリールを作成して。',
      '泰语': 'สร้าง Reels การ์ดสตาร์ฟุตบอล [01] ให้ฉัน',
      '巴西葡萄牙语': 'Gere um Reel de Card de Craque do Futebol [01] para mim.',
      '墨西哥西班牙语': 'Genera un Reel de Tarjeta de estrella de fútbol [01] para mí.',
    },
    modifier: 'admin',
    modifyTime: '2026/08/08 12:10',
  },
  {
    id: 4,
    sort: 0,
    title: 'OOTD',
    prompt: 'Create an OOTD fashion reel with my photo and trendy overlays.',
    appImageUrl: 'https://example.com/bubbles/ootd.webp',
    h5MediaUrl: 'https://example.com/bubbles/ootd_h5.mp4',
    h5MediaType: 'video',
    status: 'normal',
    online: true,
    platformType: '',
    effectId: '',
    rightsKey: '',
    regions: ['全部国家'],
    titleTrans: {
      '简体中文（原文）': 'OOTD',
      '英语': 'OOTD',
      '日语': 'OOTD',
      '泰语': 'OOTD',
      '巴西葡萄牙语': 'OOTD',
      '墨西哥西班牙语': 'OOTD',
    },
    promptTrans: {
      '简体中文（原文）': 'Create an OOTD fashion reel with my photo and trendy overlays.',
      '英语': 'Create an OOTD fashion reel with my photo and trendy overlays.',
      '日语': '私の写真でトレンディなOOTDリールを作成して。',
      '泰语': 'สร้าง OOTD reel ด้วยรูปของฉัน',
      '巴西葡萄牙语': 'Crie um reel OOTD com minha foto.',
      '墨西哥西班牙语': 'Crea un reel OOTD con mi foto.',
    },
    modifier: 'admin',
    modifyTime: '2026/08/07 18:22',
  },
  {
    id: 3,
    sort: 1,
    title: 'Hair Transform',
    prompt: 'Transform my hairstyle into a viral short video look.',
    appImageUrl: 'https://example.com/bubbles/hair.webp',
    h5MediaUrl: '',
    h5MediaType: '',
    status: 'disabled',
    online: false,
    platformType: 'weave',
    effectId: 'weave_flow_952',
    rightsKey: 'vr.rights.weave.flow.952',
    regions: ['全部国家'],
    titleTrans: {
      '简体中文（原文）': 'Hair Transform',
      '英语': 'Hair Transform',
    },
    promptTrans: {
      '简体中文（原文）': 'Transform my hairstyle into a viral short video look.',
      '英语': 'Transform my hairstyle into a viral short video look.',
    },
    modifier: 'ops',
    modifyTime: '2026/08/06 09:40',
  },
]

let bubbleSeq = 5
export function nextBubbleId() {
  bubbleSeq += 1
  return bubbleSeq
}

export function buildBubbleDraftTrans(title, prompt) {
  return {
    titleTrans: {
      '简体中文（原文）': title,
      '英语': title,
      '日语': title,
      '泰语': title,
      '巴西葡萄牙语': title,
      '墨西哥西班牙语': title,
    },
    promptTrans: {
      '简体中文（原文）': prompt,
      '英语': prompt,
      '日语': prompt,
      '泰语': prompt,
      '巴西葡萄牙语': prompt,
      '墨西哥西班牙语': prompt,
    },
  }
}
