<script setup lang="ts">
import cfg from 'blog.config'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { store } from '@/store/blogStore'

interface NavLink {
  text: string
  href?: string
  external?: boolean
  icon?: string
  children?: NavLink[]
}

const props = defineProps<{
  /** 博客名 */
  title: string
  /** 站点 base 前缀,如 '/astro' */
  base: string
  /** 当前页面路径(不含 query),如 '/blog'、'/blog/slug' */
  currentPath: string
  /** 导航链接列表;带 children 的项在桌面端渲染为下拉菜单 */
  links: NavLink[]
}>()

const isHome = computed(
  () => [
    props.base,
    `${props.base}/`,
    `${props.base}/page`,
    `${props.base}/page/`,
  ].includes(props.currentPath),
)

const isBlogList = computed(() => [
  `${props.base}/blog`,
  `${props.base}/blog/`,
].includes(props.currentPath))

// ── 显隐滚动逻辑 ──
const scrolled = ref(false)
const hidden = ref(false)

let bgObserver: IntersectionObserver | null = null
let hideObserver: IntersectionObserver | null = null

// ── 菜单 / 设置面板 ──
const menuOpen = ref(false)
const settingsOpen = ref(false)
const searchActive = ref(false)
const expandedMenuKey = ref<string | null>(null)
const menuPanelEl = ref<HTMLElement | null>(null)
const settingsPanelEl = ref<HTMLElement | null>(null)
const themeBtnEl = ref<HTMLElement | null>(null)

// ── 搜索 ──
const searchValue = ref(store.search)
const desktopExpanded = ref(false)
const mobileSearchOpen = ref(false)
const desktopInputEl = ref<HTMLInputElement | null>(null)
const mobileInputEl = ref<HTMLInputElement | null>(null)
const searchRootEl = ref<HTMLElement | null>(null)
let blurTimer: ReturnType<typeof setTimeout> | undefined

// function isBlogList() {
//   if (typeof window === 'undefined')
//     return false
//   const path = window.location.pathname
//   return path === `${props.base}/blog` || path === `${props.base}/blog/`
// }

function setDesktopExpanded(v: boolean) {
  if (desktopExpanded.value === v)
    return
  desktopExpanded.value = v
  searchActive.value = v
}

function expandDesktop() {
  setDesktopExpanded(true)
  nextTick(() => desktopInputEl.value?.focus())
}

function collapseDesktop() {
  if (!searchValue.value.trim()) {
    blurTimer = setTimeout(() => {
      setDesktopExpanded(false)
    }, 150)
  }
}

function handleSearchFocus() {
  if (blurTimer)
    clearTimeout(blurTimer)
}

function handleSearchBlur() {
  collapseDesktop()
}

function onSearchEnter() {
  if (isBlogList()) {
    desktopInputEl.value?.blur()
    mobileInputEl.value?.blur()
    return
  }

  const q = encodeURIComponent(searchValue.value.trim())
  window.location.href = `${props.base}/blog${q ? `?q=${q}` : ''}`
}

function toggleMobileSearch() {
  mobileSearchOpen.value = !mobileSearchOpen.value
  if (mobileSearchOpen.value)
    nextTick(() => mobileInputEl.value?.focus())
}

watch(searchValue, (v) => {
  if (isBlogList.value)
    store.search = v
})

// ── 主题 ──
type Theme = 'auto' | 'light' | 'dark'

const themeMode = ref<Theme>('auto')
const systemDark = ref(false)
const mql = ref<MediaQueryList | null>(null)

const effectiveDark = computed(() => {
  if (themeMode.value === 'dark')
    return true
  if (themeMode.value === 'light')
    return false
  return systemDark.value
})

function applyTheme(value: Theme) {
  themeMode.value = value
  document.documentElement.dataset.theme = value
  localStorage.setItem('theme', value)
}

function toggleTheme() {
  applyTheme(effectiveDark.value ? 'light' : 'dark')
}

function onSystemThemeChange(e: MediaQueryListEvent) {
  systemDark.value = e.matches
}

// ── 主题色(设置面板) ──
const hue = ref(260)
const DEFAULT_HUE = 260

