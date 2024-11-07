import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    strict: true,
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        strict: true,
        component: () => import('pages/IndexPage.vue'),
      },
      {
        path: '/code-of-conduct/',
        name: 'codeOfConduct',
        strict: true,
        component: () => import('pages/CodeOfConductPage.vue'),
      },
      {
        path: '/conference/committee/',
        redirect: {
          name: 'committees',
        },
      },
      {
        path: '/conference/committees/',
        name: 'committees',
        strict: true,
        component: () => import('pages/conference/CommitteesPage.vue'),
      },
      {
        path: '/contact/',
        name: 'contact',
        strict: true,
        component: () => import('pages/ContactPage.vue'),
      },
      {
        path: '/disclaimer/',
        name: 'disclaimer',
        strict: true,
        component: () => import('pages/DisclaimerPage.vue'),
      },
      {
        path: '/privacy-policy/',
        name: 'privacyPolicy',
        strict: true,
        component: () => import('pages/PrivacyPolicyPage.vue'),
      },
      {
        path: '/submission-guidelines/',
        name: 'submissions',
        strict: true,
        component: () => import('pages/conference/SubmissionsPage.vue'),
      },
      {
        path: '/venue-and-location/',
        name: 'venue',
        strict: true,
        component: () => import('pages/conference/VenuePage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    strict: true,
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
