// 自定义webpack默认配置
module.exports = {
  // configureWebpack 通过操作对象修改webpack默认配置
  // chainWebpack 通过链式编程修改webpack默认配置
  chainWebpack: config => {
    // 生产环境
    config.when(process.env.NODE_ENV === 'production', config => {
      // 配置生产环境入口文件
      config.entry('app').clear().add('./src/main-prod.js')

      // 配置externals加载第三方CDN资源
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        vuex: 'Vuex',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      // 配置生产环境下title
      config.plugin('html').tap(args => {
        args[0].isProduction = true
        return args
      })
    })
    // 开发环境
    config.when(process.env.NODE_ENV === 'development', config => {
      // 配置开发环境入口文件
      config.entry('app').clear().add('./src/main-dev.js')

      // 配置开发环境下title
      config.plugin('html').tap(args => {
        args[0].isProduction = false
        return args
      })
    })
  }
}
