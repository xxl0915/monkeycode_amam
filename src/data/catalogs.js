export const productGroups = [
  { key: '套图上架', label: '套图上架', description: '从商品素材到完整上架图包', icon: 'package', tone: 'violet' },
  { key: '服饰转化', label: '服饰转化', description: '平铺、上身与面料表达', icon: 'refresh', tone: 'pink' },
  { key: '场景合成', label: '场景合成', description: '把商品放进目标营销场景', icon: 'spark', tone: 'cyan' },
  { key: '多视角细节', label: '多视角细节', description: '补充角度与材质特写', icon: 'files', tone: 'amber' },
  { key: '更多功能', label: '更多功能', description: '精修、光影与系列统一', icon: 'test', tone: 'emerald' }
]

export const productScenes = [
  ['套图上架', '商品套图', 'suite', '一套生成多种电商版位，沿用现有套图能力。', '已接入'],
  ['套图上架', '商品套图（旧版）', 'suite-legacy', '复刻旧版商品套图流程，使用当前生成引擎。', '已接入'],
  ['套图上架', '电商详情页', 'detail-page', '按模块规划详情页，再合成长图。', '已接入'],
  ['套图上架', '商品SKU图', 'sku-image', '按 SKU 变体逐项输出并保持映射。', '已接入'],
  ['套图上架', '商品主图', 'hero-image', '商品与模板组合生成主图变体。', '已接入'],
  ['套图上架', '主图拼图', 'main-collage', '固定模板排版或 AI 自由构图。', '已接入'],
  ['套图上架', '商品直通车图', 'clothing-ztc', '选择构图快速生成推广图。', '已接入'],
  ['套图上架', '爆款图复刻', 'hot-replica', '区分商品主体与风格参考，复刻版式表达。', '已接入'],
  ['服饰转化', '实拍转平铺', 'outfit-split', '从穿搭照提取单品并输出平铺图。', '已接入'],
  ['服饰转化', '百变服饰图', 'garment-multi', '切换平铺、立体、挂拍等展示方式。', '已接入'],
  ['服饰转化', '平铺转3D', 'flat-to-3d', '把平铺衣物转成有体积感的展示图。', '已接入'],
  ['服饰转化', '面料上身', 'fabric-tryon', '将面料参考应用到指定服装版型。', '已接入'],
  ['服饰转化', '材质增强', 'material-enhancement', '保留版型并增强真实面料表现。', '已接入'],
  ['服饰转化', '一键去皱', 'wrinkle-remove', '批量减弱褶皱，同时保护服装结构。', '已接入'],
  ['服饰转化', '面料质感还原', 'fabric-restore', '恢复单图中的材质观感。', '已接入'],
  ['服饰转化', '静物换拍', 'age-shift', '保留同款商品，切换静物拍摄表达。', '已接入'],
  ['场景合成', '产品替换', 'material-apply', '只替换画面中的指定商品或材质。', '已接入'],
  ['场景合成', '一键种草图', 'seeding', '结合卖点生成营销场景图。', '已接入'],
  ['场景合成', '一键代言图', 'endorsement', '生成真人使用中的商品代言图。', '已接入'],
  ['场景合成', '一键卖点图', 'selling-point', '在画面中突出核心卖点与标注。', '已接入'],
  ['场景合成', '商品图合成', 'product-composite', '把商品自然融入目标场景。', '已接入'],
  ['场景合成', '商品换背景', 'change-bg', '保留商品并替换背景环境。', '已接入'],
  ['场景合成', '链接出图上架', 'listing-link', '安全导入公开链接素材，再生成图片包。', '已接入'],
  ['多视角细节', '商品多视角图', 'multi-view', '为目标机位分别生成商品图片。', '已接入'],
  ['多视角细节', '三视图', 'three-view', '一张规格图排出正面、顶面与侧面。', '已接入'],
  ['多视角细节', '商品细节图', 'close-up', '按部位输出材质与结构特写。', '已接入'],
  ['多视角细节', '一键细节图', 'detail-sheet', '一张拼版排出材质、工艺与结构特写。', '已接入'],
  ['更多功能', '商品精修 Pro', 'product-retouch-pro', '除尘、校色、边缘与投影的结构化精修。', '已接入'],
  ['更多功能', '商品光影棚', 'product-light-studio', '改变布光与台面，保持商品外观。', '已接入'],
  ['更多功能', '商品系列一致化', 'product-consistency', '统一系列图的角度、留白和光影。', '已接入']
].map(([group, title, slug, description, status]) => ({
  group, title, slug, description, status, capability: 'implemented'
}))

