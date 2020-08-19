<template>
  <div>
<!--    <div class=centered>-->
<!--      <div class=emscripten id=status>Downloading...-->
<!--      </div>-->
<!--      <progress hidden id=progress max=100 value=10>-->
<!--      </progress>-->
<!--    </div>-->
<!--    <canvas height=100 id=canvas oncontextmenu=event.preventDefault() style=display:none tabindex=-1 width=100>-->
<!--    </canvas>-->
<!--    <div id=fullscreen-button onclick=enterFullscreen() style=display:none>-->
<!--      <svg enable-background="new 0 0 512 512" id=Layer_1 version=1.1 viewBox="0 0 512 512" x=0px xml:space=preserve xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink y=0px>-->
<!--            <path d="M93.1,139.6l46.5-46.5L93.1,46.5L139.6,0H0v139.6l46.5-46.5L93.1,139.6z M93.1,372.4l-46.5,46.5L0,372.4V512h139.6-->
<!--                    l-46.5-46.5l46.5-46.5L93.1,372.4z M372.4,139.6H139.6v232.7h232.7V139.6z M325.8,325.8H186.2V186.2h139.6V325.8z M372.4,0-->
<!--                    l46.5,46.5l-46.5,46.5l46.5,46.5l46.5-46.5l46.5,46.5V0H372.4z M418.9,372.4l-46.5,46.5l46.5,46.5L372.4,512H512V372.4l-46.5,46.5-->
<!--                    L418.9,372.4z"/>-->
<!--        </svg>-->
<!--    </div>-->
<!--    <div v-shortkey="['esc']" @shortkey="exit()">-->
<!--    </div>-->
    <div class="button" @click="testPointers()">Test pointers</div>
    <iframe id="frame" src="/player.html" style="width: 100%; height: 100%;" v-if="shouldRun"></iframe>
  </div>
</template>

<script>
export default {
  name: 'Preview',
  data () {
    return {
      shouldRun: true
    }
  },
  methods: {
    testPointers () {
      const Module = document.getElementById('frame').contentWindow.Module
      if (Module.MultiplyArray) {
        // Create example data to test float_multiply_array
        const data = new Float32Array([1, 2, 3, 4, 5])

        // Get data byte size, allocate memory on Emscripten heap, and get pointer
        const nDataBytes = data.length * data.BYTES_PER_ELEMENT
        const dataPtr = Module._malloc(nDataBytes)

        // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
        const dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes)
        dataHeap.set(new Uint8Array(data.buffer))

        // const float_multiply_array = Module.cwrap(
        //   'MultiplyArray', 'number', ['number', 'number', 'number']
        // );
        // Call function and get result
        Module.MultiplyArray(2, dataHeap.byteOffset, data.length)
        const result = new Float32Array(dataHeap.buffer, dataHeap.byteOffset, data.length)

        console.log('result', result)
        // Free memory
        Module._free(dataHeap.byteOffset)
      } else {
        console.log('Module doesnt have MultiplyArray function')
      }
    },
    exit () {
      this.shouldRun = false
    },
    getFileContent (file) {
      return localStorage.getItem(file) || ''
    }
  },
  mounted () {
    this.$bus.$on('rerun-preview', () => {
      this.shouldRun = false
      setTimeout(() => {
        this.shouldRun = true
      }, 500)
    })
    this.$bus.$on('save-file', (item) => {
      document.getElementById('frame').contentWindow.Module.UploadSingleFile(item)
    })
    this.$bus.$on('update-preview', () => {
      let files = []
      const content = localStorage.getItem('files')
      if (content) {
        try {
          files = JSON.parse(content)
        } catch (e) {
        }
      }
      files.forEach((item) => {
        try {
          const result = document.getElementById('frame').contentWindow.Module.UploadSingleFile(item)
          console.log('result', result)
        } catch (e) {
          console.error('File upload error', e)
        }
      })
    })
    // this.$ModuleInit()
  }
}
</script>

<style scoped>
.emscripten {
  padding-right: 0;
  margin-left: auto;
  margin-right: auto;
  display: block;
}
div.emscripten {
  text-align: center;
}
#fullscreen-button {
  position: absolute;
  width: 2em;
  height: 2em;
  left: 50%;
  top: 4px;
  -moz-transform: translateX(-50%);
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
  stroke: #999;
  stroke-width: 10px;
}
#fullscreen-button:hover {
  fill: #999;
  cursor: pointer;
}
#canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  border: 1px solid #000;
  border: none;
  cursor: default !important;
}
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  -moz-transform: translateX(-50%) translateY(-50%);
  -webkit-transform: translateX(-50%) translateY(-50%);
  transform: translateX(-50%) translateY(-50%);
}

</style>
