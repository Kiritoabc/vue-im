<template>
  <div class="ai-chat-container">
    <!-- 左侧会话列表 -->
    <div class="conversation-list">
      <div class="list-header">
        <el-button type="primary" @click="createNewChat">新建会话</el-button>
      </div>
      <div class="conversations">
        <div
            v-for="chat in aiChats"
            :key="chat.id"
            :class="['conversation-item', { active: currentChat?.id === chat.id }]"
            @click="switchChat(chat)"
        >
          <span class="chat-title">{{ chat.title }}</span>
          <el-dropdown trigger="click" @command="handleCommand">
            <span class="more-actions">...</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="{ type: 'rename', chatId: chat.id }">重命名</el-dropdown-item>
                <el-dropdown-item :command="{ type: 'delete', chatId: chat.id }">删除会话</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="chat-area">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <h2>{{ currentChat?.title || 'AI 助手' }}</h2>
        <div class="header-actions">
          <el-button size="small" @click="clearChat">清空对话</el-button>
        </div>
      </div>

      <!-- 消息区域 -->
      <div class="message-area" ref="messageArea">
        <template v-if="currentChat">
          <div
              v-for="msg in currentChat.messages"
              :key="msg.id"
              :class="['message', { 'message-ai': msg.role === 'ai', 'message-user': msg.role === 'user' }]"
          >
            <template v-if="msg.role === 'ai'">
              <el-avatar :size="40" :src="aiAvatar" />
              <div class="message-content">
                <div class="message-text" v-html="formatMessage(msg.content)"></div>
                <div class="message-actions">
                  <el-button size="small" text @click="copyMessage(msg.content)">复制</el-button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="message-content">
                <div class="message-text" v-html="formatMessage(msg.content)"></div>
              </div>
              <el-avatar :size="40" :src="userAvatar" />
            </template>
          </div>
        </template>
        <div v-else class="empty-chat">
          <el-empty description="开始新的对话">
            <el-button type="primary" @click="createNewChat">新建会话</el-button>
          </el-empty>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="input-area">
        <el-input
            v-model="messageText"
            type="textarea"
            :rows="3"
            placeholder="输入消息..."
            @keyup.enter.ctrl="sendMessage"
        />
        <div class="input-actions">
          <span class="hint">Ctrl + Enter 发送</span>
          <el-button type="primary" @click="sendMessage" :loading="sending">发送</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'

const messageText = ref('')
const sending = ref(false)
const messageArea = ref(null)
const currentChat = ref(null)
const store = useStore()


// 从 store 中获取用户信息
const userInfo = computed(() => store.state.userInfo)

console.log(userInfo.value.id)

// 模拟数据
const userAvatar = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3w2fqb71MsCj97IKLAUXoI6BS4IfeCeEoq_XGS3X2CErGlYyP4xxX4eQ&s'
const aiAvatar = 'https://cdn.jsdelivr.net/gh/Kiritoabc/my_cdn/img/header.jpg'

const aiChats = ref([
  {
    id: 1,
    title: '关于原神的讨论',
    messages: [
      {
        id: 1,
        role: 'user',
        content: '你知道原神吗？'
      },
      {
        id: 2,
        role: 'ai',
        content: '是的，原神是由米哈游开发的一款开放世界冒险游戏。游戏发生在一个被称作"提瓦特"的幻想世界，在这里，被神选中的人将被授予"神之眼"，导引元素之力。'
      }
    ]
  },
  {
    id: 2,
    title: '游戏攻略咨询',
    messages: []
  }
])

// 切换聊天
const switchChat = (chat) => {
  currentChat.value = chat
  scrollToBottom()
}

// 创建新会话
const createNewChat = () => {
  const newChat = {
    id: aiChats.value.length + 1,
    title: `新会话 ${aiChats.value.length + 1}`,
    messages: []
  }
  aiChats.value.push(newChat)
  switchChat(newChat)
}

