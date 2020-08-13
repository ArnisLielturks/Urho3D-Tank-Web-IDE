<template>
  <div class="list">
    <div v-shortkey="['esc']" @shortkey="adding = false" v-if="adding">
    </div>
    <div class="add-file">
      <div class="preview" v-if="adding">
        Path: {{pendingNode.fullname}}/{{filename}}
      </div>
      <input class="filename" ref="filename" v-model="filename" placeholder="scriptname.as" v-if="adding">
      <div class="button" v-show="adding" @click="addNewFile">
          Add
      </div>
    </div>
    <Tree id="my-tree-id" ref="my-tree-ref" :custom-options="myCustomOptions" :custom-styles="myCustomStyles" :nodes="engineFiles"></Tree>
  </div>
</template>

<script>
import Tree from '../components/Tree'

export default {
  name: 'ProjectStructure',
  components: {
    Tree
  },
  data () {
    return {
      files: [],
      adding: false,
      filename: '',
      engineFiles: [],
      projectStructureTimer: false,
      lastFileId: 0,
      pendingNode: false
    }
  },
  computed: {
    myCustomStyles () {
      return {
        tree: {
          height: 'auto',
          maxHeight: '300px',
          overflowY: 'visible',
          display: 'inline-block'
        },
        row: {
          width: '500px',
          cursor: 'pointer',
          child: {
            height: '20px'
          }
        },
        text: {
          style: {},
          active: {
            style: {
              'font-weight': 'bold',
              color: '#2ECC71'
            }
          }
        },
        addNode: {
          class: 'fa fa-plus',
          style: {
            color: '#009900'
          }
        },
        selectIcon: {
          class: 'fa fa-folder',
          style: {
            color: '#007AD5'
          },
          active: {
            class: 'fa fa-folder-open',
            style: {
              color: '#2ECC71'
            }
          }
        },
        expanded: {
          class: 'fa fa-angle-right expanded_icon'
        }
      }
    },
    myCustomOptions () {
      return {
        treeEvents: {
          expanded: {
            state: false
          },
          collapsed: {
            state: false
          },
          selected: {
            state: false
          }
          // checked: {
          //   state: true,
          //   fn: this.myCheckedFunction
          // }
        },
        events: {
          expanded: {
            state: true
          },
          selected: {
            fn: this.selectNode,
            state: true
          },
          checked: {
            state: false
          },
          editableName: {
            state: true,
            calledEvent: 'expanded'
          }
        },
        addNode: {
          state: true,
          fn: this.addNode,
          appearOnHover: false
        },
        editNode: { state: false, fn: null, appearOnHover: true },
        deleteNode: {
          state: true,
          fn: this.deleteNode,
          appearOnHover: true
        },
        showTags: true
      }
    }
  },
  methods: {
    getFullName (node) {
      let currentNode = node
      let name = node.text
      while (currentNode.parent) {
        name = currentNode.parent.text + '/' + name
        currentNode = currentNode.parent
      }
      return name
    },
    selectNode: function (node) {
      this.$bus.$emit('edit-file', node.fullname)
    },
    addNode: function (node) {
      this.adding = true
      this.pendingNode = node
      this.$nextTick(() => this.$refs.filename.focus())
      console.log('this.$refs.filename.$el.focus()', this.$refs)
      // window.scrollTo(0, 0)
    },
    deleteNode: function (node) {
      console.log('deleteNode', node)
      if (localStorage.getItem(node.fullname) !== null) {
        localStorage.removeItem(node.fullname)
        const index = this.files.indexOf(node.fullname)
        if (index >= 0) {
          this.files.splice(index, 1)
          this.saveToStorage()
          this.updateTree()
        }
      }
    },
    loadFromStorage () {
      const items = localStorage.getItem('files') || '[]'
      if (items) {
        try {
          this.files = JSON.parse(items)
        } catch (e) {
          console.error('e')
        }
      }
      this.files.sort()

      let engineFiles = localStorage.getItem('engine_files') || '[]'
      if (engineFiles) {
        try {
          engineFiles = JSON.parse(engineFiles)
        } catch (e) {
          console.error('e')
        }
      }

      this.files.forEach((item) => {
        engineFiles.push(item)
      })
      engineFiles.sort()

      this.engineFiles = this.processFiles(engineFiles)
      this.engineFiles.sort((a, b) => {
        if (a.nodes.length && !b.nodes.length) {
          return -1
        }
        if (!a.nodes.length && b.nodes.length) {
          return 1
        }
        if (a.text < b.text) {
          return -1
        }
        if (a.text > b.text) {
          return 1
        }
        return 0
      })
      this.updateTree()
    },
    saveToStorage () {
      // Sort the files so that scripts appear last and are loaded last in the player
      this.files.sort((a, b) => {
        const partsA = a.split('.')
        const partsB = b.split('.')
        const extA = partsA[partsA.length - 1]
        const extB = partsB[partsB.length - 1]
        if (extA === 'as') {
          return 1
        } else if (extB === 'as') {
          return -1
        } else {
          return 0
        }
      })
      localStorage.setItem('files', JSON.stringify(this.files))
    },
    addNewFile () {
      const fullname = this.getFullName(this.pendingNode) + '/' + this.filename
      this.pendingNode.nodes.push({
        text: this.filename,
        id: this.lastFileId++,
        nodes: [],
        parent: this.pendingNode,
        icon: 'fa fa-file',
        icon_expanded: 'fa fa-file',
        style: 'color: #990000',
        style_selected: 'color: #990000',
        deletable: true,
        fullname: fullname
      })

      if (this.files.includes(fullname)) {
        this.$store.commit('toast/NEW', { message: 'File already exists', duration: 2000, type: 'warning' })
      } else if (!this.filename) {
        this.$store.commit('toast/NEW', { message: 'No name specified', duration: 2000, type: 'warning' })
      } else {
        this.files.push(fullname)
        this.saveToStorage()
        localStorage.setItem(fullname, '')
        this.adding = false
        this.$bus.$emit('edit-file', fullname)
      }
      this.filename = ''
      this.files.sort()
      this.updateTree()
    },
    changeFile (file) {
      console.log('Changing file', file)
      this.$bus.$emit('edit-file', file)
    },
    updateTree () {
      this.engineFiles.forEach((node) => {
        this.processSingleNode(node)
      })
    },
    processSingleNode (node) {
      node.style = 'color: #ee9944'
      node.style_selected = 'color: #00000'
      node.nodes.forEach((child) => {
        this.processSingleNode(child)
      })
      if (localStorage.getItem(node.fullname) !== null) {
        node.style = 'color: #990000'
        node.style_selected = 'color: #990000'

        let currentParent = node.parent
        while (currentParent) {
          currentParent.style = node.style
          currentParent.style_selected = node.style_selected
          currentParent = currentParent.parent
        }
      }
    },
    deleteFile (index) {
      const file = this.files[index]
      this.files.splice(index, 1)
      localStorage.removeItem(file)
      this.saveToStorage()
      this.$bus.$emit('delete-file', file)
    },

    convertItem (name, children, parent) {
      const node = {
        text: name,
        id: this.lastFileId++,
        nodes: [],
        deletable: localStorage.getItem(name) !== null,
        parent: parent,
        icon: 'fa fa-folder',
        icon_expanded: 'fa fa-folder-open',
        style: 'color: #ee9944',
        style_selected: 'color: #00000'
      }
      const fullname = this.getFullName(node)
      node.fullname = fullname
      const nodes = []
      if (Object.keys(children).length > 0) {
        for (const x in children) {
          nodes.push(this.convertItem(x, children[x], node))
        }
      }
      node.nodes = nodes
      if (node.nodes.length === 0) {
        node.icon = 'fa fa-file'
      }
      if (node.deletable) {
        node.style = 'color: #990000'
      }
      return node
    },
    processFiles (files) {
      const folderStruct = {}
      files.forEach((file) => {
        const parts = file.split('/')
        const parent = parts[0]
        if (!folderStruct[parent]) {
          folderStruct[parent] = {}
        }
        let current = folderStruct[parent]
        for (let i = 1; i < parts.length; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {}
          }
          current = current[parts[i]]
        }
      })
      const tree = []
      for (const x in folderStruct) {
        tree.push(this.convertItem(x, folderStruct[x]))
      }

      return tree
    },
    addNewCustomFile (filename) {
      if (!this.files.includes(filename)) {
        this.files.push(filename)
        this.saveToStorage()
      }
    }
  },
  mounted () {
    this.loadFromStorage()

    this.$bus.$on('refresh', () => {
      this.loadFromStorage()
    })
    this.$bus.$on('list-resource', (name) => {
      clearTimeout(this.projectStructureTimer)
      this.projectStructureTimer = setTimeout(() => {
        this.loadFromStorage()
        clearTimeout(this.projectStructureTimer)
      }, 1000)
    })
    this.$bus.$on('save-file', (file) => {
      this.addNewCustomFile(file)
      this.updateTree()
    })
  }
}
</script>

<style scoped lang="scss">
.add-file {
  width: 100%;
  float: left;
  padding: 10px;
  .button {
    float: left;
  }
  .filename {
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
    height: 24px;
    float: left;
  }
  .preview {
    margin-bottom: 4px;
    color: #ffffff;
  }
}
.list {
  overflow-y: scroll;
  width: 100%;
  height: calc(100vh / 3);
  display: inline-block;
  padding: 5px;
}
.actions {
  width: 100%;
}
.file {
  width: 100%;
  margin: 0px;
}
.edit-file {
  cursor: pointer;
}
.edit-file:hover {
  color: #adadad;
}
.title {
  overflow: hidden;
  font-size: 14px;
}
.success {
  color: #4cd964;
}
.danger {
  color: #e01b3c;
}
hr {
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
h1 {
  font-weight: bold;
  margin-bottom: 10px;
}
.focus {
  border: 2px solid #ee0000;
}
.path-preview {
  color: #fff;
}
</style>
