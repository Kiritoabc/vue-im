<template>
  <div class="chat-container">

    <!-- 中间聊天列表和聊天区域 -->
    <div class="chat-main">
      <!-- 聊天列表 -->
      <div class="chat-list">
        <div class="search-bar">
          <el-input v-model="searchText" placeholder="搜索" />
        </div>
        <!-- 修改聊天项的点击事件 -->
        <div class="chat-items">
          <div v-for="chat in chatList"
               :key="`${chat.type}-${chat.id}`"
               :class="['chat-item', {
           active: currentChatId === chat.id &&
                  route.path.includes(chat.type)
         }]"
               @click="selectChat(chat)">
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
          <h2>{{ currentChat?.name }} </h2>
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
            <el-button type="primary" @click="showAIHelper = true">AI助手</el-button>
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
          <el-button
            v-if="!isFriend(selectedSender.id)"
            type="primary"
            @click="addFriend(selectedSender.id)">添加好友</el-button>
          <el-button
            v-else
            type="primary"
            @click="sendPrivateMessage(selectedSender.senderId)">发送消息</el-button>
          <el-button @click="showSenderDialog = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 右侧成员列表 -->
    <div class="member-list" v-if="isGroupChat">

      <!-- 群公告部分 -->
      <div class="group-announcement">
        <div class="section-header">
          <h3>群公告</h3>
          <el-button v-if="isGroupAdmin" type="text" @click="editAnnouncement">
            <el-icon><Edit /></el-icon>
          </el-button>
        </div>
        <div class="announcement-content">
          {{ currentGroup?.announcement || '暂无公告' }}
        </div>
      </div>

      <!-- 群成员部分 -->
      <div class="group-members">
        <div class="section-header">
          <h3>群成员 ({{ groupMembers.length }})</h3>
          <el-button type="primary" size="small" @click="showInviteDialog">
            <el-icon><Plus /></el-icon>邀请好友
          </el-button>
        </div>
        <div class="members-list">
          <div v-for="member in groupMembers"
               :key="member.id"
               class="member-item"
               @click="showMemberInfo(member)">
            <el-avatar :src="member.avatar" />
            <span class="member-name">{{ member.name }}</span>
          </div>
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

    <!-- 添加邀请好友对话框 -->
    <el-dialog v-model="showInvite" title="邀请好友加入群聊" width="500px">
      <div class="invite-dialog">
        <el-input
            v-model="searchFriend"
            placeholder="搜索好友"
            prefix-icon="Search"
            clearable
            @input="filterFriends"
        />
        <div class="friends-list">
          <el-checkbox-group v-model="selectedFriends">
            <div v-for="friend in filteredFriends"
                 :key="friend.id"
                 class="friend-item">
              <el-checkbox :label="friend.id">
                <div class="friend-info">
                  <el-avatar :size="30" :src="friend.avatar" />
                  <div class="friend-detail">
                    <span class="friend-name">{{ friend.name }}</span>
                    <span class="friend-status" :class="{ 'online': friend.status === '在线' }">
                  {{ friend.status }}
                </span>
                  </div>
                </div>
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showInvite = false">取消</el-button>
          <el-button type="primary" @click="inviteFriends">邀请</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- AI助手抽屉 -->
    <el-drawer
      title="AI助手"
      v-model="showAIHelper"
      :visible.sync="showAIHelper"
      size="400px"
      direction="rtl"
    >
      <div>
        <h3>欢迎使用AI助手！</h3>
        <p>您可以在这里总结群友聊天内容和查询相关资料。</p>
        <el-input v-model="aiQuery" placeholder="输入您的问题..." />
        <el-button type="primary" @click="queryAI">查询</el-button>
        <div v-if="aiResponse">
          <h4>AI助手回复：</h4>
          <p>{{ aiResponse }}</p>
        </div>
      </div>
    </el-drawer>

  </div>
</template>
<script setup>
import {ref, watch, computed, onMounted, onUnmounted} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from "axios";
import {ElMessage} from "element-plus";
import store from "../store/index.js";
import { Edit, Plus, Search } from '@element-plus/icons-vue'

// 添加新的响应式变量
const showInvite = ref(false)
const searchFriend = ref('')
const selectedFriends = ref([])
const filteredFriends = ref([])
const currentGroup = ref(null)

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

// 替换原来的 mockChats
const chatList = ref([])

// AI助手抽屉
const showAIHelper = ref(false) // 控制AI助手抽屉的显示
const aiQuery = ref('') // AI助手查询输入
const aiResponse = ref('') // AI助手的回复

// 查询AI助手
const queryAI = async () => {
  // 这里可以调用后端API来获取AI助手的回复
  // 假设我们有一个API可以查询AI助手
  try {
    const response = await axios.post('http://localhost:8080/im-server/ai/query', { query: aiQuery.value })
    aiResponse.value = response.data.answer // 假设返回的答案在answer字段中
  } catch (error) {
    console.error('查询AI助手失败:', error)
    ElMessage.error('查询失败')
  }
}

