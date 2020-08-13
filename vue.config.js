// https://cli.vuejs.org/guide/css.html#passing-options-to-pre-processor-loaders
module.exports = {
  css: {
    loaderOptions: {
      scss: {
        prependData: `
        `
      }
    }
  },

  devServer: {
    watchOptions: {
      clientLogLevel: 'warning'
    }
  }
}
