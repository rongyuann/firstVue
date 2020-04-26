<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="请输入搜索内容"
                    clearable @clear="getGoodsList">
            <el-button @click="getGoodsList" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddGoodsPage">添加商品</el-button>
        </el-col>
      </el-row>
      <!--商品表格区域-->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="120px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="100px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="160px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-button type="warning" @click="showDetailDialog(scope.row.goods_id)" class="el-icon-view" size="mini"></el-button>
            <el-button type="danger" @click="removeGoodsById(scope.row.goods_id)" class="el-icon-delete" size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页菜单-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[10,20,30]"
        layout="total,sizes,prev,pager,next,jumper"
        :total="total"
        background>
      </el-pagination>
    </el-card>

    <!--展示商品信息对话框-->
    <el-dialog
      title="商品信息"
      :visible.sync="detailDialogVisible"
      width="50%">
      <el-form :model="goodsDetailList">
        <el-form-item label="商品名称">
          <el-input v-model="goodsDetailList.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="动态参数">
          <template>
            <el-tag v-for="(item,index) in goodsDetailList.attrs" :key="index"  v-show="item.attr_sel === 'many'">
              {{item.attr_name}}
              <span v-show="item.attr_sel === 'only'">暂无</span>
            </el-tag>
          </template>
        </el-form-item>
        <el-form-item label="静态属性">
          <template>
            <el-tag v-for="(item,index) in goodsDetailList.attrs" :key="index"  v-show="item.attr_sel === 'only'">
              {{item.attr_name}}
            </el-tag>
          </template>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'List',
  data () {
    return {
      queryInfo: {
        query: '',
        pagenum: 1, // 当前页数
        pagesize: 10 // 每页显示条数
      },
      total: 0, // 总页数
      goodsList: [], // 商品列表
      detailDialogVisible: false,
      goodsDetailList: {}
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    handleSizeChange (newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange (currentPage) {
      // console.log(currentPage)
      this.queryInfo.pagenum = currentPage
      this.getGoodsList()
    },
    // 分页获取对应商品列表
    async getGoodsList () {
      const { data: res } = await this.$http.get('/goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // 根据id查询对应商品信息并展示
    async showDetailDialog (goodsId) {
      this.detailDialogVisible = true
      const { data: res } = await this.$http.get(`/goods/${goodsId}`)
      console.log(res.data)
      this.goodsDetailList = res.data
    },
    // 根据id删除对应商品
    removeGoodsById (goodsId) {
      this.$confirm('该操作会删除该商品，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$http.delete(`/goods/${goodsId}`).then(res => {
          res = res.data
          if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
          this.$message.success(res.meta.msg)
          this.getGoodsList()
        })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 跳转到添加商品页面
    goAddGoodsPage () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style scoped>

</style>
