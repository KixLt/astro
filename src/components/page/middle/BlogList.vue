<script setup lang="ts">
import cfg from 'blog.config'
import { computed, onMounted, watch } from 'vue'
import ArticleCard from '@/components/page/middle/ArticleCard.vue'
import Pagination from '@/components/page/middle/Pagination.vue'
import { store } from '@/store/blogStore'

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

const props = withDefaults(defineProps<{
  posts: PostMeta[]
  /** 每页文章数,默认 10 */
  pageSize?: number
  /** 站点 base 前缀,如 '/astro' */
  base: string
}>(), {
  pageSize: 10,
})

// search(标题/描述,忽略大小写) ∧ tag ∧ category 过滤
const filtered = computed(() => {
  const keyword = store.search.trim().toLowerCase()
  return props.posts.filter((post) => {
    const matchSearch = !keyword
      || post.title.toLowerCase().includes(keyword)
      || post.description.toLowerCase().includes(keyword)
    const matchTag = !store.tag || post.tags.includes(store.tag)
    const matchCategory = !store.category || post.category === store.category
    return matchSearch && matchTag && matchCategory
  })
})

// 从 URL 参数初始化(?q=/?tag=/?category=):详情页分类/标签点击、搜索跳转过来时生效
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const q = params.get('q')
  const tag = params.get('tag')
  const category = params.get('category')
  if (q)
    store.search = q
  if (tag)
    store.tag = tag
  if (category)
    store.category = category
})

// 过滤条件变化 → 重置到第一页
watch(() => [store.search, store.tag, store.category], () => {
  store.page = 1
})

// 过滤结果缩水 → 页码越界钳制
watch(filtered, (list) => {
  const max = Math.max(1, Math.ceil(list.length / props.pageSize))
  if (store.page > max)
    store.page = max
})

const paged = computed(() => {
  const page = Math.min(store.page, Math.max(1, Math.ceil(filtered.value.length / props.pageSize)))
  const start = (page - 1) * props.pageSize
  return filtered.value.slice(start, start + props.pageSize)
})
</script>

<template>
  <div class="blog-list">
    <div v-if="!filtered.length" class="blog-list__empty">
      {{ cfg.WebsiteSettings.text.emptyPosts }}
    </div>
    <template v-else>
      <div class="blog-list__cards">
        <ArticleCard
          v-for="(post, i) in paged"
          :key="post.slug"
          :post="post"
          :base="base"
          :index="i"
        />
      </div>
      <Pagination :total="filtered.length" :page-size="pageSize" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
  .blog-list__cards {
    display: flex;
    flex-flow: column nowrap;
    gap: 1rem;
  }

  .blog-list__empty {
    padding: 3rem 1rem;
    border-radius: var(--radius-large);
    font-size: 0.9375rem;
    text-align: center;
    color: var(--tips-default);
    border: 1px solid var(--border-default);
    background-color: var(--background-card);
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16),
      0 2px 10px 0 rgba(0, 0, 0, 0.12);
  }
</style>
