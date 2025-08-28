import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    reporter: 'basic',
    coverage: {
      enabled: false
    },
    logHeapUsage: false,
    outputFile: undefined
  },
});
