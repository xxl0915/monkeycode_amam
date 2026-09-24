import { createReadStream, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function infiniteCanvasAssets() {
  const rewrite = (req, _res, next) => {
    const raw = req.url || ''
    const q = raw.indexOf('?')
    const path = q >= 0 ? raw.slice(0, q) : raw
    const query = q >= 0 ? raw.slice(q) : ''
    if (path === '/ic' || path === '/ic/' || (path.startsWith('/ic/') && !/\.[a-zA-Z0-9]+$/.test(path))) {
      req.url = '/ic/index.html' + query
    }
    next()
  }
  const gzip = (req, res, next) => {
    const path = (req.url || '').split('?')[0]
    if (!path.startsWith('/ic/assets/') || !(path.endsWith('.js') || path.endsWith('.css'))) return next()
    const accept = String(req.headers['accept-encoding'] || '')
    const file = join(process.cwd(), 'public', path.slice(1) + '.gz')
    if (!accept.includes('gzip') || !existsSync(file)) return next()
    res.setHeader('Content-Encoding', 'gzip')
    res.setHeader('Content-Type', path.endsWith('.css') ? 'text/css; charset=utf-8' : 'text/javascript; charset=utf-8')
    res.setHeader('Content-Length', String(statSync(file).size))
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('Vary', 'Accept-Encoding')
    createReadStream(file).pipe(res)
  }
  return {
    name: 'infinite-canvas-assets',
    configureServer(server) {
      server.middlewares.use(gzip)
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(gzip)
      server.middlewares.use(rewrite)
    }
  }
}

export default defineConfig({
  plugins: [vue(), infiniteCanvasAssets()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.monkeycode-ai.online'],
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.monkeycode-ai.online']
  }
})
