import request from './request'
import router from '../router'

let checkInterval = null

// 开始定时检查 token
export const startTokenCheck = () => {
  // 清除可能存在的旧定时器
  if (checkInterval) {
    clearInterval(checkInterval)
  }

  // 设置新的定时器，每分钟检查一次
  checkInterval = setInterval(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        handleTokenInvalid()
        return
      }

      // 发送请求检查 token
      const response = await request.get('/user/check_token')
      if (response.code !== 200) {
        handleTokenInvalid()
      }
    } catch (error) {
      handleTokenInvalid()
    }
  }, 60000) // 60000ms = 1分钟
}

// 停止定时检查
export const stopTokenCheck = () => {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
}

// 处理 token 无效的情况
const handleTokenInvalid = () => {
  // 停止定时检查
  stopTokenCheck()
}
