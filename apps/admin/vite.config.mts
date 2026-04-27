import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function normalizeId(id: string) {
  return id.replace(/\\/g, '/');
}

function getAdminPageChunkName(id: string) {
  const normalizedId = normalizeId(id);
  const pagePath = normalizedId.split('/src/pages/')[1];

  if (!pagePath) {
    return undefined;
  }

  if (pagePath.startsWith('login/')) {
    return 'page-login';
  }

  if (pagePath.startsWith('dashboard/')) {
    return 'page-dashboard';
  }

  if (pagePath.startsWith('events/')) {
    return 'page-events';
  }

  if (pagePath.startsWith('orders/')) {
    return 'page-orders';
  }

  if (pagePath.startsWith('refunds/')) {
    return 'page-refunds';
  }

  if (pagePath.startsWith('users/')) {
    return 'page-users';
  }

  return undefined;
}

function getSharedAppChunkName(id: string) {
  const normalizedId = normalizeId(id);

  if (
    normalizedId.includes('/src/app/admin-auth-context.tsx') ||
    normalizedId.includes('/src/services/admin-auth.ts') ||
    normalizedId.includes('/src/services/request.ts')
  ) {
    return 'app-auth';
  }

  return undefined;
}

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const sharedAppChunkName = getSharedAppChunkName(id);

          if (sharedAppChunkName) {
            return sharedAppChunkName;
          }

          const pageChunkName = getAdminPageChunkName(id);

          if (pageChunkName) {
            return pageChunkName;
          }

          if (
            /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler|use-sync-external-store|@remix-run)[\\/]/.test(
              id,
            )
          ) {
            return 'vendor-react-router';
          }

          if (
            /[\\/]node_modules[\\/](antd|@ant-design|rc-[^\\/]+|@rc-component|dayjs|lodash-es|@ctrl\/tinycolor|@floating-ui|dom-align|classnames|throttle-debounce|resize-observer-polyfill|scroll-into-view-if-needed|@babel\/runtime)[\\/]/.test(
              id,
            )
          ) {
            return 'vendor-antd';
          }

          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://120.55.70.226:3000',
      },
    },
  },
});
