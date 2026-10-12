import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use React's automatic JSX runtime in every JSX module.
// This avoids runtime "React is not defined" errors in production bundles.
export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  esbuild: {
    jsx: 'automatic',
  },
});
