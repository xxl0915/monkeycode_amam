<template>
  <SceneWorkbenchShell kind="product" scene="suite">
  <div class="suite-page">
    <div class="suite-workbench">
      <div class="suite-input-column">
        <div class="suite-input-head">
          <div>
            <h2>商品套图</h2>
            <p>上传商品图，一键生成风格统一的多平台电商套图</p>
          </div>
          <button type="button" class="suite-new-task" :disabled="busy" @click="resetTask">＋ 新建任务</button>
        </div>
        <div class="suite-input-scroll">
          <section class="suite-panel">
            <div class="panel-title">
              <span>1</span>
              <div>
                <h2>上传商品图 <em class="required-mark">（必填）</em></h2>
                <p>主图用于锁定商品外形；其他角度和细节图可继续补充，最多 5 张。</p>
              </div>
            </div>
            <div class="upload-section">
              <div class="upload-section-head">
                <strong>商品主图</strong>
                <small>AI 分析优先读取这张图</small>
              </div>
              <div class="image-grid">
                <div v-if="mainImage" class="image-tile-wrap">
                  <button type="button" class="image-tile main" :title="mainImage.name">
                    <img :src="mainImage.preview" :alt="mainImage.name" />
                    <span class="main-mark">主图</span>
                    <span class="image-name">{{ mainImage.name }}</span>
                    <span class="remove-image" title="移除" @click.stop="removeImage(mainImageIndex)">×</span>
                  </button>
                </div>
                <button v-else type="button" class="upload-tile" @click="pickFiles('main')">
                  <Icon name="plus" :size="20" />
                  <span>上传主图</span>
                  <small>JPG / PNG / WebP</small>
                </button>
              </div>
              <div class="suite-samples-head">
                <span>推荐示例</span>
                <button type="button" class="text-btn" @click="showSamples = !showSamples">{{ showSamples ? '隐藏示例' : '显示示例' }}</button>
              </div>
              <div v-if="showSamples" class="suite-samples">
                <button v-for="sample in samples" :key="sample[0]" type="button" class="suite-sample" @click="useSample(sample)">
                  <img class="suite-sample-art" :src="sample[2]" :alt="sample[1]" />
                  <small>{{ sample[1] }}</small>
                </button>
              </div>
              <div class="suite-tips">
                <strong>Tips.</strong>
                <span>{{ tipOpen ? '建议优先上传清晰主图，再补充侧面、细节和包装图；示例仅用于快速填充参考素材，生成前仍可删除或替换。' : '请上传同一款商品的不同角度/细节图，建议清晰展示商品全貌；支持 JPG / PNG / GIF / WebP，单张不超过 50MB。' }}</span>
                <button type="button" class="text-btn" @click="tipOpen = !tipOpen">{{ tipOpen ? '收起 ‹' : '更多 ›' }}</button>
              </div>
            </div>
            <div class="upload-section optional-upload">
              <div class="upload-section-head">
                <strong>上传其他图 <em>（非必填）</em></strong>
                <small>角度、细节、包装或品牌素材</small>
              </div>
              <div class="image-grid">
                <div v-for="entry in otherImages" :key="entry.item.id" class="image-tile-wrap">
                  <button type="button" class="image-tile" title="点击设为主图" @click="setMain(entry.index)">
                    <img :src="entry.item.preview" :alt="entry.item.name" />
                    <span class="set-main-mark">设为主图</span>
                    <span class="image-name">{{ entry.item.name }}</span>
                    <span class="remove-image" title="移除" @click.stop="removeImage(entry.index)">×</span>
                  </button>
                  <select class="image-role-select" :value="entry.item.role" @click.stop @change="entry.item.role = $event.target.value">
                    <option value="product">同款商品图</option>
                    <option value="reference">辅助参考图</option>
                  </select>
                </div>
                <button v-if="images.length < maxImages" type="button" class="upload-tile" @click="pickFiles('other')">
                  <Icon name="plus" :size="20" />
                  <span>添加其他图</span>
                  <small>{{ otherImages.length }}/{{ Math.max(0, maxImages - (mainImage ? 1 : 0)) }}</small>
                </button>
              </div>
            </div>
            <div class="suite-action-row">
              <button type="button" class="secondary-btn" :disabled="analyzing || !images.length" @click="analyze">
                <Icon name="spark" :size="14" /> {{ analyzing ? '分析中...' : 'AI 分析' }}
              </button>
              <button type="button" class="text-btn" @click="fillGuide"><Icon name="list" :size="14" /> 输入向导</button>
            </div>
            <div class="suite-analysis-usage">
              <div class="suite-analysis-usage-head">
                <span>AI 分析额度与费用</span>
                <strong>{{ images.length ? '本次演示免费' : '上传商品主图后估算' }}</strong>
              </div>
              <div class="suite-analysis-usage-body">
                <span>按实际用量结算</span>
                <small>分析前会显示预估上限；当前为本地演示，不调用原站接口。</small>
              </div>
            </div>
          </section>

          <section class="suite-panel">
            <div class="panel-title">
              <span>2</span>
              <div>
                <h2>商品卖点&要求 <em class="required-mark">（*必填）</em></h2>
                <p>信息越具体，商品一致性、文案和版位适配越稳定。</p>
              </div>
              <small class="field-count">{{ form.product_info.length }}/12000</small>
            </div>
            <textarea
              v-model="form.product_info"
              class="suite-textarea suite-product-info"
              :class="{ 'suite-product-info-expanded': infoExpanded }"
              :rows="infoExpanded ? 10 : 6"
              maxlength="12000"
              placeholder="建议包含：1. 产品名称  2. 核心卖点  3. 适用人群  4. 期望场景  5. 具体参数"
            ></textarea>
            <div class="suite-info-actions">
              <button type="button" class="text-btn" :disabled="!images.length || analyzing" @click="analyze">
                <Icon name="spark" :size="14" /> {{ analyzing ? '分析中…' : 'AI 撰写' }}
              </button>
              <button type="button" class="text-btn" @click="infoExpanded = !infoExpanded"><Icon name="maximize" :size="14" /> 放大编辑</button>
              <button type="button" class="text-btn" :disabled="!form.product_info" @click="form.product_info = ''">清空</button>
              <span>{{ form.product_info.length }} / 12000</span>
            </div>

            <div class="suite-more-settings" @click="moreOpen = !moreOpen">
              <div>
                <strong>更多设置</strong>
                <span>{{ marketLabel }} · {{ form.language }} · {{ form.platform || '淘宝/天猫/1688' }} · {{ form.default_audience }} · {{ form.theme_color }} · {{ form.font_style_mode }}</span>
              </div>
              <Icon name="chevron" :size="16" :class="{ open: moreOpen }" />
            </div>
            <div v-if="moreOpen" class="suite-subsection">
              <div class="mode-tabs">
                <button v-for="m in markets" :key="m.value" type="button" :class="{ active: form.market_mode === m.value }" @click="setMarket(m.value)">
                  <span class="mode-icon">{{ m.icon }}</span>{{ m.label }}
                </button>
              </div>
              <div class="platform-grid">
                <button v-for="p in currentPlatforms" :key="p.value" type="button" class="platform-chip" :class="{ active: form.platform === p.value }" :style="{ '--accent': p.accent }" @click="form.platform = p.value">
                  <b>{{ p.short }}</b>{{ p.label }}
                </button>
              </div>
              <input v-model="form.platform" class="other-platform" placeholder="其他平台或补充平台要求" />
              <div class="field-grid">
                <label><span>文案语言</span>
                  <select v-model="form.language">
                    <option v-for="lang in currentLanguages" :key="lang" :value="lang">{{ lang }}</option>
                  </select>
                </label>
                <label class="range-label">
                  <span>风格强度 <b>{{ Math.round(form.style_strength * 100) }}%</b></span>
                  <input v-model.number="form.style_strength" type="range" min="0" max="1" step="0.05" class="suite-range" />
                </label>
              </div>
              <div class="field-grid">
                <label><span>默认受众</span>
                  <select v-model="form.default_audience">
                    <option>默认中国人</option><option>年轻女性</option><option>家庭用户</option><option>专业买家</option>
                  </select>
                </label>
                <label><span>主题色</span>
                  <select v-model="form.theme_color">
                    <option>智能主题色</option><option>暖色高级</option><option>清爽明亮</option><option>品牌主色</option>
                  </select>
                </label>
                <label><span>字体风格</span>
                  <select v-model="form.font_style_mode">
                    <option>智能字体风格</option><option>现代无衬线</option><option>高端杂志体</option><option>品牌字体</option>
                  </select>
                </label>
              </div>
              <label class="check-row">
                <input v-model="form.text_required" type="checkbox" />
                <span>强文案模式</span>
                <small>卖点图 / A+ 必须有文案</small>
              </label>
              <label class="check-row">
                <input v-model="form.no_text" type="checkbox" />
                <span>无文字模式</span>
                <small>不生成新增文案</small>
              </label>
            </div>

            <div class="suite-strategy-section">
              <div class="suite-subsection-head">
                <span>套图策略</span>
                <small>选择套图类型、画面取向和附加要求</small>
              </div>
              <div class="suite-choice-row">
                <div>
                  <span>套图类型</span>
                  <div class="segmented-row">
                    <button type="button" :class="{ active: form.suite_type === 'multi_dimension' }" @click="form.suite_type = 'multi_dimension'">多维套图</button>
                    <button type="button" :class="{ active: form.suite_type === 'main_variant' }" @click="form.suite_type = 'main_variant'">主图变体测试</button>
                  </div>
                </div>
                <div>
                  <span>画面取向</span>
                  <div class="segmented-row">
                    <button type="button" :class="{ active: form.image_direction === 'promo' }" @click="form.image_direction = 'promo'">宣传大片</button>
                    <button type="button" :class="{ active: form.image_direction === 'balanced' }" @click="form.image_direction = 'balanced'">平衡</button>
                    <button type="button" :class="{ active: form.image_direction === 'real' }" @click="form.image_direction = 'real'">真实试穿</button>
                  </div>
                  <small class="direction-tip">美只在光和景，货与上身效果守真。</small>
                </div>
              </div>
              <div class="suite-mode-actions">
                <button type="button" class="secondary-btn" @click="smartSlots">✦ 智能推荐版位</button>
                <button type="button" class="text-btn" @click="notice = '批量托管需要先完成一次套图任务；当前参数已保存，可直接新建任务。'">▦ 批量托管</button>
              </div>
              <div class="suite-extra-field">
                <div class="suite-subsection-head">
                  <span>额外描述 <small>（非必填）</small></span>
                  <small>{{ form.extra_description.length }}/2000</small>
                </div>
                <textarea v-model="form.extra_description" maxlength="2000" class="suite-textarea" rows="4" placeholder="可在此补充套图风格、背景氛围、版面与文案要求"></textarea>
              </div>
            </div>

            <div class="suite-addons">
              <div class="suite-subsection-head"><span>附加功能</span></div>
              <label class="suite-addon-row"><span>爆款风格推荐 <small>?</small></span><input v-model="form.trending_style" type="checkbox" role="switch" /></label>
              <label class="suite-addon-row"><span>配图文字字数 <small>?</small></span><input v-model="form.text_amount" type="checkbox" role="switch" /></label>
              <select v-if="form.text_amount" v-model="form.text_amount_mode" class="suite-addon-select">
                <option>简洁</option><option>标准</option><option>丰富</option>
              </select>
              <label class="suite-addon-row"><span>配图版式 <small>?</small></span><input v-model="form.layout_mode" type="checkbox" role="switch" /></label>
              <select v-if="form.layout_mode" v-model="form.layout_mode_value" class="suite-addon-select">
                <option>标准商品卡</option><option>留白高级</option><option>信息密度高</option>
              </select>
              <label class="suite-addon-row"><span>指定版面结构 <small>?</small></span><input v-model="form.page_structure" type="checkbox" role="switch" /></label>
              <select v-if="form.page_structure" v-model="form.page_structure_value" class="suite-addon-select">
                <option>商品-卖点-场景-细节</option><option>商品-参数-尺寸-包装</option><option>主图-卖点-信任-行动</option>
              </select>
              <label class="suite-addon-row"><span>模板风格 <small>?</small></span><input v-model="form.template_style" type="checkbox" role="switch" /></label>
              <select v-if="form.template_style" v-model="form.template_style_value" class="suite-addon-select">
                <option>智能统一</option><option>极简白底</option><option>氛围大片</option>
              </select>
              <label class="suite-addon-row"><span>商品立体感 <small>?</small></span><input v-model="form.product_depth" type="checkbox" role="switch" /></label>
              <select v-if="form.product_depth" v-model="form.product_depth_value" class="suite-addon-select">
                <option>自然立体</option><option>强立体光影</option><option>柔和质感</option>
              </select>
            </div>

            <div class="suite-subsection">
              <div class="suite-subsection-head">
                <span>模型与画质</span>
                <small>使用当前账号的图片引擎和计费</small>
              </div>
              <div class="field-grid">
                <label><span>图片模型</span>
                  <select v-model="form.model_id">
                    <option v-for="m in models" :key="m.id" :value="m.id">{{ m.name }}</option>
                  </select>
                </label>
                <div>
                  <span class="field-label">画质</span>
                  <div class="choice-grid">
                    <button v-for="q in qualities" :key="q" type="button" class="choice-btn" :class="{ active: form.quality === q }" @click="form.quality = q">{{ q }}</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="suite-subsection">
              <div class="suite-subsection-head">
                <span>输出内容</span>
                <small>已选 {{ totalCount }}/{{ maxSlots }} 张 · {{ form.language }}</small>
              </div>
              <div v-for="group in slotGroups" :key="group.title" class="slot-group">
                <div class="slot-group-title">{{ group.title }}</div>
                <div class="slot-grid">
                  <div v-for="item in group.items" :key="item[0]" class="slot-item">
                    <div class="slot-copy">
                      <strong>{{ item[1] }}</strong>
                      <small>{{ item[2] }}</small>
                    </div>
                    <div class="stepper">
                      <button type="button" :disabled="form[item[0]] <= 0" :aria-label="`减少${item[1]}`" @click="setSlot(item[0], form[item[0]] - 1)"><Icon name="minus" :size="14" /></button>
                      <span>{{ form[item[0]] }}</span>
                      <button type="button" :disabled="form[item[0]] >= 4 || totalCount >= maxSlots" :aria-label="`增加${item[1]}`" @click="setSlot(item[0], form[item[0]] + 1)"><Icon name="plus" :size="14" /></button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="platform-pixel-row">
                <span>平台像素 <small>选填</small></span>
                <div class="platform-pixel-list">
                  <button v-for="px in pixels" :key="px[0]" type="button" :class="{ active: form.platform_pixel === px[0] }" @click="form.platform_pixel = px[0]">{{ px[1] }}</button>
                </div>
              </div>
              <div class="suite-subsection-head">
                <span>生成比例 <em class="required-mark">（*必填）</em></span>
              </div>
              <div class="ratio-grid">
                <button v-for="r in ratios" :key="r.value" type="button" class="ratio-btn" :class="{ active: form.aspect_ratio === r.value }" @click="form.aspect_ratio = r.value">
                  <span class="ratio-shape" :class="r.shape"></span>{{ r.label }}
                </button>
              </div>
            </div>

            <details class="suite-collapsible">
              <summary>
                <div>
                  <span>品牌基因</span>
                  <small>可选，帮助统一套图视觉</small>
                </div>
                <Icon name="chevron" class="suite-collapse-icon" :size="14" />
              </summary>
              <div class="suite-collapsible-body">
                <div class="field-grid">
                  <label><span>品牌名称</span><input v-model="form.brand_name" placeholder="可选" /></label>
                  <label><span>品牌主色</span><input v-model="form.brand_colors" placeholder="如黑白银、#7c5cfc" /></label>
                  <label><span>字体/视觉风格</span><input v-model="form.font_style" placeholder="如现代、简约、科技" /></label>
                  <label><span>销售地区</span><input v-model="form.sales_region" placeholder="如中国、北美、欧洲" /></label>
                </div>
              </div>
            </details>
          </section>
        </div>
        <div class="suite-generate-bar">
          <div>
            <strong>{{ totalCount }} 张</strong>
            <small>{{ canGenerate ? 'AI 生成 · 4 积分' : generateHint }}</small>
          </div>
          <button type="button" class="primary-btn" :disabled="!canGenerate || busy" @click="generate">
            {{ busy ? '生成中…' : `开始生成 ${totalCount} 张 4 积分` }}
          </button>
        </div>
      </div>

      <aside class="suite-result-column">
        <div class="suite-result-panel">
          <div class="suite-result-header">
            <div>
              <h2>商品套图</h2>
              <p>上传商品图，一键生成风格统一的多平台电商套图</p>
            </div>
            <button type="button" class="suite-refresh-button" @click="resultTab = 'ai'">刷新</button>
          </div>
          <div class="suite-result-tabs">
            <button type="button" :class="{ on: resultTab === 'ai' }" @click="resultTab = 'ai'"><Icon name="spark" :size="14" /> AI 创作结果 <b v-if="tasks.length">{{ tasks.length }}</b></button>
            <button type="button" :class="{ on: resultTab === 'examples' }" @click="resultTab = 'examples'"><Icon name="files" :size="14" /> 创作案例</button>
            <button type="button" class="suite-tutorial-button" @click="tutorialOpen = true"><Icon name="book" :size="14" /> 教程说明</button>
          </div>
          <div class="suite-result-content">
            <template v-if="resultTab === 'ai'">
              <div v-if="!tasks.length" class="suite-result-empty">
                <span class="suite-empty-illustration"><Icon name="spark" :size="22" /></span>
                <strong>还没有套图任务</strong>
                <p>上传商品主图并填写卖点后，点击开始生成。</p>
              </div>
              <div v-else class="suite-task-list">
                <article v-for="task in tasks" :key="task.id" class="suite-task-card" :class="{ 'is-selected': selectedTaskId === task.id }">
                  <div class="suite-task-heading" @click="selectedTaskId = selectedTaskId === task.id ? '' : task.id">
                    <div class="suite-task-heading-main">
                      <div class="suite-task-title-line">
                        <strong>{{ task.name }}</strong>
                        <span class="suite-task-status" :class="task.statusClass">{{ task.statusLabel }}</span>
                      </div>
                      <div class="suite-task-meta">
                        <span>{{ task.when }}</span>
                        <span>已处理 {{ task.items.length }}/{{ task.items.length }} 张</span>
                        <span>实际 4 积分</span>
                      </div>
                    </div>
                    <div class="suite-task-actions">
                      <a class="suite-task-action" :href="task.items[0]?.image" download><span>下载</span></a>
                    </div>
                  </div>
                  <div v-if="selectedTaskId === task.id" class="suite-task-body">
                    <div class="suite-output-grid">
                      <figure v-for="item in task.items" :key="item.id">
                        <span class="suite-output-badge">{{ item.slot }}</span>
                        <img :src="item.image" :alt="item.slot" />
                        <figcaption>
                          <div class="suite-output-caption-title">{{ item.slot }}</div>
                          <div class="suite-output-caption-meta">{{ item.ratio }} · {{ item.model }}</div>
                          <a :href="item.image" download>下载</a>
                        </figcaption>
                      </figure>
                    </div>
                  </div>
                </article>
              </div>
            </template>
            <div v-else class="suite-example-grid">
              <article v-for="sample in samples" :key="sample[0]" class="suite-example-item">
                <img :src="sample[2]" :alt="sample[1]" />
                <span>{{ sample[1] }}</span>
              </article>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div v-if="tutorialOpen" class="suite-modal-backdrop" @click.self="tutorialOpen = false">
      <section class="suite-tutorial-modal" role="dialog" aria-modal="true" aria-label="商品套图教程">
        <button type="button" class="suite-modal-close" aria-label="关闭" @click="tutorialOpen = false">×</button>
        <h2>商品套图教程</h2>
        <ol>
          <li><b>准备商品参考图</b> 上传同一商品的主图和不同角度、细节图，主图用于锁定商品外形。</li>
          <li><b>填写商品要求</b> 补充卖点、受众、平台和版位数量，信息越具体，生成结果越稳定。</li>
          <li><b>连续提交任务</b> 每次提交都会形成独立任务，生成期间可以继续编辑并提交下一套图。</li>
        </ol>
        <p>当前为本地演示：生成会扣除 4 积分并返回样图结果。</p>
      </section>
    </div>
    <p v-if="notice" class="suite-feedback"><span>{{ notice }}</span></p>
    <input ref="fileInput" class="hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple @change="onFiles" />
  </div>
  </SceneWorkbenchShell>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import Icon from '../components/Icon.vue'
