import { defineConfig, type Plugin } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const fromProjectRoot = (relativePath: string) =>
  new URL(relativePath, import.meta.url).pathname

function figmaAssetResolver(): Plugin {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return fromProjectRoot(`src/assets/${filename}`)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': fromProjectRoot('./src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
