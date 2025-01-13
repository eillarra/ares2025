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
        path: '/call-for-papers/',
        name: 'callForPapers',
        strict: true,
        component: () => import('pages/conference/CallForPapersPage.vue'),
      },
      {
        path: '/call-for-workshops/',
        name: 'callForWorkshops',
        strict: true,
        component: () => import('pages/conference/CallForWorkshopsPage.vue'),
      },
      {
        path: '/call-for-eu-workshops/',
        name: 'callForEUWorkshops',
        strict: true,
        component: () => import('pages/conference/CallForEUWorkshopsPage.vue'),
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
        path: '/conference/program-committee/',
        name: 'programCommittee',
        strict: true,
        component: () => import('pages/conference/ProgramCommitteePage.vue'),
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
