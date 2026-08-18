<script setup lang="ts">
import cfg from 'blog.config'
import { onBeforeUnmount, onMounted, ref } from 'vue'

interface Heading {
  depth: number
  slug: string
  text: string
}

const props = defineProps<{
  /** 文章章节列表(详情页);为空时整个组件隐藏 */
  headings: Heading[]
}>()

const active = ref('')

let observer: IntersectionObserver | null = null
const intersecting = new Set<string>()

function updateActive() {
  const order = props.headings.map(h => h.slug)
  active.value = order.find(slug => intersecting.has(slug)) ?? ''
}

// 点击章节 → 平滑滚动(补偿吸顶 nav 高度)
function jump(slug: string) {
  const el = document.getElementById(slug)
  if (!el)
    return
  const top = el.getBoundingClientRect().top + window.scrollY - 96
  window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  active.value = slug
}

onMounted(() => {
  if (!props.headings.length)
    return
  // 高亮"当前章节":只关注视口顶部下方一块带状区域(避开吸顶 nav)
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting)
        intersecting.add(entry.target.id)
      else
        intersecting.delete(entry.target.id)
    }
    updateActive()
  }, { rootMargin: '-80px 0px -70% 0px' })
  for (const h of props.headings) {
    const el = document.getElementById(h.slug)
    if (el)
      observer.observe(el)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <nav v-if="headings.length" class="toc" :aria-label="cfg.WebsiteSettings.text.toc">
    <div class="toc__title">
      {{ cfg.WebsiteSettings.text.toc }}
    </div>
    <ul class="toc__list">
      <li
        v-for="h in headings"
        :key="h.slug"
        class="toc__item"
        :style="{ paddingLeft: `${Math.max(0, h.depth - 2) * 0.75}rem` }"
      >
        <a
          class="toc__link"
          :class="{ 'is-active': active === h.slug }"
          :href="`#${h.slug}`"
          @click.prevent="jump(h.slug)"
        >{{ h.text }}</a>
      </li>
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
  .toc {
    padding: 1rem;
    border-radius: var(--radius-large);
    color: var(--text-default);
    border: 1px solid var(--border-default);
    background-color: var(--background-card);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
      0 2px 10px 0 rgba(0, 0, 0, 0.12);
  }

  .toc__title {
    margin-bottom: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--tips-default);
  }

  .toc__list {
    display: flex;
    flex-flow: column nowrap;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .toc__item {
    line-height: 1.5;
  }

  .toc__link {
    display: block;
    padding: 0.15rem 0.5rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition:
      color 0.2s,
      background-color 0.2s;

    &:hover {
      color: var(--tips-default);
      background-color: var(--background-active);
    }

    &.is-active {
      color: var(--tips-default);
      font-weight: 600;
    }
  }
</style>
