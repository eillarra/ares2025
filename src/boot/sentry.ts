import { boot } from 'quasar/wrappers';
import * as Sentry from '@sentry/vue';

export default boot(({ app, router }) => {
  if (process.env.PROD) {
    Sentry.setTag('app.mode', process.env.MODE);
    Sentry.init({
      app,
      dsn: 'https://1aeafb85f31961a45c85f7e9b69e5463@o4507214700019712.ingest.de.sentry.io/4508244598718544',
      integrations: [Sentry.browserTracingIntegration({ router }), Sentry.replayIntegration()],
      release: process.env.GIT_COMMIT_HASH,
      environment: 'production',
      // Performance monitoring
      tracesSampleRate: 0.05,
      // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
      tracePropagationTargets: [process.env.APP_DOMAIN || 'www.ares-conference.eu', /^\//],
      // Ignore some errors: https://docs.sentry.io/platforms/javascript/configuration/filtering/
      // - ResizeObserver loop errors
      ignoreErrors: ['ResizeObserver loop'],
    });
  }
});
