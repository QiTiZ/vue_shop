<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/ccc.jpg" alt="" width="50px" height="50px" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="danger" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 左侧边栏 -->
      <el-aside :width="isFold ? '64px' : '200px'">
        <div class="toggle-button" @click="foldMenu">|||</div>
        <el-menu background-color="#313743" text-color="#fff" active-text-color="#469ceb" unique-opened :collapse="isFold" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <!-- :index 只接收字符串 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右主体部分 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconObj: {
        125: 'iconfont icon-peoplefill',
        103: 'iconfont icon-quanxian',
        101: 'iconfont icon-cartfill',
        102: 'iconfont icon-jianqu',
        145: 'iconfont icon-xitongguanli'
      },
      // 是否折叠菜单栏
      isFold: false,
      // 路由链接使用
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    // 打开页面第一时间获取路由链接
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.erroe(res.meta.msg)
      this.menulist = res.data
      // console.log(res)
    },
    // 菜单展开与折叠
    foldMenu() {
      this.isFold = !this.isFold
    },
    // 获取路由链接
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #363d40;
  // 使用 flex布局 以及两端对齐
  display: flex;
  justify-content: space-between;
  padding-left: 5px;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    img {
      border-radius: 50%;
    }
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #313743;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #e9edf0;
}

.iconfont {
  margin-right: 12px;
}

.toggle-button {
  background-color: #475163;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
