<template>
  <div class="login_bgc">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="via">
        <img src="../assets/ccc.jpg" alt="" />
      </div>
      <!-- 登录表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form">
        <!-- 用户名区域 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user">
          </el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-key" placeholder="请输入密码" show-password>
          </el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        // 验证用户名是否符合规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        // 验证密码是否符合规则
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    login() {
      this.$refs.loginFormRef.validate(async valid => {
        // console.log(valid);
        if (!valid) return
        const { data: result } = await this.$http.post('login', this.loginForm)
        // console.log(result);
        if (result.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        // console.log(result);
        // 1.将登录成功之后的 token 保存在服务器端 sessionStorage中
        //  1.1 项目中 除了登录API 其他 API都需要在登录之后才能访问
        //  1.2 token只能在打开网站生效 所以应该保存在 sessionStorage中
        window.sessionStorage.setItem('token', result.data.token)
        // 2.通过编程式导航跳转到后台主页 地址是 /home
        this.$router.push('/home')
      })
    },
    // 点击重置按钮 重置表单验证规则
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.login_bgc {
  position: relative;
  background-color: rgb(168, 206, 177);
}
.login_box {
  width: 450px;
  height: 350px;
  background-color: #fff;
  border-radius: 10px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  .via {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 1px solid #eee;
    padding: 10px;
    left: 50%;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background-color: #eee;
      left: 50%;
    }
  }

  .btns {
    float: right;
  }
}
.login_form {
  position: absolute;
  margin-top: 150px;
  width: 100%;
  padding: 0 15px;
  box-sizing: border-box;
}
</style>
