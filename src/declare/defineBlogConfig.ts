import _ from 'lodash'

// 外链配置
interface BasicLinkConfig {
  sitename?: string
  link?: string
  /** 图标名,对应 components/icons/Icon.astro 的 name */
  icon?: string
}

// 个人信息配置
interface BasicPersonalConfig {
  /** 你的名字，用于资料卡名字展示 */
  name: string
  /** 你的简介 */
  introduction?: string
  /** 头像路径，从public目录开始查找，如：`/avatar/avatar2.jpg` */
  avatar?: string
  /** 你的网站外链，如 GitHub，会展示在资料卡 */
  link: BasicLinkConfig[]
}

// 底色配置
interface BasicThemeColorConfig {
  /** 背景默认颜色，默认：`#f5f5f7`，夜间默认：`#121212` */
  backgroundDefault: string
  /** 卡片等组件表面的背景颜色，默认：`#fff`，夜间默认：`#1d1d1f` */
  cardDefault: string
  /** 卡片等组件的边框颜色，默认：`rgba(0, 0, 0, 0.08)`，夜间默认：`rgba(255, 255, 255, 0.08)` */
  borderDefault: string
  /** 选择框激活 / 鼠标悬浮时的背景颜色，默认：`#ddd`，夜间默认：`#444` */
  backgroundActiveDefault: string
  /** 文字默认颜色，默认：`#000`，夜间默认：`#fff` */
  textDefault: string
  /** 文字按钮激活 / 鼠标悬浮时默认颜色，默认：`#3F5EFB`，夜间默认：`#919edf` */
  tipsDefault: string
  /** 主色(强调色)，用于标题竖条、hover 高亮等，默认取 tipsDefault，可单独配置 */
  primary?: string
}

type LightThemeColorConfig = BasicThemeColorConfig

type DarkThemeColorConfig = BasicThemeColorConfig

// 页面配置
export interface BasicPageConfig {
  /** Banner 配置,背景图列表 */
  banner?: {
    images?: string[]
  }
  /** footer 配置 */
  footer: {
    /** 底部 footer，默认是 `Copyright © {当前年份}`，会作为 HTML 插入到页尾 */
    content: string[]
  }
}

interface BlogPageConfig extends BasicPageConfig {
  /** 博客页中每页展示的文章数量，默认10 */
  PageArticleCount?: number
}

// 页面文案配置
interface TextConfig {
  home: string
  blog: string
  archive: string
  about: string
  links: string
  enterBlog: string
  searchPlaceholder: string
  searchHint: string
  displaySettings: string
  themeColor: string
  resetThemeColor: string
  toggleTheme: string
  menu: string
  navMenu: string
  breadcrumb: string
  notFoundTitle: string
  notFoundTip: string
  backHome: string
  previousPage: string
  nextPage: string
  readingTime: string
  wordCount: string
  viewPost: string
  enterPost: string
  commentPlaceholder: string
  emptyPosts: string
  emptyTags: string
  emptyCategories: string
  toc: string
  author: string
  publishedAt: string
  license: string
  scrollDown: string
  archiveCount: string
}

// 网站配置
interface BasicWebsiteConfig {
  /** 网站默认标题，会被放入 head 标签内的 title 部分，header 处也会使用 */
  title: string
  /** 网站描述 */
  description: string
  /**
   * 网站线上链接，**请设置成 `astro.config.mjs` 下的 `site` 值**
   * @example
   * // blog.config.ts
   * export default defineConfig({
   *    site: '', // 确保此处的值与 astro.config.mjs 的值相同
   * })
   */
  site: string
  /**
   * 网站二级路径，**请设置成 `astro.config.mjs` 下的 `base` 值**
   * @example
   * // blog.config.ts
   * export default defineConfig({
   *    base: '', // 确保此处的值与 astro.config.mjs 的值相同
   * })
   * @see https://docs.astro.build/zh-cn/guides/deploy/github/#如何部署 参考设置 base 属性
   */
  base?: string
  /** 页面文案统一配置 */
  text: TextConfig
  /** 版权声明 */
  copyright?: {
    /** 自定义版权文案 */
    text?: string
    /** 许可协议名称,如 CC BY-NC-SA 4.0 */
    name?: string
    /** 许可协议链接 */
    url?: string
  }
  /** Twikoo 评论配置 */
  comment?: {
    /** 是否启用评论 */
    enable?: boolean
    /** Twikoo 环境 ID(腾讯云环境 ID 或 Vercel URL) */
    envId?: string
    /** 腾讯云区域,默认为 ap-shanghai */
    region?: string
    /** 评论语言 */
    lang?: string
  }
}