export const productCatalog = productGroups.map((g) => ({
  ...g,
  scenes: productScenes.filter((s) => s.group === g.key)
}))

export const modelGroups = [
  { key: '服饰试穿', label: '服饰试穿', description: '让商品快速找到合适的上身表达', icon: 'users', tone: 'violet' },
  { key: '模特转化', label: '模特转化', description: '替换人物、姿势与展示关系', icon: 'refresh', tone: 'pink' },
  { key: '商品互动', label: '商品互动', description: '手持、试戴与鞋靴展示', icon: 'package', tone: 'cyan' },
  { key: '影像控制', label: '影像控制', description: '控制光线、色彩与镜头表达', icon: 'spark', tone: 'amber' },
  { key: '系列延展', label: '系列延展', description: '批量扩展整套模特视觉资产', icon: 'files', tone: 'emerald' }
]

export const modelScenes = [
  ['服饰试穿', '万物上身', 'tryon-any', '商品图与模特图自然合成，快速查看上身效果。', '/product-scenes/samples/fabric-tryon.webp'],
  ['服饰试穿', '模特图生图', 'img2img', '参考模特图和文字描述，快速演绎不同风格与画面表达。', '/product-scenes/samples/multi-view.webp'],
  ['服饰试穿', '风格匹配', 'style-match', '将商品、模特与目标风格参考统一到同一张画面中。', '/product-scenes/samples/product-consistency.webp'],
  ['服饰试穿', '搭配融图', 'outfit-fusion', '组合多件单品、模特和场景，生成完整的搭配展示图。', '/product-scenes/samples/product-consistency.webp'],
  ['服饰试穿', '真人试衣', 'human-tryon', '上传真人或模特参考图，生成对应的穿搭展示。', '/product-scenes/samples/garment-multi.webp'],
  ['服饰试穿', '平铺 / 人台试衣', 'mannequin-tryon', '从平铺、人台或挂拍素材生成立体展示。', '/product-scenes/samples/flat-to-3d.webp'],
  ['模特转化', '一键换模特', 'swap-model', '保留商品表达，更换模特身份、气质与风格。', '/product-scenes/samples/age-shift.webp'],
  ['模特转化', '模特换姿势', 'pose', '同一套商品快速扩展多种自然姿势。', '/product-scenes/samples/seeding.webp'],
  ['模特转化', '姿势换场景', 'pose-scene', '用姿势参考和场景参考组合新的展示画面。', '/product-scenes/samples/product-composite.webp'],
  ['商品互动', 'AI 试戴', 'accessory', '眼镜、首饰、发饰等配饰自然上身。', '/product-scenes/samples/necklace.jpg'],
  ['商品互动', '鞋靴试穿', 'shoe-tryon', '生成鞋靴在脚部和完整穿搭中的展示效果。', '/product-scenes/samples/bag.jpg'],
  ['商品互动', '手持商品', 'handheld', '生成自然的手持商品和生活方式画面。', '/product-scenes/samples/seeding.webp'],
  ['影像控制', '镜头与景别', 'camera-lens', '统一模特资产的镜头、景别与空间关系。', '/product-scenes/samples/hero-image.webp'],
  ['影像控制', '模特换背景/氛围', 'relight', '在保持人物和商品的基础上切换布光氛围。', '/product-scenes/samples/product-light-studio.webp'],
  ['影像控制', '换色与风格', 'recolor', '延展服装、背景或整体视觉的色彩方案。', '/product-scenes/samples/material-apply.webp'],
  ['影像控制', '人脸替换', 'face-swap', '在授权素材范围内替换人物面部表达。', '/product-scenes/samples/close-up.webp'],
  ['系列延展', '套装模特图', 'outfit-set', '一套商品生成统一风格的系列模特图。', '/product-scenes/samples/product-consistency.webp'],
  ['系列延展', '模特裂变', 'set-fission', '从一张定妆照扩展不同商品与场景。', '/product-scenes/samples/multi-view.webp'],
  ['系列延展', 'Lookbook / 服饰种草图', 'lookbook', '批量生成整套品牌模特视觉和画册素材。', '/product-scenes/samples/detail-sheet.webp'],
  ['系列延展', '模特塑形', 'body-adjust', '在授权素材范围内调整身形比例和服装适配。', '/product-scenes/samples/age-shift.webp']
].map(([group, title, slug, description, preview]) => ({
  group, title, slug, description, preview, status: '已接入', capability: 'implemented'
}))

