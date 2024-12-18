<template>
  <div class="layout-container">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <!-- 用户信息 -->
      <div class="user-profile" @click="showUserInfo = true">
        <el-avatar :src="userInfo.avatar" />
      </div>
      <!-- 添加用户信息弹窗 -->
      <el-dialog v-model="showUserInfo" title="个人信息" width="400px" :show-close="true" :close-on-click-modal="true">
        <div class="user-info-content">
          <!-- 头像和基本信息 -->
          <div class="user-info-header">
            <el-avatar :size="80" :src="userInfo.avatar" />
            <div class="basic-info">
              <h2>{{ userInfo.nickname }}</h2>
              <div class="account">账号：{{ userInfo.account }}</div>
              <div class="status">
                <span class="status-dot"></span>
                {{ userInfo.status }}
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="info-section">
            <div class="info-item">
              <span class="label">性别</span>
              <span>{{ userInfo.gender }}</span>
            </div>
            <div class="info-item">
              <span class="label">生日</span>
              <span>{{ userInfo.birthday }}</span>
            </div>
            <div class="info-item">
              <span class="label">所在地</span>
              <span>{{ userInfo.location }}</span>
            </div>
            <div class="info-item">
              <span class="label">个性签名</span>
              <span>{{ userInfo.signature }}</span>
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
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
// 在原有的 script 中添加
const showUserInfo = ref(false)


// 模拟用户信息
const userInfo = {
  nickname: '菠萝🍍',
  avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3w2fqb71MsCj97IKLAUXoI6BS4IfeCeEoq_XGS3X2CErGlYyP4xxX4eQ&s',
  account: '2493381254',
  status: '在线',
  gender: '男',
  birthday: '2000-01-01',
  location: '中国',
  signature: '这个人很懒，什么都没留下...'
}

// 菜单项配置
const menuItems = [
  { label: '消息', path: '/chat', badge: 3 },
  { label: '联系人', path: '/contact', badge: 1 },
  { label: 'AI', path: '/ai' },
]

// 编辑用户信息
const editUserInfo = () => {
  // 实现编辑资料的逻辑
}

// 当前路径
const currentPath = computed(() => route.path)

// 导航处理
const handleNavigation = (path) => {
  router.push(path)
}

// 下拉菜单命令处理
const handleCommand = (command) => {
  switch (command) {
    case 'logout':
      // 清除登录信息
      localStorage.removeItem('token')
      router.push('/login')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'status':
      // 处理在线状态变更
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

/* 添加到原有的 style 中 */
.user-profile {
  cursor: pointer;
}

.user-info-content {
  padding: 20px;
}

.user-info-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.basic-info {
  margin-left: 20px;
}

.basic-info h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.account {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.status {
  display: flex;
  align-items: center;
  color: #67C23A;
  font-size: 14px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #67C23A;
  border-radius: 50%;
  margin-right: 5px;
}

.info-section {
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-item .label {
  width: 80px;
  color: #666;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 弹窗样式调整 */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  margin-right: 0;
  border-bottom: 1px solid #eee;
  padding: 20px;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: bold;
}
</style>