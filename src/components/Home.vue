<template>
  <el-container>
    <!--头部区域-->
    <el-header>
      <div>
        <img src="../assets/mylogo.png" alt="" width="130px">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--主体区域-->
    <el-container>
      <!--侧边栏区域-->
      <el-aside :width="isCollapse? '70px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          unique-opened
          :collapse="isCollapse" :collapse-transition="false"
          :router="true"
          :default-active="$route.path"
          background-color="#333744" text-color="#fff" active-text-color="#ffd04b">
          <!--一级菜单-->
          <el-submenu :index="index + ''" v-for="(item,index) in menuList" :key="item.id">
            <!--一级菜单的模板区域-->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!--二级菜单-->
            <!--开启router功能，index作为跳转的path-->
            <el-menu-item :index="'/' + subItem.path" v-for="(subItem) in item.children" :key="subItem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!--右侧主体区域-->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      // 左侧菜单数据
      menuList: [],
      iconsObj: {
        125: 'el-icon-user-solid',
        103: 'el-icon-s-marketing',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-claim',
        145: 'el-icon-s-data'
      },
      isCollapse: false
    }
  },
  methods: {
    logout () {
      // 清空token并跳转到登录页
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    getMenuList () {
      this.$http.get('/menus').then(res => {
        res = res.data
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menuList = res.data
        console.log(this.menuList)
      })
    },
    // 点击按钮折叠菜单
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    }
  },
  created () {
    this.getMenuList()
  }
}
</script>

<style lang="less" scoped>
  .el-container {
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: white;
    font-size: 20px;
    > div {
      display: flex;
      align-items: center;
      > img {
        margin-left: 20px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
  }
  .el-main {
    background-color: #eaedf1;
  }
  .el-menu {
    border-right: none;
  }
  .toggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
  }

</style>
