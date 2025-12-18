<template>
  <div v-if="event" class="q-my-xl q-pb-xl">
    <div class="container">
      <div class="row q-col-gutter-y-lg q-col-gutter-x-md justify-between">
        <div class="col-12 col-md-4 flex column">
          <h2 class="ares__text-title">Registration</h2>
          <q-separator />
          <template v-if="event.is_open_for_registration">
            <h6 class="ares__text-red">
              You can register for <span class="text-no-wrap">{{ event.name }}</span> using UGent's event manager, Evan,
              using the link below.<br /><br />
              <template v-if="isEarly">
                Early registration deadline:<br />
                <strong>{{ format(event.registration_early_deadline, 'PPPPpppp') }}.</strong>
              </template>
              <template v-else>
                Registration deadline:<br /><strong>{{ format(event.registration_deadline, 'PPPPpppp') }}.</strong>
              </template>
            </h6>
            <div class="q-mb-lg">
              <ares-btn
                :icon="iconRegistration"
                label="Register now via UGent"
                type="a"
                :href="event.registration_url"
                target="_blank"
                rel="noopener noreferrer"
                class="ares__bg-yellow"
                :class="{ 'full-width': $q.screen.lt.sm }"
              />
            </div>
          </template>
          <h6 v-else class="ares__text-red">
            Registrations for <span class="text-no-wrap">{{ event.name }}</span> are not open.
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
                    v-if="socialEvents.length > 0 && fee.config.included_social_events.length == socialEvents.length"
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
import { computed, onMounted } from 'vue';
import { useMeta } from 'quasar';

import { useEventStore } from '@evan/stores/event';
import { format } from '@evan/utils/dates';

import { iconRegistration } from '@/icons';

const eventStore = useEventStore();

const event = computed(() => eventStore.event);

// Load program data when component mounts
onMounted(async () => {
  if (!eventStore.programDataLoaded) {
    await eventStore.fetchProgramData();
  }
});

const isEarly = computed<boolean>(() => {
  return event.value.registration_early_deadline && new Date() < new Date(event.value.registration_early_deadline);
});
const socialEvents = computed<EvanSession[]>(() => {
  // First try event.sessions, then fall back to store sessions
  const sessions = event.value?.sessions || eventStore.sessions;
  if (!sessions || sessions.length === 0) {
    return [];
  }

  const socialSessions = sessions.filter((session) => session.is_social_event);

  return socialSessions;
});

useMeta(() => {
  return {
    title: 'Registration',
  };
});
</script>
