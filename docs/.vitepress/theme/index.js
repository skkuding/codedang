// .vitepress/theme/index.js
import DefaultTheme from 'vitepress/theme'

export default {
  // root component to wrap each page
  ...DefaultTheme,

  enhanceApp({ app, router, siteData }) {
    // app is the Vue 3 app instance from `createApp()`.
    // router is VitePress' custom router. `siteData` is
    // a `ref` of current site-level metadata.
  }
}
