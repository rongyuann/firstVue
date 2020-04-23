<template>
    <div>
      <!--面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!--卡片视图区域-->
      <el-card>
        <el-row>
          <el-col>
            <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
          </el-col>
        </el-row>
        <el-table stripe border :data="rolesList">
          <el-table-column type="expand">
            <template slot-scope="scope">
<!--              <pre>{{scope.row}}</pre>-->
              <el-row :class="['bdbottom', i1 === 0 ? 'bdtop':'','vertical-center']"
                      v-for="(item1,i1) in scope.row.children" :key="item1.id">
                <!--一级权限-->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <!--二、三级权限-->
                <el-col :span="19">
                  <!--渲染二级权限-->
                  <el-row :class="[i2===0 ? '':'bdtop','vertical-center']" v-for="(item2,i2) in item1.children" :key="item2.id">
                    <el-col :span="6">
                      <el-tag type="success"
                              closable @close="removeRightById(scope.row,item2.id)"
                      >{{item2.authName}}</el-tag>
                      <i class="el-icon-arrow-right"></i>
                    </el-col>
                    <el-col :span="18">
                      <el-tag type="warning"
                              v-for="(item3) in item2.children" :key="item3.id"
                              closable @close="removeRightById(scope.row,item3.id)"
                      >{{item3.authName}}</el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <!--索引列-->
          <el-table-column label="#" type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope">
              <el-button type="primary" @click="showEditRoleDialog(scope.row.id)" icon="el-icon-edit" size="mini">编辑</el-button>
              <el-button type="danger" @click="removeRoleById(scope.row.id)" icon="el-icon-delete" size="mini">删除</el-button>
              <el-button @click="showSetRightDialog(scope.row)" type="warning" icon="el-icon-setting" size="mini">分配权限</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!--分配权限对话框-->
      <el-dialog
        title="分配角色权限"
        :visible.sync="rightsDialogVisible"
        width="50%"
        @close="setRightsDialogClosed">
        <!--树形控件-->
        <span>
          <el-tree :data="rightsTree" show-checkbox
                   :props="treeProps" node-key="id"
                   default-expand-all :default-checked-keys="defKeys"
                   ref="rightsTreeRef"></el-tree>
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="rightsDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>

      <!--添加角色对话框-->
      <el-dialog
        title="添加角色"
        :visible.sync="addRoleDialogVisible"
        width="50%"
        @close="addRoleDialogClosed">
        <el-form :model="addRoleForm" ref="addRoleFormRef" :rules="addRoleFormRules">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>

      <!--编辑角色对话框-->
      <el-dialog
        title="编辑角色"
        :visible.sync="editRoleDialogVisible"
        width="50%"
        @close="editRoleFormClosed">
        <el-form :model="editRoleForm" ref="editRoleFormRef" :rules="editRoleFormRules">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRoleInfo">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      rolesList: [], // 角色列表
      rightsDialogVisible: false, // 控制分配权限对话框的显示与隐藏
      rightsTree: [], // 权限列表（树形结构）
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defKeys: [], // 默认选中的节点id值
      roleId: '', // 当前提交角色权限分配的角色id
      addRoleDialogVisible: false, // 控制添加角色对话框的显示与隐藏
      addRoleForm: { // 添加角色表单
        roleName: '',
        roleDesc: ''
      },
      addRoleFormRules: { // 添加角色验证规则
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 9, message: '角色名称在2到9个字符', trigger: 'blur' }
        ]
      },
      editRoleDialogVisible: false, // 控制编辑角色对话框的显示与隐藏
      // 修改用户的表单数据
      editRoleForm: {},
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 9, message: '角色名称在2到9个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    async getRolesList () {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rolesList = res.data
    },
    // 根据ID删除对应权限
    removeRightById (role, rightId) {
      this.$confirm('此操作将删除该角色权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(res => {
          res = res.data
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)

          // this.getRolesList() // 导致页面完整重新渲染
          role.children = res.data
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      // 获取权限数据
      const { data: res } = await this.$http.get('/rights/tree')
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightsTree = res.data
      // 递归获取已勾选的三级节点
      this.getLeafKeys(role, this.defKeys)
      this.rightsDialogVisible = true

      this.roleId = role.id // 便于后续角色权限更新
    },
    // 递归获取角色下三级权限的id
    getLeafKeys (node, arr) {
      if (!node.children) {
        // 不包含children则为三级节点
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightsDialogClosed () {
      this.defKeys = []
    },
    // 角色权限更新
    allotRights () {
      const keys = [...this.$refs.rightsTreeRef.getCheckedKeys(),
        ...this.$refs.rightsTreeRef.getHalfCheckedKeys()]
      const keysStr = keys.join(',')
      this.$http.post(`/roles/${this.roleId}/rights`, { rids: keysStr }).then(res => {
        res = res.data
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getRolesList()
        this.rightsDialogVisible = false
      })
    },
    // 添加角色
    addRole () {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/roles', this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getRolesList()
        this.addRoleDialogVisible = false
      })
    },
    // 编辑角色
    // 点击编辑获取角色id
    async showEditRoleDialog (roleId) {
      this.editRoleDialogVisible = true
      const { data: res } = await this.$http.get(`/roles/${roleId}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editRoleForm = res.data
      console.log(this.editRoleForm)
    },
    editRoleInfo () {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`/roles/${this.editRoleForm.roleId}`, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(`角色${this.editRoleForm.roleId}修改成功`)

        this.getRolesList()
        this.editRoleDialogVisible = false
      })
    },
    // 监听修改角色对话框关闭事件,重置表单
    editRoleFormClosed () {
      this.$refs.editRoleFormRef.resetFields()
    },
    // 删除角色
    removeRoleById (roleId) {
      // 点击删除弹框提示
      this.$confirm('此操作将删除该角色，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$http.delete(`/roles/${roleId}`).then(res => {
          res = res.data
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          this.getRolesList()
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 监听添加角色对话框关闭事件,重置表单
    addRoleDialogClosed () {
      this.addRoleForm.roleDesc = ''
      this.$refs.addRoleFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 10px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }
  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vertical-center {
    display: flex;
    align-items: center;
  }
</style>
