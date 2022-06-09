<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 文本提示区域 -->
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false">
      </el-alert>

      <!-- step步骤条 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 左边tab 菜单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeLeave" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="catlist" :props="cascaderProps" @change="handleChange">
              </el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableDate" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="da" v-for="(da,index) in item.attr_vals" :key="index" border> </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTableDate" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture"
              :headers="headers" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑区域 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btn" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>

      <!-- 图片预览显示框 -->
      <el-dialog title="图片预览" :visible.sync="preDialog" width="50%">
        <img :src="previewPath" alt="" class="preWidth">
      </el-dialog>
    </el-card>
  </div>
</template>

<script>

// 导入 loadsh
import _ from 'lodash'

export default {
  data() {
    return {
      activeIndex: 0,
      // 添加商品表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        // 商品详情
        goods_introduce: '',
        attrs: []
      },
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 商品分类列表
      catlist: [],
      // 级联选择器配置项
      cascaderProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 动态参数列表
      manyTableDate: [],
      // 静态属性列表
      onlyTableDate: [],
      // 上传图片路径
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 上传文件的请求头
      headers: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewPath: '',
      // 控制图片预览 显示框 的 显示与隐藏
      preDialog: false
    }
  },
  created() {
    this.getCatList()
  },
  methods: {
    async getCatList() {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }

      this.catlist = res.data
    },
    handleChange() {
      console.log(this.addForm.goods_cat)
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    beforeLeave(activeName, oldActiveName) {
      // 离开
      // console.log(oldActiveName)
      // // 进入
      // console.log(activeName)

      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    async tabClick() {
      // console.log(this.activeIndex)
      // 动态参数模块
      if (this.activeIndex === '1') {
        // eslint-disable-next-line quotes
        const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, {
          params: {
            sel: 'many'
          }
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        console.log(res.data)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableDate = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, {
          params: {
            sel: 'only'
          }
        })

        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败')
        }
        // console.log(res.data)
        this.onlyTableDate = res.data
      }
    },
    // 处理文件预览效果
    handlePreview(file) {
      // console.log(file)
      this.previewPath = file.response.data.url
      this.preDialog = true
    },
    // 移除文件
    handleRemove(file) {
      // 获取要删除的文件的临时路径
      const filePath = file.response.data.tmp_path
      // 找到对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 调用 splice 方法 删除在pics中的文件
      this.addForm.pics.splice(i, 1)
      // console.log(this.addForm)
    },
    // 文件上传成功后立即执行此函数
    handleSuccess(res) {
      // 获取图片信息对象
      const picInfo = res.data.tmp_path
      // push到 pics中
      this.addForm.pics.push(picInfo)
      // console.log(this.addForm)
    },
    // 添加商品
    addGoods() {
      // 预校验
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请完整填写表单')
        }
        // 执行添加商品业务逻辑
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableDate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableDate.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })

        form.attrs = this.addForm.attrs
        // console.log(form)
        // 添加商品
        // 商品名必须是唯一 不能重复
        const { data: res } = await this.$http.post('goods', form)

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }

        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    // 分类参数 三级分类 id
    catId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return ''
    }
  }
}
</script>

<style lang='less' scoped>
.el-steps {
  margin: 20px 0;
}

.el-cascader {
  width: 30%;
}

.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.preWidth {
  width: 100%;
}

.btn {
  margin-top: 15px;
}
</style>