export const modelCatalog = modelGroups.map((g) => ({
  ...g,
  scenes: modelScenes.filter((s) => s.group === g.key)
}))

export const plazaModels = [
  { id: 'm1', name: '林澄', tag: '东亚 / 休闲', image: '/business/models/model-1.png' },
  { id: 'm2', name: '苏晚', tag: '东亚 / 通勤', image: '/business/models/model-2.png' },
  { id: 'm3', name: '安然', tag: '东亚 / 运动', image: '/business/models/model-3.png' },
  { id: 'm4', name: '顾星', tag: '东亚 / 时尚', image: '/business/models/model-4.png' },
  { id: 'm5', name: 'Nia', tag: '混血 / 大片', image: '/business/models/model-1.png' },
  { id: 'm6', name: 'Mina', tag: '日韩 / 清透', image: '/business/models/model-2.png' },
  { id: 'm7', name: 'Eva', tag: '欧美 / 高级感', image: '/business/models/model-3.png' },
  { id: 'm8', name: 'Kai', tag: '男性 / 都市', image: '/business/models/model-4.png' }
]

export const videoGroups = [
  {
    key: 'local-growth',
    label: '实体获客',
    scenes: [
      { slug: 'entity-leads', title: '实体获客', description: '上传实体参考图和经营资料，AI 自动规划获客分镜并逐段生成短视频。' }
    ]
  },
  {
    key: 'video-create',
    label: '视频创作',
    scenes: [
      { slug: 'image-to-video', title: '图生视频', description: '以商品图、模特图或首帧为基础，让静态素材动起来。' },
      { slug: 'tryon-video', title: '试衣视频', description: '让服饰商品从静态上身延展为自然走动的试衣短片。' },
      { slug: 'motion-copy', title: '动作复刻', description: '参考动作视频，将人物动作迁移到商品展示内容中。' },
      { slug: 'product-demo', title: '产品演示视频', description: '围绕商品功能、细节和使用方式生成演示短片。' },
      { slug: 'live-clip', title: '直播切片', description: '把商品卖点整理成适合投放的直播切片脚本。' },
      { slug: 'avatar-promo', title: 'AI 数字人口播', description: '用商品图和脚本生成数字人带货口播视频。' },
      { slug: 'batch-avatar', title: '批量口播视频', description: '按脚本规则批量生成口播成片。' },
      { slug: 'product-tvc', title: '商品 TVC', description: '自动规划脚本、分镜和镜头，生成大牌感商品广告。' },
      { slug: 'product-effects', title: 'AI 产品特效', description: '为商品画面叠加镜头运动和特效转场。' },
      { slug: 'video-localize', title: '视频翻译与配音', description: '翻译口播并匹配目标语言配音。' },
      { slug: 'video-replica', title: '商品视频复刻', description: '复刻参考视频的镜头节奏和结构，替换成自己的商品。' }
    ]
  }
]

