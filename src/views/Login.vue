<template>
  <div class="auth-container">
    <!-- 添加系统标题 -->
    <div class="system-title">
      <h1>原神交流 IM 系统</h1>
      <p>与提瓦特大陆的冒险者们在线交流</p>
    </div>
    <div class="auth-box" :class="{ 'slide-signup': isSignUp }">
      <!-- 左侧登录面板 -->
      <div class="form-container sign-in" v-if="!isSignUp">
        <form @submit.prevent="handleLogin">
          <h2>登录</h2>
          <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
          <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" />
          <el-button type="primary" @click="handleLogin">登录</el-button>
        </form>
      </div>

      <!-- 右侧注册面板 -->
      <div class="form-container sign-up">
        <form @submit.prevent="handleRegister">
          <h2>注册</h2>
          <el-input v-model="registerForm.username" placeholder="用户名" prefix-icon="User" />
          <el-input v-model="registerForm.phone_number" placeholder="手机号" prefix-icon="Message" />
          <el-input v-model="registerForm.password" type="password" placeholder="密码" prefix-icon="Lock" />
          <el-button type="primary" @click="handleRegister">注册</el-button>
        </form>
      </div>

      <!-- 遮罩层 -->
      <div class="overlay-container">
        <div class="overlay" :class="{ 'right-panel-active': isSignUp }">
          <div class="overlay-panel overlay-left">
            <h2>欢迎回来！</h2>
            <p>请登录您的账号以继续访问</p>
            <el-button class="ghost" @click="isSignUp = false">登录 </el-button>
          </div>
          <div class="overlay-panel overlay-right">
            <h2>您好！</h2>
            <p>立即注册账号开始体验</p>
            <el-button class="ghost" @click="isSignUp = true">注册</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useStore } from 'vuex'
import { ElNotification } from 'element-plus'

const router = useRouter()
const store = useStore()
const isSignUp = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const registerForm = reactive({
  username: '',
  phone_number: '',
  password: ''
})

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:8080/im-server/login', {
      phone_number: loginForm.username,
      password: loginForm.password
    })
    // 获取用户信息
    const token = response.data.data.token
    // 保存token到本地存储
    localStorage.setItem('token', token)
    const userInfoResponse = await axios.get(`http://localhost:8080/im-server/user/userInfo`, {
      headers: {
        'token': token
      }
    })
    console.log("用户登录的信息"+userInfoResponse.data.data)
    // 使用vuex 保存用户信息
    await store.dispatch('updateUserInfo', userInfoResponse.data.data)

    // 显示登录成功的通知
    ElNotification({
      title: '登录成功',
      message: '欢迎回来！',
      type: 'success',
      duration: 3000
    })

    // 登录成功后，跳转到聊天页面
    await router.push('/chat')
  } catch (error) {
    console.error('登录失败:', error.response.data)
    // 显示登录失败的通知
    ElNotification({
      title: '登录失败',
      message: error.response.data.message || '请检查您的用户名和密码',
      type: 'error',
      duration: 3000
    })
  }
}

const handleRegister = async () => {
  try {
    const response = await axios.post('http://localhost:8080/im-server/register', {
      phone_number: registerForm.phone_number,
      username: registerForm.username,
      password_hash: registerForm.password
    })
    console.log('注册成功:', response.data)

    // 显示注册成功的通知
    ElNotification({
      title: '注册成功',
      message: '您已成功注册，请登录！',
      type: 'success',
      duration: 3000
    })

    // 注册成功后，跳转到登录页面或直接登录
    isSignUp.value = false
  } catch (error) {
    console.error('注册失败:', error.response.data)
    // 显示注册失败的通知
    ElNotification({
      title: '注册失败',
      message: error.response.data.message || '请检查您的输入',
      type: 'error',
      position: 'top-center',
      duration: 3000
    })
  }
}
</script>

<style scoped>
.auth-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('../static/login-bg.jpg');
  background-size: cover;
  background-position: center;
}