function applyHue(value: number) {
  hue.value = value
  const root = document.documentElement
  root.style.setProperty('--hue', String(value))
  root.style.setProperty(
    '--primary',
    `light-dark(hsl(${value} 80% 55%), hsl(${value} 80% 70%))`,
  )
  root.style.setProperty(
    '--tips-default',
    `light-dark(hsl(${value} 80% 55%), hsl(${value} 80% 70%))`,
  )
  localStorage.setItem('hue', String(value))
}

function onHueInput(e: Event) {
  const value = Number((e.target as HTMLInputElement).value)
  if (Number.isFinite(value))
    applyHue(value)
}

function resetHue() {
  applyHue(DEFAULT_HUE)
}

// ── 链接工具 ──
function isActive(href?: string) {
  if (!href)
    return false
  return props.currentPath === href || props.currentPath.startsWith(`${href}/`)
}

function resolveHref(link: NavLink) {
  return link.href ?? `${props.base}/blog`
}

function toggleMenuKey(key: string) {
  expandedMenuKey.value = expandedMenuKey.value === key ? null : key
}

function toggleSettings() {
  settingsOpen.value = !settingsOpen.value
  if (settingsOpen.value) {
    nextTick(() => {
      const btn = themeBtnEl.value
      const panel = settingsPanelEl.value
      if (!btn || !panel)
        return
      const rect = btn.getBoundingClientRect()
      // 锚定到主题切换按钮,方向从右向左展开
      panel.style.top = `${rect.bottom + 16}px`
      panel.style.right = `${window.innerWidth - rect.right}px`
    })
  }
}

// ── 全局点击 / 键盘 ──
function onDocClick(e: MouseEvent) {
  const target = e.target as Node
  if (settingsOpen.value && settingsPanelEl.value && !settingsPanelEl.value.contains(target))
    settingsOpen.value = false
  if (menuOpen.value && menuPanelEl.value && !menuPanelEl.value.contains(target))
    menuOpen.value = false
  if (mobileSearchOpen.value && searchRootEl.value && !searchRootEl.value.contains(target))
    mobileSearchOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    setDesktopExpanded(false)
    mobileSearchOpen.value = false
    menuOpen.value = false
    settingsOpen.value = false
  }
}