export const toolGroups = [
  {
    key: 'ai',
    label: 'AI 智能处理',
    scenes: [
      { slug: 'layer-split', title: 'AI 图层拆分 PSD', description: '将成品图中的主体、文字、装饰与背景拆分为可独立编辑图层。' },
      { slug: 'ai-edit', title: 'AI 万能改图', description: '用一句话描述需求，精准修改图片内容。' },
      { slug: 'product-explode', title: '产品分解图', description: '生成产品零件、装饰件和结构关系的分解展示图。' },
      { slug: 'logo-design', title: '设计 Logo', description: '填写品牌信息，生成多组 Logo 设计方向。' },
      { slug: 'image-translate', title: '图片翻译', description: '翻译图片中的文字，同时尽量保持原图排版。' },
      { slug: 'white-bg', title: '商品白底图', description: '生成标准电商白底商品图，保持主体清晰并补足自然投影。' },
      { slug: 'id-photo', title: '证件照制作', description: '从人物照片生成多规格、多底色的合规证件照。' },
      { slug: 'pro-portrait', title: 'AI 职业形象照', description: '将生活照转换为自然可信的职场形象照。' },
      { slug: 'art-portrait', title: 'AI 艺术写真照', description: '将人物照片延展为多种风格的艺术写真。' },
      { slug: 'product-pile', title: '商品堆品图', description: '将多件商品组合成有陈列感和层次的组合图。' },
      { slug: 'pre-check', title: '投前检测', description: '检测图片的主体、文字、构图和平台投放风险。' },
      { slug: 'cutout-pro', title: 'AI 抠图', description: '处理人物、商品、发丝和复杂背景，生成透明底图片。' }
    ]
  },
  {
    key: 'pro',
    label: 'Pro 工具',
    scenes: [
      { slug: 'upscale-pro', title: '图片放大 Pro', description: '针对清晰度、画面边界和人物商品细节的高清放大。' },
      { slug: 'eliminate-pro', title: '涂抹消除 Pro', description: '涂抹指定区域后智能补全背景。' },
      { slug: 'outpaint-pro', title: 'AI 扩图 Pro', description: '按目标比例向外扩展画面并保持主体。' },
      { slug: 'watermark-pro', title: '去水印 Pro', description: '去除水印并修补被遮挡的画面细节。' }
    ]
  },
  {
    key: 'fix',
    label: '专项修复',
    scenes: [
      { slug: 'upscale', title: '图片超清', description: '提升清晰度，适合商品图二次投放。' },
      { slug: 'outpaint', title: 'AI 扩图', description: '把构图不够的画面扩展到目标比例。' },
      { slug: 'remove-watermark', title: 'AI 消除', description: '消除杂物、文字或多余元素。' },
      { slug: 'limb-fix', title: '手脚修复', description: '修复人物手脚结构异常。' },
      { slug: 'clothes-fix', title: '服饰修复', description: '修补褶皱、破洞和穿搭结构。' },
      { slug: 'shoes-fix', title: '鞋靴修复', description: '修正鞋型、透视和上脚细节。' }
    ]
  }
]

export const localTools = [
  { slug: 'photo-edit', title: '图片编辑', description: '裁剪、旋转、改尺寸、调色全部在浏览器本地完成。', detail: '支持本地上传，也可继续扩展素材库和生成记录取图。', icon: 'maximize', tone: 'pink', preview: '/product-scenes/samples/product-retouch-pro.webp', route: '/photo-edit' },
  { slug: 'collage', title: '在线拼图', description: '选择布局模式，上传图片，自动生成宫格拼图。', detail: '适合商品对比、搭配展示和社交媒体长图。', icon: 'files', tone: 'blue', preview: '/product-scenes/samples/main-collage.webp', route: '/tools/collage' },
  { slug: 'slice', title: '图片切图', description: '把一张图切成九宫格、长图分段或自定义网格。', detail: '处理完成后可以一次性打包下载全部切片。', icon: 'copy', tone: 'pink', preview: '/product-scenes/samples/detail-sheet.webp', route: '/tools/slice' },
  { slug: 'compress', title: '图片批量压缩', description: '批量压缩图片，快速减小图片大小，保留图片质量。', detail: '压缩前后大小对比清晰可见，文件只在本地处理。', icon: 'download', tone: 'cyan', preview: '/product-scenes/samples/hero-image.webp', route: '/tools/compress' },
  { slug: 'resize', title: '图片批量修改尺寸', description: '批量修改图片尺寸，快速调整图片大小。', detail: '支持锁定比例、填充、裁切和禁止放大。', icon: 'maximize', tone: 'violet', preview: '/product-scenes/samples/three-view.webp', route: '/tools/resize' },
  { slug: 'convert', title: '批量图片格式转换', description: '批量转换图片格式，快速转换并保留图片质量。', detail: '支持 JPG、PNG、WEBP 和质量设置。', icon: 'refresh', tone: 'teal', preview: '/product-scenes/samples/material-apply.webp', route: '/tools/convert' },
  { slug: 'annotate', title: '商品图片标注', description: '免费图片标注工具，支持尺寸标注、单位自动换算。', detail: '适合商品尺寸图、结构说明和打样沟通。', icon: 'config', tone: 'amber', preview: '/product-scenes/samples/detail-page.webp', route: '/tools/annotate' }
]

