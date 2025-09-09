import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    __V0_INTEGRATION__: process.env.VITE_V0_INTEGRATION === 'true',
    __VOICEFLOW_INTEGRATION__: process.env.VITE_VOICEFLOW_INTEGRATION === 'true',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/components/v0/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ]
  },
  resolve: {
    alias: {
      '@': '/src',
      '@v0': '/src/components/v0'
    }
  }
})