import SceneWorkbenchShell from '../components/SceneWorkbenchShell.vue'
import { onlineModels } from '../data/catalogs'
import { store, createJob, pollJob } from '../store'

const maxImages = 5
const maxSlots = 12
const fileInput = ref(null)
const pickRole = ref('main')
const images = ref([])
const showSamples = ref(true)
const tipOpen = ref(false)
const moreOpen = ref(false)
const infoExpanded = ref(false)
const analyzing = ref(false)
const busy = ref(false)
const tutorialOpen = ref(false)
const notice = ref('')
const resultTab = ref('ai')
const selectedTaskId = ref('')
const tasks = ref([])

const samples = [
  ['suite', '商品套图', '/product-scenes/samples/suite.webp'],
  ['detail', '详情页', '/product-scenes/samples/detail-page.webp'],
  ['hero', '主图', '/product-scenes/samples/hero-image.webp'],
  ['collage', '主图拼图', '/product-scenes/samples/main-collage.webp'],
  ['poster', '营销海报', '/product-scenes/samples/clothing-ztc.webp'],
  ['variant', 'SKU 变体', '/product-scenes/samples/sku-image.webp']
]

const slotGroups = [
  { title: 'A+ 图', items: [['a_plus_standard_count', '标准 A+', '横版详情模块'], ['a_plus_premium_count', '宽幅 A+', '宽屏首屏模块'], ['a_plus_mobile_count', '移动 A+', '移动端详情模块']] },
  { title: '主副图', items: [['sell_point_count', '卖点图', '场景加卖点'], ['white_bg_count', '白底图', '平台主图'], ['dimension_count', '尺寸图', '标尺加规格'], ['scene_count', '场景图', '真实使用场景'], ['closeup_count', '特写图', '细节材质'], ['closeup_white_count', '特写白底', '白底细节']] }
]
const slotKeys = slotGroups.flatMap((g) => g.items.map((i) => i[0]))
const slotLabel = Object.fromEntries(slotGroups.flatMap((g) => g.items.map((i) => [i[0], i[1]])))