export const graphicGroups = [
  {
    key: 'poster',
    label: '海报与封面',
    scenes: [
      { slug: 'free-poster', title: '自由海报', description: '一句话描述主题和风格，不套固定模板直接生成海报。' },
      { slug: 'cover-set', title: '封面设计', description: '为小红书、公众号、视频和店铺生成封面组合。' }
    ]
  },
  {
    key: 'print',
    label: '印刷与信息表达',
    scenes: [
      { slug: 'print-size', title: '打印尺寸生图', description: '按指定印刷尺寸生成可落地的设计稿。' },
      { slug: 'flyer-fold', title: '传单折页', description: '生成适合线下物料的折页和传单版式。' },
      { slug: 'infographic', title: '信息图', description: '把卖点、流程和对比整理成信息图。' }
    ]
  },
  {
    key: 'longform',
    label: '长图与模块排版',
    scenes: [
      { slug: 'design-longform', title: '设计长图', description: '按模块规划长图，适合详情页和种草长图。' }
    ]
  }
]

export const moreCategories = [
  { key: 'image-creation', path: '/image-creation', label: '图片创作', description: '从灵感发现到电商成图' },
  { key: 'learn', path: '/learn', label: '学习中心', description: '从提示词到成图的学习路径' },
  { key: 'cross-border', path: '/cross-border', label: '跨境上架', description: '把商品资料整理成海外上架包' },
  { key: 'marketing', path: '/marketing', label: '营销场景', description: '把商品卖点变成营销物料' },
  { key: 'ecommerce-assets', path: '/ecommerce-assets', label: '电商素材', description: '从商品资料生成可上架素材' },
  { key: 'pod', path: '/pod-images', label: '图片POD', description: '图案提取、创作与产品呈现' },
  { key: 'derive', path: '/derive-images', label: '爆款衍生', description: '款式、面料、配色与换拍搭配' },
  { key: 'templates', path: '/templates', label: '海量模板', description: '浏览电商创作模板' },
  { key: 'exclusive-models', path: '/exclusive-models', label: 'AI专属模特', description: '品牌专属模特工作室' }
]

export const marketingScenes = [
  { slug: 'marketing-image', title: '营销图', description: '选择卖点标签，生成高转化营销主图。' },
  { slug: 'ai-poster', title: '智能设计', description: '一键合成小红书、电商、公众号或朋友圈营销海报。' },
  { slug: 'main-image', title: '高转化主图', description: '把商品图广告化，突出核心卖点。' },
  { slug: 'festival', title: '节日海报', description: '围绕节庆节点生成促销视觉。' },
  { slug: 'social-card', title: '社媒种草图', description: '生成适合小红书、抖音的种草视觉。' },
  { slug: 'image-copy', title: '纯图加文案', description: '给画面叠上中文、英文或中英卖点文案。' },
  { slug: 'banner', title: '横版 Banner', description: '生成店铺和投放用横版主视觉。' },
  { slug: 'popup', title: '促销弹窗', description: '生成活动弹窗和优惠贴纸。' },
  { slug: 'live-bg', title: '直播背景图', description: '为直播间生成品牌背景。' },
  { slug: 'poster-replica', title: '商品宣传爆款复刻', description: '参考爆款海报版式迁移到自己的商品。' },
  { slug: 'creative-variants', title: '营销创意裂变', description: '锁定卖点，批量裂变构图和配色。' },
  { slug: 'campaign-kit', title: '大促整套物料', description: '一次生成大促所需的主视觉组合。' }
]

export const podGroups = [
  { key: '图案提取', label: '图案提取', description: '从商品或素材中提炼可复用图案' },
  { key: '图案创作', label: '图案创作', description: '生成印花、纹理与连续图案' },
  { key: '产品呈现', label: '产品呈现', description: '把图案放到商品和销售场景中' },
  { key: '图像处理', label: '图像处理', description: '完成抠图、替换与局部调整' }
]

