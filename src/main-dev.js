import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'

// 导入字体样式
import './font/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
// 富文本
import VueQuillEditor from 'vue-quill-editor'

// 导入 nprogross
import NProgress from 'nprogress'
// 配置请求基准路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 请求在到达服务器之前，先会调用use中的这个回调函数来添加请求头信息
axios.interceptors.request.use(data => {
  // 在 request中 展示进度条 NProgress.start();
  // console.log(data)
  NProgress.start()
  data.headers.Authorization = window.sessionStorage.getItem('token')
  return data
})

axios.interceptors.response.use(config => {
  // 在 request中 隐藏进度条  NProgress.done()
  NProgress.done()
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)

Vue.use(VueQuillEditor)
Vue.filter('dateFormat', function(date) {
  const dt = new Date(date)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, ' 0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  // eslint-disable-next-line quotes
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
