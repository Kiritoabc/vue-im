<template>
  <div class="chat-container">

    <!-- 中间聊天列表和聊天区域 -->
    <div class="chat-main">
      <!-- 聊天列表 -->
      <div class="chat-list">
        <div class="search-bar" style="position: relative;">
          <el-input v-model="searchText" placeholder="搜索好友/群聊"
                    @input="onSearchInput"
                    @focus="showSearchDropdown = true"
                    @blur="onSearchBlur" />
          <!-- 搜索下拉结果 -->
          <div v-if="showSearchDropdown && searchText && (searchDropdownFriends.length || searchDropdownGroups.length)" class="search-dropdown">
            <div v-if="searchDropdownFriends.length">
              <div class="search-dropdown-title">好友</div>
              <div
                v-for="friend in searchDropdownFriends"
                :key="'friend-' + friend.id"
                class="search-dropdown-item"
                @mousedown.prevent="startChatWithFriend(friend)"
              >
                <el-avatar :src="friend.avatar" size="small" />
                <span style="margin-left: 8px;">{{ friend.name }}</span>
              </div>
            </div>
            <div v-if="searchDropdownGroups.length">
              <div class="search-dropdown-title">群聊</div>
              <div
                v-for="group in searchDropdownGroups"
                :key="'group-' + group.id"
                class="search-dropdown-item"
                @mousedown.prevent="startChatWithGroup(group)"
              >
                <el-avatar :src="group.avatar" size="small" />
                <span style="margin-left: 8px;">{{ group.name }}</span>
              </div>
            </div>
          </div>
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
              <div class="message-info">
                <div class="message-sender">
                  {{ msg.senderName }}
                  <!-- 添加角色标签 -->
                  <span v-if="isGroupChat"
                    class="message-role-tag"
                    :class="{
                      'role-owner': getMemberRole(msg.senderId) === 'owner',
                      'role-admin': getMemberRole(msg.senderId) === 'admin',
                      'role-member': getMemberRole(msg.senderId) === 'member'
                    }"
                  >
                    {{ getRoleText(getMemberRole(msg.senderId)) }}
                  </span>
                </div>
                <div class="message-text">{{ msg.content }}</div>
              </div>
              <div class="message-actions">
                <el-button type="text" size="small" @click.stop="replyToMessage(msg)">
                  <el-icon><ChatLineRound /></el-icon> 回复
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <!-- 修改输入区域样式 -->
        <div class="chat-input">
          <div class="input-wrapper">
            <el-input
                v-model="messageText"
                type="text"
                placeholder="输入消息..."
                :suffix-icon="SmileFilled"
                class="message-input"
            >
              <template #prefix>
                <el-icon><Plus /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" circle @click="sendMessage">
              <el-icon><Position /></el-icon>
            </el-button>
          </div>
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
            <h2>{{ selectedSender.name }}</h2>
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
            @click="sendPrivateMessage(selectedSender.id)">发送消息</el-button>
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
          <div class="header-actions">
            <el-button v-if="isGroupOwner" type="text" @click="showMemberSettings">
              <el-icon><Setting /></el-icon>
            </el-button>
            <el-button type="primary" size="small" @click="showInviteDialog">
              <el-icon><Plus /></el-icon>邀请好友
            </el-button>
          </div>
        </div>
        <div class="members-list">
          <div v-for="member in groupMembers"
               :key="member.id"
               class="member-item"
               @click="showMemberInfo(member)">
            <el-avatar :src="member.avatar" />
            <span
              class="member-role-tag"
              :class="{
                'role-owner': member.role === 'owner',
                'role-admin': member.role === 'admin',
                'role-member': member.role === 'member'
              }"
            >
              {{ member.role === 'owner' ? '群主' : member.role === 'admin' ? '管理员' : '成员' }}
            </span>
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
            <div class="account">账号：{{ selectedMember.id }}</div>
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
          <el-button type="primary" @click="sendPrivateMessage(selectedMember.account)">发送消息</el-button>
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

    <!-- 添加浮动AI助手按钮和聊天框 -->
    <div
      class="ai-chat-widget"
      :class="{ 'ai-chat-expanded': aiChatExpanded }"
      ref="aiChatWidget"
      :style="{
        left: widgetLeft + 'px',
        top: widgetTop + 'px',
        width: widgetWidth + 'px',
        height: aiChatExpanded ? widgetHeight + 'px' : 'auto',
        transition: isDragging || isResizing ? 'none' : 'all 0.3s'
      }"
      @mousedown.prevent="startDrag">
      <div class="drag-handle" @mousedown.prevent="startDrag">
        <!-- 拖动把手 -->
        <el-button
            v-if="!aiChatExpanded"
            class="ai-chat-button"
            type="primary"
            circle
            @click="toggleAIChat">
          <el-icon><ChatDotRound /></el-icon>
        </el-button>
      </div>
      <div v-if="aiChatExpanded" class="ai-chat-container">
        <div class="ai-chat-header">
          <span>智能助手</span>
          <el-button type="text" @click="toggleAIChat">
            <el-icon><Close /></el-icon>
          </el-button>
        </div>

        <div class="ai-chat-messages" ref="aiChatMessages">
          <div v-for="(msg, index) in aiMessages" :key="index"
               :class="['ai-message', { 'ai-message-bot': msg.sender === 'bot', 'ai-message-user': msg.sender === 'user' }]">
            <div v-if="msg.sender === 'bot'" class="ai-avatar">
              <el-avatar :size="30" src="https://cdn.jsdelivr.net/gh/Kiritoabc/my_cdn/img/header.jpg" />
            </div>
            <div class="ai-message-content">
              <template v-if="msg.type === 'text'">{{ msg.content }}</template>
              <template v-else-if="msg.type === 'options'">
                <div class="ai-options">
                  <el-button
                      v-for="option in msg.options"
                      :key="option.value"
                      size="small"
                      @click="selectOption(option)">
                    {{ option.label }}
                  </el-button>
                </div>
              </template>
            </div>
            <div v-if="msg.sender === 'user'" class="ai-avatar user-avatar">
              <el-avatar :size="30" :src="userInfo.avatar_url || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
            </div>
          </div>
          <div v-if="aiTyping" class="ai-message ai-message-bot ai-typing">
            <div class="ai-avatar">
              <el-avatar :size="30" src="https://cdn.jsdelivr.net/gh/Kiritoabc/my_cdn/img/header.jpg" />
            </div>
            <div class="ai-typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <div class="ai-chat-input">
          <el-input
              v-model="aiInputMessage"
              placeholder="请输入问题..."
              :disabled="aiTyping"
              @keyup.enter="sendAIMessage" />
          <el-button type="primary" :disabled="aiTyping" @click="sendAIMessage">发送</el-button>
        </div>

        <!-- 添加调整大小的把手 -->
        <div class="resize-handle" @mousedown.prevent.stop="startResize">
          <el-icon><Rank /></el-icon>
        </div>
      </div>
    </div>

    <!-- 添加群成员设置对话框 -->
    <el-dialog v-model="showMemberSettingsDialog" title="群成员管理" width="500px">
      <div class="member-settings">
        <div v-for="member in groupMembers" :key="member.id" class="member-setting-item">
          <div class="member-info">
            <el-avatar :size="40" :src="member.avatar" />
            <span class="member-name">{{ member.name }}</span>
            <span class="member-role-tag" :class="'role-' + member.role">
              {{ getRoleText(member.role) }}
            </span>
          </div>
          <div class="member-actions">
            <el-select
              v-if="member.role !== 'owner'"
              v-model="member.role"
              size="small"
              @change="(value) => updateMemberRole(member.id, value)"
            >
              <el-option label="管理员" value="admin" />
              <el-option label="普通成员" value="member" />
            </el-select>
          </div>
        </div>
      </div>
    </el-dialog>

  </div>
