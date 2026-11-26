import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

/**
 * Proxy de imagens: os servidores de capas (Discogs, Cover Art Archive) não liberam
 * CORS para o navegador. Passando pelo servidor local, a capa chega como "mesma origem"
 * e pode ser salva e usada no 3D.
 */
const UA = 'vynl/1.0 (colecao pessoal de vinis)'
const imageProxy = {
  '/img/discogs': {
    target: 'https://i.discogs.com',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/img\/discogs/, ''),
    headers: { 'User-Agent': UA, Referer: 'https://www.discogs.com/' },
  },
  '/img/caa': {
    target: 'https://coverartarchive.org',
    changeOrigin: true,
    followRedirects: true,
    rewrite: (p: string) => p.replace(/^\/img\/caa/, ''),
    headers: { 'User-Agent': UA },
  },
  '/api/mb': {
    target: 'https://musicbrainz.org',
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/api\/mb/, ''),
    headers: { 'User-Agent': UA },
  },
}

export default defineConfig({
  base: './',
  // Escuta em 127.0.0.1 para o retorno do login do Spotify funcionar
  server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy: imageProxy },
  preview: { host: '127.0.0.1', port: 5173, proxy: imageProxy },
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('@react-three')) return 'r3f'
        },
      },
    },
  },
})