export const podScenes = [
  ['图案提取', '印花提取', 'pattern-extract', '从服装或商品图中提取干净的印花元素。'],
  ['图案提取', '满印提取', 'allover-extract', '识别满印图案并整理为可继续编辑的素材。'],
  ['图案创作', '四方连续图', 'seamless-pattern', '生成可平铺的四方连续图案。'],
  ['图案创作', '图裂变', 'image-variant', '围绕同一主题扩展多组图案方向。'],
  ['图案创作', '风格转绘', 'style-transfer', '把图案转换为新的材质或艺术风格。'],
  ['图案创作', 'AI 印花设计', 'print-design', '用一句话生成适合印刷和商品应用的图案设计。'],
  ['图案创作', '产品皮肤设计', 'skin-design', '为数码、家居等产品设计可应用的表面皮肤。'],
  ['产品呈现', '素材粘合', 'material-bond', '把图案和商品素材自然合成为一张图。'],
  ['产品呈现', '印花效果图', 'print-mockup', '查看图案在服装或商品上的真实应用效果。'],
  ['产品呈现', 'POD 商品主图', 'pod-main-image', '生成适合 POD 商品发布的销售主图。'],
  ['产品呈现', '商品尺寸图', 'pod-size-image', '将商品结构、尺寸和标注组织成销售图。'],
  ['产品呈现', 'POD 场景图', 'pod-scene-image', '为定制商品生成生活方式与使用场景。'],
  ['图像处理', '局部替换', 'local-replace', '替换画面中的局部图案或商品区域。'],
  ['图像处理', '定向替换图', 'targeted-replace', '按指定区域和文字说明完成定向修改。'],
  ['图像处理', '智能抠图', 'smart-cutout', '快速获得适合继续排版的商品主体。']
].map(([group, title, slug, description]) => ({ group, title, slug, description }))

export const podCatalog = podGroups.map((g) => ({
  ...g,
  scenes: podScenes.filter((s) => s.group === g.key)
}))

export const deriveGroups = [
  { key: '款式方向', label: '款式方向', description: '从爆款、灵感和融合关系中找到下一款' },
  { key: '面料配色', label: '面料与配色', description: '快速验证面料、颜色和季节变化' },
  { key: '系列延展', label: '系列延展', description: '把单款扩展成完整的商品组合' },
  { key: '版型工艺', label: '版型与工艺', description: '控制局部结构并输出打版参考' },
  { key: '换拍搭配', label: '换拍与搭配', description: '换人换场景，批量组织销售画面' }
]

export const deriveScenes = [
  ['款式方向', '款式创新', 'style-innovate', '爆款微创新，创新幅度可调。'],
  ['款式方向', '款式融合', 'style-fusion', '两个款融成一个新款。'],
  ['款式方向', '灵感改款', 'inspired-redesign', '用非服装的灵感图改款。'],
  ['面料配色', '面料替换', 'fabric-replace', '款式不变，只换面料。'],
  ['面料配色', '颜色替换', 'color-replace', '一次铺满整条 SKU 配色。'],
  ['面料配色', '季节转款', 'season-shift', '夏款转秋款，一款吃两季。'],
  ['系列延展', '套系衍生', 'series-derive', '单品衍生成整套系列。'],
  ['版型工艺', '局部改款', 'part-redesign', '只改领口袖型，其余不动。'],
  ['版型工艺', '工艺线稿', 'tech-sketch', '款式图转平面线稿，方便打版。'],
  ['换拍搭配', '同款换拍', 'same-style-reshoot', '换人换拍，童装成人装静物都适用。'],
  ['换拍搭配', '搭配矩阵图', 'outfit-matrix', '单品两两组合 × 换场景批量铺图。']
].map(([group, title, slug, description]) => ({ group, title, slug, description }))

export const deriveCatalog = deriveGroups.map((g) => ({
  ...g,
  scenes: deriveScenes.filter((s) => s.group === g.key)
}))

export const onlineModels = [
  { id: 'nano-banana', name: 'Nano Banana', spec: '1K / 2K · 支持参考图', video: false, glow: '#a78bfa' },
  { id: 'nano-pro', name: 'Nano Banana Pro', spec: '1K / 2K / 4K · 支持参考图', video: false, glow: '#f0abfc' },
  { id: 'seedream', name: 'Seedream 4.5', spec: '2K / 4K · 文字生图', video: false, glow: '#fb7185' },
  { id: 'gpt-image', name: 'GPT Image 1.5', spec: '1K / 2K · 支持参考图', video: false, glow: '#fbbf24' },
  { id: 'kling', name: 'Kling 2.1', spec: '5-10s · 720p / 1080p', video: true, glow: '#38bdf8' },
  { id: 'seedance', name: 'Seedance 1.5 Pro', spec: '4-12s · 支持参考图', video: true, glow: '#34d399' }
]