// 从 store 中获取用户信息
const userInfo = computed(() => store.state.userInfo)
// 添加一个计算属性来判断是否为群聊
const isGroupChat = computed(() => {
  return route.path.includes('group')
})

let ws = null

// 显示邀请对话框
const showInviteDialog = () => {
  showInvite.value = true
  searchFriend.value = ''
  selectedFriends.value = []
  // 获取最新的好友列表
  fetchFriendsList().then(() => {
    filterFriends()
  })
}

// 修改过滤好友的方法
const filterFriends = () => {
  if (!searchFriend.value) {
    filteredFriends.value = friends.value
  } else {
    filteredFriends.value = friends.value.filter(friend =>
        friend.name.toLowerCase().includes(searchFriend.value.toLowerCase())
    )
  }
}

// 邀请好友
const inviteFriends = async () => {
  if (selectedFriends.value.length === 0) {
    ElMessage.warning('请选择要邀请的好友')
    return
  }

  try {
    const token = localStorage.getItem('token')
    await axios.post('http://localhost:8080/im-server/groups/invite', {
      group_id: currentChatId.value,
      friend_ids: selectedFriends.value
    }, {
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    })

    ElMessage.success('邀请发送成功')
    showInvite.value = false
  } catch (error) {
    console.error('邀请好友失败:', error)
    ElMessage.error('邀请失败，请稍后重试')
  }
}


// 获取聊天列表数据
const fetchChatList = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:8080/im-server/friends/usr/friends_chat', {
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    })
    // 转换后台数据格式以匹配前端需求
    chatList.value = response.data.data.map(chat => ({
      id: chat.id,
      name: chat.name || chat.nickname, // 根据实际后台字段调整
      avatar: chat.avatar,
      lastMessage: chat.lastMessage || '暂无消息',
      type: chat.type || 'personal', // 根据实际后台字段调整
      messages: chat.messages || [] // 如果后台直接提供消息列表
    }))
  } catch (error) {
    console.error('获取聊天列表失败:', error)
    ElMessage.error('获取聊天列表失败')
  }
}

// 将原来的模拟数据改为响应式空数组
const friends = ref([])

// 添加获取好友列表的方法
const fetchFriendsList = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:8080/im-server/friends/all', {
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    })

    if (response.status === 200) {
      // 转换数据格式以匹配前端需求
      friends.value = response.data.data.map(friend => ({
        id: friend.id,
        name: friend.name,
        avatar: friend.avatar,
        status: friend.status ? friend.status : '离线',
        email: friend.email,
        phoneNumber: friend.phone_number,
        bio: friend.bio,
        gender: friend.gender,
        city: friend.city
      }))
    }
  } catch (error) {
    console.error('获取好友列表失败:', error)
    ElMessage.error('获取好友列表失败')
  }
}


// 判断是否是好友
const isFriend = (id) => {
  return friends.value.some(friend => friend.id === id)
}

// 添加好友
const addFriend = (id) => {
  // 处理添加好友的逻辑
  console.log(`添加好友: ${id}`)
}

// 监听路由变化
watch(
    () => route.params,
    (newParams) => {
      if (newParams.id) {
        currentChatId.value = parseInt(newParams.id)
        // 从路由中获取类型（group 或 personal）
        const chatType = route.path.includes('group') ? 'group' : 'personal'
        console.log('当前聊天ID:', currentChatId.value, '类型:', chatType)
        // 更新当前聊天
        const chat = chatList.value.find(
            chat => chat.id === currentChatId.value && chat.type === chatType
        )
        if (chat) {
          currentChat.value = chat
          // 如果是群聊，获取群成员列表
          if (chatType === 'group') {
            fetchGroupMembers(currentChatId.value)
          }
        }
      }
    },
    { immediate: true, deep: true }
)

// 模拟数据
const mockUser = {
  id: userInfo.value.id,
  name: userInfo.value.name,
  avatar: userInfo.value.avatar
}

// 后台数据
// 将 mockMembers 改为响应式数据
const groupMembers = ref([])

// 修改当前聊天的计算属性
const currentChat = computed(() => {
  const chatType = route.path.includes('group') ? 'group' : 'personal'
  return chatList.value.find(
      chat => chat.id === currentChatId.value && chat.type === chatType
  )
})

