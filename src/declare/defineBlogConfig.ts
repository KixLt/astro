import _ from 'lodash'

// const astroCfg = {}
// 外链配置
interface BasicLinkConfig {
  sitename?: string,
  link?: string,  
  class: string
}

// 个人信息配置
interface BasicPersonalConfig {
  /** 你的名字，用于资料卡名字展示 */
  name: string
  /** 你的简介 */
  introduction?: string,
  /** 头像路径，从public目录开始查找，如：`/avatar/avatar2.jpg` */
  avatar?: string,
  /** 你的网站外链，如 GitHub，会展示在资料卡 */
  link: BasicLinkConfig[]
}

// header 通用配置
interface BasicHeaderConfig {
  /** 当前网站标题，会用于 head 部分设置网站标题与大标题 */
  title?: string
  /** 隐藏 header，默认 `false` */
  hidden?: boolean
  /** 保持背景颜色，即取消透明模式，默认 `true` */
  keepBackgroundColor?: boolean
  /** 保持 header 展开，默认 `true` */
  keepOpen?: boolean
}

// 单个页面的 header 配置
type PageHeaderConfig = BasicHeaderConfig

export interface BasicBackgroundConfig {
  /** 
   * 背景类型，`photo` 为图片；`fade` 为渐变色，但只要是 `background-image` 可接受的参数即可；`purity` 为纯色
   */
  type: 'photo' | 'fade' | 'purity'
  /**
   * 填入内容，根据 `type` 选项决定
   * - `photo`，则填入图片路径，**将图片放在 public 文件夹下，并将 public 作为根路径来查找图片**
   * - `fade` 则填入 `background-image` 可接受参数，比如 `linear-gradient()`
   * - `purify` 则填入颜色代码，如 `#eee`
   */
  content: string
  /**
   * @deprecated 将会在新版本中启用
   */
  jsPlugin: boolean
  /** 为背景提供一个毛玻璃效果，默认 `false`，详见：[MDN filter](https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter) */
  filter: boolean
  /** 
   * 为背景提供一个暗色效果，默认 `false`，详见：[MDN background-color](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-color)
   * 
   * 颜色不透明度 0.3
   */
  mask: boolean
  /**
   * 暗色模式下启用背景面罩，用于降低背景亮度，默认 `false`
   */
  useMaskOnDarkMode: boolean
}

// footer 配置
interface BasicFooterConfig {
  /** 隐藏 footer，默认 `false` */
  hidden?: boolean
  /** 底部 footer，默认是 `Copyright © {当前年份}`，会作为 HTML 插入到页尾 */
  content?: string[]
}

type PageFooterConfig = BasicFooterConfig

// 底色配置
interface BasicThemeColorConfig {
  /** 背景默认颜色，默认：`#f2f5f8`，夜间默认：`#222` */
  backgroundDefault: string
  /** 选择框激活 / 鼠标悬浮时的背景颜色，默认：`#ddd`，夜间默认：`#444` */
  backgroundActiveDefault: string
  /** 文字默认颜色，默认：`#000`，夜间默认：`#fff` */
  textDefault: string
  /** 文字按钮激活 / 鼠标悬浮时默认颜色，默认：`#3F5EFB`，夜间默认：`#919edf` */
  tipsDefault: string
}

type LightThemeColorConfig = BasicThemeColorConfig

type DarkThemeColorConfig = BasicThemeColorConfig

// 页面配置
export interface BasicPageConfig {
  header?: PageHeaderConfig
  background?: Partial<BasicBackgroundConfig>
  footer?: PageFooterConfig
  /** 
   * 给予页面中心部分最小高度，默认为 `content`
   * 
   * - 'content' 会将内容控制在 `header` 与 `footer` 之间
   * - 'fill' 将会以百分百宽高填充整个可见区域，并隐藏屏幕滚动条
   * - 'unset' 将不对高度做任何处理，保留滚动条
   */
  setMinHeight?: 'content' | 'fill' | 'unset',
}

interface BlogPageConfig extends BasicPageConfig {
  /** 博客页中每页展示的文章数量，默认5 */
  PageArticleCount?: number
}

interface CollectPageConfig extends BasicPageConfig {
  /** 集合页中每页展示的文章数量，默认10 */
  PageArticleCount?: number
}

interface FriendItem {
  name: string
  link: string
  avatar?: string
  description?: string
}

interface FriendsPageConfig extends BasicPageConfig {
  /** 友链列表 */
  FriendList?: FriendItem[]
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
   *  */
  site: string
  /** 为博客添加一个自定义主页，默认为 false */
  useIndex?: boolean
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
}

export type PageList = 'index' | 'blog' | 'tags' | 'about' | 'friends' | 'posts' | 'custom' | 'collect'

interface BlogConfig extends Record<any, any> {
  PageDefaultSettings: BasicPageConfig
  WebsiteSettings: BasicWebsiteConfig
  color: {
    light: LightThemeColorConfig
    dark: DarkThemeColorConfig
  }
  pages: Partial<Record<PageList, BasicPageConfig>> & Partial<{
    'blog': BlogPageConfig
    'collect': CollectPageConfig
    'friends': FriendsPageConfig
  }>
  UserInfo: BasicPersonalConfig
}

export default function defineBlogConfig(config: Partial<BlogConfig>): BlogConfig {
  const _DEFAULT_CONFIG_: BlogConfig = {
    PageDefaultSettings: {
      setMinHeight: 'content',
      header: {
        title: '',
        hidden: false,
        keepBackgroundColor: true,
        keepOpen: true
      },
      background: {
        filter: false,
        mask: false,
        type: "purity",
        content: "#ddd"
      },
      footer: {
        hidden: false,
        content: [
          `<div>Copyright © ${(new Date()).getFullYear()}</div>`
        ]
      }
    },
    WebsiteSettings: {
      title: `Shiina's Blog`,
      description: '',
      site: "",
      useIndex: false,
      base: "",
    },
    UserInfo: {
      name: 'Shiinafan',
      introduction: '有钱终成眷属，没钱亲眼目睹',
      avatar: '/source/avatar.jpg',
      link: []
    },
    color: {
      light: {
        backgroundDefault: '#fcfcfc',
        backgroundActiveDefault: '#ddd',
        textDefault: '#222',
        tipsDefault: '#3F5EFB'
      },
      dark: {
        backgroundDefault: '#121212',
        backgroundActiveDefault: '#444',
        textDefault: '#fff',
        tipsDefault: '#919edf'
      },
    },
    pages: {
      'index': {
        header: {
          title: '主页'
        }
      },
      'blog': {
        header: {
          title: '博客'
        },
        PageArticleCount: 5
      },
      'about': {},
      'posts': {},
      'custom': {},
      'collect': {
        header: {
          title: '集合'
        },
        PageArticleCount: 10
      },
      'friends': {
        header: {
          title: '友链'
        },
        FriendList: []
      },
      'tags': {
        header: {
          title: '标签'
        }
      }
    }
  }

  const C = _.defaultsDeep(config, _DEFAULT_CONFIG_)

  for (const i in C.pages) {
    C.pages[i] = _.defaultsDeep(C.pages[i], C.PageDefaultSettings)
  }

  return C
}