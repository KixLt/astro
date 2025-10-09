import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  astro: true,
  vue: {
    overrides: {
      'vue/html-self-closing': ['warn', {
        html: { void: 'always', normal: 'never', component: 'always' },
        svg: 'always',
        math: 'always',
      }],
    },
  },
  stylistic: {
    overrides: {
      'style/no-tabs': ['warn', { allowIndentationTabs: true }],
    },
  },
})
