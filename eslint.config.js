import pluginVue from 'eslint-plugin-vue'
export default [
  ...pluginVue.configs['flat/recommended'],
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/attributes-order': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/order-in-components': 'off',
    },
  },
]
