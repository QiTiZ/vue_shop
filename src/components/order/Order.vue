<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-input placeholder="请输入内容" class="inp" v-model="queryInfo.order_number" clearable @clear="getOrderList">
        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
      </el-input>

      <!-- 订单表格区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="90px"></el-table-column>
        <el-table-column label="是否付款" prop="order_pay" width="90px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.order_pay === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="90px"></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="190px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editOrder(scope.row.id)">编辑
            </el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="showExpress(scope.row.id)">物流
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[2, 10, 15]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <el-dialog title="修改地址" :visible.sync="editDialog" width="50%" @close="editClose">
        <el-form :model="editRuleForm" :rules="editRules" ref="editRuleFormRef" label-width="100px">
          <el-form-item label="省市区县" prop="address1">
            <el-cascader :options="cityDate" v-model="editRuleForm.address1" :props="{ expandTrigger: 'hover' }">
            </el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="editRuleForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">取 消</el-button>
          <el-button type="primary" @click="editDialog = false">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 物流对话框 -->
      <el-dialog title="物流信息" :visible.sync="expressDialog" width="50%">
        <el-timeline>
          <el-timeline-item v-for="(activity, index) in expressInfo" :key="index" :timestamp="activity.time">
            {{activity.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityDate from './citydata.js'

export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 查询到的订单列表
      orderList: [],
      // 总数据条数
      total: 0,
      editDialog: false,
      editRuleForm: {
        address1: [],
        address2: ''
      },
      editRules: {
        address1: [{ required: true, message: '请输入省市区县', trigger: 'blur' }],
        address2: [{ required: true, message: '请输入详细地址', trigger: 'blur' }]
      },
      cityDate,
      expressDialog: false,
      expressInfo: [{
        time: '2018-05-08 21:36:04',
        ftime: '2018-05-08 21:36:04',
        context: '商品已经下单',
        location: ''
      }, {
        time: '2018-05-09 12:22:24',
        ftime: '2018-05-09 12:22:24',
        context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
        location: ''
      }, {
        time: '2018-05-09 12:25:03',
        ftime: '2018-05-09 12:25:03',
        context: '卖家发货',
        location: ''
      }, {
        time: '2018-05-09 13:07:00',
        ftime: '2018-05-09 13:07:00',
        context: '顺丰速运 已收取快件',
        location: ''
      }, {
        time: '2018-05-09 21:21:00',
        ftime: '2018-05-09 21:21:00',
        context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
        location: ''
      }, {
        time: '2018-05-09 23:05:00',
        ftime: '2018-05-09 23:05:00',
        context: '快件到达 [北京顺义集散中心]',
        location: ''
      }, {
        time: '2018-05-10 02:03:00',
        ftime: '2018-05-10 02:03:00',
        context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
        location: ''
      }, {
        time: '2018-05-10 07:32:00',
        ftime: '2018-05-10 07:32:00',
        context: '快件到达 [北京海淀育新小区营业点]',
        location: ''
      }, {
        time: '2018-05-10 08:23:00',
        ftime: '2018-05-10 08:23:00',
        context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
        location: ''
      }, {
        time: '2018-05-10 09:39:00',
        ftime: '2018-05-10 09:39:00',
        context: '已签收,感谢使用顺丰,期待再次为您服务',
        location: ''
      }]
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })

      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      console.log(res.data)
      this.orderList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    editOrder() {
      this.editDialog = true
    },
    editClose() {
      this.$refs.editRuleFormRef.resetFields()
    },
    showExpress() {
      // 接口失效 无法使用
      //   const { data: res } = await this.$http.get('/kuaidi/804909574412544580')

      //   if (res.meta.status !== 200) {
      //     return this.$message.error('获取物流信息失败')
      //   }

      //   this.expressInfo = res.data
      this.expressDialog = true
    }
  }
}
</script>

<style lang='less' scoped>
.inp {
  width: 350px;
}
.el-cascader {
  width: 100%;
}
</style>
