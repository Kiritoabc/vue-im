// 设置 token
export const setToken = (token) => {
    localStorage.setItem('token', token);
  }
  
  // 获取 token
  export const getToken = () => {
    return localStorage.getItem('token');
  }
  
  // 清除 token
  export const clearToken = () => {
    localStorage.removeItem('token');
  }