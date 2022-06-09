<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品表格区域 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="100px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="90px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="150px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCate(scope.row.goods_id)">编辑
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="delGoods(scope.row.goods_id)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 20, 30, 40]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total" background>
      </el-pagination>

      <!-- 编辑商品对话框 -->
      <el-dialog title="修改商品" :visible.sync="editDia" width="50%" @close="editClose">
        <el-form :model="editForm" :rules="editRules" ref="editRuleFormRef" label-width="100px">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="editForm.goods_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDia = false">取 消</el-button>
          <el-button type="primary" @click="editCateName">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodsList: [],
      // 总数据条数
      total: 0,
      editDia: false,
      // 根据id查询到的对象
      editForm: {},
      editRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', { params: this.queryInfo })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }

      console.log(res.data)
      // this.$message.success('获取商品列表成功')

      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    // pagesize
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 删除商品
    async delGoods(id) {
      const confirmDemo = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmDemo !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },
    // 添加商品
    addGoods() {
      this.$router.push('/goods/add')
    },
    async editCate(id) {
      const { data: res } = await this.$http.get('goods/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('查询商品失败')
      }
      this.editForm = res.data
      this.editDia = true
    },
    // 修改商品
    editCateName() {
      this.$refs.editRuleFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请输入正确的商品名称')
        }

        const { data: res } = await this.$http.put('goods/' + this.editForm, {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          pics: [],
          // 商品详情
          goods_introduce: '',
          attrs: []
        })
        if (res.meta.status !== 201) {
          return this.$message.error('修改商品失败')
        }
        this.getGoodsList()
        this.$message.success('修改商品成功')
        this.editDia = false
      })
    },
    editClose() {
      this.$refs.editRuleFormRef.resetFields()
    }
  }
}
</script>

<style lang='less' scoped>
</style>
