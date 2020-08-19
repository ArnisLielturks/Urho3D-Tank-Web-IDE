<template>
  <div id="app">
    <UiToastList></UiToastList>
    <Loader v-show="loading"></Loader>
    <div id="top-half" class="row">
      <input type="checkbox" class="hideBox" id="hideAce"/>
      <div id="ace" class="column top-column resizable">
        <CodeEditor>
        </CodeEditor>
      </div>

      <Preview id="player" class="column top-column">

      </Preview>
    </div>
    <div id="bottom-half" class="row">
      <Messages id="console" class="column bottom-column resizable"></Messages>
      <ProjectStructure id="browser" class="column bottom-column resizable"></ProjectStructure>
      <div id="logo" class="column bottom-column">
        <img class="preview" v-if="url" :src="url" width="80%">
      </div>
    </div>
  </div>
</template>

<script>
import Loader from '@/components/Loader'
import CodeEditor from '@/components/CodeEditor'
import Preview from '@/components/Preview'
import ProjectStructure from '@/components/ProjectStructure'
import Messages from '@/components/Messages'
import UiToastList from '@/components/UIToastList'

export default {
  name: 'AppLayout',
  components: {
    UiToastList,

    Messages,
    ProjectStructure,
    Preview,
    CodeEditor,
    Loader
  },
  data () {
    return {
      loading: false,
      url: false
    }
  },
  mounted () {
    this.$bus.$on('loading', (loading) => {
      this.loading = loading
    })

    setTimeout(() => {
      this.loading = false
    }, 5000)

    this.$bus.$on('binary-file-loaded', (payload) => {
      let type = 'image/png'
      if (payload.filename.endsWith('.jpg')) {
        type = 'image/jpeg'
      }
      if (payload.filename.endsWith('.icns')) {
        type = 'image/icns'
      }
      const HEAPU8 = document.getElementById('frame').contentWindow.HEAPU8
      const buffer = new Uint8Array(HEAPU8.subarray(payload.ptr, payload.ptr + payload.size))
      const blob = new Blob([buffer], { type: type })
      this.url = URL.createObjectURL(blob)
      console.log('url', this.url)
      setTimeout(() => {
        URL.revokeObjectURL(this.url)
      }, 10000)
    })
  }
}
</script>
<style>
  .preview {

  }
</style>
