<script setup lang="ts">
import cfg from 'blog.config'
import { computed } from 'vue'
import { store } from '@/store/blogStore'

const props = defineProps<{
  /** 过滤后的文章总数 */
  total: number
  /** 每页文章数 */
  pageSize: number
}>()

type PageItem = number | 'ellipsis'

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const current = computed(() => Math.min(store.page, pageCount.value))
const show = computed(() => props.total > props.pageSize)

// 页码窗口:1、末页、当前页±1,间隔用省略号
const pages = computed<PageItem[]>(() => {
  const total = pageCount.value
  const cur = current.value
  if (total <= 7)
    return Array.from({ length: total }, (_, i) => i + 1)

  const set = new Set<number>([1, total, cur - 1, cur, cur + 1])
  const nums = [...set].filter(p => p >= 1 && p <= total).sort((a, b) => a - b)
  const out: PageItem[] = []
  let prev = 0
  for (const p of nums) {
    if (prev && p - prev > 1)
      out.push('ellipsis')
    out.push(p)
    prev = p
  }
  return out
})

function go(page: number) {
  store.page = Math.min(Math.max(1, page), pageCount.value)
}
</script>

<template>
  <div v-if="show" class="pagination">
    <button
      class="pagination__btn"
      type="button"
      :disabled="current <= 1"
      @click="go(current - 1)"
    >
      {{ cfg.WebsiteSettings.text.previousPage }}
    </button>

    <template v-for="(p, i) in pages" :key="i">
      <span v-if="typeof p === 'string'" class="pagination__ellipsis" aria-hidden="true">…</span>
      <button
        v-else
        class="pagination__num"
        :class="{ 'is-active': p === current }"
        type="button"
        :aria-current="p === current ? 'page' : undefined"
        @click="go(p)"
      >
        {{ p }}
      </button>
    </template>

    <button
      class="pagination__btn"
      type="button"
      :disabled="current >= pageCount"
      @click="go(current + 1)"
    >
      {{ cfg.WebsiteSettings.text.nextPage }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
  .pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    margin-top: 1.25rem;
  }

  .pagination__btn,
  .pagination__num {
    min-width: 2.25rem;
    height: 2.25rem;
    padding: 0 0.5rem;
    border: 1px solid var(--border-default);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    color: var(--text-default);
    background-color: var(--background-card);
    cursor: pointer;
    transition:
      color 0.2s,
      background-color 0.2s;

    &:hover:not(:disabled) {
      color: var(--tips-default);
      background-color: var(--background-active);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }

  .pagination__num.is-active {
    color: #fff;
    background-color: var(--tips-default);
  }

  .pagination__ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.5rem;
    color: var(--tips-default);
  }
</style>
