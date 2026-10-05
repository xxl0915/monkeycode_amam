import { persistAsset } from './client'

export function revokePreview(url) {
  if (typeof url === 'string' && url.startsWith('blob:')) URL.revokeObjectURL(url)
}

export function claimLocalItem(item, userId) {
  const url = String(item?.url || '')
  if (!url.startsWith('/api/v1/assets/')) return
  if (userId && item.ownerId === userId) return
  item.url = ''
  item.assetId = ''
  item.ownerId = ''
}

export async function persistLocalItem(item, role, userId) {
  if (item.uploadPromise) {
    try {
      await item.uploadPromise
    } catch {
      /* retry after the in-flight attempt settles */
    }
  }
  claimLocalItem(item, userId)
  if (item.url || !item.file) return item
  item.uploading = true
  item.error = ''
  item.uploadPromise = (async () => {
    try {
      const asset = await persistAsset(item.file, role || item.role || 'product')
      revokePreview(item.preview)
      item.url = asset.url
      item.assetId = asset.assetId
      item.ownerId = userId || ''
      item.preview = asset.url
      return item
    } catch (e) {
      item.error = e?.message || '上传失败'
      throw e
    } finally {
      item.uploading = false
      item.uploadPromise = null
    }
  })()
  return item.uploadPromise
}

export function localImageItem(file, extra = {}) {
  return {
    name: file.name,
    file,
    preview: URL.createObjectURL(file),
    url: '',
    ownerId: '',
    uploading: false,
    error: '',
    ...extra
  }
}
