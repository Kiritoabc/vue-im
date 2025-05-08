<template>
  <div class="layout-container">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <!-- 用户信息 -->
      <div class="user-profile" @click="showUserInfo = true">
        <el-avatar :src="userInfo.avatar_url" />
      </div>
      <!-- 添加用户信息弹窗 -->
      <el-dialog v-model="showUserInfo" title="我的信息" width="400px" :show-close="true" :close-on-click-modal="true">
        <div class="user-info-content">
          <!-- 头像和基本信息 -->
          <div class="user-info-header">
            <el-avatar :size="80" :src="userInfo.avatar_url" />
            <div class="basic-info">
              <h2>{{ userInfo.username }}</h2>
              <div class="account">账号：{{ userInfo.phone_number }}</div>
              <div class="status">
                <span class="status-dot"></span>
                {{ userInfo.gender }}
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="info-section">
            <div class="info-item">
              <span class="label">性别:</span>
              <span>{{ userInfo.gender }}</span>
            </div>
            <div class="info-item">
              <span class="label">生日:</span>
              <span>{{ userInfo.data_of_birth || '2000-01-01' }}</span>
            </div>
            <div class="info-item">
              <span class="label">所在地:</span>
              <span>{{ userInfo.city || '北京' }} * {{ userInfo.country || '中国' }}</span>
            </div>
            <div class="info-item">
              <span class="label">个性签名:</span>
              <span>{{ userInfo.bio || '人生就像旷野' }}</span>
            </div>
            <div class="info-item">
              <span class="label">邮箱:</span>
              <span>{{ userInfo.email }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" @click="editUserInfo">编辑资料</el-button>
            <el-button @click="showUserInfo = false">关闭</el-button>
          </div>
        </div>
      </el-dialog>

      <!-- 主导航菜单 -->
      <div class="main-menu">
        <div v-for="item in menuItems" :key="item.path" class="menu-item" :class="{ active: currentPath === item.path }"
          @click="handleNavigation(item.path)">
          <div class="menu-content">
            <span>{{ item.label }}</span>
            <el-badge v-if="item.badge" :value="item.badge" class="badge" />
          </div>
        </div>
      </div>

      <!-- 底部菜单 -->
      <div class="bottom-menu">
        <el-dropdown trigger="click" @command="handleCommand">
          <div class="settings-trigger">
            <span>设置</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="settings">个人设置</el-dropdown-item>
              <el-dropdown-item command="status">在线状态</el-dropdown-item>
              <el-dropdown-item command="theme">
                <ThemeSwitch />
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <!-- 内容区域 -->
    <div class="main-content">
      <UserInfoEdit v-model:visible="showEditDialog" :user-info="userInfo" @save="handleSaveUserInfo" />
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import UserInfoEdit from '../components/UserInfoEdit.vue'
import ThemeSwitch from '../components/ThemeSwitch.vue'
import { getToken } from '../utils/utils.js'
import { ElNotification } from 'element-plus'
import { stopTokenCheck } from '../utils/tokenCheck'

const router = useRouter()
const route = useRoute()
const store = useStore()

const showUserInfo = ref(false)
const showEditDialog = ref(false)

// 从 store 中获取用户信息
const userInfo = computed(() => store.state.userInfo)

const menuItems = [
  { label: '消息', path: '/chat' },
  { label: '联系人', path: '/contact'},
  { label: 'AI助手', path: '/ai' },
]

const handleSaveUserInfo = async (updatedInfo) => {
  console.log('更新的用户信息：', updatedInfo)

  // 获取存储在浏览器中的 token
  const token = getToken()

  try {
    // 发送更新用户信息的请求
    const response = await axios.post('http://localhost:8080/im-server/user/update', {
      'avatar_url': updatedInfo.avatarUrl,
      'username': updatedInfo.nickname,
      'gender': updatedInfo.gender,
      'bio': updatedInfo.signature,
      'city': updatedInfo.location
    }, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    })

    // 更新成功后，查询最新的用户信息
    const userInfoResponse = await axios.get('http://localhost:8080/im-server/user/userInfo', {
      headers: {
        'token': token
      }
    })

    // 更新 Vuex store 中的用户信息
    console.log('更新后查询的用户信息', userInfoResponse.data.data)
    await store.dispatch('updateUserInfo', userInfoResponse.data.data)

    // 显示成功通知
    ElNotification({
      title: '更新成功',
      message: '用户信息已成功更新！',
      type: 'success',
      duration: 3000
    })
  } catch (error) {
    console.error('更新失败:', error.response.data)
    // 显示失败通知
    ElNotification({
      title: '更新失败',
      message: error.response.data.message || '更新用户信息时出错',
      type: 'error',
      duration: 3000
    })
  }
}

const editUserInfo = () => {
  console.log('编辑资料')
  showEditDialog.value = true
  showUserInfo.value = false
}

const currentPath = computed(() => route.path)

const handleNavigation = (path) => {
  router.push(path)
}

const handleCommand = async (command) => {
  switch (command) {
    case 'logout':
      // 退出登录
      const token = getToken()
      try {
        await axios.post('http://localhost:8080/im-server/logout', {}, {
          headers: {
            'token': token
          }
        })
        // 清除本地存储的 token
        localStorage.removeItem('token')
        // 停止 token 检查
        stopTokenCheck()
        await router.push('/login')
      } catch (error) {
        console.error('退出登录失败:', error.response.data)
        // 可以在这里添加通知用户的逻辑
      }
      break
    case 'settings':
      await router.push('/settings')
      break
    case 'status':
      break
    case 'theme':
      // 实现主题切换逻辑
      break
  }
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 120px;
  background-color: #2b2b2b;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.user-profile {
  padding: 0 20px;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.username {
  margin-left: 10px;
  font-size: 14px;
  color: #fff;
}

.main-menu {
  flex: 1;
}

.menu-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  background-color: #409EFF;
}

.menu-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  margin-left: 8px;
}

.bottom-menu {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-trigger {
  color: #fff;
  cursor: pointer;
  padding: 8px;
  text-align: center;
}

.settings-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.main-content {
  flex: 1;
  overflow: hidden;
}

/* 美化用户信息展示 */
.user-info-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-info-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.basic-info {
  margin-left: 15px;
}

.basic-info h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.info-section {
  margin-top: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.label {
  font-weight: bold;
  color: #666;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #67C23A;
  border-radius: 50%;
  margin-right: 5px;
}
</style>
