<script setup lang="ts">
import cfg from 'blog.config'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{
  /** 页面标题 */
  title: string
  /** 轮播背景图路径(public 根相对路径,如 '/full/6.webp';http 原样) */
  images: string[]
  /** 站点 base 前缀,如 '/astro' */
  base: string
}>()

const active = ref(0)
const bannerEl = ref<HTMLElement | null>(null)
const resolved = ref<string[]>([])

let timer: ReturnType<typeof setInterval> | null = null

function resolve(src: string) {
  return /^https?:/i.test(src) || src.startsWith('//') ? src : `${props.base}${src}`
}

onMounted(() => {
  resolved.value = props.images.map(resolve)
  // 预载全部图片,避免切换时闪烁
  for (const src of resolved.value) {
    const img = new Image()
    img.src = src
  }
  // ~5s 切换
  if (resolved.value.length > 1) {
    timer = setInterval(() => {
      active.value = (active.value + 1) % resolved.value.length
    }, 5000)
  }
})

onBeforeUnmount(() => {
  if (timer)
    clearInterval(timer)
})

// 点击向下箭头 → 平滑滚动到内容区(下一个兄弟元素;无则按 banner 高度)
function scrollToContent() {
  const el = bannerEl.value?.nextElementSibling
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
  else {
    window.scrollTo({ top: bannerEl.value?.offsetHeight ?? 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div
    ref="bannerEl"
    class="banner"
    :class="{ 'banner--empty': !resolved.length }"
  >
    <!-- 渐变兜底层:图片加载前/缺省回退都可见 -->
    <div class="banner__gradient" aria-hidden="true"></div>

    <div
      v-for="(src, i) in resolved"
      :key="src"
      class="banner__slide"
      :class="{ 'is-active': i === active }"
      :style="{ backgroundImage: `url(${src})` }"
      aria-hidden="true"
    ></div>

    <div class="banner__content">
      <h1 class="banner__title">
        {{ title }}
      </h1>
    </div>
    <!-- Banner 底部水波纹(Mizuki 风格) -->
    <div id="header-waves" class="banner__waves" aria-hidden="true">
      <svg
        class="banner__waves-svg"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 20 150 32"
        preserveAspectRatio="none"
        shape-rendering="auto"
      >
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v48h-352z"
          />
        </defs>
        <g class="banner__waves-parallax">
          <use
            xlink:href="#gentle-wave"
            x="48"
            y="0"
            class="banner__waves-layer"
            style="animation-delay: -2s; animation-duration: 7s;"
          />
          <use
            xlink:href="#gentle-wave"
            x="48"
            y="3"
            class="banner__waves-layer"
            style="animation-delay: -3s; animation-duration: 10s;"
          />
          <use
            xlink:href="#gentle-wave"
            x="48"
            y="5"
            class="banner__waves-layer"
            style="animation-delay: -4s; animation-duration: 13s;"
          />
          <use
            xlink:href="#gentle-wave"
            x="48"
            y="7"
            class="banner__waves-layer"
            style="animation-delay: -5s; animation-duration: 20s;"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .banner {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60vh;
    min-height: 18rem;
    overflow: hidden;
    color: #fff;
    background-color: var(--background-default);

    // images 为空时的纯渐变回退
    &--empty {
      background-image: linear-gradient(
        to left,
        #12c2e9,
        #c471ed,
        #f64f59
      );
    }

    // Mizuki 响应式 Banner 高度
    @media (max-width: 767px) {
      height: max(70vh, 450px);
    }

    @media (min-width: 768px) and (max-width: 1279px) {
      height: max(70vh, 500px);
    }

    @media (min-width: 1280px) {
      height: 65vh;
    }
  }

  .banner__gradient {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(
      to left,
      #12c2e9,
      #c471ed,
      #f64f59
    );
  }

  .banner__slide {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    opacity: 0;
    transition: opacity 1.5s ease;

    &.is-active {
      opacity: 1;
    }
  }

  .banner__content {
    position: relative;
    z-index: 2;
    padding: 1rem 2rem;
    text-align: center;
  }

  .banner__title {
    font-size: 2.25rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }

  .banner__waves {
    position: absolute;
    bottom: -1px;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 10vh;
    min-height: 50px;
    max-height: 80px;
    overflow: visible;
    pointer-events: none;
    isolation: isolate;

    @media (min-width: 768px) {
      height: 15vh;
      max-height: 150px;
    }
  }

  .banner__waves-svg {
    display: block;
    width: 100%;
    height: 100%;
    transform: translateZ(0);
    backface-visibility: hidden;
  }

  .banner__waves-parallax use {
    transform: translateZ(0);
    backface-visibility: hidden;
    will-change: transform;
    fill: var(--background-default);
    animation: banner-wave-move 25s cubic-bezier(0.5, 0.5, 0.45, 0.5) infinite;
  }

  .banner__waves-layer:nth-child(1) {
    animation-duration: 7s;
    animation-delay: -2s;
    opacity: 0.25;
  }

  .banner__waves-layer:nth-child(2) {
    animation-duration: 10s;
    animation-delay: -3s;
    opacity: 0.5;
  }

  .banner__waves-layer:nth-child(3) {
    animation-duration: 13s;
    animation-delay: -4s;
    opacity: 0.75;
  }

  .banner__waves-layer:nth-child(4) {
    animation-duration: 20s;
    animation-delay: -5s;
    opacity: 1;
  }

  @keyframes banner-wave-move {
    0% {
      transform: translate3d(-90px, 0, 0);
    }

    100% {
      transform: translate3d(85px, 0, 0);
    }
  }

  @keyframes banner-bounce {
    0%,
    100% {
      transform: translateX(-50%) translateY(0);
    }

    50% {
      transform: translateX(-50%) translateY(0.5rem);
    }
  }
</style>
