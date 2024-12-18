<template>
  <div class="notice-container">
    <div class="notice-header">
      <h2>{{ type === 'friend' ? '好友通知' : '群通知' }}</h2>
      <div class="header-actions">
        <el-badge :value="unreadCount" class="notice-badge" />
      </div>
    </div>

    <div class="notice-list">
      <div v-for="notice in notices" :key="notice.id" class="notice-item">
        <div class="notice-content">
          <el-avatar :size="40" :src="notice.avatar" />
          <div class="notice-info">
            <div class="notice-user">
              <span class="username">{{ notice.username }}</span>
              <span class="time">{{ notice.time }}</span>
            </div>
            <div class="notice-message">{{ notice.message }}</div>
            <div class="notice-remark">留言：{{ notice.remark }}</div>
          </div>
        </div>
        <div class="notice-actions" v-if="!notice.handled">
          <el-button type="primary" size="small" @click="handleRequest(notice.id, 'accept')">同意</el-button>
          <el-button size="small" @click="handleRequest(notice.id, 'reject')">拒绝</el-button>
        </div>
        <div class="notice-status" v-else>
          {{ notice.status === 'accepted' ? '已同意' : '已拒绝' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['friend', 'group'].includes(value)
  }
})

// 模拟通知数据
const notices = ref([
  {
    id: 1,
    username: '野心家',
    avatar: 'https://example.com/avatar1.jpg',
    message: '请求添加你为好友',
    remark: '你好，我是野心家',
    time: '2024/12/10',
    handled: false
  },
  {
    id: 2,
    username: '真言',
    avatar: 'https://example.com/avatar2.jpg',
    message: '请求添加你为好友',
    remark: '我是原神角色的真言',
    time: '2024/11/30',
    handled: false
  },
  {
    id: 3,
    username: '墨宝',
    avatar: 'https://example.com/avatar3.jpg',
    message: '请求添加你为好友',
    remark: '我是墨宝',
    time: '2024/11/20',
    handled: true,
    status: 'accepted'
  }
])

// 未读消息数量
const unreadCount = computed(() => {
  return notices.value.filter(notice => !notice.handled).length
})

// 处理请求
const handleRequest = (id, action) => {
  const notice = notices.value.find(n => n.id === id)
  if (notice) {
    notice.handled = true
    notice.status = action
  }
}
</script>

<style scoped>
.notice-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.notice-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.notice-list {
  max-height: 600px;
  overflow-y: auto;
}

.notice-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.notice-content {
  display: flex;
  margin-bottom: 12px;
}

.notice-info {
  margin-left: 12px;
  flex: 1;
}

.notice-user {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.username {
  font-weight: bold;
  font-size: 14px;
}

.time {
  color: #999;
  font-size: 12px;
}

.notice-message {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}

.notice-remark {
  background-color: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #666;
}

.notice-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.notice-status {
  text-align: right;
  color: #999;
  font-size: 13px;
}

.el-button--small {
  padding: 6px 16px;
}
</style>