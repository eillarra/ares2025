import { boot } from 'quasar/wrappers';

import AresBtn from 'components/AresBtn.vue';
import MarkedDiv from 'src/evan/components/MarkedDiv.vue';

export default boot(({ app }) => {
  app.component('AresBtn', AresBtn);
  app.component('MarkedDiv', MarkedDiv);
});
