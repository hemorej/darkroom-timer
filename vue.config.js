module.exports = {
  'publicPath' : 'darkroom',
  chainWebpack: config => {
    config.module.rule('eslint').use('eslint-loader').options({
      fix: true
    })
  }
}