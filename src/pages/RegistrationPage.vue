<template>
  <div class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-xl justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Registration</h2>
          <q-separator />
          <h6 class="ares__text-red">
            Registrations will open soon. Stay tuned for more information.
            <span v-if="event && event.registration_early_deadline">
              Early registration deadline: <strong>{{ format(event.registration_early_deadline, 'PPPPpppp') }}.</strong>
            </span>
          </h6>
        </div>
        <div class="col-12 col-md-7">
          <ares-subtitle>Registration fees</ares-subtitle>
          <q-markup-table flat>
            <thead>
              <tr class="text-weight-bold">
                <th class="text-left">Fee</th>
                <th>Early bird</th>
                <th>Regular</th>
                <th>Social events</th>
              </tr>
            </thead>
            <tbody class="text-body1">
              <tr v-for="fee in event.fees" :key="fee.type">
                <td>{{ fee.notes }}</td>
                <td class="text-center">€ {{ fee.early_value }}</td>
                <td class="text-center">€ {{ fee.value }}</td>
                <td class="text-center">
                  <q-chip
                    v-if="fee.config.included_social_events.length == socialEvents.length"
                    label="All included"
                    color="positive"
                    class="text-white text-caption q-mb-xs"
                  />
                  <q-chip
                    v-else-if="fee.config.included_social_events.length > 0"
                    outline
                    label="Some included"
                    color="dark"
                    class="text-caption q-mb-xs"
                  />
                  <q-chip v-else label="Not included" class="ares__bg-yellow text-caption q-mb-xs" />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
          <p class="text-caption text-right q-my-md text">* All fees are inclusive of VAT.</p>
          <ares-subtitle class="q-mt-xl">Social events</ares-subtitle>
          <p>
            Not all registrations give you access to all social events. Check the following list to see which social
            events are included in your registration. You can always purchase additional tickets for social events (for
            you or for <strong>your guests</strong>) during the registration process.
          </p>
          <q-list separator>
            <q-item v-for="session in socialEvents" :key="session.id" class="q-py-md">
              <q-item-section>
                <q-item-label>{{ session.title }} on {{ format(session.start_at, 'PPPP') }}</q-item-label>
                <q-item-label>
                  <p class="text-body2">
                    <strong>Extra ticket price:</strong> € {{ session.extra_attendees_fee }}<br />
                    <strong>This social event is included in:</strong>
                  </p>
                  <ul class="text-body2">
                    <template v-for="fee in event.fees" :key="fee.type">
                      <li v-if="fee.config.included_social_events.includes(session.id)">{{ fee.notes }}</li>
                    </template>
                  </ul>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMeta } from 'quasar';

import { useEventStore } from 'src/evan/stores/event';
import { format } from 'src/evan/utils/dates';

const eventStore = useEventStore();

const { event } = storeToRefs(eventStore);

const socialEvents = computed<EvanSession[]>(() => {
  return event.value.sessions.filter((session) => session.is_social_event);
});

useMeta(() => {
  return {
    title: 'registration',
  };
});
</script>
