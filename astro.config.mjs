import { satteri } from '@astrojs/markdown-satteri'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'

/**
 * hast 插件:为正文 markdown 中以 '/' 开头的 <img src> 补 base 前缀
 * (如 '/full/6.webp' → '/astro/full/6.webp')。
 * 已带 base 前缀、协议相对('//')或 http/data 链接跳过,避免重复加前缀。
 * Astro 7 已弃用 markdown.rehypePlugins,需通过 satteri({ hastPlugins }) 注册。
 */
const baseImages = {
  name: 'base-images',
  element: {
    filter: ['img'],
    visit(node, ctx) {
      const src = node.properties?.src
      if (typeof src === 'string' && src.startsWith('/') && !src.startsWith('//') && !src.startsWith('/astro/'))
        ctx.setProperty(node, 'src', `/astro${src}`)
    },
  },
}

// https://astro.build/config
export default defineConfig({
  site: 'https://kixlt.github.io',
  base: '/astro',
  devToolbar: {
    enabled: false,
  },
  integrations: [mdx(), sitemap(), UnoCSS({ injectReset: true }), vue()],
  markdown: {
    processor: satteri({
      hastPlugins: [baseImages],
    }),
  },
})
