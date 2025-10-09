import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'

// https://astro.build/config
export default defineConfig({
  site: 'https://kixlt.github.io',
  base: '/astro',
  integrations: [mdx(), sitemap(), UnoCSS({ injectReset: true }), vue()],
})
