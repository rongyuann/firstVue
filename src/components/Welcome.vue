<template>
  <div>
    <h1>Welcome Back ！</h1>
    <h2>{{loginName}}</h2>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Welcome',
  data () {
    return {
      username: 'Hayden'
    }
  },
  computed: {
    ...mapState(['loginName'])
  }
}
</script>

<style scoped>

</style>
