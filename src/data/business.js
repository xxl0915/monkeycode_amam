import categories from './business.json'

export const businessCategories = categories

export function getBusinessCategory(key) {
  return businessCategories.find((item) => item.key === String(key || '')) || null
}

export function getBusinessScenes(key) {
  const category = getBusinessCategory(key)
  return category ? category.groups.flatMap((group) => group.scenes) : []
}

export function findBusinessScene(key, slug) {
  return getBusinessScenes(key).find((scene) => scene.slug === String(slug || '')) || null
}

export function filterBusinessScenes(key, query = '') {
  const scenes = getBusinessScenes(key)
  const needle = String(query).trim().toLowerCase()
  if (!needle) return scenes
  return scenes.filter((scene) => `${scene.title} ${scene.description} ${scene.slug}`.toLowerCase().includes(needle))
}

export function sceneRoute(category, scene) {
  if (scene?.targetRoute) return scene.targetRoute
  return `${category?.path || ''}/${scene?.slug || ''}`
}
