<template>
    <div>
      <!--面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      </el-breadcrumb>

      <!--卡片视图区域-->
      <el-card>
        <!--警告区域-->
        <el-alert :closable="false" title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon></el-alert>
        <!--商品选择区域-->
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <el-cascader
              v-model="selectedCategoryKeys"
              :options="categoryList"
              :props="categoryProps"
              @change="handleChange"></el-cascader>
          </el-col>
        </el-row>
        <template>
          <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane label="动态参数" name="many">
              <el-button type="primary" :disabled="isDisabled" @click="addParamDialogVisible = true">添加参数</el-button>
              <!--动态参数表格-->
              <el-table :data="manyTableData"
                        border stripe>
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <!--循环渲染tag标签-->
                    <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index"
                            closable @close="handleClose(scope.row,index)">
                      {{item}}
                    </el-tag>
                    <!--new tag标签切换-->
                    <!--inputVisible和inputValue保证每个item不同-->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @blur="handleInputConfirm(scope.row)">
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="primary" @click="showEditParamDialog(scope.row.attr_id)" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" @click="removeParamById(scope.row.attr_id)" icon="el-icon-delete" size="mini">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
              <el-button type="primary" :disabled="isDisabled" @click="addParamDialogVisible = true">添加属性</el-button>
              <!--静态属性表格-->
              <el-table :data="onlyTableData"
                        border stripe>
                <el-table-column type="expand">
                  <template slot-scope="scope">
                    <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index"
                            closable @close="handleClose(scope.row,index)">
                      {{item}}
                    </el-tag>
                    <!--new tag标签切换-->
                    <!--inputVisible和inputValue保证每个item不同-->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @blur="handleInputConfirm(scope.row)">
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="primary" @click="showEditParamDialog(scope.row.attr_id)" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" @click="removeParamById(scope.row.attr_id)" icon="el-icon-delete" size="mini">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </template>
      </el-card>

      <!--添加动态参数/静态属性的对话框-->
      <el-dialog
        :title="'添加'+ dialogTitle"
        :visible.sync="addParamDialogVisible"
        width="50%"
        @close="addParamFormClosed">
        <!--添加动态参数/静态属性的表单-->
        <el-form :model="addParamForm"
                 :rules="addParamFormRules"
                 ref="addParamFormRef">
          <el-form-item :label="dialogTitle" prop="attr_name">
            <el-input v-model="addParamForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addParamDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParam">确 定</el-button>
        </span>
      </el-dialog>

      <!--修改动态参数/静态属性的对话框-->
      <el-dialog
        :title="'修改'+ dialogTitle"
        :visible.sync="editParamDialogVisible"
        width="50%"
        @close="editParamFormClosed">
        <!--添加动态参数/静态属性的表单-->
        <el-form :model="editParamForm"
                 :rules="editParamFormRules"
                 ref="editParamFormRef">
          <el-form-item :label="dialogTitle" prop="attr_name">
            <el-input v-model="editParamForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editParamDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParam">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      categoryList: [], // 商品分类列表
      categoryProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedCategoryKeys: [], // 选中的选择项的cat_id(从父到子)
      activeName: 'many', // 被激活的页签的名称
      manyTableData: [], // 动态参数数据
      onlyTableData: [], // 静态属性数据
      addParamDialogVisible: false, // 控制添加参数属性显示与隐藏
      addParamForm: { // 添加参数的表单数据对象
        attr_name: ''
      },
      addParamFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      editParamDialogVisible: false, // 控制修改参数属性显示与隐藏
      editParamForm: { // 修改参数的表单数据对象
        attr_name: ''
      },
      editParamFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
      // inputVisible: false, // 控制按钮与文本框的切换显示
      // inputValue: '' // 文本框输入内容
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList () {
      const { data: res } = await this.$http.get('/categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.categoryList = res.data
    },
    // 级联选择器选中项变化触发
    handleChange () {
      console.log(this.selectedCategoryKeys)
      this.getParamsData()
    },
    // 获取参数数据
    async getParamsData () {
      if (this.selectedCategoryKeys.length === 3) {
        const { data: res } = await this.$http.get(`/categories/${this.categoryId}/attributes`, { params: { sel: this.activeName } })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        // console.log(res.data)

        // 获取attr_vals子属性
        res.data.forEach(item => {
          // 避免新添加的参数attr_vals为空字符串以空格分隔出现bug
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          // 控制文本框的显示与隐藏
          item.inputVisible = false
          item.inputValue = ''
        })
        console.log(res.data)

        // 判断数据类型，分别挂载
        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      } else {
        this.$message.warning('所选分类必须为第三级')
        this.selectedCategoryKeys = []
        // 已渲染表格数据清空
        this.manyTableData = []
        this.onlyTableData = []
      }
    },
    // Tab页签点击事件的处理函数
    handleTabClick () {
      console.log(this.activeName)
      this.getParamsData()
    },
    // 监听添加参数对话框关闭事件，重置表单
    addParamFormClosed () {
      this.$refs.addParamFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParam () {
      this.$refs.addParamFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(`/categories/${this.categoryId}/attributes`, {
          attr_name: this.addParamForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getParamsData()
        this.addParamDialogVisible = false
      })
    },
    async showEditParamDialog (paramId) {
      this.editParamDialogVisible = true
      // 获取所选参数id，便于后面修改
      const { data: res } = await this.$http.get(`/categories/${this.categoryId}/attributes/${paramId}`,
        { params: { attr_sel: this.activeName } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editParamForm = res.data
    },
    editParam () {
      this.$refs.editParamFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(`/categories/${this.categoryId}/attributes/${this.editParamForm.attr_id}`, {
          attr_name: this.editParamForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getParamsData()
        this.editParamDialogVisible = false
      })
    },
    editParamFormClosed () {
      this.$refs.editParamFormRef.resetFields()
    },
    // 根据id删除对应参数项
    removeParamById (paramId) {
      this.$confirm('此操作将删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`categories/${this.categoryId}/attributes/${paramId}`).then(res => {
          res = res.data
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)

          this.getParamsData()
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 对attr_vals的操作保存到数据库
    saveAttrVals (item) {
      this.$http.put(`/categories/${this.categoryId}/attributes/${item.attr_id}`, {
        attr_name: item.attr_name,
        attr_sel: item.attr_sel,
        attr_vals: item.attr_vals.join(' ')
      }).then(res => {
        res = res.data
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)

        // this.getParamsData()
      }, error => {
        console.log(error)
      })
    },
    // 文本框失去焦点或按下enter切换为标签
    handleInputConfirm (item) {
      item.inputValue = item.inputValue.trim() // 去除前后空格
      if (item.inputValue.length === 0) {
        item.inputValue = ''
        item.inputVisible = false
        this.$message.warning('tag内容不能为空')
        return
      }
      // 输入内容有效
      item.attr_vals.push(item.inputValue)

      this.saveAttrVals(item)
      item.inputValue = ''
      item.inputVisible = false
    },
    // 显示文本框
    showInput (item) {
      item.inputVisible = true
      // 文本框自动获得焦点focus
      // $nextTick页面元素被重新渲染完毕后才指定回调函数内的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除对应的参数可选项attr_vals
    handleClose (item, index) {
      item.attr_vals.splice(index, 1)
      this.saveAttrVals(item)
    }
  },
  computed: {
    // 控制添加按钮是否被启用，返回布尔值
    isDisabled () {
      return this.selectedCategoryKeys.length !== 3
    },
    // 选中的三级分类的id
    categoryId () {
      if (this.selectedCategoryKeys.length === 3) {
        return this.selectedCategoryKeys[2]
      } else {
        return null
      }
    },
    // 动态计算添加参数标题的文本
    dialogTitle () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style scoped>
  .cat_opt {
    margin: 20px 0;
  }
  .el-tag {
    margin: 10px;
  }
  .input-new-tag {
    width: 120px;
    vertical-align: center;
  }
</style>