onMounted(() => {
  // 哨兵 + IntersectionObserver 驱动吸顶/隐藏
  const header = document.querySelector('header')
  const contentBody = document.querySelector('.page-shell__main')
  const Sentinel = document.createElement('div')
  const hideSentinel = document.createElement('div')
  header?.before(Sentinel)
  contentBody?.before(hideSentinel)
  if (Sentinel && 'IntersectionObserver' in window) {
    bgObserver = new IntersectionObserver(([entry]) => {
      scrolled.value = !entry.isIntersecting
    }, {
      rootMargin: '50px 0px 0px 0px',
    })
    bgObserver.observe(Sentinel)
  }

  if (hideSentinel && 'IntersectionObserver' in window) {
    hideObserver = new IntersectionObserver(([entry]) => {
      hidden.value = !entry.isIntersecting
    }, {
      rootMargin: '-70px 0px 0px 0px',
    })
    hideObserver.observe(hideSentinel)
  }

  // 搜索框 URL 参数初始化
  const params = new URLSearchParams(window.location.search)
  const q = params.get('q')
  if (q) {
    searchValue.value = q
    store.search = q
  }

  // 主题初始化
  mql.value = window.matchMedia('(prefers-color-scheme: dark)')
  systemDark.value = mql.value.matches
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
    themeMode.value = savedTheme
    document.documentElement.dataset.theme = savedTheme
  }
  else {
    document.documentElement.dataset.theme = 'auto'
  }
  mql.value.addEventListener?.('change', onSystemThemeChange)

  // 主题色初始化
  const savedHue = Number(localStorage.getItem('hue'))
  if (Number.isFinite(savedHue) && savedHue >= 0 && savedHue <= 360)
    applyHue(savedHue)

  document.addEventListener('mousedown', onDocClick)
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  bgObserver?.disconnect()
  hideObserver?.disconnect()
  if (blurTimer)
    clearTimeout(blurTimer)
  mql.value?.removeEventListener?.('change', onSystemThemeChange)
  document.removeEventListener('mousedown', onDocClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <header
    id="navbar"
    class="navbar_warpper onload-animation"
    :class="{ 'is-searching': searchActive, 'is-hidden': hidden }"
    :data-is-home="isHome"
  >
    <div class="navbar__bar" :class="{ 'is-scrolled': scrolled }">
      <a
        class="mz-btn-plain mz-scale-animation navbar__brand"
        :href="`${base}/page`"
      >
        <img src="" alt="" srcset="" />
        <span class="navbar__brand-text">{{ title }}</span>
      </a>

      <nav class="navbar__links" :aria-label="cfg.WebsiteSettings.text.navMenu">
        <template v-for="link in links" :key="`${link.text}-${link.href ?? ''}`">
          <a
            class="mz-btn-plain mz-scale-animation navbar__link"
            :class="{ 'is-active': isActive(link.href) }"
            :href="resolveHref(link)"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener noreferrer' : undefined"
          >{{ link.text }}</a>
        </template>
      </nav>

      <div class="navbar__tools">
        <!-- 搜索 -->
        <div ref="searchRootEl" class="search">
          <div
            class="search__desktop"
            :class="{ 'is-expanded': desktopExpanded }"
          >
            <button
              v-show="!desktopExpanded"
              class="mz-btn-plain mz-scale-animation mz-icon-btn search__toggle"
              type="button"
              :aria-label="cfg.WebsiteSettings.text.searchPlaceholder"
              @click="expandDesktop"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>

            <div
              v-show="desktopExpanded"
              class="search__field"
            >
              <svg
                class="search__field-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref="desktopInputEl"
                v-model="searchValue"
                class="search__input"
                type="search"
                :placeholder="cfg.WebsiteSettings.text.searchPlaceholder"
                @keydown.enter="onSearchEnter"
                @focus="handleSearchFocus"
                @blur="handleSearchBlur"
              />
            </div>
          </div>

          <button
            class="mz-btn-plain mz-scale-animation mz-icon-btn search__mobile-toggle"
            type="button"
            :aria-label="cfg.WebsiteSettings.text.searchPlaceholder"
            @mousedown.stop
            @click="toggleMobileSearch"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          <div
            class="search__panel mz-float-panel"
            :class="{ 'mz-float-panel-closed': !mobileSearchOpen }"
            role="search"
          >
            <div class="search__panel-input">
              <svg
                class="search__panel-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                ref="mobileInputEl"
                v-model="searchValue"
                class="search__panel-field"
                type="search"
                :placeholder="cfg.WebsiteSettings.text.searchPlaceholder"
                @keydown.enter="onSearchEnter"
              />
            </div>
            <div v-if="isBlogList" class="search__panel-hint">
              {{ cfg.WebsiteSettings.text.searchHint }}
            </div>
          </div>
        </div>

        <!-- 显示设置 -->
        <button
          class="mz-btn-plain mz-scale-animation mz-icon-btn navbar__icon-btn"
          type="button"
          :aria-label="cfg.WebsiteSettings.text.displaySettings"
          :aria-expanded="settingsOpen"
          @mousedown.stop
          @click="toggleSettings"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
            <circle cx="12" cy="12" r="3.5" />
          </svg>
        </button>

        <!-- 主题切换 -->
        <button
          ref="themeBtnEl"
          class="mz-btn-plain mz-scale-animation mz-icon-btn theme-switch"
          type="button"
          :aria-label="cfg.WebsiteSettings.text.toggleTheme"
          @click="toggleTheme"
        >
          <span
            class="theme-switch__icon"
            :class="{ 'is-hidden': effectiveDark, 'is-rotated': effectiveDark }"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
          </span>
          <span
            class="theme-switch__icon"
            :class="{ 'is-hidden': !effectiveDark, 'is-rotated': !effectiveDark }"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </span>
        </button>

        <!-- 移动端菜单按钮 -->
        <button
          class="mz-btn-plain mz-scale-animation mz-icon-btn navbar__icon-btn navbar__menu-btn"
          type="button"
          :aria-label="cfg.WebsiteSettings.text.menu"
          :aria-expanded="menuOpen"
          aria-controls="nav-menu"
          @mousedown.stop
          @click="menuOpen = !menuOpen"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 移动端导航菜单 -->
    <Transition name="mz-menu">
      <div
        v-if="menuOpen"
        id="nav-menu"
        ref="menuPanelEl"
        class="mz-float-panel nav-menu-panel"
        role="menu"
        :aria-label="cfg.WebsiteSettings.text.navMenu"
      >
        <div
          v-for="link in links"
          :key="`${link.text}-${link.href ?? ''}`"
          class="nav-menu-panel__item"
        >
          <template v-if="link.children && link.children.length">
            <button
              class="nav-menu-panel__trigger"
              type="button"
              :aria-expanded="expandedMenuKey === link.text"
              @click="toggleMenuKey(link.text)"
            >
              <span>{{ link.text }}</span>
              <svg
                class="nav-menu-panel__arrow"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <div
              class="nav-menu-panel__submenu"
              :class="{ 'is-open': expandedMenuKey === link.text }"
            >
              <a
                v-for="child in link.children"
                :key="`${child.text}-${child.href ?? ''}`"
                class="nav-menu-panel__child"
                :href="resolveHref(child)"
                :target="child.external ? '_blank' : undefined"
                :rel="child.external ? 'noopener noreferrer' : undefined"
                role="menuitem"
                @click="menuOpen = false"
              >
                <span>{{ child.text }}</span>
                <svg
                  v-if="child.external"
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7" />
                  <path d="M8 7h9v9" />
                </svg>
              </a>
            </div>
          </template>
          <a
            v-else
            class="nav-menu-panel__link"
            :class="{ 'is-active': isActive(link.href) }"
            :href="resolveHref(link)"
            :target="link.external ? '_blank' : undefined"
            :rel="link.external ? 'noopener noreferrer' : undefined"
            role="menuitem"
            @click="menuOpen = false"
          >
            <span>{{ link.text }}</span>
            <svg
              v-if="!link.external"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M7 17 17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </a>
        </div>
      </div>
    </Transition>

    <!-- 显示设置面板 -->
    <div
      ref="settingsPanelEl"
      class="mz-float-panel settings-panel"
      :class="{ 'mz-float-panel-closed': !settingsOpen }"
      role="dialog"
      :aria-label="cfg.WebsiteSettings.text.displaySettings"
    >
      <div class="settings-panel__header">
        <span class="settings-panel__title">{{ cfg.WebsiteSettings.text.themeColor }}</span>
        <span class="settings-panel__value">{{ hue }}</span>
        <button
          class="settings-panel__reset"
          type="button"
          :aria-label="cfg.WebsiteSettings.text.resetThemeColor"
          @click="resetHue"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-15.5 6.2L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
        </button>
      </div>
      <div class="settings-panel__slider">
        <input
          type="range"
          min="0"
          max="360"
          step="5"
          :value="hue"
          :aria-label="cfg.WebsiteSettings.text.themeColor"
          @input="onHueInput"
        />
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.navbar_warpper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 60;
  pointer-events: none;
  transition:
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;

  &.onload-animation {
    animation: nav-fade-in 0.4s ease-out both;
  }

  &.is-hidden {
    transform: translateY(-110%);
    opacity: 0;
  }
}

.navbar__bar {
  pointer-events: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: var(--navbar-h);
  width: calc(100vw);
  margin: 0 auto;
  padding: 0 1rem;
  border-radius: 0 0 1rem  1rem ;
  background-color: transparent;
  will-change: background, backdrop-filter, box-shadow;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.navbar__bar.is-scrolled {
  width: calc(var(--layout-page-width) - 4rem);
  background-color: color-mix(in srgb, var(--background-card) 75%, transparent);
  box-shadow:
    inset 0 0 0 1px var(--border-default),
    0 4px 16px light-dark(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.18));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.navbar__brand {
  flex-shrink: 0;
  height: 2.5rem;
  padding: 0 1.25rem;
  border-radius: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  transition:
    color 0.2s,
    transform 0.15s;

  &:hover {
    color: var(--primary);
  }

  &:active {
    transform: scale(0.95);
  }
}

.navbar__brand-icon {
  width: 1.75rem;
  height: 1.75rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
}

.navbar__brand-text {
  font-size: 1.125rem;
  color: light-dark(#000, #fff);
  transition: color 0.2s;
}

.navbar__links {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  overflow: hidden;
  transition: opacity 0.3s ease;

  @media (max-width: 1023.98px) {
    display: none;
  }
}

.navbar__link {
  height: 2.75rem;
  padding: 0 1.25rem;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-weight: 700;
  white-space: nowrap;

  &.is-active {
    color: var(--primary);
  }
}

.navbar__tools {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.navbar__icon-btn {
  color: light-dark(rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.75));
}

.navbar__menu-btn {
  @media (min-width: 1024px) {
    display: none;
  }
}

// ── 桌面下拉菜单 ──
.dropdown {
  position: relative;
}

.dropdown__trigger {
  height: 2.75rem;
  padding: 0 1rem;
  border-radius: 0.75rem;
  gap: 0.25rem;
  font-size: 0.9375rem;
  font-weight: 700;
  white-space: nowrap;

  &:hover {
    color: var(--primary);
  }
}

.dropdown__arrow {
  transition: transform 0.2s ease;

  .dropdown:hover &,
  .dropdown:focus-within &,
  .dropdown__trigger[aria-expanded='true'] & {
    transform: rotate(180deg);
  }
}

.dropdown__menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 50;
  min-width: 12rem;
  padding-top: 0.25rem;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-0.5rem);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    visibility 0.2s;

  &.is-open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
  }
}

