/* eslint-disable */

declare module '@vue/runtime-core' {
  // TODO: remove this eventually, when it just works again
  interface ComponentCustomProperties {
    $q: any;
    $route: any;
  }
}
