import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Splits every route's component into its own chunk, so the login screen
    // no longer downloads the whole admin app before it can render.
    TanStackRouterVite({ autoCodeSplitting: true }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Only React and the router are pinned to their own chunks: both are
        // needed to render anything, and they change rarely, so they stay
        // cached across deploys. Heavier libraries (recharts, TipTap) are
        // deliberately NOT listed here — route splitting already isolates them
        // into the chunks that use them, and naming them here would drag their
        // shared dependencies (e.g. clsx) into the entry graph.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],
          'vendor-router': ['@tanstack/react-router'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