// 发送消息
const sendMessage = async () => {
  if (!messageText.value.trim() || sending.value) return;
  if (!currentChat.value) {
    createNewChat();
  }

  sending.value = true;
  const userMessage = {
    userId: userInfo.value.id,
    id: currentChat.value.messages.length + 1,
    role: 'user',
    content: messageText.value,
  };
  console.log(userMessage)
  currentChat.value.messages.push(userMessage);
  messageText.value = '';
  await nextTick();
  scrollToBottom();

  // 初始化 WebSocket 连接
  const ws = new WebSocket('ws://localhost:8080/im-server/ws');

  ws.onopen = () => {
    // 发送用户消息
    ws.send(JSON.stringify(userMessage));
  };
  // 响应AI的回复
  ws.onmessage = (event) => {
    const aiMessage = currentChat.value.messages.find((msg) => msg.role === 'ai' && msg.id === 'streaming');
    if (aiMessage) {
      // 追加流式数据
      console.log("追加流式数据----------")
      aiMessage.content += event.data;
    } else {
      // 创建新的 AI 消息
      const newAiMessage = {
        id: 'streaming', // 使用特殊 ID 标识流式消息
        role: 'ai',
        content: event.data,
      };
      currentChat.value.messages.push(newAiMessage);
    }
    // sending.value = false;
    scrollToBottom();
  };

  ws.onclose = () => {
    // 标记流式消息完成
    const aiMessage = currentChat.value.messages.find((msg) => msg.role === 'ai' && msg.id === 'streaming');
    if (aiMessage) {
      aiMessage.id = currentChat.value.messages.length + 1; // 分配正式 ID
    }
    sending.value = false;
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    sending.value = false;
  };
};

// 复制消息
const copyMessage = (text) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已复制到剪贴板')
}

// 清空对话
const clearChat = () => {
  if (currentChat.value) {
    currentChat.value.messages = []
  }
}

// 处理下拉菜单命令
const handleCommand = ({ type, chatId }) => {
  const chat = aiChats.value.find(c => c.id === chatId)
  if (!chat) return

  switch (type) {
    case 'rename':
      // 实现重命名逻辑
      break
    case 'delete':
      aiChats.value = aiChats.value.filter(c => c.id !== chatId)
      if (currentChat.value?.id === chatId) {
        currentChat.value = aiChats.value[0]
      }
      break
  }
}

// 格式化消息（可以处理markdown等格式）
const formatMessage = (text) => {
  return text.replace(/\n/g, '<br>')
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageArea.value) {
      messageArea.value.scrollTop = messageArea.value.scrollHeight
    }
  })
}

onMounted(() => {
  if (aiChats.value.length > 0) {
    currentChat.value = aiChats.value[0]
  }
})
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.conversation-list {
  width: 250px;
  background-color: #fff;
  border-right: 1px solid #dcdfe6;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 15px;
  border-bottom: 1px solid #dcdfe6;
}

.list-header .el-button {
  width: 100%;
}

.conversations {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.conversation-item:hover {
  background-color: #f5f5f5;
}

.conversation-item.active {
  background-color: #e6f1fc;
}

.chat-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-actions {
  color: #909399;
  font-size: 16px;
  padding: 0 5px;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 15px 20px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.message-ai {
  justify-content: flex-start;
}

.message-user {
  justify-content: flex-end;
}

.message-content {
  max-width: 80%;
  margin: 0 12px;
}

.message-text {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.message-ai .message-text {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 0 8px 8px 8px;
}

.message-user .message-text {
  background-color: #95ec69;
  color: #000;
  border-radius: 8px 0 8px 8px;
}

.message-actions {
  margin-top: 4px;
  display: flex;
  justify-content: flex-start;
}

.input-area {
  padding: 20px;
  background-color: #fff;
  border-top: 1px solid #dcdfe6;
}

.input-actions {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint {
  color: #909399;
  font-size: 12px;
}

.empty-chat {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
