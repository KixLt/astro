<script setup lang="ts">
import cfg from 'blog.config'
import { computed } from 'vue'

/**
 * 与 src/types/post.ts(Agent 1)结构一致的本地类型;
 * Agent 1 就位后按结构兼容直接使用。
 */
interface PostMeta {
  slug: string
  title: string
  description: string
  /** ISO 日期字符串 */
  date: string
  updatedDate?: string
  tags: string[]
  category?: string
  cover?: string
  minutes: number
  words: number
}

const props = withDefaults(defineProps<{
  post: PostMeta
  /** 站点 base 前缀,如 '/astro' */
  base: string
  /** 卡片在列表中的序号,用于 onload 错峰动画(Firefly: delay = index * 50ms) */
  index?: number
}>(), {
  index: 0,
})

const href = `${props.base}/blog/${props.post.slug}`

// cover 已是含 base 的完整 URL(见 src/types/post.ts 契约),直接使用
const coverSrc = computed(() => props.post.cover ?? '')

const dateText = computed(() => formatDate(props.post.date))

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime()))
    return iso
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${month}-${day}`
}
</script>

<template>
  <div
    class="article-card onload-animation"
    :class="{ 'has-cover': post.cover }"
    :style="{ animationDelay: `${index * 50}ms` }"
  >
    <div class="article-card__content">
      <a class="article-card__title" :href="href">{{ post.title }}</a>

      <div class="article-card__meta">
        <span class="article-card__meta-item">{{ dateText }}</span>
        <span v-if="post.category" class="article-card__meta-item article-card__meta-item--category">{{ post.category }}</span>
        <span
          v-for="tag in post.tags"
          :key="tag"
          class="article-card__meta-item article-card__meta-item--tag"
        >#{{ tag }}</span>
      </div>

      <p class="article-card__desc">
        {{ post.description }}
      </p>

      <!-- Firefly PostStats:底部贴底弱化小字(有封面时右移避开封面区) -->
      <div class="article-card__stats">
        {{ cfg.WebsiteSettings.text.wordCount.replace('{words}', String(post.words)) }} ·
        {{ cfg.WebsiteSettings.text.readingTime.replace('{minutes}', String(post.minutes)) }}
      </div>
    </div>

    <a
      v-if="post.cover"
      class="article-card__cover"
      :href="href"
      :aria-label="`${cfg.WebsiteSettings.text.viewPost}:${post.title}`"
    >
      <span class="article-card__mask" aria-hidden="true"></span>
      <span class="article-card__chevron" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          width="40"
          height="40"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </span>
      <img :src="coverSrc" :alt="post.title" loading="lazy" />
    </a>

    <a
      v-else
      class="article-card__enter"
      :href="href"
      :aria-label="`${cfg.WebsiteSettings.text.enterPost}:${post.title}`"
    >
      <svg
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </a>
  </div>
</template>

<style lang="scss" scoped>
  .article-card {
    position: relative;
    display: flex;
    align-items: stretch;
    padding: 1.25rem;
    border-radius: var(--radius-large);
    color: var(--text-default);
    border: 1px solid var(--border-default);
    background-color: var(--background-card);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
      0 2px 10px 0 rgba(0, 0, 0, 0.12);
    transition: box-shadow 0.3s ease;

    &:hover {
      box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.2),
        0 4px 20px 0 rgba(0, 0, 0, 0.16);
    }

    // 加载入场:复用全局 fadeInUp,按 index 错峰
    &.onload-animation {
      animation: fadeInUp 0.45s ease both;
    }
  }

  .article-card__content {
    display: flex;
    flex: 1;
    flex-flow: column nowrap;
    min-width: 0;

    .has-cover & {
      padding-right: calc(30% + 1.5rem);
    }

    .article-card:not(.has-cover) & {
      padding-right: 4rem;
    }
  }

  .article-card__title {
    position: relative;
    margin-bottom: 0.5rem;
    padding-left: 0.75rem;
    font-size: 1.25rem;
    font-weight: 600;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: color 0.2s;

    // 左侧主色竖条装饰(Firefly: before 条 + hover 主色)
    &::before {
      content: '';
      position: absolute;
      top: 0.35rem;
      bottom: 0.35rem;
      left: 0;
      width: 0.25rem;
      border-radius: 0.125rem;
      background-color: var(--primary);
    }

    &:hover {
      color: var(--primary);
    }
  }

  .article-card__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.8125rem;
  }

  .article-card__meta-item {
    color: var(--text-default);
    opacity: 0.65;

    &--category,
    &--tag {
      color: var(--tips-default);
      opacity: 0.9;
    }
  }

  .article-card__desc {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--text-default);
    opacity: 0.75;
  }

  // ── 底部 stats(Firefly: 弱化小字, mt-auto 贴底)──
  .article-card__stats {
    margin-top: auto;
    padding-top: 0.5rem;
    font-size: 0.75rem;
    color: var(--text-default);
    opacity: 0.35;
  }

  // ── 有封面:右侧封面 ──
  .article-card__cover {
    position: absolute;
    top: 1rem;
    right: 1rem;
    bottom: 1rem;
    width: 30%;
    overflow: hidden;
    border-radius: var(--radius-large);

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    &:hover img {
      transform: scale(1.1);
    }
  }

  .article-card__mask {
    position: absolute;
    inset: 0;
    z-index: 1;
    background-color: rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease;

    .article-card__cover:hover & {
      opacity: 1;
    }
  }

  .article-card__chevron {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;

    .article-card__cover:hover & {
      opacity: 1;
      transform: scale(1);
    }
  }

  // ── 无封面:右侧常驻方块进入按钮 ──
  .article-card__enter {
    position: absolute;
    top: 50%;
    right: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-large);
    color: var(--primary);
    background-color: var(--background-active);
    transform: translateY(-50%);
    transition:
      background-color 0.2s,
      color 0.2s,
      transform 0.2s;

    &:hover {
      background-color: var(--primary);
      color: #fff;
      transform: translateY(-50%) scale(1.05);
    }
  }
</style>
