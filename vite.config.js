import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue()],
    define: {
      'import.meta.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || ''),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || ''),
      'import.meta.env.SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.SUPABASE_SERVICE_ROLE_KEY || ''),
      'import.meta.env.VITE_APP_NAME': JSON.stringify(env.VITE_APP_NAME || 'E-commerce System'),
      'import.meta.env.VITE_DEFAULT_CURRENCY': JSON.stringify(env.VITE_DEFAULT_CURRENCY || 'UGX'),
    },
    build: {
      target: 'es2015',
      minify: 'esbuild',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@supabase')) return 'supabase';
              if (id.includes('vue') || id.includes('pinia')) return 'vendor-core';
              return 'vendor';
            }
          }
        }
      },
      chunkSizeWarningLimit: 600,
    },
  }
})
