import { reactive } from 'vue'

/**
 * 共享状态:由 SearchBox / TagList / CategoryList / BlogList 同页共享。
 * reactive 在无 Vue 组件上下文时仍可安全导出,供组件的 setup 使用。
 */
export const store = reactive({
  search: '',
  tag: '',
  category: '',
  page: 1,
})
