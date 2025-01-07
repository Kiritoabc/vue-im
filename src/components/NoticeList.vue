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
            <div class="notice-remark">留言：{{ notice.message }}</div>
          </div>
        </div>
        <div class="notice-actions" v-if="!notice.handled">
          <el-button type="primary" size="small" @click="handleRequest(notice.id, 'accept')" v-if="notice.userid != currentUserID.value">{{}}同意</el-button>
          <el-button size="small" @click="handleRequest(notice.id, 'reject')" v-if="notice.userid !=  currentUserID.value">拒绝</el-button>
          <span v-else>等待验证中...</span> <!-- 如果是本人发送的请求 -->
        </div>
        <div class="notice-status" v-else>
          {{ notice.status === 'accepted' ? '已同意' : '已拒绝' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch} from 'vue'
import { useStore } from 'vuex'
import axios from "axios";
import {getToken} from "../utils/utils.js"; // 导入 useStore

const store = useStore()


const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['friend', 'group'].includes(value)
  }, showNoticeDialog: {
    type: Boolean,
    required: true,
    default: false
  }
})

const notices = ref([]) // 存储通知数据


// 从 store 中获取用户信息
const currentUserID = computed(() => store.state.userInfo.id)
console.log("currentUserID"+currentUserID.value)

// 未读消息数量
const unreadCount = computed(() => {
  return notices.value.filter(notice => !notice.handled).length
})


// 获取通知
const fetchNotices = async () => {
  const token = getToken() // 获取 token
  try {
    const response = await axios.get('http://localhost:8080/im-server/notifications/friend_requests', {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });
    if (response.data.message === "获取好友请求通知成功") {
      notices.value = response.data.data.map(notice => ({
        id: notice.id,
        userid: notice.user_id,
        username: notice.sender.username,
        avatar: notice.sender.avatar_url,
        message: notice.content,
        remark: '', // 可以根据需要填充
        time: new Date(notice.created_at).toLocaleString(), // 格式化时间
        handled: notice.is_read, // 是否已读
        status: notice.status
      }));
      unreadCount.value = notices.value.filter(notice => !notice.handled).length; // 更新未读数量
    }
  } catch (error) {
    console.error('获取通知失败:', error);
  }
}

// 处理请求
const handleRequest = async (id, action) => {
  // 发送请求到后端
  const token = getToken() // 获取 token
  const notice = notices.value.find(n => n.id === id)

  if (notice) {
    try {
      // 分组暂时可以不传，使用默认的分组
      const response = await axios.post(`http://localhost:8080/im-server/notifications/${id}?action=${action}`, {}, {
        headers: {
          'token': token,
          'Content-Type': 'application/json'
        }
      });
      notice.handled = true
      notice.status = action === 'accept' ? 'accepted' : 'rejected'
       // 重新获取通知以更新列表
       await fetchNotices()
    } catch (error) {
      console.error('请求失败:', error);
    }
  }
}

// 监听对话框显示状态
watch(() => props.showNoticeDialog, (newVal) => {
  if (newVal) {
    fetchNotices() // 当对话框显示时获取通知
  }
})

// 在组件加载时获取通知
fetchNotices()

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