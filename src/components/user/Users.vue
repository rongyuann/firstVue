<template>
    <div>
      <!--面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!--卡片视图区域-->
      <el-card class="box-card">
        <!--搜索添加区域-->
        <el-row :gutter="20">
          <el-col :span="10">
            <el-input v-model="queryInfo.query" clearable @clear="getUserList" placeholder="请输入内容">
              <el-button @click="getUserList" slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
        </el-row>

        <!--用户列表区域-->
        <el-table :data="userList" border stripe>
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="用户名" prop="username"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="电话" prop="mobile"></el-table-column>
          <el-table-column label="角色" prop="role_name"></el-table-column>
          <el-table-column label="状态">
            <!--作用域插槽-->
            <template slot-scope="scope">
              <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180px">
            <template slot-scope="scope">
              <el-button type="primary" @click="showEditDialog(scope.row.id)" icon="el-icon-edit" circle size="mini"></el-button>
              <el-button type="danger" @click="removeUserById(scope.row.id)" icon="el-icon-delete" circle size="mini"></el-button>
              <el-tooltip content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" @click="setRole(scope.row)" icon="el-icon-setting" circle size="mini"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!--分页区域-->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </el-card>

      <!--添加用户对话框-->
      <el-dialog
        title="添加用户"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
        <span>
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="mobile">
              <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>

          </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="info" @click="resetAddForm">重 置</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!--修改用户对话框-->
      <el-dialog
        title="修改用户信息"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
        <span>
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef">
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="电话" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>

          </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>

      <!--分配角色对话框-->
      <el-dialog
        title="分配角色"
        :visible.sync="setRoleDialogVisible"
        width="50%"
        @close="setRoleDialogClosed">
        <div>
          <p>当前的用户: {{userInfo.username}}</p>
          <p>当前的角色: {{userInfo.role_name}}</p>
          <p>分配新角色:
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option v-for="role in rolesList" :key="role.id" :label="role.roleName" :value="role.id"></el-option>
            </el-select>
          </p>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Users',
  data () {
    // 自定义校验规则
    const checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('邮箱格式不正确'))
    }
    const checkMobile = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('手机号格式不正确'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        pagenum: 1, // 当前页码
        pagesize: 3 // 每页显示条数
      },
      userList: [],
      total: 0,
      addDialogVisible: false, // 控制添加用户对话框的显示于隐藏
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { mix: 3, max: 10, message: '用户名长度在3到10个字符间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { mix: 6, max: 15, message: '密码长度在6到15个字符间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户的表单数据
      editForm: {},
      editDialogVisible: false, // 控制修改用户对话框的显示于隐藏
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入电话', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      userInfo: {}, // 被分配角色的用户信息
      rolesList: [], // 所有角色的数据列表
      selectedRoleId: '' // 已选中的角色id值
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    getUserList () {
      this.$http.get('/users', {
        params: this.queryInfo
      }).then(res => {
        res = res.data
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.userList = res.data.users
        this.total = res.data.total
      })
    },
    // 监听pagesize改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
      console.log(`每页${newSize}条`)
    },
    // 监听pagenum当前页码改变的事件
    handleCurrentChange (currentPage) {
      this.queryInfo.pagenum = currentPage
      this.getUserList()
      console.log(`当前页:${currentPage}页`)
    },
    // 监听Switch状态的改变
    async userStateChanged (userInfo) {
      console.log(userInfo)
      // this.$http.put('users/:uId/state/:type')
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    // 重置添加用户表单
    resetAddForm () {
      this.$refs.addFormRef.resetFields()
    },
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) return
        const { data: res } = await this.$http.post('/users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        // 关闭对话框，重新获取用户列表数据
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    // 控制修改用户对话框显示
    async showEditDialog (userId) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`/users/${userId}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
    },
    // 监听修改用户对话框的关闭事件，重置表单
    editDialogClosed () {
      this.$message.info('已取消修改用户')
      this.$refs.editFormRef.resetFields()
    },
    editUserInfo () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`/users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        // 关闭对话框，重新获取用户列表数据
        this.editDialogVisible = false
        this.getUserList()
      })
    },
    // 根据ID删除对应用户信息
    removeUserById (userId) {
      // 弹框提示是否删除数据
      this.$confirm('此操作将删除该用户，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/users/${userId}`).then(res => {
          res = res.data
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          this.queryInfo.pagenum = 1
          this.getUserList()
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 展示分配角色对话框
    async setRole (userInfo) {
      this.userInfo = userInfo
      // 展示对话框前获取所有角色列表
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rolesList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮，保存分配的角色
    async saveRoleInfo () {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(`/users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getUserList()

      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话框的关闭事件, 重置表单
    setRoleDialogClosed () {
      this.selectedRoleId = ''
      this.userInfo = {}
    },
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    }
  }
}
</script>

<style scoped>
  .el-breadcrumb {
    font-size: 12px;
  }
  .box-card {
    margin: 15px;
    box-shadow: 0 1px 1px rgba(0,0,0,0.15);
  }
</style>
