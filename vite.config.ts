import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'
import { handleAiGenerate, handleAiAdapt } from './src/server/geminiApiHandler'

// Vite plugin to provide local dev API routes for Gemini calls
function localDevApiPlugin() {
  return {
    name: 'local-dev-api-plugin',
    configureServer(server: any) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = req.url?.split('?')[0]
        if (req.method === 'POST' && url === '/api/ai/generate') {
          await handleAiGenerate(req, res)
          return
        }
        if (req.method === 'POST' && url === '/api/ai/adapt') {
          await handleAiAdapt(req, res)
          return
        }
        next()
      })
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }

  return {
    plugins: [react(), localDevApiPlugin()],
    server: {
      port: 3000,
      host: true
    }
  };
})
