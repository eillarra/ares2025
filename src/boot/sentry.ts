import { boot } from 'quasar/wrappers';
import * as Sentry from '@sentry/vue';

import { initLogger } from '@evan/utils/logger';

// See https://sentry.io/eo06/ares2025/getting-started/javascript-vue/

const PRELOAD_ERRORS = [
  /Loading chunk/i,
  /Failed to fetch dynamically imported module/i,
  /Error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /Unable to preload CSS/i,
  /'text\/html' is not a valid JavaScript MIME type/i,
];

export default boot(({ app, router }) => {
  const isProduction = !!process.env.PROD;

  if (process.env.PROD) {
    Sentry.setTag('app.mode', process.env.MODE);
    Sentry.init({
      app,
      dsn: 'https://1aeafb85f31961a45c85f7e9b69e5463@o4507214700019712.ingest.de.sentry.io/4508244598718544',
      release: process.env.GIT_COMMIT_HASH || 'dev',
      environment: 'production',
      integrations: [Sentry.browserTracingIntegration({ router })],
      enableLogs: true,
      // Ignore some errors: https://docs.sentry.io/platforms/javascript/configuration/filtering/
      // - ResizeObserver loop errors
      // - 'vite:preloadError` equivalent errors
      ignoreErrors: ['ResizeObserver loop', ...PRELOAD_ERRORS],
      // VueOptions: suppress reporting of all props data
      attachProps: false,
    });
  }

  // Initialize logger with Sentry module (or null in dev mode)
  initLogger(isProduction ? Sentry : null, isProduction);
});
