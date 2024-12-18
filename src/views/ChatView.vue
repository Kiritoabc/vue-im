<template>
  <div class="chat-container">

    <!-- 中间聊天列表和聊天区域 -->
    <div class="chat-main">
      <!-- 聊天列表 -->
      <div class="chat-list">
        <div class="search-bar">
          <el-input v-model="searchText" placeholder="搜索" />
        </div>
        <!-- 可选择的群聊和个人聊天 -->
        <div class="chat-items">
          <div v-for="chat in mockChats" :key="chat.id" :class="['chat-item', { active: chat.id === currentChatId }]"
            @click="$router.push(`/chat/group/${chat.id}`)">
            <el-avatar :src="chat.avatar" />
            <div class="chat-info">
              <div class="chat-name">{{ chat.name }}</div>
              <div class="chat-preview">{{ chat.lastMessage }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 聊天内容区域 -->
      <div class="chat-content">
        <!-- 左侧群最后的消息和私聊的最后消息 -->
        <div class="chat-header">
          <h2>{{ currentChat?.name }} ({{ currentChat?.memberCount || 36 }})</h2>
        </div>
        <!-- 消息展示页面 -->
        <div class="message-area">
          <div v-for="msg in currentMessages" :key="msg.id"
            :class="['message', { 'message-self': msg.senderId === mockUser.id }]" @click="showSenderInfo(msg)">
            <el-avatar :src="msg.avatar" />
            <div class="message-content">
              <div class="message-sender">{{ msg.senderName }}</div>
              <div class="message-text">{{ msg.content }}</div>
            </div>
          </div>
        </div>
        <!-- 发送页面 -->
        <div class="chat-input">
          <div class="toolbar">
            <el-button>表情</el-button>
            <el-button>图片</el-button>
            <el-button>文件</el-button>
          </div>
          <el-input v-model="messageText" type="textarea" :rows="3" placeholder="请输入消息..." />
          <el-button type="primary" @click="sendMessage">发送</el-button>
        </div>
      </div>
    </div>


    <!-- 添加发送消息成员弹窗 -->
    <el-dialog v-model="showSenderDialog" title="成员信息" width="400px" :show-close="true" :close-on-click-modal="true">
      <div class="member-info-content" v-if="selectedSender">
        <!-- 头像和基本信息 -->
        <div class="member-info-header">
          <el-avatar :size="80" :src="selectedSender.avatar" />
          <div class="basic-info">
            <h2>{{ selectedSender.senderName || selectedSender.name }}</h2>
            <div class="account">账号：{{ selectedSender.account }}</div>
            <div class="status">
              <span class="status-dot"></span>
              {{ selectedSender.status }}
            </div>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="info-section">
          <div class="info-item">
            <span class="label">群名片</span>
            <span>{{ selectedSender.groupNickname || '暂无群名片' }}</span>
          </div>
          <div class="info-item">
            <span class="label">性别</span>
            <span>{{ selectedSender.gender }}</span>
          </div>
          <div class="info-item">
            <span class="label">地区</span>
            <span>{{ selectedSender.location }}</span>
          </div>
          <div class="info-item">
            <span class="label">加群时间</span>
            <span>{{ selectedSender.joinTime }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="sendPrivateMessage(selectedSender.senderId)">发送消息</el-button>
          <el-button @click="showSenderDialog = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>


    <!-- 右侧成员列表 -->
    <div class="member-list">
      <div class="member-header">
        <h3>群成员 {{ currentChat?.memberCount || 36 }}</h3>
      </div>
      <div class="members">
        <div v-for="member in mockMembers" :key="member.id" class="member-item" @click="showMemberInfo(member)">
          <el-avatar :src="member.avatar" />
          <span>{{ member.name }}</span>
        </div>
      </div>
    </div>




    <!-- 添加成员信息弹窗 -->
    <el-dialog v-model="showMemberDialog" title="成员信息" width="400px" :show-close="true" :close-on-click-modal="true">
      <div class="member-info-content" v-if="selectedMember">
        <!-- 头像和基本信息 -->
        <div class="member-info-header">
          <el-avatar :size="80" :src="selectedMember.avatar" />
          <div class="basic-info">
            <h2>{{ selectedMember.nickname || selectedMember.name }}</h2>
            <div class="account">账号：{{ selectedMember.account }}</div>
            <div class="status">
              <span class="status-dot"></span>
              {{ selectedMember.status }}
            </div>
          </div>
        </div>

        <!-- 详细信息 -->
        <div class="info-section">
          <div class="info-item">
            <span class="label">群名片</span>
            <span>{{ selectedMember.groupNickname || '暂无群名片' }}</span>
          </div>
          <div class="info-item">
            <span class="label">性别</span>
            <span>{{ selectedMember.gender }}</span>
          </div>
          <div class="info-item">
            <span class="label">地区</span>
            <span>{{ selectedMember.location }}</span>
          </div>
          <div class="info-item">
            <span class="label">加群时间</span>
            <span>{{ selectedMember.joinTime }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <el-button type="primary" @click="sendPrivateMessage(selectedMember.id)">发送消息</el-button>
          <el-button @click="showMemberDialog = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>

  </div>
</template>
<script setup>
import { fa } from 'element-plus/es/locales.mjs';
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const searchText = ref('')
const messageText = ref('')
const currentChatId = ref(null)
// 展示群成员信息
const showMemberDialog = ref(false)
const selectedMember = ref(null)

// 展示消息发送者的信息
const showSenderDialog = ref(false)
const selectedSender = ref(null)

// 监听路由变化
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      currentChatId.value = parseInt(newId)
      console.log('当前聊天ID:', currentChatId.value)
    }
  },
  { immediate: true }
)

