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
        path: '/contact/',
        name: 'contact',
        strict: true,
        component: () => import('pages/ContactPage.vue'),
      },
      {
        path: '/imprint/',
        name: 'imprint',
        strict: true,
        component: () => import('pages/ImprintPage.vue'),
      },
      {
        path: '/privacy-policy/',
        name: 'privacyPolicy',
        strict: true,
        component: () => import('pages/PrivacyPolicyPage.vue'),
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
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
