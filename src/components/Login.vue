<template>
  <div class="login_container">
    <div class="login_box">
      <!--头像区域-->
      <div class="avatar_box">
        <img src="../assets/profile.jpg" alt="">
      </div>
      <!--登录表单区域-->
      <el-form :model="loginForm" ref="loginFormRef" :rules="loginFormRules" label-width="0px" class="login_form">
        <!--用户名-->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user"></el-input>
        </el-form-item>
        <!--密码-->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-lock"></el-input>
        </el-form-item>
        <!--按钮区域-->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单验证规则对象，通过prop绑定相应规则
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 8, message: '长度在 3 到 8 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login () {
      this.$refs.loginFormRef.validate(valid => {
        console.log(valid)
        if (valid) {
          this.$http.post('/login', this.loginForm).then(res => {
            res = res.data
            console.log(res)
            if (res.meta.status === 200) {
              // 向组件传递登录的username
              this.$store.commit('setLoginName', this.loginForm.username)
              this.$message.success('登录成功')
              // 1.登录成功后的token保存到客户端的sessionStorage中
              // 1.1 项目中的除登录外其他API接口必须在登录后才能访问
              // 1.2 token只在当前网站打开期间生效，故保存在sessionStorage
              window.sessionStorage.setItem('token', res.data.token)
              // 2.通过编程式导航跳转到后台主页 /home
              this.$router.push('/home')
            } else {
              this.$message.error('登录失败')
            }
          }, error => {
            console.log(error)
          })
        } else {

        }
      })
    },
    // 点击重置按钮
    resetLoginForm () {
      console.log(this)
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    position: relative;
    height: 100%;
    background-color: #2b4b6b;
  }
  .login_box {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%,-50%);
    width: 450px;
    height: 300px;
    background-color: aliceblue;
    border-radius: 3px;

    .avatar_box {
      position: absolute;
      left: 50%;
      transform: translate(-50%,-50%);
      height: 130px;
      width: 130px;
      padding: 10px;
      background-color: aliceblue;
      border: #eee 1px solid;
      border-radius: 50%;
      box-shadow: 0 0 10px #ddd;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }
    .btns {
      display: flex;
      justify-content: flex-end;
    }
    .login_form {
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
    }
  }
</style>
