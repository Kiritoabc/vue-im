<template>
  <div class="contact-container">

    <!-- 左侧列表 -->
    <div class="friend-list-container">
      <!-- 搜索框 -->
      <div class="search-bar">
        <el-input v-model="searchText" placeholder="搜索" clearable>
          <template #prefix>搜索</template>
        </el-input>
      </div>

      <!-- 在原有代码中添加 -->
      <el-dialog v-model="showNoticeDialog" :title="noticeType === 'friend' ? '好友通知' : '群通知'" width="650px"
        :show-close="true" :close-on-click-modal="true">
        <NoticeList :type="noticeType" />
      </el-dialog>

      <!-- 修改原有的好友通知和群通知点击事件 -->
      <div class="friend-list-container">
        <div class="category-tabs">
          <div class="notification-links">
            <div class="notice-link" @click="showNotice('friend')">
              好友通知
              <el-badge :value="3" class="notice-badge" />
            </div>
            <div class="notice-link" @click="showNotice('group')">
              群通知
              <el-badge :value="2" class="notice-badge" />
            </div>
          </div>
          <!-- 原有的 tabs 内容 -->
        </div>
      </div>

      <!-- 好友/群聊切换 -->
      <div class="category-tabs">
        <div v-for="tab in tabs" :key="tab.key" :class="['tab-item', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key">
          {{ tab.label }}
        </div>
      </div>

      <!-- 好友列表 -->
      <div v-if="activeTab === 'friends'" class="list-content">
        <!-- 我的设备 -->
        <div class="list-group">
          <div class="group-header" @click="toggleGroup('devices')">
            <span class="arrow">{{ expandedGroups.devices ? '▼' : '▶' }}</span>
            <span>我的设备</span>
            <span class="count">2</span>
          </div>
          <div v-show="expandedGroups.devices" class="group-content">
            <div v-for="device in devices" :key="device.id" class="friend-item">
              <el-avatar :size="30" :src="device.avatar" />
              <div class="friend-info">
                <div class="nickname">{{ device.name }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 特别关心 -->
        <div class="list-group">
          <div class="group-header" @click="toggleGroup('special')">
            <span class="arrow">{{ expandedGroups.special ? '▼' : '▶' }}</span>
            <span>特别关心</span>
            <span class="count">1/2</span>
          </div>
          <div v-show="expandedGroups.special" class="group-content">
            <div v-for="friend in specialFriends" :key="friend.id" class="friend-item"
              :class="{ active: selectedFriend?.id === friend.id }" @click="selectFriend(friend)">
              <el-avatar :size="30" :src="friend.avatar" />
              <div class="friend-info">
                <div class="nickname">{{ friend.nickname }}</div>
                <div class="status">{{ friend.status }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 朋友列表 -->
        <div class="list-group">
          <div class="group-header" @click="toggleGroup('friends')">
            <span class="arrow">{{ expandedGroups.friends ? '▼' : '▶' }}</span>
            <span>朋友</span>
            <span class="count">29/37</span>
          </div>
          <div v-show="expandedGroups.friends" class="group-content">
            <div v-for="friend in friends" :key="friend.id" class="friend-item"
              :class="{ active: selectedFriend?.id === friend.id }" @click="selectFriend(friend)">
              <el-avatar :size="30" :src="friend.avatar" />
              <div class="friend-info">
                <div class="nickname">{{ friend.nickname }}</div>
                <div class="status">{{ friend.status }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 群聊列表 -->
      <div v-else class="list-content">
        <!-- 置顶群聊 -->
        <div class="list-group">
          <div class="group-header" @click="toggleGroup('starred')">
            <span class="arrow">{{ expandedGroups.starred ? '▼' : '▶' }}</span>
            <span>置顶群聊</span>
            <span class="count">0</span>
          </div>
          <div v-show="expandedGroups.starred" class="group-content">
            <!-- 置顶群聊列表 -->
          </div>
        </div>

        <!-- 我创建的群 -->
        <div class="list-group">
          <div class="group-header" @click="toggleGroup('created')">
            <span class="arrow">{{ expandedGroups.created ? '▼' : '▶' }}</span>
            <span>我创建的群</span>
            <span class="count">5</span>
          </div>
          <div v-show="expandedGroups.created" class="group-content">
            <div v-for="group in createdGroups" :key="group.id" class="group-item"
              :class="{ active: selectedGroup?.id === group.id }" @click="selectGroup(group)">
              <el-avatar :size="40" :src="group.avatar" />
              <div class="group-info">
                <div class="group-name">{{ group.name }}</div>
                <div class="member-count">{{ group.memberCount }}人</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 我管理的群 -->
        <div class="list-group">
          <div class="group-header" @click="toggleGroup('managed')">
            <span class="arrow">{{ expandedGroups.managed ? '▼' : '▶' }}</span>
            <span>我管理的群</span>
            <span class="count">3</span>
          </div>
          <div v-show="expandedGroups.managed" class="group-content">
            <div v-for="group in managedGroups" :key="group.id" class="group-item"
              :class="{ active: selectedGroup?.id === group.id }" @click="selectGroup(group)">
              <el-avatar :size="40" :src="group.avatar" />
              <div class="group-info">
                <div class="group-name">{{ group.name }}</div>
                <div class="member-count">{{ group.memberCount }}人</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 我加入的群 -->
        <div class="list-group">
          <div class="group-header" @click="toggleGroup('joined')">
            <span class="arrow">{{ expandedGroups.joined ? '▼' : '▶' }}</span>
            <span>我加入的群</span>
            <span class="count">67</span>
          </div>
          <div v-show="expandedGroups.joined" class="group-content">
            <div v-for="group in joinedGroups" :key="group.id" class="group-item"
              :class="{ active: selectedGroup?.id === group.id }" @click="selectGroup(group)">
              <el-avatar :size="40" :src="group.avatar" />
              <div class="group-info">
                <div class="group-name">{{ group.name }}</div>
                <div class="member-count">{{ group.memberCount }}人</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧详情 -->
    <div class="detail-container">
      <!-- 好友详情 -->
      <div v-if="activeTab === 'friends' && selectedFriend" class="friend-detail">
        <div class="detail-header">
          <el-avatar :size="80" :src="selectedFriend.avatar" />
          <div class="basic-info">
            <h2>{{ selectedFriend.nickname }}</h2>
            <div class="account">QQ：{{ selectedFriend.account }}</div>
            <div class="online-status">
              <span class="status-dot"></span>
              {{ selectedFriend.status }}
            </div>
          </div>
        </div>

        <div class="detail-content">
          <div class="info-section">
            <div class="info-item">
              <span class="label">备注名</span>
              <span>{{ selectedFriend.remarkName || '暂无备注' }}</span>
            </div>
            <div class="info-item">
              <span class="label">性别</span>
              <span>{{ selectedFriend.gender }}</span>
            </div>
            <div class="info-item">
              <span class="label">生日</span>
              <span>{{ selectedFriend.birthday }}</span>
            </div>
            <div class="info-item">
              <span class="label">所在地</span>
              <span>{{ selectedFriend.location }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <el-button type="primary" @click="sendMessage(selectedFriend)">发送消息</el-button>
            <el-button @click="editRemark(selectedFriend)">修改备注</el-button>
            <el-button type="danger" @click="deleteFriend(selectedFriend)">删除好友</el-button>
          </div>
        </div>
      </div>

      <!-- 群聊详情 -->
      <div v-if="activeTab === 'groups' && selectedGroup" class="group-detail">
        <div class="detail-header">
          <el-avatar :size="80" :src="selectedGroup.avatar" />
          <div class="basic-info">
            <h2>{{ selectedGroup.name }}</h2>
            <div class="group-id">群号：{{ selectedGroup.groupId }}</div>
            <div class="group-category">{{ selectedGroup.category }}</div>
          </div>
        </div>

        <div class="detail-content">
          <!-- 群公告 -->
          <div class="info-section">
            <div class="section-header">
              <h3>群公告</h3>
              <el-button v-if="isGroupAdmin" size="small" @click="editAnnouncement">编辑</el-button>
            </div>
            <div class="announcement">{{ selectedGroup.announcement || '暂无公告' }}</div>
          </div>

          <!-- 群介绍 -->
          <div class="info-section">
            <div class="section-header">
              <h3>群介绍</h3>
            </div>
            <div class="description">{{ selectedGroup.description }}</div>
          </div>

          <!-- 群成员统计 -->
          <div class="info-section">
            <div class="section-header">
              <h3>成员分布</h3>
            </div>
            <div class="member-stats">
              <div class="stat-item">
                <span>活跃度</span>
                <el-progress :percentage="selectedGroup.stats.active" />
              </div>
              <div class="stat-item">
                <span>男女比例</span>
                <el-progress :percentage="selectedGroup.stats.male" color="#409EFF" />
              </div>
              <div class="stat-item">
                <span>地区分布</span>
                <el-progress :percentage="selectedGroup.stats.local" color="#67C23A" />
              </div>
            </div>
          </div>

          <!-- 群成员列表预览 -->
          <div class="info-section">
            <div class="section-header">
              <h3>群成员 ({{ selectedGroup.memberCount }})</h3>
              <el-button size="small" @click="showAllMembers">查看全部</el-button>
            </div>
            <div class="member-preview">
              <div v-for="member in selectedGroup.previewMembers" :key="member.id" class="member-item">
                <el-avatar :size="30" :src="member.avatar" />
                <span class="member-name">{{ member.name }}</span>
                <span class="member-role" v-if="member.role">{{ member.role }}</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" @click="enterGroup(selectedGroup)">发送消息</el-button>
            <el-button @click="showGroupMembers(selectedGroup)">查看成员</el-button>
            <el-button type="danger" @click="quitGroup(selectedGroup)">退出群聊</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import NoticeList from '../components/NoticeList.vue'

const router = useRouter()
const searchText = ref('')
const activeTab = ref('friends')
const selectedFriend = ref(null)
const selectedGroup = ref(null)
// 添加通知相关的状态
const showNoticeDialog = ref(false)
const noticeType = ref('friend')

// 显示通知对话框
const showNotice = (type) => {
  noticeType.value = type
  showNoticeDialog.value = true
}


// 标签页配置
const tabs = [
  { key: 'friends', label: '好友' },
  { key: 'groups', label: '群聊' }
]

// 分组展开状态
const expandedGroups = reactive({
  devices: true,
  special: true,
  friends: true,
  starred: true,
  created: true,
  managed: true,
  joined: true
})

// 设备列表
const devices = [
  {
    id: 1,
    name: '我的电脑',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: 2,
    name: '我的手机',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
]

// 特别关心好友
const specialFriends = [
  {
    id: 1,
    nickname: '锦',
    account: '2493381254',
    status: '[在线] 祝我生日快乐',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    remarkName: '',
    gender: '男',
    birthday: '11月1日',
    location: '中国'
  }
]

// 好友列表
const friends = [
  {
    id: 2,
    nickname: '虎子（冲田总司）',
    account: '1234567890',
    status: '[在线] 好想成为的...',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    remarkName: '虎子',
    gender: '男',
    birthday: '1月1日',
    location: '日本'
  },
  {
    id: 3,
    nickname: '胡安（半岛铁盒）',
    account: '9876543210',
    status: '离开',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    remarkName: '胡安',
    gender: '男',
    birthday: '6月6日',
    location: '中国'
  }
]

// 群聊列表
const createdGroups = [
  {
    id: 1,
    groupId: '1107576869',
    name: '学习交流群',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    memberCount: 11,
    category: '学习考试、高考',
    announcement: '本着学习交流为目的，各位...',
    description: '在群里，发现更多～',
    stats: {
      active: 27,
      male: 82,
      local: 73
    },
    previewMembers: [
      { id: 1, name: '群主', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', role: '群主' },
      { id: 2, name: '管理员1', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', role: '管理员' }
    ]
  }
]

const managedGroups = [
  {
    id: 2,
    groupId: '2233445566',
    name: '技术交流群',
    avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
    memberCount: 50,
    category: '技术交流',
    announcement: '技术交流群，禁止广告...',
    description: '专注技术交流',
    stats: {
      active: 45,
      male: 90,
      local: 60
    },
    previewMembers: [
      { id: 1, name: '群主', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', role: '群主' }
    ]
  }
]

const joinedGroups = [
  {
    id: 3,
    groupId: '9988776655',
    name: '游戏交流群',
    avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    memberCount: 100,
    category: '游戏',
    announcement: '游戏交流，禁止外挂...',
    description: '一起来玩游戏',
    stats: {
      active: 85,
      male: 75,
      local: 50
    },
    previewMembers: [
      { id: 1, name: '群主', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', role: '群主' }
    ]
  }
]

// 是否为群管理员
const isGroupAdmin = computed(() => {
  if (!selectedGroup.value) return false
  return createdGroups.some(g => g.id === selectedGroup.value.id) ||
    managedGroups.some(g => g.id === selectedGroup.value.id)
})

// 展开/收起分组
const toggleGroup = (groupKey) => {
  expandedGroups[groupKey] = !expandedGroups[groupKey]
}

// 选择好友
const selectFriend = (friend) => {
  selectedFriend.value = friend
  selectedGroup.value = null
}

// 选择群聊
const selectGroup = (group) => {
  selectedGroup.value = group
  selectedFriend.value = null
}

// 发送消息
const sendMessage = (friend) => {
  router.push(`/chat/private/${friend.id}`)
}

// 编辑备注
const editRemark = (friend) => {
  // 实现编辑备注的逻辑
}

// 删除好友
const deleteFriend = (friend) => {
  // 实现删除好友的逻辑
}

// 进入群聊
const enterGroup = (group) => {
  router.push(`/chat/group/${group.id}`)
}

// 查看群成员
const showGroupMembers = (group) => {
  // 实现查看群成员的逻辑
}

// 查看所有成员
const showAllMembers = () => {
  // 实现查看所有成员的逻辑
}

// 编辑群公告
const editAnnouncement = () => {
  // 实现编辑群公告的逻辑
}

// 退出群聊
const quitGroup = (group) => {
  // 实现退出群聊的逻辑
}
</script>

<style scoped>
.contact-container {
  display: flex;
  height: 100%;
  background-color: #fff;
}

.friend-list-container {
  width: 250px;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.category-tabs {
  display: flex;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.tab-item {
  padding: 5px 15px;
  cursor: pointer;
  border-radius: 3px;
  margin-right: 10px;
}

.tab-item:hover {
  background-color: #f5f5f5;
}

.tab-item.active {
  background-color: #e6f1fc;
  color: #409EFF;
}

.list-content {
  flex: 1;
  overflow-y: auto;
}

.list-group {
  margin-bottom: 1px;
}

.group-header {
  padding: 8px 10px;
  background-color: #f8f8f8;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.group-header:hover {
  background-color: #f0f0f0;
}

.arrow {
  width: 20px;
  color: #666;
}

.count {
  margin-left: auto;
  color: #999;
  font-size: 12px;
}

.friend-item,
.group-item {
  padding: 8px 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.friend-item:hover,
.group-item:hover {
  background-color: #f5f5f5;
}

.friend-item.active,
.group-item.active {
  background-color: #e6f1fc;
}

.friend-info,
.group-info {
  margin-left: 10px;
  flex: 1;
}

.nickname,
.group-name {
  font-size: 13px;
}

.status,
.member-count {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.detail-container {
  flex: 1;
  padding: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.basic-info {
  margin-left: 20px;
}

.basic-info h2 {
  margin: 0 0 10px 0;
}

.account,
.group-id {
  color: #666;
  margin-bottom: 5px;
}

.online-status {
  display: flex;
  align-items: center;
  color: #67C23A;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #67C23A;
  border-radius: 50%;
  margin-right: 5px;
}

.detail-content {
  margin-top: 20px;
}

.info-section {
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-item .label {
  width: 80px;
  color: #666;
}

.announcement,
.description {
  color: #666;
  line-height: 1.5;
}

.member-stats {
  padding: 10px 0;
}

.stat-item {
  margin-bottom: 15px;
}

.stat-item span {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

.member-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.member-name {
  font-size: 12px;
}

.member-role {
  font-size: 12px;
  color: #409EFF;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>