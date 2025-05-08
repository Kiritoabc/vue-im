import axios from 'axios'

// 上传头像
export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('avatar', file)
  
  // 从localStorage获取token
  const token = localStorage.getItem('token')
  
  return axios.post('http://localhost:8080/im-server/user/upload_avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'token': token // 添加token到请求头
    }
  })
} 