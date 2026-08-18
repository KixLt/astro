/** 文章元信息,序列化后传递给 Vue 岛屿组件 */
export interface PostMeta {
  slug: string
  title: string
  description: string
  /** ISO 日期字符串 */
  date: string
  /** ISO 日期字符串 */
  updatedDate?: string
  tags: string[]
  category?: string
  /** 已含 base 的完整 URL */
  cover?: string
  /** 阅读时间(分钟) */
  minutes: number
  /** 字数 */
  words: number
}

/** 文章章节标题,用于 TOC */
export interface Heading {
  depth: number
  slug: string
  text: string
}
