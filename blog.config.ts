import defineBlogConfig from './src/declare/defineBlogConfig.ts'

const site = `https://KixLt.github.io`
const base = `/astro`

export default defineBlogConfig({
  PageDefaultSettings: {
    background: {
      type: 'fade',
      content: `linear-gradient(to left, #12c2e9, #c471ed, #f64f59)`,
    },
    footer: {
      content: [
        '<div>Powered by Astro & Vue</div>',
      ],
    },
  },
  UserInfo: {
    name: 'KixLt',
    introduction: 'pure gamer',
    avatar: '/avatar/avatar.jpg',
    link: [
      {
        sitename: 'Github',
        link: 'https://github.com/KixLt',
        class: 'iconfont icon-github',
      },
    ],
  },
  WebsiteSettings: {
    title: `KixLt's Blog`,
    description: `Coder Gamer`,
    site,
    useIndex: true,
    base,
  },
  pages: {
    index: {
      header: {
        hidden: true,
      },
      background: {
        type: 'photo',
        content: '/indexBG.jpg',
        useMaskOnDarkMode: true,
      },
      footer: {
        hidden: true,
      },
      setMinHeight: 'fill',
    },
    blog: {
      PageArticleCount: 5,
    },
  },
})
