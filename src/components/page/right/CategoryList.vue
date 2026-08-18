<script setup lang="ts">
import cfg from 'blog.config'
import { store } from '@/store/blogStore'

const props = defineProps<{
  /** 全站分类聚合 */
  categories: { name: string, count: number }[]
  /** true = 详情页(点击跳转);false = 列表页(点击过滤) */
  isDetail: boolean
  /** 站点 base 前缀,如 '/astro' */
  base: string
}>()

function onClick(name: string) {
  // 详情页:跳转列表页并携带 category 参数
  if (props.isDetail) {
    window.location.href = `${props.base}/blog?category=${encodeURIComponent(name)}`
    return
  }
  // 列表页:切换 store.category(相同值取消)
  store.category = store.category === name ? '' : name
}
</script>

<template>
  <div class="category-list">
    <div v-if="!categories.length" class="category-list__empty">
      {{ cfg.WebsiteSettings.text.emptyCategories }}
    </div>
    <button
      v-for="cat in categories"
      :key="cat.name"
      class="category-list__item"
      :class="{ 'is-active': !isDetail && store.category === cat.name }"
      type="button"
      @click="onClick(cat.name)"
    >
      <span class="category-list__name">{{ cat.name }}</span>
      <span class="category-list__count">{{ cat.count }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
  .category-list {
    display: flex;
    flex-flow: column nowrap;
    gap: 0.4rem;
    padding: 1rem;
    border-radius: var(--radius-large);
    color: var(--text-default);
    border: 1px solid var(--border-default);
    background-color: var(--background-card);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
      0 2px 10px 0 rgba(0, 0, 0, 0.12);
  }

  .category-list__empty {
    font-size: 0.875rem;
    text-align: center;
    color: var(--tips-default);
  }

  .category-list__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.45rem 0.7rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    color: var(--text-default);
    background-color: transparent;
    cursor: pointer;
    transition:
      color 0.2s,
      background-color 0.2s;

    &:hover {
      color: var(--tips-default);
      background-color: var(--background-active);
    }

    &.is-active {
      color: #fff;
      background-color: var(--tips-default);
    }
  }

  .category-list__count {
    font-size: 0.75rem;
    opacity: 0.7;
  }
</style>