const markets = [
  { value: 'china', label: '中文电商', icon: 'CN' },
  { value: 'cross_border', label: '跨境电商', icon: 'CB' }
]
const platforms = {
  china: [
    { value: '淘宝', label: '淘宝', short: '淘', accent: '#f97316' },
    { value: '京东', label: '京东', short: 'JD', accent: '#dc2626' },
    { value: '拼多多', label: '拼多多', short: '拼', accent: '#ef4444' },
    { value: '1688', label: '1688', short: '1688', accent: '#f97316' },
    { value: '小红书', label: '小红书', short: 'RED', accent: '#ef4444' },
    { value: '抖音', label: '抖音', short: '♪', accent: '#f8fafc' }
  ],
  cross_border: [
    { value: 'Amazon', label: 'Amazon', short: 'a', accent: '#f3f4f6' },
    { value: 'Temu', label: 'Temu', short: 'T', accent: '#ff6a00' },
    { value: 'Shopee', label: 'Shopee', short: 'S', accent: '#f05a28' },
    { value: 'TikTok Shop', label: 'TikTok Shop', short: '♪', accent: '#f8fafc' },
    { value: 'AliExpress', label: 'AliExpress', short: 'Ali', accent: '#ef4444' },
    { value: 'Alibaba.com', label: 'Alibaba', short: '阿', accent: '#f97316' },
    { value: 'OZON', label: 'OZON', short: 'OZ', accent: '#2563eb' },
    { value: 'Lazada', label: 'Lazada', short: 'Laz', accent: '#7c3aed' },
    { value: 'eBay', label: 'eBay', short: 'e', accent: '#3b82f6' }
  ]
}
const languages = { china: ['中文简体', '中文繁体'], cross_border: ['英文', '俄语', '日文', '德文', '法文', '西班牙文', '意大利文', '葡萄牙文', '荷兰文', '波兰文', '阿拉伯文'] }
const pixels = [['auto', '不指定'], ['taobao', '淘宝/天猫 1440×1440'], ['jd', '京东 1024×1024'], ['douyin', '抖音小店 1024×1024'], ['tiktok', 'TikTok Shop 1024×1024'], ['amazon', '亚马逊 1600×1600'], ['ebay', 'eBay 1600×1600'], ['temu', 'Temu 1200×1200'], ['shopify', 'Shopify 2048×2048'], ['shein', 'SHEIN 1340×1785'], ['shopee', 'Shopee 1080×1080'], ['lazada', 'Lazada 1080×1080']]
const ratios = [
  { value: '1:1', label: '1:1', shape: 'aspect-square' },
  { value: '3:4', label: '3:4', shape: 'aspect-portrait' },
  { value: '2:3', label: '2:3', shape: 'aspect-tall' },
  { value: '3:2', label: '3:2', shape: 'aspect-wide-s' },
  { value: '4:3', label: '4:3', shape: 'aspect-landscape' },
  { value: '4:5', label: '4:5', shape: 'aspect-card' },
  { value: '5:4', label: '5:4', shape: 'aspect-wide-s' },
  { value: '9:16', label: '9:16', shape: 'aspect-story' },
  { value: '16:9', label: '16:9', shape: 'aspect-wide' },
  { value: '1:2', label: '1:2', shape: 'aspect-tall' },
  { value: '2:1', label: '2:1', shape: 'aspect-wide' },
  { value: '21:9', label: '21:9', shape: 'aspect-cinema' }
]
const models = onlineModels.filter((m) => !m.video)
const qualities = ['1K', '2K', '4K']

