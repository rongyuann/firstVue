<template>
    <div>
      <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    logout () {
      // 清空token并跳转到登录页
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>

</style>
