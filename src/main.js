import Vue from 'vue'

import AppLayout from './layout/index.vue'
import router from './router'
import store from './store'

import './mixins'
import './plugins'
import './thirdParty'

import './scss/style.scss'
import JSZip from 'jszip'

Vue.config.productionTip = false

new Vue({
  name: 'Root',
  router,
  store,
  data () {
    return {
      filesLoaded: 0,
      requiredFiles: 0,
      zip: false
    }
  },
  methods: {
    onRemoteEvent (event) {
      if (event.data.name) {
        this.$bus.$emit(event.data.name, event.data.payload)
      }
    },
    onFileLoaded () {
      this.filesLoaded++
      if (this.filesLoaded === this.requiredFiles && this.zip) {
        this.zip.generateAsync({ type: 'blob' })
          .then((content) => {
            // see FileSaver.js
            this.$FileSaver(content, 'project.zip')
            this.$bus.$emit('loading', false)
          })
      }
    },
    fetchAndAddTextFile (filepath, resultName) {
      this.requiredFiles++
      fetch('/' + filepath).then(response => {
        response.text().then(text => {
          if (resultName) {
            this.zip.file(resultName, text)
          } else {
            this.zip.file(filepath, text)
          }
          this.onFileLoaded()
        })
      })
    },
    fetchAndAddBinaryFile (filepath) {
      this.requiredFiles++
      fetch('/' + filepath).then(response => {
        response.blob().then(text => {
          this.zip.file(filepath, text)
          this.onFileLoaded()
        })
      })
    },
    addCustomFiles () {
      const items = localStorage.getItem('files') || '[]'
      if (items) {
        try {
          const files = JSON.parse(items)
          this.requiredFiles += files.length
          this.zip.file('files.js', JSON.stringify(files))
          files.forEach((file) => {
            const content = localStorage.getItem(file) || ''
            this.zip.file('data/' + file, content)
          })
          this.filesLoaded += files.length
          this.onFileLoaded()
        } catch (e) {
          console.error('e', e)
        }
      }
    }
  },
  mounted () {
    store.commit('dom/SET_WINDOW_WIDTH', window.innerWidth)
    window.addEventListener('resize', () => store.commit('dom/SET_WINDOW_WIDTH', window.innerWidth))
    if (window.addEventListener) {
      window.addEventListener('message', this.onRemoteEvent, false)
    } else if (window.attachEvent) {
      window.attachEvent('onmessage', this.onRemoteEvent, false)
    }

    this.$bus.$on('download-sample', () => {
      this.$bus.$emit('loading', true)
      this.filesLoaded = 0
      this.requiredFiles = 0
      this.zip = new JSZip()
      this.addCustomFiles()
      this.fetchAndAddTextFile('player.html', 'index.html')
      this.fetchAndAddBinaryFile('55_TankPrototype.data')
      this.fetchAndAddBinaryFile('55_TankPrototype.wasm')
      this.fetchAndAddTextFile('55_TankPrototype.wasm.map')
      this.fetchAndAddTextFile('55_TankPrototype.js')
      // fetch('/player.html').then(response => {
      //   response.text().then(text => {
      //     zip.file('index.html', text)
      //
      //     fetch('/55_TankPrototype.data').then(response => {
      //       response.text().then(text => {
      //         zip.file('55_TankPrototype.data', text)
      //
      //         fetch('/55_TankPrototype.wasm').then(response => {
      //           response.text().then(text => {
      //             zip.file('55_TankPrototype.wasm', text)
      //
      //             fetch('/55_TankPrototype.js').then(response => {
      //               response.text().then(text => {
      //                 zip.file('55_TankPrototype.js', text)
      //
      //                 console.log('Generating zip archive!')
      //                 zip.generateAsync({ type: 'blob' })
      //                   .then((content) => {
      //                     // see FileSaver.js
      //                     this.$FileSaver(content, 'example.zip')
      //                   })
      //               })
      //             })
      //           })
      //         })
      //       })
      //     })
      //   })
      // })
      // zip.generateAsync({ type: 'blob' })
      //   .then((content) => {
      //     // see FileSaver.js
      //     this.$FileSaver(content, 'example.zip')
      //   })

    //   const img = zip.folder('images')
    //   img.file('smile.gif', 'aaaa', { base64: true })
    //   zip.generateAsync({ type: 'blob' })
    //     .then((content) => {
    //       // see FileSaver.js
    //       this.$FileSaver(content, 'example.zip')
    //     })
    })
  },

  beforeDestroy () {
    window.removeEventListener('resize', () => store.commit('dom/SET_WINDOW_WIDTH', window.innerWidth))
  },
  render: h => h(AppLayout)
}).$mount('#app')
