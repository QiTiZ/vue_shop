<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色 列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card>
      <!-- 添加角色列表区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bgborder',index === 0 ? 'bgtop':'','flex']" v-for="(item,index) in scope.row.children"
              :key="item.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="delPowerById(scope.row,item.id)">
                  {{item.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row :class="[index2 === 0 ? '' : 'bgtop','flex']" v-for="(item2,index2) in item.children"
                  :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="delPowerById(scope.row,item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable
                      @close="delPowerById(scope.row,item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{scope.row}}
            </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editRoles(scope.row.id)">修改</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="delRolesById(scope.row.id)">删除
            </el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="allotPower(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addRolesClose">
      <el-form :model="addRolesForm" :rules="addRolesRules" ref="addRolesFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户提示框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editRolesClose">
      <el-form :model="editRolesList" :rules="editRolesListRules" ref="editRolesRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRolesList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRolesList.roleDesc" prop="roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限提示框 -->
    <el-dialog title="分配权限" :visible.sync="allotPowerdialog" width="50%" @close="powerCloseDialog">
      <!-- 树形控件 -->
      <el-tree :data="allotList" :props="allotProps" show-checkbox node-key="id" :default-expand-all="true"
        :default-checked-keys="defKeys" ref="allotRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="allotPowerdialog = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制对话框显示与隐藏
      addDialogVisible: false,
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色验证规则
      addRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 控制修改用户对话框显示与隐藏
      editDialogVisible: false,
      // 通过 id查询到的用户数据
      editRolesList: '',
      // 修改表单 角色验证规则
      editRolesListRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 控制分配权限提示框显示与隐藏
      allotPowerdialog: false,
      // 获取到的权限列表数据
      allotList: [],
      // 树形控件属性绑定对象
      allotProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认选中的三级权限 id值
      defKeys: [],
      // 当前即将分配权限的id
      roleid: ''
    }
  },
  created() {
    // 获取所有角色列表
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.message.error('获取角色列表失败')
      }

      this.rolesList = res.data
      // console.log(this.rolesList)
    },
    // 添加用户表单路由函数
    addRoles() {
      this.$refs.addRolesFormRef.validate(async valid => {
        if (!valid) { return };
        const { data: res } = await this.$http.post('roles', this.addRolesForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功')
        // 添加成功之后关闭提示框
        this.addDialogVisible = false
        // 重新渲染用户数据
        this.getRolesList()
      })
    },
    // 展示修改用户的对话框
    async editRoles(id) {
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表错误')
      }

      this.editRolesList = res.data
      this.editDialogVisible = true
    },
    // 修改用户并提交
    async editRolesInfo() {
      const { data: res } = await this.$http.put('roles/' + this.editRolesList.roleId, {
        roleName: this.editRolesList.roleName,
        roleDesc: this.editRolesList.roleDesc
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改角色失败')
      }

      this.editDialogVisible = false
      this.getRolesList()

      this.$message.success('修改角色成功')
    },
    // 根据id删除数据
    async delRolesById(id) {
      // 弹框提示
      const confirmRoles = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // console.log(confirmRoles)
      if (confirmRoles !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }

      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    // 根据id 删除权限
    async delPowerById(role, powerId) {
      // 弹框提示是否删除
      const confirmPower = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      // console.log(confirmPower)
      if (confirmPower !== 'confirm') {
        return this.$message.info('已取消删除')
      }

      // eslint-disable-next-line quotes
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${powerId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('取消权限失败')
      }
      this.$message.success('取消权限成功')
      role.children = res.data
    },
    async allotPower(role) {
      this.roleid = role.id
      const { data: res } = await this.$http.get('rights/tree')

      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败')
      }

      this.allotList = res.data
      // console.log(this.allotList)
      this.getDefKeys(role, this.defKeys)
      this.allotPowerdialog = true
    },
    // 通过递归的方式 获取所有三级权限的 id值 并保存在defKeys中
    getDefKeys(node, arr) {
      // 当前节点不包含children则是三级权限
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach((item) => {
        this.getDefKeys(item, arr)
      })
    },
    // 分配权限树形控件关闭时清空内容
    powerCloseDialog() {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.allotRef.getCheckedKeys(),
        ...this.$refs.allotRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      const idStr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleid}/rights`, {
        rids: idStr
      })

      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }

      this.$message.success('分配权限成功')
      this.getRolesList()
      this.allotPowerdialog = false
    },
    addRolesClose() {
      this.$refs.addRolesFormRef.resetFields()
    },
    editRolesClose() {
      this.$refs.editRolesRef.resetFields()
    }
  }
}
</script>

<style lang='less' scoped>
.el-tag {
  margin: 7px;
}
.bgtop {
  border-top: 1px solid #eee;
}
.bgborder {
  border-bottom: 1px solid #eee;
}
.flex {
  display: flex;
  align-items: center;
}
</style>