.dropdown__content {
  padding: 0.5rem;
  border-radius: 1rem;
  border: 1px solid light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.1));
  color: light-dark(rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.75));
  background: light-dark(rgba(255, 255, 255, 0.85), rgba(24, 25, 38, 0.85));
  box-shadow: 0 4px 16px light-dark(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.18));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.dropdown__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: light-dark(rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.75));
  transition:
    color 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    color: var(--primary);
    background-color: light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.1));
  }
}

.dropdown__external {
  flex-shrink: 0;
  color: light-dark(rgba(0, 0, 0, 0.25), rgba(255, 255, 255, 0.25));
}

// ── 搜索 ──
.search {
  display: flex;
  align-items: center;
}

.search__desktop {
  position: relative;
  display: none;
  align-items: center;
  width: 2.75rem;
  height: 2.75rem;
  overflow: hidden;
  border-radius: 0.75rem;
  transition: width 0.3s ease;

  &.is-expanded {
    width: 12rem;
  }

  @media (min-width: 1024px) {
    display: flex;
  }
}

.search__toggle {
  position: absolute;
  inset: 0;
  color: light-dark(rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.75));
}

.search__field {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 0.75rem 0 2.5rem;
  border-radius: 0.75rem;
  color: light-dark(rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.75));
  background: light-dark(rgba(0, 0, 0, 0.04), rgba(255, 255, 255, 0.05));
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.25s ease,
    visibility 0.25s ease,
    background-color 0.15s ease;

  &:hover,
  &:focus-within {
    background: light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.1));
  }

  .search__desktop.is-expanded & {
    opacity: 1;
    visibility: visible;
  }
}

