import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    sequence: { concurrent: false },
    pool: 'threads',
    poolOptions: { threads: { singleThread: true } }
  }
});
