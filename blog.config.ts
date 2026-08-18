import defineBlogConfig from './src/declare/defineBlogConfig.ts'

const site = `https://kixlt.github.io`
const base = `/astro`

export default defineBlogConfig({
  PageDefaultSettings: {
    footer: {
      content: [
        '<div>Fight Forver Guardian</div>',
      ],
    },
  },
  UserInfo: {
    name: 'KixLt',
    introduction: 'just a gamer',
    avatar: '/img/avatar.jpg',
    link: [
      {
        sitename: 'Github',
        link: 'https://github.com/KixLt',
        icon: 'github',
      },
    ],
  },
  WebsiteSettings: {
    title: `KixLt`,
    description: `Coder Gamer`,
    site,
    base,
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
      previousPage: '<',
      nextPage: '>',
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
    copyright: {
      text: '本文由 KixLt 创作,转载须注明出处与原文链接。',
      name: 'CC BY-NC-SA 4.0',
      url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    },
    comment: {
      enable: true,
      envId: '', // TODO: Twikoo 环境 ID / Vercel URL
      region: 'ap-shanghai',
      lang: 'zh-CN',
    },
  },
  pages: {
    blog: {
      PageArticleCount: 10,
    },
  },
})
