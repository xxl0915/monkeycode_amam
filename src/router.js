import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from './layouts/PublicLayout.vue'
import HomeView from './views/HomeView.vue'
import CatalogView from './views/CatalogView.vue'
import WorkbenchView from './views/WorkbenchView.vue'
import ProductSuiteView from './views/ProductSuiteView.vue'
import ProductSceneView from './views/ProductSceneView.vue'
import PlaygroundView from './views/PlaygroundView.vue'
import ModelPlazaView from './views/ModelPlazaView.vue'
import ToolsView from './views/ToolsView.vue'
import PhotoEditView from './views/PhotoEditView.vue'
import DocsView from './views/DocsView.vue'
import AboutView from './views/AboutView.vue'
import SimplePage from './views/SimplePage.vue'
import BusinessCatalogView from './views/BusinessCatalogView.vue'
import BusinessScenePlanView from './views/BusinessScenePlanView.vue'
import InfiniteCanvasView from './views/InfiniteCanvasView.vue'
import {
  productCatalog, podCatalog, deriveCatalog, moreCategories, localTools
} from './data/catalogs'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'user', component: PlaygroundView },
        {
          path: 'product-images',
          component: CatalogView,
          props: { title: '商品图中心', cta: { to: '/product-images/suite', label: '打开商品套图' }, catalog: productCatalog, base: '/product-images' }
        },
        { path: 'product-images/suite', component: ProductSuiteView },
        { path: 'product-images/:scene', component: ProductSceneView, props: (r) => ({ kind: 'product', scene: r.params.scene }) },
        { path: 'model-plaza', component: ModelPlazaView },
        { path: 'exclusive-models', component: ModelPlazaView, props: { exclusive: true } },
        { path: 'model-images/:scene', component: ProductSceneView, props: (r) => ({ kind: 'model', scene: r.params.scene }) },
        { path: 'ai-video', component: BusinessCatalogView, meta: { businessCategory: 'video' } },
        { path: 'ai-video/entity-leads', component: WorkbenchView, props: { kind: 'video', scene: 'entity-leads' } },
        { path: 'ai-video/:scene', component: BusinessScenePlanView, meta: { businessCategory: 'video' } },
        { path: 'tools', component: ToolsView },
        { path: 'tools/photo-edit', redirect: '/photo-edit' },
        { path: 'tools/ai', component: BusinessCatalogView, meta: { businessCategory: 'toolbox' } },
        { path: 'tools/ai/layer-split', component: WorkbenchView, props: { kind: 'tool', scene: 'layer-split' } },
        { path: 'tools/ai/watermark-pro', component: WorkbenchView, props: { kind: 'tool', scene: 'watermark-pro' } },
        { path: 'tools/ai/:scene', component: BusinessScenePlanView, meta: { businessCategory: 'toolbox' } },
        { path: 'tools/:tool', component: PhotoEditView },
        { path: 'photo-edit', component: PhotoEditView },
        { path: 'graphic-design', component: BusinessCatalogView, meta: { businessCategory: 'graphic-design' } },
        { path: 'graphic-design/print-size', component: WorkbenchView, props: { kind: 'graphic', scene: 'print-size' } },
        { path: 'graphic-design/:scene', component: BusinessScenePlanView, meta: { businessCategory: 'graphic-design' } },
        {
          path: 'pod-images',
          component: CatalogView,
          props: { title: '图片POD', kicker: '从图案提取到商品呈现', catalog: podCatalog, base: '/pod-images' }
        },
        { path: 'pod-images/:scene', component: WorkbenchView, props: (r) => ({ kind: 'pod', scene: r.params.scene }) },
        {
          path: 'derive-images',
          component: CatalogView,
          props: { title: '爆款衍生', kicker: '从爆款、灵感和融合关系中找到下一款', catalog: deriveCatalog, base: '/derive-images' }
        },
        { path: 'derive-images/:scene', component: WorkbenchView, props: (r) => ({ kind: 'derive', scene: r.params.scene }) },
        { path: 'marketing', component: BusinessCatalogView, meta: { businessCategory: 'marketing' } },
        { path: 'marketing/:scene', component: BusinessScenePlanView, meta: { businessCategory: 'marketing' } },
        { path: 'cross-border', component: BusinessCatalogView, meta: { businessCategory: 'cross-border' } },
        { path: 'cross-border/:scene', component: BusinessScenePlanView, meta: { businessCategory: 'cross-border' } },
        { path: 'image-creation', component: BusinessCatalogView, meta: { businessCategory: 'image-creation' } },
        { path: 'image-creation/:scene', component: BusinessScenePlanView, meta: { businessCategory: 'image-creation' } },
        { path: 'learn', component: BusinessCatalogView, meta: { businessCategory: 'learn' } },
        { path: 'learn/:scene', component: BusinessScenePlanView, meta: { businessCategory: 'learn' } },
        { path: 'ecommerce-assets', component: BusinessCatalogView, meta: { businessCategory: 'material' } },
        { path: 'ecommerce-assets/:scene', component: BusinessScenePlanView, meta: { businessCategory: 'material' } },
        { path: 'templates', component: SimplePage, props: { title: '海量模板', kicker: '浏览电商创作模板', body: '按主图、详情、种草和海报分类浏览可直接带入工作台的模板。' } },
        { path: 'docs', component: DocsView },
        { path: 'about', component: AboutView },
        { path: 'logs', component: SimplePage, props: { title: '我的作品', kicker: '最近生成的图片和视频会显示在这里。', jobs: true } },
        { path: 'mylogs', component: SimplePage, props: { title: '生成日志', kicker: '查看每次生成的模型、耗时和积分消耗。', jobs: true, logs: true } },
        { path: 'invite', component: SimplePage, props: { title: '邀请返利', kicker: '邀请好友注册，其每次充值你可获得返利。' } },
        { path: 'orders', component: SimplePage, props: { title: '订单', kicker: '充值与套餐订单记录。' } },
        { path: 'settings', component: SimplePage, props: { title: '设置', kicker: '账号、通知与生成默认参数。' } }
      ]
    },
    { path: '/canvas', component: InfiniteCanvasView },
    { path: '/playground', redirect: '/user' },
    { path: '/suite', redirect: '/product-images/suite' },
    { path: '/home', redirect: '/' }
  ]
})

export default router
export { moreCategories, localTools }
