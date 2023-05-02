import { defineConfig } from 'histoire'
import { HstVue } from '@histoire/plugin-vue'

export default defineConfig({
  plugins: [HstVue()],
  setupFile: '/client/src/histoire.setup.ts',
  theme: {
    title: 'SKKUding Histoire'
  }
})