</template>
<script setup>
import {ref, watch, computed, onMounted, onUnmounted, nextTick, h} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '../utils/request'
import {ElMessage, ElNotification} from "element-plus";
import store from "../store/index.js";
import {Edit, Plus, Position, Search, Setting} from '@element-plus/icons-vue'
import { Close, ChatDotRound, Rank, ChatLineRound } from '@element-plus/icons-vue'

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

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
// AI聊天组件相关变量
const aiChatExpanded = ref(false)
const aiMessages = ref([
  {
    sender: 'bot',
    type: 'text',
    content: '您好，我是AI助手，有什么可以帮您的吗？'
  },
  {
    sender: 'bot',
    type: 'options',
    options: [
      // { label: '搜索支持文章', value: 'search' },
      { label: '上下文总结', value: 'ticket' },
    ]
  }
])
const aiInputMessage = ref('')
const aiTyping = ref(false)
const aiChatMessages = ref(null)

// 新增拖动相关响应式变量
const aiChatWidget = ref(null)
const isDragging = ref(false)
const widgetLeft = ref(20)
const widgetTop = ref(20)
const widgetWidth = ref(350)
const widgetHeight = ref(500)
const isResizing = ref(false)
const resizeStartX = ref(0)
const resizeStartY = ref(0)
const resizeStartWidth = ref(0)
const resizeStartHeight = ref(0)
let startX = 0
let startY = 0
let offsetX = 0
let offsetY = 0

