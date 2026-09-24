import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  deriveScenes,
  graphicGroups,
  marketingScenes,
  modelScenes,
  podScenes,
  productScenes,
  toolGroups,
  videoGroups
} from '../src/data/catalogs.js'

const here = dirname(fileURLToPath(import.meta.url))

export const sceneSchemas = JSON.parse(
  readFileSync(join(here, '..', 'src', 'data', 'sceneSchemas.json'), 'utf8')
)

const catalogScenes = [
  ...productScenes,
  ...modelScenes,
  ...podScenes,
  ...deriveScenes,
  ...marketingScenes,
  ...graphicGroups.flatMap((group) => group.scenes || []),
  ...videoGroups.flatMap((group) => group.scenes || []),
  ...toolGroups.flatMap((group) => group.scenes || [])
]

export const samplePool = [
  '/product-scenes/samples/suite.webp',
  '/product-scenes/samples/hero-image.webp',
  '/product-scenes/samples/detail-page.webp',
  '/product-scenes/samples/main-collage.webp',
  '/product-scenes/samples/seeding.webp',
  '/product-scenes/samples/product-composite.webp',
  '/product-scenes/samples/change-bg.webp',
  '/product-scenes/samples/multi-view.webp',
  '/product-scenes/samples/garment-multi.webp',
  '/product-scenes/samples/product-consistency.webp',
  '/product-scenes/samples/close-up.webp',
  '/product-scenes/samples/material-apply.webp'
]

export const models = [
  { id: 'seedream-4.0', name: 'Seedream 4.0', video: false },
  { id: 'gpt-image-1', name: 'GPT Image 1', video: false },
  { id: 'flux-kontext', name: 'FLUX Kontext', video: false },
  { id: 'nano-banana', name: 'Nano Banana', video: false },
  { id: 'seedance-1.0', name: 'Seedance 1.0', video: true }
]

export function getScene(idOrTitle) {
  const schema = sceneSchemas.find((scene) => scene.slug === idOrTitle || scene.title === idOrTitle)
  if (schema) return schema
  return catalogScenes.find((scene) => scene.slug === idOrTitle || scene.title === idOrTitle) || null
}
