import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // send /api calls to the Go backend while developing (avoids CORS issues)
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  // vitest config
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      // entry point and type files have no logic to test
      exclude: ['src/main.tsx', 'src/**/*.d.ts', 'src/setupTests.ts', 'src/**/*.test.{ts,tsx}'],
    },
  },
});
