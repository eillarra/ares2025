import { boot } from 'quasar/wrappers';

import AresBtn from 'components/AresBtn.vue';
import AresSubtitle from '@/components/AresSubtitle.vue';
import MarkedDiv from '@evan/components/MarkedDiv.vue';

export default boot(({ app }) => {
  app.component('AresBtn', AresBtn);
  app.component('AresSubtitle', AresSubtitle);
  app.component('MarkedDiv', MarkedDiv);
});