// 修改拖动逻辑处理
const startDrag = (e) => {
  // 如果点击的是按钮或调整大小把手，不启动拖动
  if (e.target.closest('.el-button') || e.target.closest('.resize-handle')) return

  // 其余拖动逻辑保持不变
  if (aiChatExpanded.value) {
    const rect = aiChatWidget.value.getBoundingClientRect()
    offsetX = e.clientX - rect.left
    offsetY = e.clientY - rect.top
  } else {
    offsetX = e.clientX - aiChatWidget.value.getBoundingClientRect().left
    offsetY = e.clientY - aiChatWidget.value.getBoundingClientRect().top
  }

  isDragging.value = true
  startX = e.clientX
  startY = e.clientY

  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

const handleDrag = (e) => {
  if (!isDragging.value) return
  widgetLeft.value = e.clientX - offsetX
  widgetTop.value = e.clientY - offsetY
}

const stopDrag = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 切换AI聊天框显示状态
const toggleAIChat = () => {
  aiChatExpanded.value = !aiChatExpanded.value
  if (aiChatExpanded.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 发送消息给AI
const sendAIMessage = async () => {
  if (!aiInputMessage.value.trim()) return

  // 添加用户消息
  aiMessages.value.push({
    sender: 'user',
    type: 'text',
    content: aiInputMessage.value,
    id: Date.now()
  })

  aiInputMessage.value = ''
  scrollToBottom()
  const userInput2 = aiInputMessage.value
  // 显示AI正在输入
  aiTyping.value = true

  try {
    // 初始化 WebSocket 连接
    const ws = new WebSocket('ws://localhost:8080/im-server/ws')

    ws.onopen = () => {
      // 发送用户消息
      const userMessage = {
        userId: userInfo.value.id,
        content: userInput2,
      }
      ws.send(JSON.stringify(userMessage))
    }

    // 处理AI的回复
    ws.onmessage = (event) => {
      if (aiTyping.value) {
        // 第一次收到消息时，创建AI消息
        aiTyping.value = false
        aiMessages.value.push({
          sender: 'bot',
          type: 'text',
          content: event.data,
          id: 'streaming'
        })
      } else {
        // 追加流式数据
        const aiMessage = aiMessages.value.find(msg => msg.id === 'streaming')
        if (aiMessage) {
          aiMessage.content += event.data
        }
      }
      scrollToBottom()
    }

    ws.onclose = () => {
      // 标记流式消息完成
      const aiMessage = aiMessages.value.find(msg => msg.id === 'streaming')
      if (aiMessage) {
        aiMessage.id = Date.now()
      }
      aiTyping.value = false

      // 在消息完成后添加选项
      aiMessages.value.push({
        sender: 'bot',
        type: 'options',
        options: [
          { label: '上下文总结', value: 'ticket' }
        ]
      })
      scrollToBottom()
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      aiTyping.value = false
      aiMessages.value.push({
        sender: 'bot',
        type: 'text',
        content: '抱歉，连接出现问题，请稍后再试。',
        id: Date.now()
      })
    }
  } catch (error) {
    console.error('AI请求失败:', error)
    aiTyping.value = false
    aiMessages.value.push({
      sender: 'bot',
      type: 'text',
      content: '请求失败，请稍后再试',
      id: Date.now()
    })
  }
}

// 选择预设选项
const selectOption = async (option) => {
  // 添加用户选择的选项作为消息
  aiMessages.value.push({
    sender: 'user',
    type: 'text',
    content: option.label
  })

  // 滚动到底部
  await nextTick()
  scrollToBottom()

  // 显示机器人正在输入
  aiTyping.value = true

  // 模拟API调用延迟
  setTimeout(async () => {
    let response = ''

    if (option.value === 'search') {
      response = '您可以在下方输入关键词，我会为您搜索相关支持文章。'
    } else if (option.value === 'ticket') {
      try {
        const response = await request.post('/chat/summary', {
          chat_type: route.path.includes('group') ? 'group' : 'private',
          user_id: userInfo.value.id,
          to_id: currentChatId.value
        })

        aiTyping.value = false
        // 添加机器人回复
        aiMessages.value.push({
          sender: 'bot',
          type: 'text',
          content: response.data.summary || '暂无聊天记录可供总结'
        })

        // 在总结后添加选项按钮
        aiMessages.value.push({
          sender: 'bot',
          type: 'options',
          options: [
            { label: '上下文总结', value: 'ticket' }
          ]
        })

      } catch (error) {
        console.error('获取聊天总结失败:', error)
        aiTyping.value = false
        aiMessages.value.push({
          sender: 'bot',
          type: 'text',
          content: '获取聊天总结失败，请稍后重试'
        })
      }
    }

    // 添加机器人回复
    if (response) {
      aiMessages.value.push({
        sender: 'bot',
        type: 'text',
        content: response
      })
    }

    aiTyping.value = false

    // 滚动到底部
    await nextTick()
    scrollToBottom()
  }, 1000)
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (aiChatMessages.value) {
      aiChatMessages.value.scrollTop = aiChatMessages.value.scrollHeight
    }
  })
}

// 监听AI聊天框展开状态
watch(aiChatExpanded, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

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
    await request.post('/groups/invite', {
      group_id: currentChatId.value,
      friend_ids: selectedFriends.value
    })

    ElMessage.success('邀请发送成功')
    showInvite.value = false
  } catch (error) {
    console.error('邀请好友失败:', error)
  }
}


