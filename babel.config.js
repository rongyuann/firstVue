// 发布阶段需要用到的babel插件
const productionPlugins = []
if (process.env.NODE_ENV === 'production') {
  productionPlugins.push('transform-remove-console') // 生产环境需删除所有开发环境的console
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 生产阶段的插件数组
    ...productionPlugins,
    // 配置路由懒加载插件
    '@babel/plugin-syntax-dynamic-import'
  ]
}
