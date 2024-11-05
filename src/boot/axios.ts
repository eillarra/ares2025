import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';

import { EVAN_API_ENDPOINT, EVAN_EVENT_CODE } from 'src/constants';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: EVAN_API_ENDPOINT });
const eventApi = axios.create({ baseURL: `${EVAN_API_ENDPOINT}events/${EVAN_EVENT_CODE}/` });

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { axios, api, eventApi };
