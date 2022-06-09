<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色列表区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCate">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格区域 -->
      <tree-table :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index
        index-text="#" border :show-row-hover="false">
        <!-- 是否有效模板 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen"></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序模板 -->
        <template slot="sort" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作模板 -->
        <template slot="operate" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCate(scope.row.cat_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="delCateById(scope.row.cat_id)">删除
          </el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 12]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>

      <!-- 添加分类的对话框 -->
      <el-dialog title="添加分类" :visible.sync="addCateDialog" width="50%" @close="addCateFormClose">
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称: " prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类: ">
            <el-cascader v-model="selParentCateId" :options="parentCateList" :props="parentCateOpt"
              @change="parentCateChange" clearable>
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addCateDialog = false">取 消</el-button>
          <el-button type="primary" @click="addCat">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑分类的对话框 -->
      <el-dialog title="修改分类" :visible.sync="editDialog" width="50%">
        <el-form :model="editCateForm" :rules="editCateRules" ref="editRuleFormRef" label-width="100px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialog = false">取 消</el-button>
          <el-button type="primary" @click="editCateYes">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // get携带的请求参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      catelist: [],
      // 总数据条数
      total: 0,
      // 表格的配置
      columns: [{
        label: '分类名称',
        prop: 'cat_name'
      }, {
        label: '是否有效',
        type: 'template',
        template: 'isok'
      }, {
        label: '排序',
        type: 'template',
        template: 'sort'
      }, {
        label: '操作',
        type: 'template',
        template: 'operate'
      }],
      // 控制添加分类对话框显示与隐藏
      addCateDialog: false,
      // 添加分类表单数据对象
      addCateForm: {
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类表单数据对象验证规则
      addCateFormRules: {
        cat_name: [{
          required: true, message: '请输入分类名称', trigger: 'blur'
        }]
      },
      // 父级分类的列表
      parentCateList: [],
      // 级联选择器配置对象
      parentCateOpt: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选中的一级二级分类 id
      selParentCateId: {},
      // 控制修改分类对话框显示与隐藏
      editDialog: false,
      // 根据 id查询到的对象
      editCateForm: '',
      // 修改分类表单数据对象验证规则
      editCateRules: {
        cat_name: [{
          required: true, message: '请输入分类名称', trigger: 'blur'
        }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }

      //   console.log(res.data)
      this.catelist = res.data.result
      // 获取总数据条数
      this.total = res.data.total
    },
    // 监听pagesize 改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum 改变
    handleCurrentChange(newNum) {
      this.queryInfo.pagenum = newNum
      this.getCateList()
    },
    addCate() {
      // 先获取父级分类列表
      this.getParentCateList()
      this.addCateDialog = true
    },
    // 获取父级分类商品列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      // console.log(res.data)
      this.parentCateList = res.data
    },
    // 级联选择器发生改变立即触发此函数
    parentCateChange() {
      console.log(this.selParentCateId)
      // 如果 selParentCateId的length长度大于0 则选中了父级分类 反之 没选中父级分类
      if (this.selParentCateId.length > 0) {
        // 父级分类的 ID
        this.addCateForm.cat_pid = this.selParentCateId[this.selParentCateId.length - 1]

        // 当前选中项的等级
        this.addCateForm.cat_level = this.selParentCateId.length
        // eslint-disable-next-line no-useless-return
        return
      } else {
        this.addCateForm.cat_pid = 0
        // 当前选中项的等级
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮 添加分类
    addCat() {
      // console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return
        }

        const { data: res } = await this.$http.post('categories', this.addCateForm)

        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }

        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialog = false
      })
    },
    // 对话框关闭 重置表单数据
    addCateFormClose() {
      this.$refs.addCateFormRef.resetFields()
      this.selParentCateId = []
      this.addCateForm.cat_pid = 0
      // 当前选中项的等级
      this.addCateForm.cat_level = 0
    },
    // 根据id 查询分类
    async editCate(id) {
      const { data: res } = await this.$http.get('categories/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('查询分类失败')
      }

      this.editCateForm = res.data
      this.editDialog = true
    },
    // 点击确定 修改分类名称
    async editCateYes() {
      const { data: res } = await this.$http.put('categories/' + this.editCateForm.cat_id, {
        cat_name: this.editCateForm.cat_name
      })

      if (res.meta.status !== 200) {
        return this.$message.error('更新分类名称失败')
      }

      this.getCateList()
      this.editDialog = false

      this.$message.success('更新分类名称成功')
    },
    // 根据 id删除数据
    async delCateById(id) {
      const confirmDemo = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmDemo)
      if (confirmDemo !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败')
      }

      this.$message.success('删除分类成功')
      this.getCateList()
    }
  }
}
</script>

<style lang='less' scoped>
.el-row {
  margin-bottom: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
