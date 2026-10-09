import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

/**
 * Health-endpoint plugin — serves `GET /api/health` so the hub can paint a
 * live status dot on the Relic Shields landing page. No external deps;
 * available in dev (configureServer) and preview (configurePreviewServer).
 */
const healthPlugin: Plugin = {
  name: 'soc-sys:health',
  configureServer(server) {
    server.middlewares.use('/api/health', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(JSON.stringify({status: 'ok', app: 'soc-sys'}));
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use('/api/health', (_req, res) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.end(JSON.stringify({status: 'ok', app: 'soc-sys'}));
    });
  },
};

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    // Sub-page routing under the unified Netlify build (see ../HUB_ARCHITECTURE.md).
    base: '/soc-sys/',
    plugins: [react(), tailwindcss(), healthPlugin],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Port allocation is owned by the sub-project's vite.config.ts so that
      // `npm run dev` works standalone (no collision with the hub on 3000).
      // start-all-dev.ps1 still passes --strictPort as a defensive belt.
      port: 3003,
      strictPort: true,
      host: '0.0.0.0',
    },
  };
});