// 当前消息列表
const currentMessages = computed(() => {
  return currentChat.value?.messages || []
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

// 添加选择聊天的方法
const selectChat = (chat) => {
  router.push(`/chat/${chat.type}/${chat.id}`)
}

// 添加获取群成员的方法
const fetchGroupMembers = async (groupId) => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`http://localhost:8080/im-server/groups/members`, {
      params: {
        group_id: groupId
      },
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    })

    if (response.status === 200) {
      // 转换数据格式
      groupMembers.value = response.data.data.map(member => ({
        id: member.id,
        name: member.username,
        avatar: member.avatar_url,
        email: member.email,
        phoneNumber: member.phone_number,
        bio: member.bio,
        gender: member.gender,
        city: member.city,
        joinTime: member.created_at
      }))
    }
  } catch (error) {
    console.error('获取群成员失败:', error)
    ElMessage.error('获取群成员失败')
  }
}

 // 创建 WebSocket 连接
const connectWebSocket = () => {
  // const token = localStorage.getItem('token')
  ws = new WebSocket(`ws://localhost:8080/im-server/private/chat`)
  ws.onopen = () => {
    console.log('WebSocket 连接已建立')
    ws.send(userInfo.value.id)
  }
  // 接收到消息
  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)
      const newMessage = {
        id: message.id || Date.now(),
        content: message.content,
        senderId: message.senderId,
        receiverId: message.receiverId,
        senderName: message.senderName,
        avatar: message.avatar
      }
      console.log(newMessage)
      // 根据消息类型处理
      if (message.messageType === 'private') {
        // 处理私聊消息
        if (message.receiverId === userInfo.value.id) {
          if (!currentChat.value.messages) {
            currentChat.value.messages = []
          }
          currentChat.value.messages.push(newMessage)
        }
      } else if (message.messageType === 'group') {
        // 处理群聊消息
        if (currentChat.value.type === 'group' && message.groupId === currentChat.value.id) {
          if (!currentChat.value.messages) {
            currentChat.value.messages = []
          }
          currentChat.value.messages.push(newMessage)
        }
      }
    } catch (error) {
      console.error('处理消息失败:', error)
    }
  }
  ws.onclose = () => {
    console.log('WebSocket 连接已关闭')
    // 可以在这里添加重连逻辑
    setTimeout(connectWebSocket, 5000)
  }
  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error)
    ElMessage.error('连接出错，正在重试...')
  }
}

// todo：发送消息时更新聊天列表
const sendMessage = async () => {
  if (!messageText.value.trim() || !ws || ws.readyState !== WebSocket.OPEN) return
  try {
    // 添加到本地消息列表（乐观更新）
    const newMessage = {
      id: currentChat.value.messages.length + 1,
      senderId: userInfo.value.id,
      senderName: userInfo.value.username,
      avatar: userInfo.value.avatar,
      content: messageText.value,
      messageType: currentChat.value.type === 'group' ? 'group' : 'private', // 根据聊天类型设置消息类型
      groupId: currentChat.value.type === 'group' ? currentChat.value.id : null, // 如果是群聊，设置群ID
      receiverId: currentChat.value.type === 'personal' ? currentChat.value.id : null // 如果是私聊，设置接收者ID
    }
    ws.send(JSON.stringify(newMessage))
    if (!currentChat.value.messages) {
      currentChat.value.messages = []
    }
    console.log(JSON.stringify(newMessage))
    currentChat.value.messages.push(newMessage)
    // 更新最后一条消息
    currentChat.value.lastMessage = messageText.value
    // 清空输入框
    messageText.value = ''
  } catch (error) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
  }
}

// 在组件挂载时建立连接
onMounted(() => {
  fetchChatList()
  connectWebSocket()
  fetchFriendsList() // 添加这一行
})

// 在组件卸载时关闭连接
onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})

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
/* 修改成员列表容器样式 */
.member-list {
  width: 200px;
  background-color: #fff;
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 群公告部分样式 */
.group-announcement {
  height: 30%;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
  margin-bottom: 15px;
}

.announcement-content {
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 4px;
  height: calc(100% - 40px);
  overflow-y: auto;
  font-size: 14px;
  color: #666;
}

/* 群成员部分样式 */
.group-members {
  height: 70%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
}

.members-list {
  flex: 1;
  overflow-y: auto;
}

/* 邀请对话框样式 */
.friend-info {
  display: flex;
  align-items: center;
  margin-left: 8px;
  width: 100%;
}

.friend-detail {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}

.friend-name {
  font-size: 14px;
  color: #333;
}

.friend-status {
  font-size: 12px;
  color: #999;
}

.friend-status.online {
  color: #67C23A;
}

.friend-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.friend-item:last-child {
  border-bottom: none;
}

:deep(.el-checkbox) {
  width: 100%;
  margin-right: 0;
}

:deep(.el-checkbox__label) {
  width: 100%;
}

.friends-list {
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
  padding: 0 10px;
}

.invite-dialog {
  padding: 0 20px;
}

/* 修复之前的样式错误 */
.chat-main {
  flex: 1;
  display: flex;
  border-right: 1px solid #dcdfe6;
  width: v-bind('isGroupChat ? "calc(100% - 200px)" : "100%"');
}

</style>
