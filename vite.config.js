import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import glsl from 'vite-plugin-glsl'

export default {
  root: 'src/',
  publicDir: '../static/',
  base: './',
  server: {
    host: true, // Open to local network and display URL
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  build: {
    outDir: '../dist', // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
  },
  plugins: [
    tailwindcss(), // Restart server on static file change
    glsl(),
  ],
  resolve: {
    alias: {
      '@blocks': path.resolve(__dirname, 'src/experience/blocks'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@experience': path.resolve(__dirname, 'src/experience/experience.js'),
      '@fire': path.resolve(__dirname, 'src/firebase'),
      '@grid': path.resolve(__dirname, 'src/experience/grid'),
      '@shaders': path.resolve(__dirname, 'src/shaders'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
}