.search__field-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  color: light-dark(rgba(0, 0, 0, 0.3), rgba(255, 255, 255, 0.3));
  pointer-events: none;
}

.search__input {
  width: 100%;
  height: 100%;
  border: 0;
  outline: 0;
  font-size: 0.875rem;
  color: inherit;
  background: transparent;

  &::placeholder {
    color: light-dark(rgba(0, 0, 0, 0.35), rgba(255, 255, 255, 0.35));
  }
}

.search__mobile-toggle {
  display: flex;
  color: light-dark(rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.75));

  @media (min-width: 1024px) {
    display: none;
  }
}

.search__panel {
  right: 1rem;
  left: auto;
  width: min(24rem, calc(100vw - 2rem));
  padding: 0.75rem;
}

.search__panel-input {
  position: relative;
  display: flex;
  align-items: center;
  height: 2.75rem;
  border-radius: 0.75rem;
  background: light-dark(rgba(0, 0, 0, 0.04), rgba(255, 255, 255, 0.05));

  &:focus-within {
    background: light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.1));
  }
}

.search__panel-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  color: light-dark(rgba(0, 0, 0, 0.3), rgba(255, 255, 255, 0.3));
  pointer-events: none;
}

.search__panel-field {
  width: 100%;
  height: 100%;
  padding: 0 0.75rem 0 2.5rem;
  border: 0;
  outline: 0;
  font-size: 0.875rem;
  color: inherit;
  background: transparent;

  &::placeholder {
    color: light-dark(rgba(0, 0, 0, 0.35), rgba(255, 255, 255, 0.35));
  }
}

