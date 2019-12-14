import axios from 'axios';
import qs from 'qs';

const TIME_OUT = 30 * 1000 // 超时时间30秒

// 返回数据拦截处理
axios.interceptors.response.use(response => {
  return response.data
}, error => Promise.reject(error))

// 封装请求方法
const _request = (method, url, data) => {
  const headers = {}
  const configData = {
    url, // 请求的地址
    timeout: TIME_OUT, // 超时时间, 单位毫秒
    headers
  }

  if (method === 'get') {
    configData.method = 'get'
    configData.params = data // get 请求的数据
  } else if (method === 'postForm') {
    configData.method = 'post'
    if (data instanceof FormData) {
      configData.headers['Content-Type'] = 'multipart/form-data; charset=UTF-8'
      configData.data = data
    } else {
      configData.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
      configData.data = qs.stringify(data)
    }
  } else if (method === 'postJson') {
    configData.method = 'post'
    configData.headers['Content-Type'] = 'application/json; charset=UTF-8'
    configData.data = data
  }

  return axios(configData)
}

class Ajax {
  get = (url, data = {}) => {
    return _request('get', url, data)
  }

  postForm = (url, data = {}) => {
    return _request('postForm', url, data)
  }

  postJson = (url, data = {}) => {
    return _request('postJson', url, data)
  }

  post = this.postJson // 默认post的Content-Type是application/json
}

export default (Vue) => {
  if (typeof window !== 'undefined' && window.Vue) {
    Vue = window.Vue
  }
  Vue.prototype.$ajax = new Ajax()
}
