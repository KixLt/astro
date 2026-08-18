<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

/** SVG 水波纹 */
const SHOW_WAVE = true

// ── 星空流星背景（canvas，模仿 Hexo 模板的星空效果）──
const starCanvas = ref<HTMLCanvasElement | null>(null)

interface Star {
  x: number
  y: number
  r: number
  alpha: number
  speed: number
  phase: number
  color: string
}

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  length: number
  life: number
}

let starCtx: CanvasRenderingContext2D | null = null
let stars: Star[] = []
const meteors: Meteor[] = []
let starRaf = 0
let starW = 0
let starH = 0

// 星星颜色池：纯白为主，少量淡蓝 / 淡黄增加层次
const STAR_COLORS = ['255, 255, 255', '200, 220, 255', '255, 240, 200']

// 初始化星星（密度按屏幕面积）
function initStars() {
  stars = []
  const count = Math.floor((starW * starH) / 4000)
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * starW,
      y: Math.random() * starH,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      // 闪烁角速度：1 ~ 5 rad/s（周期约 1.3s ~ 6.3s），慢闪更静谧
      speed: Math.random() * 0.004 + 0.001,
      phase: Math.random() * Math.PI * 2,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    })
  }
}

// 生成一颗流星：从画布上方斜向滑落，带渐变尾迹
function spawnMeteor() {
  const x = Math.random() * starW
  const angle = Math.PI / 4 + Math.random() * (Math.PI / 4) // 45° ~ 90°
  const speed = 6 + Math.random() * 6
  meteors.push({
    x,
    y: -20,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length: 80 + Math.random() * 120,
    life: 1,
  })
}

function drawStars() {
  if (!starCtx)
    return
  starCtx.clearRect(0, 0, starW, starH)

  // 深色夜空渐变底（自上而下由深至浅，模仿 Hexo 星空模板）
  const sky = starCtx.createLinearGradient(0, 0, 0, starH)
  sky.addColorStop(0, '#070b1f')
  sky.addColorStop(0.6, '#0d1330')
  sky.addColorStop(1, '#1a2350')
  starCtx.fillStyle = sky
  starCtx.fillRect(0, 0, starW, starH)

  // 星星：正弦闪烁
  const now = Date.now()
  for (const s of stars) {
    const a = s.alpha * (0.5 + 0.5 * Math.sin(now * s.speed + s.phase))
    starCtx.beginPath()
    starCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
    starCtx.fillStyle = `rgba(${s.color}, ${a.toFixed(3)})`
    starCtx.fill()
  }

  // 流星：最多同时 3 颗，随机生成
  if (meteors.length < 3 && Math.random() < 0.02)
    spawnMeteor()
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i]
    m.x += m.vx
    m.y += m.vy
    m.life -= 0.008
    if (m.life <= 0 || m.x > starW + 200 || m.y > starH + 200) {
      meteors.splice(i, 1)
      continue
    }
    const tailX = m.x - m.vx * (m.length / 6)
    const tailY = m.y - m.vy * (m.length / 6)
    const grad = starCtx.createLinearGradient(m.x, m.y, tailX, tailY)
    grad.addColorStop(0, `rgba(255, 255, 255, ${m.life.toFixed(3)})`)
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
    starCtx.strokeStyle = grad
    starCtx.lineWidth = 1.5
    starCtx.beginPath()
    starCtx.moveTo(m.x, m.y)
    starCtx.lineTo(tailX, tailY)
    starCtx.stroke()
  }

  starRaf = requestAnimationFrame(drawStars)
}

// 画布尺寸跟随视口（含 devicePixelRatio 高清适配）
function onStarResize() {
  const canvas = starCanvas.value
  if (!canvas)
    return
  const dpr = window.devicePixelRatio || 1
  starW = window.innerWidth
  starH = window.innerHeight
  canvas.width = starW * dpr
  canvas.height = starH * dpr
  starCtx = canvas.getContext('2d')
  starCtx?.scale(dpr, dpr)
  initStars()
}

onMounted(() => {
  onStarResize()
  window.addEventListener('resize', onStarResize)
  starRaf = requestAnimationFrame(drawStars)
})

onUnmounted(() => {
  cancelAnimationFrame(starRaf)
  window.removeEventListener('resize', onStarResize)
})
</script>

<template>
  <!-- 星空流星背景（canvas） -->
  <canvas
    ref="starCanvas"
    class="star-field"
    aria-hidden="true"
  ></canvas>

  <!-- 水波纹效果 -->
  <div
    v-if="SHOW_WAVE"
    id="header-waves"
    class="waves"
  >
    <svg
      class="waves"
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
      <g class="parallax" style="transform: translateZ(0);">
        <use
          xlink:href="#gentle-wave"
          x="48"
          y="0"
          class="wave-1"
          style="fill: var(--background-default, #f2f5f8);"
        />
        <use
          xlink:href="#gentle-wave"
          x="48"
          y="3"
          class="wave-2"
          style="fill: var(--background-default, #f2f5f8);"
        />
        <use
          xlink:href="#gentle-wave"
          x="48"
          y="5"
          class="wave-3"
          style="fill: var(--background-default, #f2f5f8);"
        />
        <use
          xlink:href="#gentle-wave"
          x="48"
          y="7"
          class="wave-4"
          style="fill: var(--background-default, #f2f5f8);"
        />
      </g>
    </svg>
  </div>
</template>

<style lang="scss" scoped>
/* 星空流星画布：固定铺满全屏，置于内容之下；
   背景渐变兜底——JS 未执行（SSR 首屏）时也显示深色夜空。
   用 inset:0 撑满而非 100vw/100vh（100vw 含滚动条宽度会引发水平溢出） */
.star-field {
  position: fixed;
  inset: 0;
  z-index: -1000;
  pointer-events: none;
  background: linear-gradient(to bottom, #070b1f, #0d1330 60%, #1a2350);
}

/* 水波纹容器：绝对定位贴底（不占文档流 → 不撑开页面、不产生滚动条）
   高度 30vh（页面高度的 30%），溢出裁剪防 1px 缝隙引发滚动 */
#header-waves {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 30vh;
  overflow: hidden;
  transform: translateZ(0);
  will-change: fill;
  pointer-events: none;
}

.waves {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 水波纹四层：独立速度 + 负延迟错峰 + 透明度由高到低（底部最实，向上渐隐） */
@keyframes waveMove {
  0% {
    transform: translate3d(-90px, 0, 0);
  }

  100% {
    transform: translate3d(85px, 0, 0);
  }
}

.wave-1 {
  opacity: 0.1;
  animation: waveMove 7s cubic-bezier(.55, .5, .45, .5) infinite;
  animation-delay: -2s;
  will-change: transform;
}

.wave-2 {
  opacity: 0.2;
  animation: waveMove 10s cubic-bezier(.55, .5, .45, .5) infinite;
  animation-delay: -3s;
  will-change: transform;
}

.wave-3 {
  opacity: 0.35;
  animation: waveMove 13s cubic-bezier(.55, .5, .45, .5) infinite;
  animation-delay: -4s;
  will-change: transform;
}

.wave-4 {
  opacity: 0.5;
  animation: waveMove 20s cubic-bezier(.55, .5, .45, .5) infinite;
  animation-delay: -5s;
  will-change: transform;
}
</style>