const form = reactive({
  model_id: models[0]?.id || '',
  product_info: '',
  quality: '1K',
  aspect_ratio: '1:1',
  market_mode: 'china',
  main_image_index: -1,
  style_strength: 0.7,
  brand_name: '',
  brand_colors: '',
  font_style: '',
  sales_region: '',
  platform: '淘宝',
  language: '中文简体',
  no_text: false,
  text_required: false,
  a_plus_standard_count: 1,
  a_plus_premium_count: 0,
  a_plus_mobile_count: 0,
  sell_point_count: 1,
  white_bg_count: 1,
  dimension_count: 0,
  scene_count: 1,
  closeup_count: 0,
  closeup_white_count: 0,
  suite_type: 'multi_dimension',
  image_direction: 'balanced',
  extra_description: '',
  default_audience: '默认中国人',
  theme_color: '智能主题色',
  font_style_mode: '智能字体风格',
  trending_style: false,
  text_amount: false,
  text_amount_mode: '简洁',
  layout_mode: false,
  layout_mode_value: '标准商品卡',
  page_structure: false,
  page_structure_value: '商品-卖点-场景-细节',
  template_style: false,
  template_style_value: '智能统一',
  product_depth: false,
  product_depth_value: '自然立体',
  platform_pixel: 'auto'
})