.search__panel-hint {
  padding: 0.75rem 0.5rem 0.25rem;
  font-size: 0.8125rem;
  color: light-dark(rgba(0, 0, 0, 0.45), rgba(255, 255, 255, 0.45));
}

// ── 主题切换 ──
.theme-switch {
  position: relative;
  color: light-dark(rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.75));
}

.theme-switch__icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.theme-switch__icon.is-hidden {
  opacity: 0;
  transform: rotate(180deg) scale(0.5);
}

.theme-switch__icon.is-rotated:not(.is-hidden) {
  transform: rotate(0) scale(1);
}

// ── 设置面板 ──
.settings-panel {
  right: 1rem;
  left: auto;
  width: 20rem;
  max-width: calc(100vw - 2rem);
  padding: 1rem;
}

.settings-panel__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.settings-panel__title {
  position: relative;
  margin-left: 0.75rem;
  font-size: 1rem;
  font-weight: 700;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -0.75rem;
    width: 0.25rem;
    height: 1.125rem;
    border-radius: 0.125rem;
    background-color: var(--primary);
    transform: translateY(-50%);
  }
}

.settings-panel__value {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 700;
  color: light-dark(rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.75));
  background: light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.1));
}

.settings-panel__reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 0;
  border-radius: 0.375rem;
  color: light-dark(rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.75));
  background: transparent;
  cursor: pointer;
  transition:
    color 0.15s,
    background-color 0.15s,
    transform 0.15s;

  &:hover {
    color: var(--primary);
    background: light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.1));
  }

  &:active {
    transform: scale(0.9);
  }
}

.settings-panel__slider {
  padding: 0.25rem;
  border-radius: 0.5rem;
  background: linear-gradient(
    to right,
    hsl(0 80% 55%),
    hsl(60 80% 55%),
    hsl(120 80% 55%),
    hsl(180 80% 55%),
    hsl(240 80% 55%),
    hsl(300 80% 55%),
    hsl(360 80% 55%)
  );

  input[type='range'] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 1rem;
    background: transparent;
    cursor: pointer;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 0.5rem;
      height: 1.125rem;
      border-radius: 0.125rem;
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    }

    &::-moz-range-thumb {
      width: 0.5rem;
      height: 1.125rem;
      border: 0;
      border-radius: 0.125rem;
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    }
  }
}

// ── 移动端菜单 ──
.nav-menu-panel {
  right: 1rem;
  left: auto;
  min-width: 13rem;
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 7rem);
  padding: 0.5rem;
  overflow-y: auto;
}

.nav-menu-panel__item {
  display: flex;
  flex-direction: column;
}

.nav-menu-panel__trigger,
.nav-menu-panel__link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 0;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: light-dark(rgba(0, 0, 0, 0.75), rgba(255, 255, 255, 0.75));
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    color 0.15s,
    background-color 0.15s;

  &:hover {
    color: var(--primary);
    background-color: light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.1));
  }

  &.is-active {
    color: var(--primary);
  }

  svg {
    flex-shrink: 0;
  }
}

.nav-menu-panel__arrow {
  color: var(--primary);
  transition: transform 0.25s ease;

  .nav-menu-panel__trigger[aria-expanded='true'] & {
    transform: rotate(180deg);
  }
}

.nav-menu-panel__submenu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;

  &.is-open {
    max-height: 24rem;
  }
}

.nav-menu-panel__child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.75rem 0.5rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: light-dark(rgba(0, 0, 0, 0.6), rgba(255, 255, 255, 0.6));
  transition:
    color 0.15s,
    background-color 0.15s;

  &:hover {
    color: var(--primary);
    background-color: light-dark(rgba(0, 0, 0, 0.06), rgba(255, 255, 255, 0.1));
  }
}

// ── 过渡 ──
.mz-menu-enter-active,
.mz-menu-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.mz-menu-enter-from,
.mz-menu-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem) scale(0.95);
}

@keyframes nav-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (max-width: 767.98px) {
  .navbar__bar {
    width: 100%;
    max-width: none;
    border-radius: 0.5rem;
    padding: 0 1rem;
  }

  .navbar__brand {
    padding: 0 1rem;
  }
}

@media (max-width: 479.98px) {
  .navbar__bar {
    padding: 0 1rem;
  }
}
</style>
