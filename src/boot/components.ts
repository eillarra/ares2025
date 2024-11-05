import { boot } from 'quasar/wrappers';

import AresBtn from 'src/components/AresBtn.vue';

export default boot(({ app }) => {
  app.component('AresBtn', AresBtn);
});
