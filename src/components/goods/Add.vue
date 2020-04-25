<template>
    <div>
      <!--面包屑导航区域-->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
      </el-breadcrumb>

      <!--卡片视图区域-->
      <el-card>
        <el-alert :closable="false" title="添加商品信息" type="info" show-icon center></el-alert>
        <!--步骤条区域(字符串转化为数字)-->
        <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <el-form :model="addGoodForm"
                 :rules="addGoodFormRules"
                 ref="addGoodFormRef"
                 label-position="top">
          <el-tabs tab-position="left" v-model="activeIndex" style="height: 800px"
                   :before-leave="beforeTabLeave"
                   @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
              <el-form-item  label="商品名称" prop="goods_name">
                <el-input v-model="addGoodForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item  label="商品价格" prop="goods_price">
                <el-input v-model="addGoodForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item  label="商品重量" prop="goods_weight">
                <el-input v-model="addGoodForm.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item  label="商品数量" prop="goods_number">
                <el-input v-model="addGoodForm.goods_number" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <!--级联选择器，options指定数据源,props指定配置对象-->
                <el-cascader
                  :options="categoryList"
                  :props="categoryProps"
                  @change="handleChange"
                  v-model="addGoodForm.goods_cat"
                  clearable></el-cascader>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <!--渲染表单的item项-->
              <el-form-item v-for="item in manyTableData" :key="item.attr_id"
                            :label="item.attr_name">
                <!--复选框组-->
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox :label="valItem"
                               v-for="(valItem,index) in item.attr_vals"
                               :key="index" border></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <el-form-item v-for="item in onlyTableData" :key="item.attr_id"
                            :label="item.attr_name">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <!--action 为图片上传的后台API地址-->
              <!--未使用axios-->
              <el-upload
                :action="uploadURL"
                :on-preview="handlePreview"
                :on-success="handleSuccess"
                :on-remove="handleRemove"
                list-type="picture"
                :headers="headerObj">
                <el-button type="primary">点击上传</el-button>
<!--                <div slot="tip">只能上传jpg/png文件，且不超过500kb</div>-->
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
              <!--富文本编辑器组件-->
              <quill-editor v-model="addGoodForm.goods_introduce"></quill-editor>
              <el-button @click="addGood" class="addGoodBtn" type="primary">添加商品</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-card>

      <!--图片预览-->
      <el-dialog title="图片预览" width="50%"
                 :visible.sync="picPreviewVisible">
        <h3 class="previewName">{{picPreviewName}}</h3>
        <img :src="picPreviewPath" alt="" class="previewImg">
      </el-dialog>
    </div>
</template>

