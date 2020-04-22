<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showCategoryDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!--表格区域-->
      <tree-table class="treeTable"
                  :data="categoryList"
                  :columns="columns"
                  ref="categoryListRef"
                  :selection-type="false" :expand-type="false"
                  show-index index-text="#"
                  border>
        <!--是否有效-->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightseagreen"></i>
          <i class="el-icon-error" v-if="scope.row.cat_deleted === true" style="color: lightcoral;"></i>
        </template>
        <!--排序-->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <!--操作-->
        <template slot="operation">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[5,10,15]"
        layout="total,sizes,prev,pager,next,jumper"
        :total="total"></el-pagination>
    </el-card>

    <!--添加分类的对话框-->
    <el-dialog
      title="添加分类"
      :visible.sync="addCategoryDialogVisible"
      width="50%"
      @close="addCategoryDialogClosed">
      <!--添加分类的表单-->
      <el-form :model="addCategoryForm"
               :rules="addCategoryFormRules"
               ref="addCategoryFormRef">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCategoryForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!--级联选择器，options指定数据源,props指定配置对象-->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCategoryList"
            :props="cascaderProps"
            @change="parentCategoryChanged"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCategoryDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCategory">确 定</el-button>
  </span>
    </el-dialog>
  </div>

</template>

<script>
export default {
  name: 'Category',
  data () {
    return {
      categoryList: [], // 商品列表数据
      parentCategoryList: [], // 父级商品列表数据
      cascaderProps: { // 指定级联选择器的配置对象
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      selectedKeys: [], // 选中的父级分类的id数组
      queryInfo: { // 查询条件
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0, // 总数据条数
      // 为tree-table指定列的定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        { label: '是否有效', prop: 'cat_deleted', type: 'template', template: 'isOk' },
        { label: '排序', prop: 'cat_level', type: 'template', template: 'order' },
        { label: '操作', type: 'template', template: 'operation' }
      ],
      addCategoryDialogVisible: false,
      // 添加分类的表单数据对象
      addCategoryForm: {
        cat_name: '',
        cat_pid: 0, // 父级分类的id
        cat_level: 0 // 分类的等级(默认为一级)
      },
      addCategoryFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList () {
      const { data: res } = await this.$http.get('/categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // console.log(res.data)
      this.categoryList = res.data.result
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCategoryList()
    },
    // 监听pagenum改变
    handleCurrentChange (currentPage) {
      this.queryInfo.pagenum = currentPage
      this.getCategoryList()
    },
    showCategoryDialog () {
      this.getParentCategoryList()
      this.addCategoryDialogVisible = true
    },
    // 获取父级分类列表数据
    async getParentCategoryList () {
      const { data: res } = await this.$http.get('/categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // console.log(res.data)
      this.parentCategoryList = res.data
    },
    // 选择项发生改变触发
    parentCategoryChanged (selectedKeys) {
      console.log(selectedKeys)
      // 若selectKeys>0则选中父级分类
      // 反之则未选中任何父级分类
      if (selectedKeys.length > 0) {
        // 父级分类的id
        this.addCategoryForm.cat_pid = selectedKeys[selectedKeys.length - 1]
        // 当前分类的level
        this.addCategoryForm.cat_level = selectedKeys.length
      } else {
        this.addCategoryForm.cat_pid = 0
        this.addCategoryForm.cat_level = 0
      }
    },
    // 点击按钮，添加新分类
    addCategory () {
      console.log(this.addCategoryForm)
      this.$refs.addCategoryFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('/categories', this.addCategoryForm)
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)

        this.getCategoryList()
        this.addCategoryDialogVisible = false
      })
    },
    // 监听对话框关闭事件，重置表单事件
    addCategoryDialogClosed () {
      this.$refs.addCategoryFormRef.resetFields()
      this.addCategoryForm.cat_pid = 0
      this.addCategoryForm.cat_level = 0
      this.selectedKeys = []
    }
  }
}
</script>

<style lang="less" scoped>
  .treeTable {
    margin: 15px 0;
    padding: 10px;
  }
  .el-cascader {
    width: 100%;
  }
</style>
