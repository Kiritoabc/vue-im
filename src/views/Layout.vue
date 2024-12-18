<template>
  <div class="layout-container">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <!-- 用户信息 -->
      <div class="user-profile">
        <el-avatar :src="userInfo.avatar" />
        <span class="username">{{ userInfo.nickname }}</span>
      </div>

      <!-- 主导航菜单 -->
      <div class="main-menu">
        <div
          v-for="item in menuItems"
          :key="item.path"
          class="menu-item"
          :class="{ active: currentPath === item.path }"
          @click="handleNavigation(item.path)"
        >
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

// 模拟用户信息
const userInfo = {
  nickname: '测试用户',
  avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3w2fqb71MsCj97IKLAUXoI6BS4IfeCeEoq_XGS3X2CErGlYyP4xxX4eQ&s'
}

// 菜单项配置
const menuItems = [
  { label: '消息', path: '/chat', badge: 3 },
  { label: '联系人', path: '/contact', badge: 1 },
  { label: '收藏', path: '/favorites' },
  { label: '文件', path: '/files' }
]

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
  width: 200px;
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
</style> 