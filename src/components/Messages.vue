<template>
  <div>
    <div class="row messages" ref="messages">
      <div class="message" v-for="(message, index) in messages" :key="index">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Messages',
  components: {
  },
  data () {
    return {
      messages: []
    }
  },
  mounted () {
    this.$bus.$on('engine-message', (text) => {
      this.messages.push(text)
      this.$nextTick(() => {
        // this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
      })
    })
  }
}
</script>

<style scoped lang="scss">
.messages {
  height: calc(100vh / 3);
  overflow-y: scroll;
  display: inline-block;
}
.message {
  display: inline-block;
}
</style>
