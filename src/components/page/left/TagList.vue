<script setup lang="ts">
import cfg from 'blog.config'
import { store } from '@/store/blogStore'

defineProps<{
  /** 全站 tag 聚合 */
  tags: { name: string, count: number }[]
}>()

// 点击切换 store.tag;相同值取消
function toggle(name: string) {
  store.tag = store.tag === name ? '' : name
}
</script>

<template>
  <div class="tag-list">
    <div v-if="!tags.length" class="tag-list__empty">
      {{ cfg.WebsiteSettings.text.emptyTags }}
    </div>
    <button
      v-for="tag in tags"
      :key="tag.name"
      class="tag-list__item"
      :class="{ 'is-active': store.tag === tag.name }"
      type="button"
      @click="toggle(tag.name)"
    >
      <span class="tag-list__name">{{ tag.name }}</span>
      <span class="tag-list__count">{{ tag.count }}</span>
    </button>
  </div>
</template>

<style lang="scss" scoped>
  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: var(--radius-large);
    color: var(--text-default);
    border: 1px solid var(--border-default);
    background-color: var(--background-card);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
      0 2px 10px 0 rgba(0, 0, 0, 0.12);
  }

  .tag-list__empty {
    width: 100%;
    font-size: 0.875rem;
    text-align: center;
    color: var(--tips-default);
  }

  .tag-list__item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    border: none;
    border-radius: 1rem;
    font-size: 0.8125rem;
    color: var(--text-default);
    background-color: var(--background-active);
    cursor: pointer;
    transition:
      color 0.2s,
      background-color 0.2s;

    &:hover {
      color: var(--tips-default);
    }

    &.is-active {
      color: #fff;
      background-color: var(--tips-default);
    }
  }

  .tag-list__count {
    font-size: 0.75rem;
    opacity: 0.7;
  }
</style>