// 模拟数据
const mockUser = {
  id: 1,
  name: '当前用户',
  avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3w2fqb71MsCj97IKLAUXoI6BS4IfeCeEoq_XGS3X2CErGlYyP4xxX4eQ&s'
}

const mockChats = [
  {
    id: 1,
    name: '乐园养老院',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3w2fqb71MsCj97IKLAUXoI6BS4IfeCeEoq_XGS3X2CErGlYyP4xxX4eQ&s',
    lastMessage: '大家晚上好啊~',
    messages: [
      {
        id: 1,
        content: '如此甚好',
        senderId: 2,
        senderName: '钟离',
        avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGxn2g1MNYiWj74sDq3vLA96CCv8uc66CFcQ&s'
      },
      {
        id: 2,
        content: '钟离先生你好嗷~',
        senderId: 1,
        senderName: '菠萝',
        avatar: mockUser.avatar
      },
      {
        id: 3,
        content: '小菠萝你也好',
        senderId: 2,
        senderName: '可莉',
        avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGxn2g1MNYiWj74sDq3vLA96CCv8uc66CFcQ&s'
      },
      {
        id: 4,
        content: '可莉，你也晚上好哦',
        senderId: 1,
        senderName: '菠萝',
        avatar: mockUser.avatar
      },
    ]
  },
  {
    id: 2,
    name: '技术交流群',
    avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3w2fqb71MsCj97IKLAUXoI6BS4IfeCeEoq_XGS3X2CErGlYyP4xxX4eQ&s',
    lastMessage: '有人在线吗？',
    messages: [
      {
        id: 1,
        content: '大家好啊！',
        senderId: 2,
        senderName: '可莉',
        avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1dyZLmNMbkVdvNVtn5AOVah151P0dVLMC8Q&s'
      },
      {
        id: 2,
        content: '你好！',
        senderId: 1,
        senderName: '菠萝',
        avatar: mockUser.avatar
      },
      {
        id: 3,
        content: '菠萝哥哥晚上好哦',
        senderId: 2,
        senderName: '可莉',
        avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1dyZLmNMbkVdvNVtn5AOVah151P0dVLMC8Q&s'
      },
      {
        id: 4,
        content: '可莉，你也晚上好哦',
        senderId: 1,
        senderName: '菠萝',
        avatar: mockUser.avatar
      },
    ]
  }
]

const mockMembers = [
  { id: 1, name: '派蒙', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5re36F5Y0vJ5iUVM_Sk3swdJ97yt9OZ3xBQ&s' },
  { id: 2, name: '可莉', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGxn2g1MNYiWj74sDq3vLA96CCv8uc66CFcQ&s' },
  { id: 3, name: '万叶', avatar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0t7r5dj987A6mOt3D7_JQOgW-48DqsdT1Ng&s' }
]

// 当前聊天
const currentChat = computed(() => {
  console.log('currentChatId', currentChatId)
  return mockChats.find(chat => chat.id === currentChatId.value)
})

// 当前消息列表
const currentMessages = computed(() => {
  console.log('currentMessages', currentChat.value)
  return currentChat.value?.messages
})

// 显示成员信息
const showMemberInfo = (member) => {
  selectedMember.value = member
  showMemberDialog.value = true
}

// 显示发送者消息者的信息
const showSenderInfo = (message) => {
  console.log('showSenderDialog', message)
  selectedSender.value = message
  showSenderDialog.value = true
}

// 发送私聊消息
const sendPrivateMessage = (id) => {
  router.push(`/chat/private/${id}`)
  showMemberDialog.value = false
  showSenderDialog.value = false
}

const sendMessage = () => {
  if (!messageText.value.trim()) return
  currentChat.value.messages.push({
    id: currentChat.value.messages.length + 1,
    content: messageText.value,
    senderId: mockUser.id,
    senderName: mockUser.name,
    avatar: mockUser.avatar
  })

  messageText.value = ''
}
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.nav-item.active {
  background-color: #409EFF;
  border-radius: 8px;
}

.chat-main {
  flex: 1;
  display: flex;
  border-right: 1px solid #dcdfe6;
}

.chat-list {
  width: 250px;
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
}

.search-bar {
  padding: 10px;
}

.chat-items {
  overflow-y: auto;
}

.chat-item {
  padding: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.chat-item.active {
  background-color: #e6f1fc;
}

.chat-info {
  margin-left: 10px;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 10px 20px;
  border-bottom: 1px solid #dcdfe6;
}

.message-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.message {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.message-self {
  flex-direction: row-reverse;
}

.message-content {
  margin: 0 10px;
  max-width: 60%;
}

.message-self .message-content {
  text-align: right;
}

.message-sender {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.message-text {
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-self .message-text {
  background-color: #409EFF;
  color: #fff;
}

.chat-input {
  padding: 10px;
  border-top: 1px solid #dcdfe6;
}

.toolbar {
  margin-bottom: 10px;
}

.toolbar .el-icon {
  margin-right: 10px;
  cursor: pointer;
  font-size: 20px;
}

.member-list {
  width: 200px;
  background-color: #fff;
  padding: 20px;
}

.member-item {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.member-item span {
  margin-left: 10px;
}

.el-button {
  margin-top: 10px;
}

/* 添加底部菜单样式 */
.bottom-menu {
  position: absolute;
  bottom: 20px;
  width: 100%;
  text-align: center;
}

.menu-trigger {
  color: #fff;
  cursor: pointer;
  padding: 8px;
}

.menu-trigger:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.member-info-content {
  padding: 20px;
}

.member-info-header {
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

/* 成员列表项添加鼠标样式 */
.member-item {
  cursor: pointer;
}

.member-item:hover {
  background-color: #f5f5f5;
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
12