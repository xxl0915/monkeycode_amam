import { createReadStream, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

function disableViteWebsocket() {
  const stub = `const hmrClient = {
  dataMap: new Map(),
  hotModulesMap: new Map(),
  ctxToListenersMap: new Map(),
  customListenersMap: new Map(),
  disposeMap: new Map(),
  pruneMap: new Map(),
  currentFirstInvalidatedBy: undefined,
  logger: { debug() {}, error() {} },
  notifyListeners() {},
  send() {}
};
export function createHotContext() {
  return {
    data: {},
    accept() {},
    dispose() {},
    prune() {},
    invalidate() {},
    on() {},
    off() {},
    send() {}
  };
}
const injected = new Map();
export function injectQuery(url) { return url; }
export function removeBase() { return ''; }
export function updateStyle(id, css) {
  if (typeof document === 'undefined') return;
  let el = injected.get(id);
  if (!el) {
    el = document.createElement('style');
    el.setAttribute('data-vite-dev-id', id);
    document.head.appendChild(el);
    injected.set(id, el);
  }
  el.textContent = css;
}
export function removeStyle(id) {
  const el = injected.get(id);
  if (!el) return;
  el.remove();
  injected.delete(id);
}
if (typeof window !== 'undefined') window.__vite_is_modern_browser = true;
`
  return {
    name: 'disable-vite-websocket',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0]
        if (path !== '/@vite/client') return next()
        res.setHeader('Content-Type', 'text/javascript')
        res.end(stub)
      })
    }
  }
}

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
  plugins: [disableViteWebsocket(), vue(), infiniteCanvasAssets()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    hmr: false,
    ws: false,
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
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  }
})
