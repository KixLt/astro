import type { CollectionEntry } from 'astro:content'
import cfg from 'blog.config'

/** 正文首图提取:Markdown 图片或 <img> 标签 */
const MARKDOWN_IMAGE = /!\[[^\]]*\]\(([^)]+)\)/
const HTML_IMAGE = /<img[^>]*src="([^"]+)"/

/**
 * 计算文章封面:
 * 1. 优先取 frontmatter 的 cover;
 * 2. 否则正则提取正文第一张图;
 *    'http'、'data:' 开头原样使用;相对路径解析为 base + '/blog/' + slug + '/' + 路径。
 */
export function getCoverImage(entry: CollectionEntry<'blog'>): string | undefined {
  const { cover } = entry.data
  let src = cover
  if (!src) {
    const body = entry.body ?? ''
    const markdownMatch = body.match(MARKDOWN_IMAGE)
    const htmlMatch = body.match(HTML_IMAGE)
    src = markdownMatch?.[1] ?? htmlMatch?.[1]
  }
  if (!src)
    return undefined

  if (src.startsWith('/') && !src.startsWith('//'))
    return `${cfg.WebsiteSettings.base}${src}`
  if (src.startsWith('http') || src.startsWith('data:'))
    return src

  return `${cfg.WebsiteSettings.base}/blog/${entry.id}/${src}`
}
