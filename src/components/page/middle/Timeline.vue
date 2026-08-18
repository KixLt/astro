<script setup lang="ts">
import cfg from 'blog.config'
import { computed, ref } from 'vue'

interface PostMeta {
  slug: string
  title: string
  description: string
  date: string
  updatedDate?: string
  tags: string[]
  category?: string
  cover?: string
  minutes: number
  words: number
}

const props = defineProps<{
  /** 按年份分组的文章 */
  groups: { year: number, posts: PostMeta[] }[]
  /** 站点 base 前缀,如 '/astro' */
  base: string
}>()

// 已展开的年份(可同时展开多年)
const expanded = ref<number[]>([])

// 年份降序 + 组内按日期降序
const sortedGroups = computed(() =>
  [...props.groups]
    .sort((a, b) => b.year - a.year)
    .map(group => ({
      ...group,
      posts: [...group.posts].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    })),
)

function isOpen(year: number) {
  return expanded.value.includes(year)
}

function toggle(year: number) {
  expanded.value = isOpen(year)
    ? expanded.value.filter(y => y !== year)
    : [...expanded.value, year]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime()))
    return iso
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${month}-${day}`
}
</script>

<template>
  <div class="timeline">
    <div
      v-for="group in sortedGroups"
      :key="group.year"
      class="timeline__group"
    >
      <button
        class="timeline__year"
        :class="{ 'is-open': isOpen(group.year) }"
        type="button"
        @click="toggle(group.year)"
      >
        <svg
          class="timeline__arrow"
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span class="timeline__year-name">{{ group.year }}</span>
        <span class="timeline__year-count">{{ cfg.WebsiteSettings.text.archiveCount.replace('{count}', String(group.posts.length)) }}</span>
      </button>

      <Transition name="fade">
        <ul v-if="isOpen(group.year)" class="timeline__posts">
          <li
            v-for="post in group.posts"
            :key="post.slug"
            class="timeline__post"
          >
            <a class="timeline__post-link" :href="`${base}/blog/${post.slug}`">
              <span class="timeline__post-date">{{ formatDate(post.date) }}</span>
              <span class="timeline__post-title">{{ post.title }}</span>
            </a>
          </li>
        </ul>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .timeline {
    display: flex;
    flex-flow: column nowrap;
    gap: 0.75rem;
  }

  .timeline__group {
    padding: 1rem;
    border-radius: var(--radius-large);
    color: var(--text-default);
    border: 1px solid var(--border-default);
    background-color: var(--background-card);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
      0 2px 10px 0 rgba(0, 0, 0, 0.12);
  }

  .timeline__year {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.4rem 0.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1.125rem;
    font-weight: 600;
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
  }

  .timeline__arrow {
    transition: transform 0.25s ease;

    .is-open & {
      transform: rotate(90deg);
    }
  }

  .timeline__year-count {
    font-size: 0.8125rem;
    font-weight: 400;
    color: var(--tips-default);
  }

  .timeline__posts {
    display: flex;
    flex-flow: column nowrap;
    gap: 0.25rem;
    margin: 0.5rem 0 0;
    padding: 0;
    list-style: none;
  }

  .timeline__post-link {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    padding: 0.35rem 0.5rem;
    border-radius: 0.375rem;
    transition:
      color 0.2s,
      background-color 0.2s;

    &:hover {
      color: var(--tips-default);
      background-color: var(--background-active);
    }
  }

  .timeline__post-date {
    flex-shrink: 0;
    font-size: 0.8125rem;
    color: var(--tips-default);
  }

  .timeline__post-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