.auth-box {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
  width: 768px;
  max-width: 100%;
  min-height: 480px;
}

.form-container {
  position: absolute;
  top: 0;
  height: 100%;
  transition: all 0.6s ease-in-out;
}

.sign-in {
  left: 0;
  width: 50%;
  z-index: 2;
}

.sign-up {
  left: 0;
  width: 50%;
  opacity: 0;
  z-index: 1;
}

.auth-box.slide-signup .sign-in {
  transform: translateX(100%);
}

.auth-box.slide-signup .sign-up {
  transform: translateX(100%);
  opacity: 1;
  z-index: 5;
}

.overlay-container {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 100;
}

.auth-box.slide-signup .overlay-container {
  transform: translateX(-100%);
}

.overlay {
  background: linear-gradient(to right, #0288d1, #0277bd);
  color: #FFFFFF;
  position: relative;
  left: -100%;
  height: 100%;
  width: 200%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.auth-box.slide-signup .overlay {
  transform: translateX(50%);
}

.overlay-panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 40px;
  text-align: center;
  top: 0;
  height: 100%;
  width: 40%;
  transform: translateX(0);
  transition: transform 0.6s ease-in-out;
}

.overlay-left {
  transform: translateX(-20%);
}

.auth-box.slide-signup .overlay-left {
  transform: translateX(0);
}

.overlay-right {
  right: 0;
  transform: translateX(0);
}

.auth-box.slide-signup .overlay-right {
  transform: translateX(20%);
}

form {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  height: 100%;
  text-align: center;
}

.el-input {
  width: 100%;
  margin: 8px 0;
}

.el-button {
  margin-top: 15px;
  width: 100%;
}

.ghost {
  background: transparent;
  height: 40px;
  border-radius: 25px;
  /* 增加圆角半径 */
  border: 1px solid #FFF;
  color: #FFF;
}

h2 {
  margin: 0 0 30px;
}

p {
  margin: 20px 0;
}

.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('../static/login-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.login-card {
  width: 400px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 25px;
  /* 增加圆角半径 */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}

.el-button--primary {
  background: #0288d1;
  border: none;
  height: 40px;
  border-radius: 25px;
  /* 增加圆角半径 */
  font-size: 16px;
  transition: all 0.3s;
}

.el-button--primary:hover {
  background: #0277bd;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(2, 136, 209, 0.3);
}

.el-input :deep(.el-input__wrapper) {
  border-radius: 25px;
  /* 增加圆角半径 */
  padding: 0 15px;
  height: 40px;
  box-shadow: none;
  border: 1px solid #e0e0e0;
}

.el-input :deep(.el-input__wrapper):hover {
  border-color: #0288d1;
}

.form-footer {
  text-align: center;
  margin-top: 20px;
}

/* 系统标题样式 */
.system-title {
  position: absolute;
  /* 添加绝对定位 */
  top: 10%;
  /* 距离顶部的距离 */
  left: 50%;
  /* 水平居中 */
  transform: translateX(-50%);
  /* 水平居中偏移 */
  text-align: center;
  color: #fff;
  margin-bottom: 40px;
  z-index: 1000;
  /* 确保标题在最上层 */
}

.system-title h1 {
  font-size: 48px;
  /* 增大标题字体 */
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: bold;
  letter-spacing: 2px;
  /* 添加字间距 */
  color: #FFD700;
  /* 使用金色 */
}

.system-title p {
  font-size: 18px;
  opacity: 0.9;
  letter-spacing: 1px;
  color: #FFF;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4);
}

/* 登录注册框内的文字样式 */
form h2 {
  font-size: 24px;
  color: #333;
  font-weight: bold;
  margin-bottom: 25px;
}

.overlay-panel h2 {
  font-size: 28px;
  margin-bottom: 20px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.overlay-panel p {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 25px;
}

/* 输入框文字样式 */
.el-input :deep(.el-input__inner) {
  font-size: 15px;
  color: #333;
}

/* 按钮文字样式 */
.el-button {
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
}
</style>