<template>
  <div>
    <!-- 面包屑导航区域 -->
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-alert title="注意: 只允许为第三级分类设置相关参数!" type="warning" show-icon :closable="false">
      </el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cate">
        <el-col>
          <span>选择商品分类: </span>
          <!-- 选择商品分类的级联选择器 -->
          <el-cascader v-model="selPropsId" :options="catlist" :props="catPropsParams" @change="handleChange" clearable>
          </el-cascader>
        </el-col>
      </el-row>

      <!-- tabs 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数区域 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtn" @click="addDramParams">添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTable" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable
                  @close="handleClose(index,scope.row)">{{item}}
                </el-tag>
                <!-- 文本输入框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New
                  Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDramParams(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="delParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性区域 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性按钮 -->
          <el-button type="primary" size="mini" :disabled="isBtn" @click="addDramParams">添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTable" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环展示 tag标签 -->
                <el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable
                  @close="handleClose(index,scope.row)">{{item}}</el-tag>
                <!-- 文本输入框 -->
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                  ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)">
                </el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New
                  Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editDramParams(scope.row.attr_id)">编辑
                </el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="delParams(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>

      <!-- 添加参数对话框 -->
      <el-dialog :title="'添加' + titleText" :visible.sync="addDramParamsDia" width="50%" @close="addDramParamsClose">
        <el-form :model="addDramForm" :rules="addDramRules" ref="addRuleRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addDramForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDramParamsDia = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改参数对话框 -->
      <el-dialog :title="'编辑' + titleText" :visible.sync="editDramParamsDia" width="50%" @close="editDramParamsClose">
        <el-form :model="editDramForm" :rules="editDramRules" ref="editRuleRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editDramForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDramParamsDia = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 数据列表
      catlist: [],
      // 级联选择器配置对象
      catPropsParams: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选中的商品分类 id
      selPropsId: [],
      // 展示某一个数据
      activeName: 'many',
      // 动态属性的数据
      manyTable: [],
      // 静态属性的数据
      onlyTable: [],
      // 控制添加参数对话框 显示与隐藏
      addDramParamsDia: false,
      // 添加属性参数
      addDramForm: {
        attr_name: ''
      },
      // 验证规则
      addDramRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      // 控制修改参数对话框 显示与隐藏
      editDramParamsDia: false,
      // 根据 id查询到的对象
      editDramForm: {},
      // 编辑表单验证规则
      editDramRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCatList()
  },
  methods: {
    async getCatList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类失败')
      }
      this.catlist = res.data
      console.log(this.catlist)
    },
    handleChange() {
      this.getParamsList()
    },
    handleClick() {
      console.log(this.activeName)
      this.getParamsList()
    },
    async getParamsList() {
      // 如果未选中三级分类
      if (this.selPropsId.length !== 3) {
        this.selPropsId = []
        this.onlyTable = []
        this.manyTable = []
        return
      }
      // 如果选中三级分类
      // console.log(this.selPropsId)

      // eslint-disable-next-line quotes
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制输入框显示与隐藏
        item.inputVisible = false
        // 文本框输入的值
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTable = res.data
      } else {
        this.onlyTable = res.data
      }
    },
    // 点击添加 弹出对话框
    addDramParams() {
      this.addDramParamsDia = true
    },
    addDramParamsClose() {
      this.$refs.addRuleRef.resetFields()
    },
    // 点击确定 添加参数
    addParams() {
      this.$refs.addRuleRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return

        // eslint-disable-next-line quotes
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addDramForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 201) {
          return this.$message.error('创建参数失败')
        }
        this.$message.success('创建参数成功')
        this.addDramParamsDia = false
        this.getParamsList()
      })
    },
    async editDramParams(id) {
      // eslint-disable-next-line quotes
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      this.editDramForm = res.data
      this.editDramParamsDia = true
    },
    // 重置表单数据
    editDramParamsClose() {
      this.$refs.editRuleRef.resetFields()
    },
    // 点击按钮修改表单
    editParams() {
      // console.log(this.titleText)
      this.$refs.editRuleRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return

        // eslint-disable-next-line quotes
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editDramForm.attr_id}`, {
          attr_name: this.editDramForm.attr_name,
          attr_sel: this.activeName
        })

        if (res.meta.status !== 200) {
          return this.$message.error('更新列表失败')
        }

        this.getParamsList()
        this.$message.success('更新列表成功')
        this.editDramParamsDia = false
      })
    },
    // 点击删除参数
    async delParams(id) {
      const confirmDemo = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmDemo !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // eslint-disable-next-line quotes
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)

      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getParamsList()
    },
    // 按下 enter 和失去焦点都会触发这个函数
    handleInputConfirm(row) {
      // console.log('ok')
      // 如果没有输入任何内容
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return ''
      }
      // 输入正确内容
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      this.editHandleParams(row)
    },
    // 添加按钮点击事件
    showInput(row) {
      row.inputVisible = true
      // 数据更新了，在dom中渲染后，自动执行该函数
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    async editHandleParams(row) {
      // eslint-disable-next-line quotes
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败')
      }

      this.$message.success('修改参数项成功')
    },
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      this.editHandleParams(row)
    }
  },
  computed: {
    // 控制按钮的 是否禁用
    isBtn() {
      if (this.selPropsId.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类 ID
    cateId() {
      if (this.selPropsId.length === 3) {
        return this.selPropsId[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang='less' scoped>
.cate {
  margin: 15px 0 15px 0;
}
.el-cascader {
  width: 50%;
}

.el-tag {
  margin: 8px;
}

.input-new-tag {
  width: 120px;
}
</style>
