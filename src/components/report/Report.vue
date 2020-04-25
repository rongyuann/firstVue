<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区域-->
    <el-card>
      <!--2. 准备echarts区域(具备宽高的DOM)-->
      <div id="main" style="width: 600px; height: 400px"></div>
    </el-card>
  </div>
</template>

<script>
// 导入lodash合并两个对象
import _ from 'lodash'
// 1. 导入echarts
import echarts from 'echarts'
export default {
  name: 'Report',
  data () {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  methods: {
  },
  created () {
  },
  // 操作DOM元素的最早时间
  async mounted () {
    // 3. 基于准备好的DOM初始化echarts实例
    const myCharts = echarts.init(document.getElementById('main'))
    // 4. 准备数据和配置项
    const { data: res } = await this.$http.get('/reports/type/1')
    if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
    const mergeResult = _.merge(res.data, this.options) // 对象合并
    // 5. 使用刚指定的配置项和数据显示图表
    myCharts.setOption(mergeResult)
  }
}
</script>

<style scoped>

</style>