// 获取聊天列表数据
const fetchChatList = async () => {
  try {
    const response = await request.get('/friends/usr/friends_chat')
    // 转换后台数据格式以匹配前端需求
    chatList.value = response.data.map(chat => ({
      id: chat.id,
      name: chat.name || chat.nickname,
      avatar: chat.avatar,
      lastMessage: chat.lastMessage || '暂无消息',
      type: chat.type || 'personal',
      messages: chat.messages || []
    }))
  } catch (error) {
    console.error('获取聊天列表失败:', error)
  }
}

// 将原来的模拟数据改为响应式空数组
const friends = ref([])

// 添加获取好友列表的方法
const fetchFriendsList = async () => {
  try {
    const response = await request.get('/friends/all')
    if (response.code === 200) {
      friends.value = response.data.map(friend => ({
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
  // 从 groupMembers 中查找对应的成员信息
  const member = groupMembers.value.find(m => m.id === message.senderId)
  if (member) {
    // 使用与 showMemberInfo 相同的数据格式
    selectedMember.value = {
      id: member.id,
      name: member.name,
      nickname: member.name,
      avatar: member.avatar,
      account: member.id,
      status: member.status || '在线',
      groupNickname: member.groupNickname,
      gender: member.gender,
      location: member.city,
      joinTime: member.joinTime
    }
    // 使用成员信息弹窗而不是发送者弹窗
    showMemberDialog.value = true
  } else {
    // 如果找不到成员信息，则使用原来的发送者信息展示
    selectedSender.value = message
    showSenderDialog.value = true
  }
}

// 发送私聊消息
const sendPrivateMessage = (id) => {
  router.push(`/chat/personal/${id}`)
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
    const response = await request.get('/groups/members', {
      params: {
        group_id: groupId
      }
    })
    if (response.code === 200) {
      groupMembers.value = response.data.map(member => ({
        id: member.id,
        name: member.username,
        avatar: member.avatar_url,
        email: member.email,
        phoneNumber: member.phone_number,
        bio: member.bio,
        gender: member.gender,
        city: member.city,
        joinTime: member.created_at,
        role: member.role
      }))
    }
  } catch (error) {
    console.error('获取群成员失败:', error)
  }
}

 // 创建 WebSocket 连接 ,获取消息
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
      console.log("获取到的消息")
      console.log(newMessage)
      // 根据消息类型处理
      if (message.messageType === 'private') {
        // 处理私聊消息
        console.log("获取到私聊的消息")
        if (message.receiverId === userInfo.value.id) {
          // 检查是否在当前聊天页面
          const isCurrentChat = route.path === `/chat/personal/${message.senderId}`

          if (!isCurrentChat) {
            // 显示消息通知
            ElNotification({
              title: message.senderName,
              message: h('div', { class: 'notification-content' }, [
                h('img', {
                  src: message.avatar,
                  class: 'notification-avatar',
                  style: {
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    marginRight: '10px'
                  }
                }),
                h('div', { class: 'notification-message' }, [
                  h('div', { class: 'notification-sender' }, message.senderName),
                  h('div', { class: 'notification-text' }, message.content)
                ])
              ]),
              type: 'success',
              duration: 5000,
              position: 'top-right',
              customClass: 'custom-notification',
              onClick: () => {
                // 点击通知时跳转到对应的聊天页面
                router.push(`/chat/personal/${message.senderId}`)
              }
            })
          }

          if (!currentChat.value.messages) {
            currentChat.value.messages = []
          }
          // 当前消息
          if (currentChat.value.type === 'personal') {
            currentChat.value.messages.push(newMessage)
          } else {
            // 将消息添加到chatList中去
            const chat = chatList.value.find(chat =>
                chat.id === message.senderId &&
                chat.type === 'personal')
            if (chat) {
              chat.lastMessage = newMessage.content
              chat.messages = chat.messages || []
              chat.messages.push(newMessage)
            }
          }

        }
      } else if (message.messageType === 'group') {
        // 处理群聊消息
        console.log("获取到群聊的消息")
        if (message.groupId === currentChat.value.id) {
          // 检查是否在当前聊天页面
          const isCurrentChat = route.path === `/chat/group/${message.groupId}`

          if (!isCurrentChat) {
            // 显示消息通知
            ElNotification({
              title: `${message.senderName} - ${message.groupName || '群聊'}`,
              message: h('div', { class: 'notification-content' }, [
                h('img', {
                  src: message.avatar,
                  class: 'notification-avatar',
                  style: {
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    marginRight: '10px'
                  }
                }),
                h('div', { class: 'notification-message' }, [
                  h('div', { class: 'notification-sender' }, `${message.senderName} - ${message.groupName || '群聊'}`),
                  h('div', { class: 'notification-text' }, message.content)
                ])
              ]),
              type: 'success',
              duration: 5000,
              position: 'top-right',
              customClass: 'custom-notification',
              onClick: () => {
                // 点击通知时跳转到对应的群聊页面
                router.push(`/chat/group/${message.groupId}`)
              }
            })
          }

          if (!currentChat.value.messages) {
            currentChat.value.messages = []
          }
          // 当前消息
          if (currentChat.value.type === 'group') {
            currentChat.value.messages.push(newMessage)
          } else {
            // 将消息添加到chatList中去
            const chat = chatList.value.find(chat =>
                chat.id === message.groupId &&
                chat.type === 'group')
            if (chat) {
              chat.lastMessage = newMessage.content
              chat.messages = chat.messages || []
              chat.messages.push(newMessage)
            }
          }
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
  }
}

// todo：发送消息时更新聊天列表
const sendMessage = async () => {
  if (!messageText.value.trim() || !ws || ws.readyState !== WebSocket.OPEN) return
  try {
    // 添加到本地消息列表（乐观更新）
    console.log(userInfo.value.avatar_url)
    const newMessage = {
      id: currentChat.value.messages.length + 1,
      senderId: userInfo.value.id,
      senderName: userInfo.value.username,
      avatar: userInfo.value.avatar_url,
      content: messageText.value,
      messageType: currentChat.value.type === 'group' ? 'group' : 'private', // 根据聊天类型设置消息类型
      groupId: currentChat.value.type === 'group' ? currentChat.value.id : null, // 如果是群聊，设置群ID
      receiverId: currentChat.value.type === 'personal' ? currentChat.value.id : null, // 如果是私聊，设置接收者ID
      createdAt: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).replace(/\//g, '-').replace(/,/g, 'T') + '+08:00'
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

// 开始调整大小
const startResize = (e) => {
  isResizing.value = true
  resizeStartX.value = e.clientX
  resizeStartY.value = e.clientY
  resizeStartWidth.value = widgetWidth.value
  resizeStartHeight.value = widgetHeight.value

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

// 处理调整大小
const handleResize = (e) => {
  if (!isResizing.value) return

  const dx = e.clientX - resizeStartX.value
  const dy = e.clientY - resizeStartY.value

  // 设置最小尺寸限制
  widgetWidth.value = Math.max(300, resizeStartWidth.value + dx)
  widgetHeight.value = Math.max(400, resizeStartHeight.value + dy)
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 在组件挂载时建立连接
onMounted(() => {
  fetchChatList()
  connectWebSocket()
  fetchFriendsList() // 添加这一行
  fetchGroupList()
  // 获取窗口尺寸
  const { innerWidth, innerHeight } = window
  // 设置初始位置在右下角（右侧20px，底部120px）
  widgetLeft.value = innerWidth - 320  // 假设浮窗宽度320px
  widgetTop.value = innerHeight - 200   // 距离底部200px

})

// 在组件卸载时清理事件监听
onUnmounted(() => {
  if (ws) {
    ws.close()
  }
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})

// 修改回复消息的方法，添加原消息内容
const replyToMessage = (message) => {
  // 获取原消息内容，如果过长则截断
  const originalContent = message.content.length > 20
    ? message.content.substring(0, 20) + '...'
    : message.content;

  // 在输入框中添加@用户名和原消息内容
  messageText.value = `@${message.senderName} 「${originalContent}」 `

  // 聚焦输入框
  nextTick(() => {
    const inputEl = document.querySelector('.message-input input')
    if (inputEl) {
      inputEl.focus()

      // 将光标移动到文本末尾
      if (inputEl.setSelectionRange) {
        const len = messageText.value.length
        inputEl.setSelectionRange(len, len)
      }
    }
  })
}

const showSearchDropdown = ref(false)
const searchDropdownFriends = ref([])
const searchDropdownGroups = ref([])

// 群聊列表（只包含你加入/管理/创建的群）
const myGroups = ref([])

// 搜索输入时过滤好友和群聊
const onSearchInput = () => {
  if (!searchText.value) {
    searchDropdownFriends.value = []
    searchDropdownGroups.value = []
    return
  }
  const keyword = searchText.value.toLowerCase()
  searchDropdownFriends.value = friends.value.filter(friend =>
    friend.name && friend.name.toLowerCase().includes(keyword)
  )
  searchDropdownGroups.value = myGroups.value.filter(group =>
    group.name && group.name.toLowerCase().includes(keyword)
  )
}

// 点击搜索结果发起聊天
const startChatWithFriend = (friend) => {
  showSearchDropdown.value = false
  searchText.value = ''
  router.push(`/chat/personal/${friend.id}`)
}
const startChatWithGroup = (group) => {
  showSearchDropdown.value = false
  searchText.value = ''
  router.push(`/chat/group/${group.id}`)
}

// 失焦时隐藏下拉
const onSearchBlur = () => {
  setTimeout(() => {
    showSearchDropdown.value = false
  }, 200)
}

// 获取群聊列表时合并
const fetchGroupList = async () => {
    const response = await request.get('/groups/my_groups')
      // 合并所有群聊
      myGroups.value = [
        ...(response.data.created_groups || []),
        ...(response.data.managed_groups || []),
        ...(response.data.joined_groups || [])
      ]
}

// 获取成员角色
const getMemberRole = (senderId) => {
  const member = groupMembers.value.find(m => m.id === senderId)
  return member ? member.role : 'member'
}

// 获取角色显示文本
const getRoleText = (role) => {
  switch (role) {
    case 'owner':
      return '群主'
    case 'admin':
      return '管理员'
    case 'member':
      return '成员'
    default:
      return ''
  }
}

// 添加群成员设置相关的响应式变量
const showMemberSettingsDialog = ref(false)

// 判断当前用户是否为群主
const isGroupOwner = computed(() => {
  const currentMember = groupMembers.value.find(member => member.id === userInfo.value.id)
  return currentMember?.role === 'owner'
})

// 显示群成员设置对话框
const showMemberSettings = () => {
  showMemberSettingsDialog.value = true
}

// 更新群成员角色
const updateMemberRole = async (memberId, newRole) => {
  try {
    await request.post('/groups/update_member_role', {
      group_id: currentChatId.value,
      member_id: memberId,
      role: newRole
    })
    ElMessage.success('角色更新成功')
    // 重新获取群成员列表
    await fetchGroupMembers(currentChatId.value)
  } catch (error) {
    console.error('更新成员角色失败:', error)
    ElMessage.error('更新角色失败')
  }
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

.search-bar {
  padding: 10px;
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

.message {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
  gap: 12px;
}

.message-self {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 80%;
}

.message-info {
  display: flex;
  flex-direction: column;
}

.message-self .message-info {
  align-items: flex-end;
}

.message-sender {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.message-text {
  padding: 8px 12px;
  border-radius: 8px;
  color: #1e1e1e;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  word-break: break-word;
}

.message-self .message-text {
  background: #dcf8c6;
  color: #1e1e1e;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.2s;
  margin-top: 4px;
}

.message:hover .message-actions {
  opacity: 1;
}

.message-role-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: bold;
  padding: 1px 6px;
  border-radius: 8px;
  vertical-align: middle;
}

/* 保持原有的角色样式 */
.message-role-tag.role-owner {
  background: #ffe066;
  color: #b8860b;
}

.message-role-tag.role-admin {
  background: #e0c3fc;
  color: #7c3aed;
}

.message-role-tag.role-member {
  background: #cce5ff;
  color: #2563eb;
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

/* AI聊天组件样式 */
.ai-chat-widget {
  position: fixed;
  right: 32px;
  bottom: 108px;
  z-index: 1000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ai-chat-button {
  width: 50px;
  height: 50px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}


.ai-chat-header {
  padding: 12px 16px;
  background-color: #4468e3;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ai-chat-header .el-button {
  color: white;
  font-size: 16px;
}

.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 200px;
}

.ai-message {
  display: flex;
  margin-bottom: 12px;
  align-items: flex-start;
}

.ai-message-bot {
  justify-content: flex-start;
  padding-right: 15%;
}

.ai-message-user {
  justify-content: flex-end;
  padding-left: 15%;
}

.ai-avatar {
  margin: 0 8px;
}

.user-avatar {
  order: 1;
}

.ai-message-content {
  padding: 10px 12px;
  border-radius: 8px;
  max-width: 100%;
  word-break: break-word;
}

.ai-message-bot .ai-message-content {
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.ai-message-user .ai-message-content {
  background-color: #4468e3;
  color: white;
  order: 0;
}

.ai-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ai-chat-input {
  padding: 12px;
  display: flex;
  border-top: 1px solid #ebeef5;
}

.ai-chat-input .el-input {
  margin-right: 8px;
}

/* 打字指示器动画 */
.ai-typing-indicator {
  display: flex;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
}

.ai-typing-indicator span {
  height: 8px;
  width: 8px;
  background: #4468e3;
  border-radius: 50%;
  display: block;
  margin: 0 2px;
  opacity: 0.4;
}

.ai-typing-indicator span:nth-child(1) {
  animation: typing 1s infinite 0s;
}

.ai-typing-indicator span:nth-child(2) {
  animation: typing 1s infinite 0.2s;
}

.ai-typing-indicator span:nth-child(3) {
  animation: typing 1s infinite 0.4s;
}

@keyframes typing {
  0% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.4; transform: scale(1); }
}

/* 消息区域样式 */
.message-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f7fb;
}

.message {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
  gap: 12px;
}

.message-self {
  flex-direction: row-reverse;
}

.message-content {
  max-width: 80%;
}

.message-info {
  display: flex;
  flex-direction: column;
}

.message-self .message-info {
  align-items: flex-end;
}

.message-sender {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.message-text {
  padding: 8px 12px;
  border-radius: 8px;
  color: #1e1e1e;
  font-size: 14px;
  line-height: 1.4;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  word-break: break-word;
}

.message-self .message-text {
  background: #dcf8c6;
  color: #1e1e1e;
}

.message-actions {
  display: flex;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.2s;
  margin-top: 4px;
}

.message:hover .message-actions {
  opacity: 1;
}

.message-role-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: bold;
  padding: 1px 6px;
  border-radius: 8px;
  vertical-align: middle;
}

/* 保持原有的角色样式 */
.message-role-tag.role-owner {
  background: #ffe066;
  color: #b8860b;
}

.message-role-tag.role-admin {
  background: #e0c3fc;
  color: #7c3aed;
}

.message-role-tag.role-member {
  background: #cce5ff;
  color: #2563eb;
}

/* 输入区域样式 */
.chat-input {
  padding: 16px 24px; /* 增加上下内边距 */
  background: white;
  border-top: 1px solid #e9edef;
}


.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-input {
  flex: 1;
}

:deep(.el-input__wrapper) {
  padding: 12px 16px; /* 增加输入框内部空间 */
  border-radius: 24px;
  background: #f0f2f5;
  height: 48px; /* 增加输入框高度 */
}

:deep(.el-input__inner) {
  font-size: 15px;
  color: #1e1e1e; /* 修改字体颜色为黑色 */
}

:deep(.el-input__inner::placeholder) {
  color: #666; /* 修改占位符文字颜色,让它更清晰 */
}

/* 修改发送按钮大小 */
:deep(.el-button.is-circle) {
  width: 48px; /* 增加按钮尺寸 */
  height: 48px;
}

/* 修改顶部输入框样式 */
.search-bar {
  padding: 12px 16px;
}

.search-bar :deep(.el-input__wrapper) {
  height: 40px;
}

.search-bar :deep(.el-input__inner) {
  color: #1e1e1e;
}

.search-bar :deep(.el-input__inner::placeholder) {
  color: #666;
}

/* 聊天列表样式 */
.chat-list {
  width: 250px;
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
  border-right: 1px solid #e9edef;
}

.chat-items {
  overflow-y: auto;
}

.chat-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-item:hover {
  background-color: #f5f6f6;
}

.chat-item.active {
  background-color: #bcd0ef;
}

.chat-info {
  margin-left: 10px;
  flex: 1;
  min-width: 0;
}

.chat-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
  color: #111b21;
}

.chat-preview {
  font-size: 14px;
  color: #667781;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-header h1 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: #111b21;
  padding: 26px 16px;
}

/* 修改输入框样式 */
.chat-input {
  padding: 16px 24px; /* 增加上下内边距 */
  background: white;
  border-top: 1px solid #e9edef;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-input {
  flex: 1;
}

:deep(.el-input__wrapper) {
  padding: 12px 16px; /* 增加输入框内部空间 */
  border-radius: 24px;
  background: #f0f2f5;
  height: 48px; /* 增加输入框高度 */
}

:deep(.el-input__inner) {
  font-size: 15px;
  color: #1e1e1e; /* 修改字体颜色为黑色 */
}

:deep(.el-input__inner::placeholder) {
  color: #666; /* 修改占位符文字颜色,让它更清晰 */
}

/* 修改发送按钮大小 */
:deep(.el-button.is-circle) {
  width: 48px; /* 增加按钮尺寸 */
  height: 48px;
}

/* 修改顶部输入框样式 */
.search-bar {
  padding: 12px 16px;
}

.search-bar :deep(.el-input__wrapper) {
  height: 40px;
}

.search-bar :deep(.el-input__inner) {
  color: #1e1e1e;
}

.search-bar :deep(.el-input__inner::placeholder) {
  color: #666;
}

.ai-chat-widget {
  position: fixed;
  width: 320px;
  z-index: 9999;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.drag-handle {
  cursor: move;
  position: relative;
  width: 100%;
  height: 40px;
  z-index: 1;
}
.ai-chat-container {
  position: relative;
  z-index: 2;
  background: white;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 添加调整大小的把手 */
.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  cursor: nwse-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  z-index: 10;
}

.resize-handle:hover {
  color: #409EFF;
}

/* 确保消息区域可以滚动且占据剩余空间 */
.ai-chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: #f5f7fa;
}

/* 添加回复按钮样式 */
.message-actions {
  display: flex;
  justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.2s;
  margin-top: 4px;
}

.message:hover .message-actions {
  opacity: 1;
}

.message-actions .el-button {
  color: #909399;
  padding: 2px 5px;
}

.message-actions .el-button:hover {
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
}

/* 增加分组标题样式 */
.search-dropdown-title {
  font-size: 12px;
  color: #999;
  padding: 4px 12px 2px 12px;
  background: #f7f7f7;
}

:deep(.custom-notification) {
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.notification-content) {
  display: flex;
  align-items: center;
  margin-top: 8px;
}

:deep(.notification-message) {
  flex: 1;
}

:deep(.notification-sender) {
  font-weight: bold;
  margin-bottom: 4px;
  color: #303133;
}

:deep(.notification-text) {
  color: #606266;
  font-size: 14px;
  line-height: 1.4;
}

:deep(.el-notification__title) {
  font-weight: bold;
  margin-bottom: 8px;
}

.member-role-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: bold;
  margin: 0 6px;
  padding: 1px 6px;
  border-radius: 8px;
  vertical-align: middle;
}
.role-owner {
  background: #ffe066;
  color: #b8860b;
}
.role-admin {
  background: #e0c3fc;
  color: #7c3aed;
}
.role-member {
  background: #cce5ff;
  color: #2563eb;
}

.message-role-tag {
  display: inline-block;
  font-size: 12px;
  font-weight: bold;
  margin: 0 6px;
  padding: 1px 6px;
  border-radius: 8px;
  vertical-align: middle;
}

.message-sender {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

/* 复用之前的角色样式 */
.message-role-tag.role-owner {
  background: #ffe066;
  color: #b8860b;
}

.message-role-tag.role-admin {
  background: #e0c3fc;
  color: #7c3aed;
}

.message-role-tag.role-member {
  background: #cce5ff;
  color: #2563eb;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-settings {
  max-height: 400px;
  overflow-y: auto;
}

.member-setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.member-setting-item:last-child {
  border-bottom: none;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-name {
  font-size: 14px;
  color: #333;
}

.member-actions {
  display: flex;
  gap: 8px;
}

</style>