export const showcaseWorks = [
  { id: 'w1', title: '商品套图生产', subtitle: 'FEATURED WORK', prompt: '白底主图 + 场景图 + 卖点海报一套出图', image: '/product-scenes/samples/suite.webp' },
  { id: 'w2', title: '模特试穿', subtitle: 'LOOKBOOK', prompt: '把连衣裙穿到都市通勤模特身上', image: '/product-scenes/samples/fabric-tryon.webp' },
  { id: 'w3', title: '种草场景', subtitle: 'LIFESTYLE', prompt: '咖啡馆窗边的生活方式商品图', image: '/product-scenes/samples/seeding.webp' },
  { id: 'w4', title: '详情拼版', subtitle: 'DETAIL', prompt: '材质、工艺与结构特写拼版', image: '/product-scenes/samples/detail-sheet.webp' },
  { id: 'w5', title: '爆款复刻', subtitle: 'REPLICA', prompt: '参考爆款版式迁移到自有商品', image: '/product-scenes/samples/hot-replica.webp' },
  { id: 'w6', title: '换背景', subtitle: 'STUDIO', prompt: '保留商品主体，替换为高级灰影棚', image: '/product-scenes/samples/change-bg.webp' },
  { id: 'w7', title: '商品合成', subtitle: 'COMPOSITE', prompt: '把单品自然放入家居场景', image: '/product-scenes/samples/product-composite.webp' },
  { id: 'w8', title: '主图变体', subtitle: 'HERO', prompt: '电商主图 1:1 干净构图', image: '/product-scenes/samples/hero-image.webp' }
]

export const helpFaqs = [
  { q: '如何开始生成？', a: '首页输入一句描述后进入生成工作台，或从商品图、模特图场景中心选择具体业务入口。' },
  { q: '积分如何消耗？', a: '每次生成按所选模型和分辨率扣除积分。登录后可在右上角查看余额并充值。' },
  { q: '图片会保存多久？', a: '生成结果默认保留 7 天，可在「我的作品」中下载或收藏。' },
  { q: '支持哪些模型？', a: '当前接入文生图、参考图生图、文生视频和图生视频多类模型，能力以工作台实时配置为准。' },
  { q: '如何联系客服？', a: '点击右下角帮助入口，或通过文档页查看接口说明与联系方式。' }
]

export const searchIndex = [
  { label: '首页', description: '返回首页', to: '/' },
  { label: '生成', description: '一句话作图工作台', to: '/user' },
  { label: '商品图', description: '商品图场景中心', to: '/product-images' },
  { label: 'AI视频', description: 'AI 视频场景中心', to: '/ai-video' },
  { label: '模特图', description: '模特图场景中心', to: '/model-plaza' },
  { label: '图片工具', description: '本地图片工具箱', to: '/tools' },
  { label: 'AI 图片工具', description: 'AI 改图、拆层和修复入口', to: '/tools/ai' },
  { label: '平面设计', description: '平面设计场景中心', to: '/graphic-design' },
  { label: '图片创作', description: '从灵感发现到电商成图', to: '/image-creation' },
  { label: '学习中心', description: '从提示词到成图的学习路径', to: '/learn' },
  { label: '跨境上架', description: '把商品资料整理成海外上架包', to: '/cross-border' },
  { label: '营销场景', description: '把商品卖点变成营销物料', to: '/marketing' },
  { label: '电商素材', description: '从商品资料生成可上架素材', to: '/ecommerce-assets' },
  { label: '图片POD', description: '图片POD场景中心', to: '/pod-images' },
  { label: '爆款衍生', description: '爆款衍生场景中心', to: '/derive-images' },
  { label: '模特广场', description: '浏览可直接使用的商用 AI 模特', to: '/model-plaza' },
  { label: '海量模板', description: '浏览电商创作模板', to: '/templates' },
  { label: '文档', description: '接口与使用文档', to: '/docs' },
  { label: '关于', description: '了解当前项目', to: '/about' },
  ...productScenes.map((s) => ({ label: s.title, description: s.description, to: `/product-images/${s.slug}` })),
  ...modelScenes.map((s) => ({ label: s.title, description: s.description, to: `/model-images/${s.slug}` }))
]
