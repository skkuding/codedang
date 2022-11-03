/// <reference types="vite/client" />
/// <reference types="histoire/vue" />
/// <reference types="unplugin-icons/types/vue" />
/// <reference types="vite-plugin-pages/client" />
/// <reference types="vite-plugin-vue-layouts/client" />

// workaround for route metadata in layout
// https://router.vuejs.org/guide/advanced/meta.html#typescript
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    group?: string
    home?: boolean
    title?: string
    subtitle?: string
  }
}