export type PageList = 'blog'

interface BlogConfig extends Record<any, any> {
  PageDefaultSettings: BasicPageConfig
  WebsiteSettings: BasicWebsiteConfig
  color: {
    light: LightThemeColorConfig
    dark: DarkThemeColorConfig
  }
  pages: Partial<Record<PageList, BlogPageConfig>>
  UserInfo: BasicPersonalConfig
}

export default function defineBlogConfig(config: Partial<BlogConfig>): BlogConfig {
  const _DEFAULT_CONFIG_: BlogConfig = {
    PageDefaultSettings: {
      banner: {
        images: ['/full/13.jpg', '/full/bgr.jpg', '/full/6.webp'],
      },
      footer: {
        content: [
          `<div>Copyright © ${(new Date()).getFullYear()}</div>`,
        ],
      },
    },
    WebsiteSettings: {
      title: `Shiina's Blog`,
      description: '',
      site: '',
      base: '',
      text: {
        home: '首页',
        blog: '博客',
        archive: '归档',
        about: '关于我',
        links: '链接',
        enterBlog: '进入博客',
        searchPlaceholder: '搜索…',
        searchHint: '输入关键词实时过滤文章',
        displaySettings: '显示设置',
        themeColor: '主题色',
        resetThemeColor: '重置主题色',
        toggleTheme: '切换明暗主题',
        menu: '菜单',
        navMenu: '导航菜单',
        breadcrumb: '面包屑',
        notFoundTitle: '404',
        notFoundTip: '抱歉,你访问的页面不存在或已被移除。',
        backHome: '回到首页',
        previousPage: '上一篇',
        nextPage: '下一篇',
        readingTime: '约 {minutes} 分钟',
        wordCount: '{words} 字',
        viewPost: '查看',
        enterPost: '进入',
        commentPlaceholder: '评论区(后续开发)',
        emptyPosts: '无匹配文章',
        emptyTags: '暂无标签',
        emptyCategories: '暂无分类',
        toc: '目录',
        author: '作者',
        publishedAt: '发布于',
        license: '许可',
        scrollDown: '向下滚动',
        archiveCount: '{count} 篇',
      },
    },
    UserInfo: {
      name: 'Shiinafan',
      introduction: '有钱终成眷属，没钱亲眼目睹',
      avatar: '/source/avatar.jpg',
      link: [],
    },
    color: {
      light: {
        backgroundDefault: '#f5f5f7',
        cardDefault: '#ffffff',
        borderDefault: 'rgba(0, 0, 0, 0.08)',
        backgroundActiveDefault: '#e4e4e8',
        textDefault: '#222',
        tipsDefault: '#3F5EFB',
        primary: '#3F5EFB',
      },
      dark: {
        backgroundDefault: '#121212',
        cardDefault: '#1d1d1f',
        borderDefault: 'rgba(255, 255, 255, 0.08)',
        backgroundActiveDefault: '#2e2e32',
        textDefault: '#fff',
        tipsDefault: '#919edf',
        primary: '#919edf',
      },
    },
    pages: {
      blog: {
        PageArticleCount: 10,
        footer: { content: [''] },
      },
    },
  }

  const C = _.defaultsDeep(config, _DEFAULT_CONFIG_)

  for (const i in C.pages) {
    C.pages[i] = _.defaultsDeep(C.pages[i], C.PageDefaultSettings)
  }

  return C
}
