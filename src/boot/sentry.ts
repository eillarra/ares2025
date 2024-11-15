import { boot } from 'quasar/wrappers';
import * as Sentry from '@sentry/vue';

// See https://sentry.io/eo06/ares2025/getting-started/javascript-vue/

export default boot(({ app }) => {
  if (process.env.PROD) {
    Sentry.setTag('app.mode', process.env.MODE);
    Sentry.init({
      app,
      dsn: 'https://1aeafb85f31961a45c85f7e9b69e5463@o4507214700019712.ingest.de.sentry.io/4508244598718544',
      release: process.env.GIT_COMMIT_HASH,
      environment: 'production',
      integrations: [],
      ignoreErrors: ['ResizeObserver loop'],
      // VueOptions: suppress reporting of all props data
      attachProps: false,
    });
  }
});
