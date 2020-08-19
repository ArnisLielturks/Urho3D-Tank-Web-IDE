<template>
  <div>
<!--    <div class="controls">-->
<!--      <div class="btn btn-sm btn-danger" @click="clear()" data-toggle="tooltip" title="Clears all the created files and restarts the preview">-->
<!--        Clear everything-->
<!--      </div>-->
<!--      <div class="btn btn-sm btn-primary" @click="update()" data-toggle="tooltip" title="Upload all the content to the preview">-->
<!--        Update scripts-->
<!--      </div>-->
<!--      <div v-shortkey="['f9']" @shortkey="run()" class="btn btn-sm btn-warning" @click="rerun()" data-toggle="tooltip" title="Restart the preview">-->
<!--        Rerun sample-->
<!--      </div>-->
<!--    </div>-->
    <header class="toolbar">
      <div class="button" @click="saveCurrentFile()" data-toggle="tooltip" title="Save currently opened file!">Save file</div>
      <div class="button" @click="clear()" data-toggle="tooltip" title="Clear all changed files!">Clear all</div>
      <div class="button" @click="update()" data-toggle="tooltip" title="Send all changed files to the engine!">Update</div>
      <div class="button" @click="rerun()" data-toggle="tooltip" title="Restart the preview!">Restart</div>
      <div class="button" @click="downloadSample()" data-toggle="tooltip" title="Download packed sample!">Download</div>
      <label class="hide button" for="hideAce"></label>
      <img :src="url" v-if="url">
    </header>
    <ul class="nav nav-tabs">
      <li class="nav-item" v-for="(file, index) in openedFiles" :key="index">
        <div class="nav-link" :class="file == currentFile.name ? 'active' : ''" @click="openFile(file)">
          {{file}} <span class="fa fa-window-close" @click="closeFile(file)"></span>
        </div>
      </li>
    </ul>
    <div id="code-container">
      <div v-shortkey="['ctrl', 's']" @shortkey="saveCurrentFile()">
      </div>
      <div v-shortkey="['meta', 's']" @shortkey="saveCurrentFile()">
      </div>
      <editor v-model="currentFile.content" @init="editorInit" :options="editorOptions" :lang="language" theme="twilight" width="100%" height="100%"></editor>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CodeEditor',
  components: {
    editor: require('vue2-ace-editor')
  },
  data () {
    return {
      options: {
        theme: 'vs-dark'
      },
      editor: false,
      openedFiles: [],
      language: 'c_cpp',
      currentFile: {
        name: '',
        content: ''
      },
      contents: {},
      url: false
    }
  },
  computed: {
    editorOptions () {
      return {
        maxLines: 23
        // minLines: 24
      }
    }
  },
  methods: {
    downloadSample () {
      this.$bus.$emit('download-sample')
    },
    clear () {
      localStorage.clear()
      this.$bus.$emit('refresh')
      this.$bus.$emit('rerun-preview')
      this.$bus.$emit('loading', true)
    },
    update () {
      this.$bus.$emit('update-preview')
    },
    rerun () {
      this.$bus.$emit('rerun-preview')
    },
    editorInit: function () {
      require('brace/ext/language_tools')
      require('brace/mode/lua')
      require('brace/mode/c_cpp')
      require('brace/mode/xml')
      require('brace/mode/json')
      require('brace/theme/twilight')
      require('brace/snippets/lua')
      require('brace/snippets/json')
      require('brace/snippets/xml')
    },
    onChange (value) {
      console.log(value)
    },
    openFile (file) {
      if (file.endsWith('.png') || file.endsWith(('.jpg')) || file.endsWith(('.icns'))) {
        document.getElementById('frame').contentWindow.Module.GetResourceBinary(file)
        return
      }
      if (!this.openedFiles.includes(file)) {
        this.openedFiles.push(file)
      }
      this.onChanged()
      this.currentFile.name = file
      this.currentFile.content = this.getFileContent(file)
      if (file.endsWith('.xml')) {
        this.language = 'xml'
      } else if (file.endsWith('.json')) {
        this.language = 'json'
      } else if (file.endsWith('.lua')) {
        this.language = 'lua'
      } else {
        this.language = 'c_cpp'
      }
      // this.editor.setValue(this.getFileContent(file))
    },
    closeFile (file) {
      this.onChanged()
      const index = this.openedFiles.indexOf(file)
      if (index >= 0) {
        this.openedFiles.splice(index, 1)
        if (this.currentFile.name === file) {
          this.currentFile.name = false
          this.currentFile.content = ''
          this.contents[file] = false
          if (this.openedFiles.length > 0) {
            let nextIndex = index - 1
            if (nextIndex < 0) {
              nextIndex = 0
            }
            this.openFile(this.openedFiles[nextIndex])
          } else {
            fetch('/tutorial.txt').then(response => {
              response.text().then(text => {
                this.currentFile.content = text
              })
            })
          }
          console.log('this.openedFiles', this.openedFiles)
        }
      }
    },
    getFileContent (file) {
      if (this.contents[this.currentFile.name]) {
        return this.contents[this.currentFile.name]
      } else {
        let content = localStorage.getItem(file)
        if (!content) {
          try {
            content = document.getElementById('frame').contentWindow.Module.GetResource(file)
          } catch (e) {
            console.error(e)
          }
        }
        return content
      }
    },
    saveCurrentFile () {
      if (this.currentFile.name) {
        console.log('Saving file', this.currentFile.name)
        localStorage.setItem(this.currentFile.name, this.currentFile.content)
        this.$store.commit('toast/NEW', {
          message: 'File ' + this.currentFile.name + ' saved',
          duration: 2000,
          type: 'success'
        })
        this.onChanged()
        this.$bus.$emit('save-file', this.currentFile.name)
      }
    },
    onChanged () {
      if (this.currentFile.name) {
        this.contents[this.currentFile.name] = this.currentFile.content
      }
    }
  },
  mounted () {
    fetch('/tutorial.txt').then(response => {
      response.text().then(text => {
        this.currentFile.content = text
      })
    })

    this.$bus.$on('refresh', () => {
      this.currentFile.name = ''
      this.currentFile.content = ''
      this.openedFiles = []
      this.contents = {}
      fetch('/tutorial.txt').then(response => {
        response.text().then(text => {
          this.currentFile.content = text
        })
      })
    })
    this.$bus.$on('edit-file', (file) => {
      if (this.currentFile.name === file) {
        return
      }
      this.openFile(file)
    })

    this.$bus.$on('delete-file', (file) => {
      this.closeFile(file)
    })
  }
}
</script>

<style lang="scss" scoped>
  #code-container {
    width: 100%;
    z-index: 0;
    margin-top: 32px;
  }
  .tab {
    margin: 2px;
    padding: 1px;
    height: 15px;
  }
  .editor {
    width: 100%;
    height: 100%;
  }
  .nav {
    clear: both;
    font-size: 14px;
  }
  .nav-link {
    padding: 4px;
    &:hover {
      color: #339933;
    }
    &.active {
      color: #00ee00;
    }
  }
  .nav-item {
    cursor: pointer;
    float: left;
  }
  .controls {
    height: 20px;
    .btn-danger {
      background-color: #e01b3c;
    }
    .btn-primary {
      background-color: #444499;
    }
    .btn-warning {
      background-color: #aaaa00;
    }
  }
  .btn {
    color: #fff;
    border: 1px solid #000;
    width: auto;
    display: inline-block;
    float: left;
    padding: 4px;
    margin: 2px;
    cursor: pointer;
    border-radius: 3px;

    &:hover {
      background-color: #bebebe;
      color: #000;
    }
  }
</style>