<script>
export default {
  name: 'Add',
  data () {
    return {
      activeIndex: '0', // 步骤条激活索引
      addGoodForm: { // 添加商品的表单数据对象
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [], // 商品所属的(选中)的分类数组
        pics: [], // 商品图片的临时路径
        goods_introduce: '', // 商品介绍
        attrs: [] // 动态参数和静态属性
      },
      addGoodFormRules: { // 添加商品的表单数据验证规则
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      categoryList: [], // 商品分类数据列表
      categoryProps: { // 指定级联选择器的配置对象
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数
      manyTableData: [],
      // 静态属性
      onlyTableData: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload', // 上传图片url地址
      // 图片上传组件headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览路径
      picPreviewPath: '',
      picPreviewName: '',
      picPreviewVisible: false
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
      console.log(this.categoryList)
    },
    // 级联选择器选中项变化触发
    handleChange () {
      // 只允许选择三级分类
      if (this.addGoodForm.goods_cat.length !== 3) {
        this.$message.warning('只允许选择第三级分类嗷！')
        this.addGoodForm.goods_cat = []
      }
      console.log(this.addGoodForm.goods_cat)
    },
    // tab标签切换前的钩子函数
    beforeTabLeave (activeName, oldActiveName) {
      console.log('即将离开的标签页名' + oldActiveName)
      console.log('即将进入的标签页名' + activeName)
      if (oldActiveName === '0' && this.addGoodForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类嗷！')
        return false
      }
    },
    // 切换tab事件判定
    async tabClicked () {
      console.log(this.activeIndex)
      if (this.activeIndex === '1') {
        // 获取商品动态参数
        const { data: res } = await this.$http.get(`/categories/${this.addGoodForm.goods_cat[2]}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.manyTableData = res.data
        console.log(this.manyTableData)

        // 字符串分割为数组
        this.manyTableData.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
      } else if (this.activeIndex === '2') {
        // 获取静态属性
        const { data: res } = await this.$http.get(`/categories/${this.addGoodForm.goods_cat[2]}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.onlyTableData = res.data
        console.log(this.onlyTableData)
      }
    },
    // 图片预览效果
    handlePreview (file) {
      // console.log(file)
      this.picPreviewName = file.name
      this.picPreviewPath = file.response.data.url
      this.picPreviewVisible = true
    },
    // 监听图片上传成功的response
    handleSuccess (response) {
      // console.log(response)
      // 图片临时路径tmp_path保存
      const picInfo = { pic: response.data.tmp_path }
      this.addGoodForm.pics.push(picInfo)
      console.log(this.addGoodForm)
    },
    // 删除图片
    handleRemove (file) {
      // console.log(file.response.data.tmp_path)
      const removePicInfo = file.response.data
      // this.addGoodForm.pics.forEach((item, index) => {
      //   if (item.pic === removePicInfo.tmp_path) {
      //     this.addGoodForm.pics.splice(index, 1)
      //   }
      // })
      const index = this.addGoodForm.pics.findIndex(item => item.pic === removePicInfo.tmp_path)
      this.addGoodForm.pics.splice(index, 1)
      console.log(this.addGoodForm.pics)
    },
    // 深拷贝
    deepCopy (oldObj) {
      const newObj = []
      oldObj.forEach((item, index) => {
        if (item instanceof Array) {
          newObj[index] = []
          this.deepCopy(newObj[index], item)
        } else if (item instanceof Object) {
          newObj[index] = {}
          this.deepCopy(newObj[index], item)
        } else {
          newObj[index] = item
        }
      })
      return newObj
    },
    addGood () {
      this.$refs.addGoodFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整必要的商品数据嗷！')
        // 添加商品

        // 级联选择器this.addGoodForm.goods_cat必须为数组，直接转化会出错
        // 深拷贝一份this.addGoodForm.goods_cat
        const newGoodsCat = this.deepCopy(this.addGoodForm.goods_cat)

        // 处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.addGoodForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addGoodForm.attrs.push(newInfo)
        })
        console.log(this.addGoodForm)

        // 发起请求添加商品(商品名称唯一)
        const { data: res } = await this.$http.post('/goods', {
          goods_name: this.addGoodForm.goods_name,
          goods_cat: newGoodsCat.join(','),
          goods_price: this.addGoodForm.goods_price,
          goods_number: this.addGoodForm.goods_number,
          goods_weight: this.addGoodForm.goods_weight,
          goods_introduce: this.addGoodForm.goods_introduce,
          pics: this.addGoodForm.pics,
          attrs: this.addGoodForm.attrs
        })
        if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // categoryId () {
    //   if (this.addGoodForm.goods_cat.length === 3) {
    //     return this.addForm.goods_cat[2]
    //   }
    //   return null
    // }
  }
}
</script>

<style lang="less" scoped>
  .el-steps {
    margin: 25px 0;
    font-size: 13px;
  }
  .el-checkbox {
    margin: 0 10px 0 0 !important;
  }
  .previewImg {
    width: 100%;
  }
  .previewName {
    width: 100%;
    text-align: center;
  }
  .addGoodBtn {
    margin: 20px;
  }
</style>