const mainImageIndex = computed(() => {
  const i = Number(form.main_image_index)
  return Number.isInteger(i) && i >= 0 && i < images.value.length ? i : -1
})
const mainImage = computed(() => (mainImageIndex.value >= 0 ? images.value[mainImageIndex.value] : null))
const otherImages = computed(() => images.value.map((item, index) => ({ item, index })).filter(({ index }) => index !== mainImageIndex.value))
const currentPlatforms = computed(() => platforms[form.market_mode] || platforms.china)
const currentLanguages = computed(() => languages[form.market_mode] || languages.china)
const marketLabel = computed(() => (form.market_mode === 'china' ? '中国' : '跨境'))
const totalCount = computed(() => slotKeys.reduce((n, k) => n + Math.max(0, Math.min(4, Number(form[k]) || 0)), 0))
const canGenerate = computed(() => !!mainImage.value && !!form.product_info.trim() && totalCount.value > 0 && !busy.value && !analyzing.value)
const generateHint = computed(() => {
  if (!mainImage.value) return '请先上传商品主图'
  if (!form.product_info.trim()) return '请填写商品卖点与要求'
  if (totalCount.value <= 0) return '请至少选择 1 个输出版位'
  return '补充参数后即可生成'
})

function pickFiles(role) {
  pickRole.value = role
  fileInput.value?.click()
}
function onFiles(e) {
  const files = [...(e.target.files || [])].slice(0, maxImages - images.value.length)
  files.forEach((file) => {
    images.value.push({
      id: `${Date.now()}-${file.name}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      preview: URL.createObjectURL(file),
      role: 'product'
    })
  })
  if (form.main_image_index < 0 && images.value.length) form.main_image_index = 0
  if (pickRole.value === 'main' && images.value.length) form.main_image_index = images.value.length - files.length
  e.target.value = ''
}
function useSample(sample) {
  if (images.value.length >= maxImages) return
  images.value.push({ id: `sample-${sample[0]}-${Date.now()}`, name: sample[1], preview: sample[2], role: 'product' })
  if (form.main_image_index < 0) form.main_image_index = 0
}
function removeImage(index) {
  images.value.splice(index, 1)
  if (!images.value.length) form.main_image_index = -1
  else if (form.main_image_index >= images.value.length) form.main_image_index = 0
}
function setMain(index) {
  form.main_image_index = index
}
function setMarket(mode) {
  form.market_mode = mode
  const langs = languages[mode]
  if (!langs.includes(form.language)) form.language = langs[0]
  const list = platforms[mode]
  if (!list.some((p) => p.value === form.platform)) form.platform = list[0].value
}
function setSlot(key, value) {
  form[key] = Math.max(0, Math.min(4, Number(value) || 0))
}
function smartSlots() {
  slotKeys.forEach((k) => { form[k] = 0 })
  const text = form.product_info
  const picks = []
  if (/详情|A\+|模块/.test(text)) picks.push('a_plus_standard_count')
  if (/白底|主图/.test(text)) picks.push('white_bg_count')
  if (/卖点/.test(text)) picks.push('sell_point_count')
  if (/场景|使用/.test(text)) picks.push('scene_count')
  if (/尺寸|规格/.test(text)) picks.push('dimension_count')
  if (/细节|材质|特写/.test(text)) picks.push('closeup_count')
  ;['white_bg_count', 'sell_point_count', 'scene_count', 'a_plus_standard_count'].forEach((k) => { if (!picks.includes(k)) picks.push(k) })
  picks.slice(0, 4).forEach((k) => { form[k] = 1 })
  notice.value = '已按商品要求推荐版位'
}
function fillGuide() {
  if (form.product_info.trim()) return
  form.product_info = `[产品名称]：\n[规格数量]：\n[目标受众]：\n[卖点描述]：\n[产品卖点]：\n[材质描述]：\n[使用方式]：\n[产品类目]：\n[套图要求]：`
  infoExpanded.value = true
}
async function analyze() {
  if (!images.value.length) return
  analyzing.value = true
  await new Promise((r) => setTimeout(r, 700))
  if (!form.product_info.trim()) {
    form.product_info = '商品主图已识别。建议补充产品名称、核心卖点、适用人群、使用场景和关键参数，以便套图文案与版位更稳定。'
  }
  analyzing.value = false
}
function resetTask() {
  notice.value = '已保留当前参数，可继续编辑后提交下一套图。'
}
async function generate() {
  if (!canGenerate.value) return
  if (!store.user) {
    store.loginOpen = true
    return
  }
  busy.value = true
  notice.value = ''
  try {
    const refs = images.value.map((img, index) => ({
      role: 'product',
      name: img.name,
      url: img.preview,
      main: index === mainImageIndex.value
    }))
    const job = await createJob({
      scene: '商品套图',
      model: form.model_id,
      params: { ...form, outputCount: totalCount.value },
      refs
    })
    const finished = await pollJob(job.id)
    if (finished.status !== 'succeeded') throw new Error(finished.error || '生成失败，请稍后重试')
    const items = (finished.outputs || []).map((output, i) => ({
      id: `${finished.id}-${output.index ?? i}`,
      slot: slotLabel[slotKeys[i]] || '套图',
      image: output.url,
      ratio: form.aspect_ratio,
      model: form.model_id
    }))
    const task = {
      id: finished.id,
      name: `商品套图任务 ${finished.id.slice(-8)}`,
      statusLabel: '已完成',
      statusClass: 'is-completed',
      when: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items
    }
    tasks.value.unshift(task)
    selectedTaskId.value = task.id
    resultTab.value = 'ai'
  } catch (error) {
    notice.value = error?.message || '生成失败，请稍后重试'
  } finally {
    busy.value = false
  }
}
</script>

<style scoped>
.suite-page { min-width: 0; }
.suite-workbench { display: grid; grid-template-columns: minmax(0, 420px) minmax(0, 1fr); gap: 1rem; align-items: stretch; }
.suite-input-column, .suite-result-column { min-height: 0; min-width: 0; }
.suite-input-column { display: flex; flex-direction: column; gap: 0; height: calc(100dvh - 10rem); max-height: calc(100dvh - 10rem); overflow: hidden; border: 1px solid var(--hairline); border-radius: 1rem; background: var(--surface); }
.suite-input-head { display: flex; align-items: center; justify-content: space-between; gap: .7rem; flex: none; padding: .85rem 1rem; border-bottom: 1px solid var(--hairline); }
.suite-input-head h2 { margin: 0; font-size: 1rem; }
.suite-input-head p { margin: .2rem 0 0; color: var(--fg-3); font-size: .68rem; line-height: 1.4; }
.suite-new-task { padding: .45rem .7rem; border: 1px solid color-mix(in srgb, #8b5cf6 30%, var(--hairline)); border-radius: 999px; color: #7c3aed; background: color-mix(in srgb, #8b5cf6 8%, var(--surface)); font-size: .7rem; white-space: nowrap; }
.suite-input-scroll { display: grid; flex: 1; gap: 1rem; padding: 1rem; overflow-y: auto; }
.suite-panel { padding: .9rem; background: var(--surface); box-shadow: inset 0 0 0 1px var(--hairline); border-radius: .5rem; }
.panel-title { display: flex; gap: .65rem; align-items: flex-start; margin-bottom: .85rem; }
.panel-title > span:first-child { display: grid; place-items: center; width: 1.55rem; height: 1.55rem; flex: none; border-radius: 50%; color: #fff; background: #7c3aed; font-size: .75rem; font-weight: 700; }
.panel-title h2 { margin: 0 0 .15rem; font-size: 1rem; }
.panel-title p { margin: 0; color: var(--fg-3); font-size: .8rem; }
.field-count { margin-left: auto; color: var(--fg-faint); font-size: .68rem; font-weight: 600; }
.required-mark, .upload-section-head em { color: #ef6b6b; font-style: normal; font-size: .72rem; }
.upload-section { margin-top: .75rem; padding: .7rem; border: 1px solid var(--hairline); border-radius: .65rem; background: var(--surface-2); }
.upload-section-head { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; margin-bottom: .45rem; }
.upload-section-head strong { color: var(--fg-2); font-size: .74rem; }
.upload-section-head small { color: var(--fg-faint); font-size: .64rem; }
.image-grid { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: .75rem; }
.image-tile-wrap { display: grid; width: 5rem; gap: .25rem; }
.image-tile, .upload-tile { position: relative; width: 5rem; height: 5rem; overflow: hidden; border: 1px solid var(--hairline); border-radius: .5rem; background: var(--surface-2); color: var(--fg-2); }
.image-tile.main { box-shadow: inset 0 0 0 2px #7c3aed; }
.image-tile img { width: 100%; height: 100%; object-fit: cover; }
.image-role-select { width: 5rem; height: 1.35rem; padding: 0 .18rem; border: 1px solid var(--hairline); border-radius: .3rem; color: var(--fg-3); background: var(--surface-2); font-size: .55rem; }
.image-name { position: absolute; left: .25rem; right: .25rem; bottom: .22rem; overflow: hidden; color: #fff; font-size: .52rem; text-overflow: ellipsis; white-space: nowrap; text-shadow: 0 1px 3px #000; }
.main-mark, .set-main-mark { position: absolute; top: .25rem; left: .25rem; padding: .1rem .25rem; border-radius: .2rem; color: #fff; font-size: .55rem; }
.main-mark { background: #7c3aed; }
.set-main-mark { background: #0f172ab8; opacity: 0; }
.image-tile:hover .set-main-mark { opacity: 1; }
.remove-image { position: absolute; top: .2rem; right: .2rem; display: grid; place-items: center; width: 1.2rem; height: 1.2rem; border-radius: 50%; color: #fff; background: #0f172ab3; }
.upload-tile { display: grid; place-content: center; gap: .15rem; text-align: center; border-style: dashed; }
.upload-tile span { font-size: .62rem; }
.upload-tile small { color: var(--fg-faint); font-size: .55rem; }
.suite-samples-head { display: flex; align-items: center; justify-content: space-between; margin-top: .55rem; color: var(--fg-3); font-size: .66rem; }
.suite-samples { display: flex; gap: .35rem; overflow: auto; padding: .35rem 0; }
.suite-sample { display: grid; flex: none; gap: .15rem; width: 3.35rem; border: 1px solid var(--hairline); border-radius: .45rem; padding: .16rem; background: var(--surface); color: var(--fg-faint); font-size: .56rem; }
.suite-sample-art { width: 100%; height: 3.1rem; border-radius: .3rem; object-fit: cover; }
.suite-tips { display: flex; align-items: flex-start; gap: .35rem; margin-top: .4rem; padding: .45rem .55rem; border-radius: .45rem; color: var(--fg-faint); background: #7c3aed0f; font-size: .62rem; line-height: 1.4; }
.suite-tips strong { color: var(--fg-2); font-style: italic; }
.suite-tips .text-btn { margin-left: auto; flex: none; font-size: .6rem; }
.suite-action-row { display: flex; align-items: center; gap: .35rem; margin-top: .65rem; }
.suite-analysis-usage { display: grid; gap: .35rem; margin-top: .65rem; padding: .65rem .7rem; border: 1px solid var(--hairline); border-radius: .5rem; background: var(--surface-2); }
.suite-analysis-usage-head, .suite-analysis-usage-body { display: flex; align-items: baseline; justify-content: space-between; gap: .7rem; }
.suite-analysis-usage-head span { color: var(--fg-2); font-size: .7rem; font-weight: 700; }
.suite-analysis-usage-head strong { color: #0f766e; font-size: .68rem; }
.suite-analysis-usage-body span { color: var(--fg-3); font-size: .68rem; }
.suite-analysis-usage-body small { max-width: 62%; color: var(--fg-faint); font-size: .61rem; line-height: 1.45; text-align: right; }
.text-btn { display: inline-flex; align-items: center; gap: .35rem; min-height: 2.25rem; padding: .45rem .55rem; border: 0; color: var(--fg-2); background: transparent; font-size: .78rem; font-weight: 700; }
.text-btn:hover:not(:disabled) { color: var(--fg); background: var(--hover); }
.text-btn:disabled { opacity: .45; }
.secondary-btn, .primary-btn { display: inline-flex; align-items: center; justify-content: center; gap: .4rem; min-height: 2.25rem; padding: .5rem .8rem; border: 0; border-radius: .5rem; font-size: .78rem; font-weight: 700; }
.secondary-btn { color: var(--fg-2); background: var(--surface-2); box-shadow: inset 0 0 0 1px var(--hairline); }
.primary-btn { color: #fff; background: var(--generation-cta-bg); box-shadow: var(--generation-cta-shadow); }
.primary-btn:disabled, .secondary-btn:disabled { opacity: .45; }
.suite-textarea, input, select { width: 100%; border: 1px solid var(--hairline); border-radius: .5rem; outline: none; color: var(--fg); background: var(--surface-2); }
.suite-textarea { min-height: 5.6rem; padding: .7rem; resize: vertical; font-size: .82rem; }
.suite-product-info { min-height: 7rem; }
.suite-product-info-expanded { min-height: 14rem; }
.suite-info-actions { display: flex; align-items: center; gap: .65rem; margin-top: .35rem; color: var(--fg-faint); font-size: .68rem; }
.suite-info-actions > span { margin-left: auto; }
input, select { height: 2.25rem; padding: 0 .55rem; font-size: .78rem; }
.suite-textarea:focus, input:focus, select:focus { border-color: #7c3aedb3; box-shadow: 0 0 0 3px #7c3aed1f; }
.suite-more-settings { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-top: .7rem; padding: .65rem .7rem; border-radius: .55rem; color: var(--fg-2); background: var(--surface-2); cursor: pointer; }
.suite-more-settings div { display: grid; gap: .2rem; min-width: 0; }
.suite-more-settings strong { color: var(--fg); font-size: .72rem; }
.suite-more-settings span { overflow: hidden; color: var(--fg-faint); font-size: .65rem; text-overflow: ellipsis; white-space: nowrap; }
.suite-more-settings :deep(svg.open) { transform: rotate(180deg); }
.mode-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .35rem; }
.mode-tabs button { min-height: 2.1rem; padding: .4rem .55rem; border: 1px solid var(--hairline); border-radius: .5rem; color: var(--fg-2); background: var(--surface-2); font-size: .75rem; font-weight: 700; }
.mode-tabs button.active { color: #fff; border-color: #7c3aed; background: #7c3aed; }
.mode-icon { display: inline-block; margin-right: .3rem; font-size: .62rem; }
.platform-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .35rem; margin: .55rem 0; }
.platform-chip { display: flex; align-items: center; gap: .35rem; min-height: 2.1rem; padding: .3rem .45rem; border: 1px solid var(--hairline); border-radius: .5rem; color: var(--fg-2); background: var(--surface-2); font-size: .68rem; }
.platform-chip b { display: grid; place-items: center; width: 1.35rem; height: 1.35rem; border-radius: .3rem; color: #0f172a; background: var(--accent, #e5e7eb); font-size: .55rem; }
.platform-chip.active { border-color: #7c3aed; color: var(--fg); background: #7c3aed14; }
.other-platform { margin-bottom: .55rem; }
.field-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: .7rem; margin-top: .7rem; }
label > span, .field-label { display: block; margin-bottom: .3rem; color: var(--fg-2); font-size: .7rem; font-weight: 600; }
.range-label b { margin-left: .35rem; color: #7c3aed; }
.suite-range { height: 1.4rem; padding: 0; accent-color: #7c3aed; }
.check-row { display: flex; align-items: center; gap: .45rem; margin-top: .45rem; font-size: .72rem; color: var(--fg-2); }
.check-row small { color: var(--fg-faint); }
.suite-strategy-section, .suite-subsection, .suite-addons, .suite-collapsible, .suite-extra-field { margin-top: .8rem; padding-top: .8rem; border-top: 1px solid var(--hairline); }
.suite-subsection-head { display: flex; align-items: baseline; justify-content: space-between; gap: .75rem; margin-bottom: .55rem; }
.suite-subsection-head > span { color: var(--fg-2); font-size: .72rem; font-weight: 700; }
.suite-subsection-head small { color: var(--fg-faint); font-size: .64rem; }
.suite-choice-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .6rem; }
.suite-choice-row > div { color: var(--fg-3); font-size: .68rem; }
.suite-choice-row > div > span { display: block; color: var(--fg-2); font-weight: 700; }
.segmented-row { display: flex; gap: .25rem; margin-top: .3rem; }
.segmented-row button { flex: 1; min-height: 2rem; border: 1px solid var(--hairline); border-radius: .4rem; color: var(--fg-2); background: var(--surface-2); font-size: .68rem; }
.segmented-row button.active { color: #fff; border-color: #f47d7d; background: #f47d7d; }
.direction-tip { display: block; margin-top: .3rem; color: var(--fg-faint); font-size: .62rem; }
.suite-mode-actions { display: flex; gap: .5rem; margin-top: .6rem; }
.suite-addon-row { display: flex; align-items: center; justify-content: space-between; min-height: 2.2rem; margin-top: .3rem; padding: .35rem .55rem; border-radius: .45rem; color: var(--fg-2); background: var(--surface-2); font-size: .68rem; }
.suite-addon-row small { color: var(--fg-faint); }
.suite-addon-select { width: 100%; min-height: 2rem; margin: .25rem 0 .35rem; padding: 0 .55rem; border: 1px solid var(--hairline); border-radius: .4rem; color: var(--fg-2); background: var(--surface); font-size: .68rem; }
.suite-addon-row input { width: 2rem; height: 1.15rem; accent-color: #7c3aed; }
.choice-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .35rem; }
.choice-btn { min-height: 2.25rem; padding: .35rem .5rem; border: 1px solid var(--hairline); border-radius: .5rem; color: var(--fg-2); background: var(--surface-2); font-size: .75rem; font-weight: 700; }
.choice-btn.active { color: #fff; border-color: #7c3aed; background: #7c3aed; }
.slot-group + .slot-group { margin-top: .9rem; }
.slot-group-title { margin-bottom: .45rem; color: var(--fg-3); font-size: .7rem; font-weight: 700; }
.slot-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: .45rem; }
.slot-item { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: .5rem .55rem; border: 1px solid var(--hairline); border-radius: .5rem; color: var(--fg-2); background: var(--surface-2); font-size: .75rem; }
.slot-copy { min-width: 0; display: grid; gap: .15rem; }
.slot-copy strong { overflow: hidden; color: var(--fg); font-size: .72rem; text-overflow: ellipsis; white-space: nowrap; }
.slot-copy small { overflow: hidden; color: var(--fg-faint); font-size: .62rem; text-overflow: ellipsis; white-space: nowrap; }
.stepper { display: flex; align-items: center; gap: .25rem; flex: none; }
.stepper button { display: grid; place-items: center; width: 1.55rem; height: 1.55rem; border: 1px solid var(--hairline); border-radius: .45rem; color: var(--fg-2); background: transparent; }
.stepper > span { width: 1.15rem; color: var(--fg); text-align: center; font-size: .75rem; font-weight: 700; }
.platform-pixel-row { display: grid; gap: .4rem; margin: .75rem 0; color: var(--fg-3); font-size: .7rem; }
.platform-pixel-row small { color: var(--fg-faint); }
.platform-pixel-list { display: flex; flex-wrap: wrap; gap: .35rem; }
.platform-pixel-list button { padding: .35rem .5rem; border: 1px solid var(--hairline); border-radius: 999px; color: var(--fg-2); background: var(--surface); font-size: .65rem; }
.platform-pixel-list button.active { border-color: #f07d7d; color: #d85d63; background: #f472b614; }
.ratio-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .4rem; }
.ratio-btn { display: flex; min-height: 2.35rem; align-items: center; justify-content: center; gap: .35rem; padding: .3rem .35rem; border: 1px solid var(--hairline); border-radius: .5rem; color: var(--fg-2); background: var(--surface-2); font-size: .68rem; font-weight: 700; }
.ratio-btn.active { color: #fff; border-color: #7c3aed; background: #7c3aed; }
.ratio-shape { display: block; width: .85rem; height: .7rem; border: 1.5px solid currentColor; border-radius: 2px; }
.aspect-square { width: .7rem; height: .7rem; }
.aspect-portrait, .aspect-card, .aspect-tall, .aspect-story { width: .55rem; height: .8rem; }
.aspect-landscape, .aspect-wide-s, .aspect-wide, .aspect-cinema { width: .95rem; height: .55rem; }
.suite-collapsible summary { display: flex; align-items: flex-start; justify-content: space-between; gap: .75rem; list-style: none; cursor: pointer; }
.suite-collapsible summary::-webkit-details-marker { display: none; }
.suite-collapsible summary span { color: var(--fg-2); font-size: .72rem; font-weight: 700; }
.suite-collapsible summary small { color: var(--fg-faint); font-size: .64rem; }
.suite-collapse-icon { color: var(--fg-faint); }
.suite-collapsible[open] .suite-collapse-icon { transform: rotate(180deg); }
.suite-collapsible-body { padding-top: .7rem; }
.suite-generate-bar { display: flex; align-items: center; justify-content: space-between; gap: .75rem; flex: none; padding: .75rem 1rem; border-top: 1px solid var(--hairline); background: var(--surface); }
.suite-generate-bar strong { display: block; font-size: .82rem; }
.suite-generate-bar small { color: var(--fg-3); font-size: .64rem; }
.suite-result-column { display: flex; flex-direction: column; max-height: calc(100dvh - 10rem); overflow: hidden; }
.suite-result-panel { display: flex; flex-direction: column; min-width: 0; min-height: 100%; overflow: hidden; border: 1px solid var(--hairline); border-radius: 1rem; background: #fff; box-shadow: 0 1px 2px #0f172a08; }
.suite-result-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 20px 22px 14px; border-bottom: 1px solid var(--hairline); }
.suite-result-header h2 { margin: 0; font-size: 17px; }
.suite-result-header p { margin: 4px 0 0; color: var(--fg-2); font-size: 12px; }
.suite-refresh-button { display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: #7c3aed; font-size: 12px; }
.suite-result-tabs { display: flex; gap: .35rem; padding: .65rem 1rem 0; }
.suite-result-tabs button { display: inline-flex; align-items: center; gap: .35rem; min-height: 2rem; padding: .35rem .7rem; border: 0; border-radius: 999px; color: var(--fg-3); background: var(--surface-2); font-size: .72rem; }
.suite-result-tabs button.on { color: #7c3aed; background: linear-gradient(135deg, #a78bfa38, #ec48992e); }
.suite-result-tabs b { color: #7c3aed; }
.suite-result-content { flex: 1; min-height: 0; padding: 1rem; overflow: auto; }
.suite-result-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; min-height: 260px; color: var(--fg-2); text-align: center; font-size: 12px; }
.suite-empty-illustration { display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 50%; background: #7c3aed14; color: #7c3aed; }
.suite-result-empty strong { color: var(--fg); font-size: 13px; }
.suite-task-list { display: flex; flex-direction: column; gap: 12px; }
.suite-task-card { overflow: hidden; border: 1px solid var(--hairline); border-radius: 8px; background: #fff; }
.suite-task-card.is-selected { border-color: #7c3aed; box-shadow: 0 0 0 2px #7c3aed1f; }
.suite-task-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 14px; cursor: pointer; }
.suite-task-title-line { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
.suite-task-title-line strong { font-size: 13px; }
.suite-task-status { display: inline-flex; align-items: center; min-height: 20px; padding: 0 7px; border-radius: 10px; font-size: 11px; }
.suite-task-status.is-completed { background: #ecfdf5; color: #047857; }
.suite-task-meta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 5px; color: var(--fg-2); font-size: 11px; }
.suite-task-action { min-height: 28px; padding: 0 8px; border: 1px solid #d1d5db; border-radius: 5px; color: #374151; text-decoration: none; font-size: 12px; display: inline-flex; align-items: center; }
.suite-task-body { padding: 0 14px 14px; border-top: 1px solid #f0f1f3; }
.suite-output-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 10px; padding-top: 12px; }
.suite-output-grid figure { position: relative; overflow: hidden; border: 1px solid var(--hairline); border-radius: .65rem; background: #fff; margin: 0; }
.suite-output-grid img { width: 100%; aspect-ratio: 1; object-fit: cover; }
.suite-output-badge { position: absolute; top: .55rem; left: .55rem; z-index: 4; padding: .15rem .4rem; border-radius: .35rem; color: #fff; background: #0f172a9e; font-size: .62rem; }
.suite-output-grid figcaption { display: grid; gap: .2rem; padding: .55rem .65rem; }
.suite-output-caption-title { overflow: hidden; font-size: .72rem; font-weight: 600; text-overflow: ellipsis; white-space: nowrap; }
.suite-output-caption-meta { color: var(--fg-3); font-size: .62rem; }
.suite-output-grid a { color: #7c3aed; font-size: .68rem; text-decoration: none; }
.suite-example-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
.suite-example-item { overflow: hidden; border: 1px solid var(--hairline); border-radius: 6px; background: #fff; }
.suite-example-item img { width: 100%; aspect-ratio: 1; object-fit: cover; }
.suite-example-item > span { display: block; padding: 8px 9px; color: var(--fg-2); font-size: 11px; }
.suite-modal-backdrop { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 1rem; background: #0f172a52; }
.suite-tutorial-modal { position: relative; width: min(100%, 30rem); padding: 1.4rem; border: 1px solid var(--hairline); border-radius: 1rem; color: var(--fg-2); background: var(--surface); box-shadow: 0 24px 70px #0f172a33; }
.suite-tutorial-modal h2 { margin: .35rem 0 .7rem; color: var(--fg); font-size: 1.2rem; }
.suite-tutorial-modal ol { display: grid; gap: .55rem; margin: 0; padding-left: 1.2rem; font-size: .78rem; line-height: 1.55; }
.suite-tutorial-modal p { margin: .9rem 0 0; color: var(--fg-3); font-size: .72rem; }
.suite-modal-close { position: absolute; top: .6rem; right: .7rem; width: 1.8rem; height: 1.8rem; border: 0; border-radius: 50%; color: var(--fg-3); background: var(--surface-2); font-size: 1.2rem; }
.suite-feedback { margin: .5rem 0 0; padding: .5rem .65rem; border-radius: 999px; color: var(--fg-3); background: var(--surface-2); font-size: .66rem; text-align: right; }
.suite-feedback span { color: #7c3aed; font-weight: 700; }
.hidden { display: none; }
@media (max-width: 980px) {
  .suite-workbench { grid-template-columns: 1fr; }
  .suite-input-column, .suite-result-column { height: auto; max-height: none; }
}
</style>
