<script setup lang='ts'>
import cfg from 'blog.config'
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { loadModules } from '@/utils/loadModules'

const leftImages = import.meta.glob('/src/assets/left/*.webp', { import: 'default' })
const rightImages = import.meta.glob('/src/assets/right/*.webp', { import: 'default' })
const leftList = await loadModules(leftImages)
console.log(leftList)
const rightList = await loadModules(rightImages)
console.log(rightList)
const base = cfg.WebsiteSettings.base
const bgleft = ref('')
const bgright = ref('')
const timer = reactive({
  id: null as null | ReturnType<typeof setInterval>,
  index: 0,
  running: false,

  start: () => {
    if (timer.id)
      return
    timer.id = setInterval(() => {
      if (timer.index > 4) {
        timer.index = 0
      }
      timer.index++
    }, 3000)

    timer.running = true
  },

  stop: () => {
    if (!timer.id)
      return
    clearInterval(timer.id)
    timer.id = null
    timer.running = false
    timer.index = 0
  },
})

const parseImage = await Promise.all(
  Object.keys(leftImages).map(async (key) => {
    const mod = await leftImages[key]()
    return {
      name: key.split('/').pop(),
      src: mod.default,
    }
  }),
)

onMounted(() => {
  timer.start()
})

onUnmounted(() => {
  timer.stop()
})
</script>

<template>
  <div>
    <div class="background " :style="bgleft" w="100% xl:[50%]">
      <div class="mask"></div>
      <img :src="leftList[timer.index].src" w="100%" h="100%" object-contain xl:object-cover />
    </div>
    <div class="background " :style="bgright" w="0 xl:[50%]" left="0 md:[50%]">
      <div class="mask"></div>
      <img :src="rightList[timer.index].src" w="100%" h="100%" object-contain xl:object-cover />
    </div>
  </div>
</template>

<style lang="scss">
.background {
    z-index: -1000;
    position: fixed;
    top: 0;
    width: 50vw;
    height: 100vh;
    filter: blur(2px);

    &::before {
      content: " ";
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0;
      background-color: rgba(0, 0, 0, 0.3);
    }
    img{
      object-position: top -2px left 50%;
    }
  }
</style>
