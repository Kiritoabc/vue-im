<template>
  <div class="contact-container">

    <!-- 左侧列表 -->
    <div class="friend-list-container">
      <!-- 搜索框 -->
      <div class="search-bar">
        <el-input v-model="searchText" placeholder="搜索" clearable @keyup.enter="searchFriends">
          <template #prefix></template>
        </el-input>
      </div>

      <!-- 搜索结果对话框 -->
      <el-dialog v-model="showSearchResults" title="搜索结果" width="650px" :show-close="true" :close-on-click-modal="true">
        <div class="category-tabs">
          <div class="tab-item" :class="{ active: searchActiveTab === 'all' }" @click="searchActiveTab = 'all'">全部</div>
          <div class="tab-item" :class="{ active: searchActiveTab === 'users' }" @click="searchActiveTab = 'users'">用户</div>
          <div class="tab-item" :class="{ active: searchActiveTab === 'groups' }" @click="searchActiveTab = 'groups'">群聊</div>
        </div>

        <div v-if="searchActiveTab === 'all' || searchActiveTab === 'users'">
          <h3 v-if="searchResults.users.length > 0">用户</h3>
          <div v-for="user in searchResults.users" :key="user.id" class="friend-item" @click="selectFriend(user)">
            <el-avatar :size="30" :src="user.avatar_url" />
            <div class="friend-info">
              <div class="nickname">{{ user.username }}</div>
              <div class="phone-number">{{ user.phone_number }}</div>
              <div class="bio">{{ user.bio }}</div>
            </div>
            <el-button size="small" @click.stop="showAddFriendDialog(user)" style="margin-left: auto;">添加好友</el-button>
          </div>
        </div>

        <div v-if="searchActiveTab === 'all' || searchActiveTab === 'groups'">
          <h3 v-if="searchResults.groups && searchResults.groups.length > 0">群聊</h3>
          <div v-for="group in searchResults.groups" :key="group.id" class="friend-item">
            <el-avatar :size="30" :src="group.group_avatar" />
            <div class="friend-info">
              <div class="group-name">{{ group.name }}</div>
              <div class="member-count">{{ group.memberCount }}人</div>
            </div>
            <el-button size="small" @click="joinGroup(group)" style="margin-left: auto;">加入</el-button>
          </div>
        </div>

        <div v-if="searchResults.users.length === 0 && searchResults.groups.length === 0">没有找到相关结果</div>
      </el-dialog>

      <!-- 添加好友对话框 -->
      <el-dialog v-model="showAddFriend" title="" @close="showAddFriend = false" class="add-friend-dialog" width="400px">
        <div class="dialog-header">

          <el-avatar :size="50" :src="friendForm.avatar" class="friend-avatar" />
          <div>
            <h3 class="dialog-title">申请加好友</h3>
            <p class="friend-id">uid:  {{ friendForm.id }}</p> <!-- 显示好友ID -->
          </div>
        </div>
        <div>
          <el-form :model="friendForm" label-width="100px">
            <el-form-item label="好友昵称">
              <el-input v-model="friendForm.nickname" disabled></el-input>
            </el-form-item>
            <el-form-item label="好友备注">
              <el-input v-model="friendForm.remark" placeholder="请输入备注"></el-input>
            </el-form-item>
            <el-form-item label="分组">
              <el-select
                v-model="friendForm.group"
                placeholder="请选择分组"
                @change="onGroupChange"
              >
                <el-option
                  v-for="group in friendGroupOptions"
                  :key="group.group_id"
                  :label="group.group_name"
                  :value="group.group_name"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="好友验证">
              <el-input type="textarea" v-model="friendForm.verification" placeholder="请输入验证信息" rows="4"></el-input>
            </el-form-item>
          </el-form>
        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showAddFriend = false">取 消</el-button>
            <el-button type="primary" @click="addFriend">确 定</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 在原有代码中添加 -->
      <el-dialog v-model="showNoticeDialog" :title="noticeType === 'friend' ? '好友通知' : '群通知'" width="650px"
        :show-close="true" :close-on-click-modal="true">
        <NoticeList :type="noticeType" :show-notice-dialog="showNoticeDialog"/>
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
        <!-- 添加创建群聊按钮 -->
        <div class="create-group-btn">
          <el-button type="primary" @click="showCreateGroupDialog" size="small" style="width: 90%; margin: 10px;">
            <el-icon><Plus /></el-icon>创建分组
          </el-button>
        </div>

        <!-- 好友分组列表 -->
        <div v-for="group in friendGroups" :key="group.group_id" class="friend-group">
          <div class="group-header" @click="toggleGroup(group.group_id)">
            <span class="arrow">{{ expandedGroups[group.group_id] ? '▼' : '▶' }}</span>
            <span>{{ group.group_name }}</span>
            <span class="count">({{ group.members.length }})</span>
          </div>
          <!-- 好友列表 -->
          <div v-show="expandedGroups[group.group_id]" class="group-content">
            <div v-for="friend in group.members"
                 :key="friend.id"
                 class="friend-item"
                 :class="{ active: selectedFriend?.id === friend.id }"
                 @click="selectFriend(friend)">
              <el-avatar :size="30" :src="friend.avatar_url" />
              <div class="friend-info">
                <div class="nickname">{{ friend.username }}</div>
                <div class="status">{{ friend.bio || '[暂无签名]' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 群聊列表 -->
      <div v-else class="list-content">
        <!-- 添加创建群聊按钮 -->
        <div class="create-group-btn">
          <el-button type="primary" @click="showCreateGroupDialog" size="small" style="width: 90%; margin: 10px;">
            <el-icon><Plus /></el-icon>创建群聊
          </el-button>
        </div>

        <!-- 创建群聊对话框 -->
        <el-dialog v-model="showCreateGroup" title="创建群聊" width="400px">
          <el-form :model="groupForm" :rules="groupRules" ref="groupFormRef">
            <el-form-item label="群名称" prop="name">
              <el-input v-model="groupForm.name" placeholder="请输入群名称"></el-input>
            </el-form-item>
            <el-form-item label="群头像">
              <el-upload
                  class="avatar-uploader"
                  action="#"
                  :show-file-list="false"
                  :before-upload="beforeAvatarUpload"
              >
                <img v-if="groupForm.group_avatar" :src="groupForm.group_avatar" class="avatar-preview">
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="showCreateGroup = false">取消</el-button>
              <el-button type="primary" @click="createGroup">创建</el-button>
            </div>
          </template>
        </el-dialog>

        <!-- 我创建的群 -->
        <div class="list-group">
          <div class="group-header" @click="toggleGroup('created')">
            <span class="arrow">{{ expandedGroups.created ? '▼' : '▶' }}</span>
            <span>我创建的群</span>
            <span class="count">{{ createdGroups.length }}</span>
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
            <span class="count">{{ managedGroups.length }}</span>
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
            <span class="count">{{ joinedGroups.length }}</span>
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
          <el-avatar :size="80" :src="selectedFriend.avatar_url" />
          <div class="basic-info">
            <h2>{{ selectedFriend.nickname }}</h2>
            <div class="account">QQ：{{ selectedFriend.phone_number }}</div>
            <div class="online-status">
              <span class="status-dot"></span>
              {{ selectedFriend.status || '离线' }}
            </div>
          </div>
        </div>

        <div class="detail-content">
          <div class="info-section">
            <div class="info-item">
              <span class="label">备注名</span>
              <span>{{ selectedFriend.username || '暂无备注' }}</span>
            </div>
            <div class="info-item">
              <span class="label">性别</span>
              <span>{{ selectedFriend.gender }}</span>
            </div>
            <div class="info-item">
              <span class="label">生日</span>
              <span>{{ selectedFriend.birthday || '2000-01-01' }}</span>
            </div>
            <div class="info-item">
              <span class="label">所在地</span>
              <span>{{ selectedFriend.location || '中国' }}</span>
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
<!--              <el-button v-if="isGroupAdmin" size="small" @click="editAnnouncement">编辑</el-button>-->
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

    <!-- 在 template 中添加创建分组的对话框 -->
    <el-dialog v-model="showCreateFriendGroup" title="创建分组" width="400px">
      <el-form :model="friendGroupForm" :rules="friendGroupRules" ref="friendGroupFormRef">
        <el-form-item label="分组名称" prop="group_name">
          <el-input v-model="friendGroupForm.group_name" placeholder="请输入分组名称"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCreateFriendGroup = false">取消</el-button>
          <el-button type="primary" @click="createFriendGroup">创建</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted} from 'vue'
import { useRouter } from 'vue-router'
import NoticeList from '../components/NoticeList.vue'
import { getToken } from '../utils/utils.js'
import axios from 'axios'
import { ElNotification } from 'element-plus' // 导入 ElNotification
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const searchText = ref('')
const activeTab = ref('friends')
const friendGroups = ref([])
const selectedFriend = ref(null)
const selectedGroup = ref(null)
// 分组展开状态
const expandedGroups = reactive({
})
// 添加通知相关的状态
const showNoticeDialog = ref(false)
const noticeType = ref('friend')
const showSearchResults = ref(false)
const searchResults = ref({ users: [], groups: [] }) // 初始化为包含空数组的对象
const searchActiveTab = ref('all') // 使用 searchActiveTab 代替 activeTab
const showAddFriend = ref(false)

// 在已有的 ref 声明下添加
const showCreateGroup = ref(false)
const groupFormRef = ref(null)
const groupForm = reactive({
  name: '',
  group_avatar: ''
})

const groupRules = {
  name: [
    { required: true, message: '请输入群名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}


// const friendId = ref('') // 用于存储输入的好友ID
const friendForm = ref({
  id: '',
  nickname: '',
  remark: '',
  group: '',
  verification: '',
  avatar: '', // 添加头像字段
  group_id: 0
})

const friendGroupOptions = ref([])

const fetchFriendGroups = async () => {
  try {
    const token = getToken()
    const response = await axios.get('http://localhost:8080/im-server/friends/user/friend_groups', {
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    })
    if (response.status === 200) {
      friendGroupOptions.value = response.data.data
    } else {
      friendGroupOptions.value = []
    }
  } catch (error) {
    friendGroupOptions.value = []
    console.error('获取好友分组失败:', error)
  }
}

// 获取好友列表
const fetchFriendsList = async () => {
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:8080/im-server/friends/user/groups', {
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    })

    friendGroups.value = response.data.data
    // todo: 初始化展开状态
    response.data.data.forEach(group => {
      expandedGroups[group.group_id] = true
    })
  } catch (error) {
    console.error('获取好友列表失败:', error)
    ElMessage.error('获取好友列表失败')
  }
}

// 标签页配置
const tabs = [
  { key: 'friends', label: '好友' },
  { key: 'groups', label: '群聊' }
]

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
// const createdGroups = [
//   {
//     id: 1,
//     groupId: '1107576869',
//     name: '学习交流群',
//     avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
//     memberCount: 11,
//     category: '学习考试、高考',
//     announcement: '本着学习交流为目的，各位...',
//     description: '在群里，发现更多～',
//     stats: {
//       active: 27,
//       male: 82,
//       local: 73
//     },
//     previewMembers: [
//       { id: 1, name: '群主', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', role: '群主' },
//       { id: 2, name: '管理员1', avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', role: '管理员' }
//     ]
//   }
// ]
//
// const managedGroups = [
//   {
//     id: 2,
//     groupId: '2233445566',
//     name: '技术交流群',
//     avatar: 'https://cube.elemecdn.com/9/c2/f0ee8a3c7c9638a54940382568c9dpng.png',
//     memberCount: 50,
//     category: '技术交流',
//     announcement: '技术交流群，禁止广告...',
//     description: '专注技术交流',
//     stats: {
//       active: 45,
//       male: 90,
//       local: 60
//     },
//     previewMembers: [
//       { id: 1, name: '群主', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', role: '群主' }
//     ]
//   }
// ]
//
// const joinedGroups = [
//   {
//     id: 3,
//     groupId: '9988776655',
//     name: '游戏交流群',
//     avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
//     memberCount: 100,
//     category: '游戏',
//     announcement: '游戏交流，禁止外挂...',
//     description: '一起来玩游戏',
//     stats: {
//       active: 85,
//       male: 75,
//       local: 50
//     },
//     previewMembers: [
//       { id: 1, name: '群主', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png', role: '群主' }
//     ]
//   }
// ]

// 在现有的 ref 声明中添加或修改
const createdGroups = ref([])
const managedGroups = ref([])
const joinedGroups = ref([])

const updateNotice = (id, action) => {
  const notice = notices.value.find(n => n.id === id)
  if (notice) {
    notice.handled = true
    notice.status = action === 'accept' ? 'accepted' : 'rejected'
  }
}


// 是否为群管理员
// const isGroupAdmin = computed(() => {
//   if (!selectedGroup.value) return false
//   return createdGroups.some(g => g.id === selectedGroup.value.id) ||
//     managedGroups.some(g => g.id === selectedGroup.value.id)
// })

// 切换分组展开/收起
const toggleGroup = (groupId) => {
  expandedGroups[groupId] = !expandedGroups[groupId]
}

// 选择好友
const selectFriend = (friend) => {
  selectedFriend.value = friend
}

// 选择群聊
const selectGroup = (group) => {
  console.log('selectGroup', group.name)
  selectedGroup.value = group
  console.log('selectedGroup', selectedGroup.value)
  selectedFriend.value = null
}

// 发送消息
const sendMessage = (friend) => {
  router.push(`/chat/personal/${friend.id}`)
}

// 编辑备注
const editRemark = (friend) => {
  // 实现编辑备注的逻辑
}

// 删除好友
const deleteFriend = async (friend) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除好友「${friend.nickname || friend.username || friend.name}」吗？`,
      '删除好友',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    // 用户确认后执行删除
    const token = getToken()
    const response = await axios.post(
      'http://localhost:8080/im-server/user/del_friend',
      { friend_id: friend.id },
      {
        headers: {
          'Content-Type': 'application/json',
          'token': token,
        }
      }
    )
    if (response.status === 200) {
      ElMessage.success('好友删除成功')
      // 刷新好友列表
      await fetchFriendsList()
      selectedFriend.value = null
    } else {
      ElMessage.error(response.data.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试')
    }
  }
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

// 搜索好友
const searchFriends = async () => {
  if (!searchText.value) {
    showSearchResults.value = false
    return
  }
  try {
    const token = getToken() // 获取 token
    const response = await axios.post('http://localhost:8080/im-server/user/query', {
      search_id: searchText.value
    }, {
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    })
    // 处理返回结果
    searchResults.value = {
      users: response.data.data.users || [], // 确保是数组
      groups: response.data.data.groups || []  // 确保是数组
    }
    showSearchResults.value = true
  } catch (error) {
    console.error('搜索失败:', error)
    showSearchResults.value = false
  }
}

// 添加好友逻辑
const addFriend = async () => {
  console.log('添加好友:', friendForm.value)
  try {
    const token = getToken(); // 获取 token
    const response = await axios.post('http://localhost:8080/im-server/user/add_friend', {
      'friend_id': friendForm.value.id, // 好友ID
      'remark': friendForm.value.remark, // 备注
      'group_id': friendForm.value.group_id, // 分组ID（需要根据实际情况调整）
      'content': friendForm.value.verification // 验证信息
    }, {
      headers: {
        'token': token,
        'Content-Type': 'application/json'
      }
    });
    // 处理成功响应
    console.log('添加好友成功:', response.data);
    // 可以在这里显示成功消息
    ElNotification({
      title: '成功',
      message: '好友添加请求已发送成功！',
      type: 'success',
      duration: 3000 // 持续时间
    });
  } catch (error) {
    console.error('添加好友请求失败:', error);
    ElNotification({
      title: '错误',
      message: '添加好友请求失败，请检查网络或稍后重试。',
      type: 'error',
      duration: 3000 // 持续时间
    });
    // 可以在这里显示错误消息
  } finally {
    showAddFriend.value = false; // 关闭对话框
  }
}

// 加入群聊
const joinGroup = (group) => {
  // 加入群聊的逻辑
  console.log('加入群聊:', group)
}

// 显示添加好友对话框
const showAddFriendDialog = async (user) => {
  friendForm.value.nickname = user.username
  friendForm.value.remark = ''
  friendForm.value.group = ''
  friendForm.value.group_id = 0
  friendForm.value.verification = ''
  friendForm.value.avatar = user.avatar_url
  friendForm.value.id  = user.id
  await fetchFriendGroups()
  if (friendGroupOptions.value.length > 0) {
    friendForm.value.group = friendGroupOptions.value[0].group_name
    friendForm.value.group_id = friendGroupOptions.value[0].id
    console.log(friendForm.value)
  }
  showAddFriend.value = true
}

// 显示通知对话框
const showNotice = (type) => {
  noticeType.value = type
  showNoticeDialog.value = true
}
// 创建群聊
// 添加以下方法
const showCreateGroupDialog = () => {
  if (activeTab.value === 'friends') {
    showCreateFriendGroup.value = true
  } else {
    showCreateGroup.value = true
    groupForm.name = ''
    groupForm.group_avatar = ''
  }
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传头像图片只能是图片格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return false
  }

  // 创建临时URL用于预览
  groupForm.group_avatar = URL.createObjectURL(file)
  return false // 阻止自动上传
}

// 添加获取群聊列表的方法
const fetchGroupList = async () => {
  try {
    const token = getToken()
    const response = await axios.get('http://localhost:8080/im-server/groups/my_groups', {
      headers: {
        'Content-Type': 'application/json',
        'token': token
      }
    })
    if (response.status === 200) {
      // 假设后端返回的数据结构包含 created_groups, managed_groups, joined_groups
      const { created_groups = [], managed_groups = [], joined_groups = [] } = response.data.data
      // 更新群组数据
      createdGroups.value = created_groups || []
      managedGroups.value = managed_groups || []
      joinedGroups.value = joined_groups || []
      // 更新计数
      expandedGroups.created = true
      expandedGroups.managed = true
      expandedGroups.joined = true
    }
  } catch (error) {
    console.error('获取群聊列表失败:', error)
    ElMessage.error('获取群聊列表失败')
  }
}

const createGroup = async () => {
  if (!groupFormRef.value) return

  await groupFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const token = getToken()
        const response = await axios.post('http://localhost:8080/im-server/groups', {
          name: groupForm.name,
          group_avatar: groupForm.group_avatar
        }, {
          headers: {
            'Content-Type': 'application/json',
            'token': token
          }
        })

        if (response.status === 200) {
          ElMessage.success('群聊创建成功')
          showCreateGroup.value = false
          // 可以在这里刷新群聊列表
          await fetchGroupList() // 刷新群聊列表
        } else {
          ElMessage.error(response.data.msg || '创建失败')
        }
      } catch (error) {
        console.error('创建群聊失败:', error)
        ElMessage.error('创建群聊失败，请稍后重试')
      }
    }
  })
}

// 修改创建分组相关的响应式变量
const showCreateFriendGroup = ref(false)
const friendGroupFormRef = ref(null)
const friendGroupForm = reactive({
  group_name: ''
})

// 修改分组表单验证规则
const friendGroupRules = {
  group_name: [
    { required: true, message: '请输入分组名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 修改创建分组的方法
const createFriendGroup = async () => {
  if (!friendGroupFormRef.value) return

  await friendGroupFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const token = getToken()
        const response = await axios.post('http://localhost:8080/im-server/friend_groups', {
          group_name: friendGroupForm.group_name
        }, {
          headers: {
            'Content-Type': 'application/json',
            'token': token
          }
        })

        if (response.status === 200) {
          ElMessage.success('分组创建成功')
          showCreateFriendGroup.value = false
          // 刷新好友分组列表
          await fetchFriendsList()
          // 重置表单
          friendGroupForm.group_name = ''
        } else {
          ElMessage.error(response.data.msg || '创建失败')
        }
      } catch (error) {
        console.error('创建分组失败:', error)
        ElMessage.error('创建分组失败，请稍后重试')
      }
    }
  })
}

const onGroupChange = (groupName) => {
  // 找到选中的分组对象
  const group = friendGroupOptions.value.find(g => g.group_name === groupName)
  if (group) {
    friendForm.value.group_id = group.id
  } else {
    friendForm.value.group_id = 0
  }
}

onMounted(() => {
  fetchFriendsList()
  fetchGroupList() // 添加这一行
})
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

.friend-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}

.friend-item:hover {
  background-color: #f5f5f5;
}

.friend-info {
  margin-left: 10px;
}

.nickname {
  font-weight: bold;
}

.phone-number,
.bio {
  font-size: 12px;
  color: #666;
}

.contact-container {
  display: flex;
  height: 100%;
  background-color: #fff;
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

.friend-item {
  display: flex;
  align-items: center;
  padding: 10px;
  cursor: pointer;
}

.friend-item:hover {
  background-color: #f5f5f5;
}

.friend-info {
  margin-left: 10px;
}

.nickname {
  font-weight: bold;
}

.phone-number,
.bio {
  font-size: 12px;
  color: #666;
}
/* 111 */
.add-friend-dialog {
  border-radius: 12px; /* 圆角 */
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: center; /* 中心对齐 */
  margin-bottom: 10px; /* 增加间距 */
}

.dialog-title {
  margin: 0 10px; /* 标题与头像之间的间距 */
}

.friend-id {
  font-size: 12px; /* ID字体大小 */
  color: #666; /* ID颜色 */
  text-align: center; /* 居中对齐 */
}

.friend-avatar {
  margin-right: 10px; /* 头像与标题之间的间距 */
}

.el-dialog {
  border-radius: 12px; /* 圆角 */
}

.el-input,
.el-select {
  border-radius: 6px; /* 圆角 */
}

.dialog-footer {
  display: flex;
  justify-content: flex-end; /* 右对齐 */
}

.el-button {
  border-radius: 20px; /* 圆角 */
}

.el-form-item {
  margin-bottom: 15px; /* 增加间距 */
}

.chat-container {
  display: flex;
  height: 100%;
  background: #f5f5f5;
}

.friend-list-container {
  width: 250px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.search-bar {
  padding: 10px;
  border-bottom: 1px solid #e0e0e0;
}

.friend-group {
  margin-bottom: 10px;
}

.group-header {
  padding: 8px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #666;
}

.arrow {
  margin-right: 5px;
  font-size: 12px;
}

.count {
  margin-left: 5px;
  font-size: 12px;
  color: #999;
}

.friend-item {
  padding: 10px 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.friend-item:hover {
  background: #f5f5f5;
}

.friend-item.active {
  background: #e3f2fd;
}

.friend-info {
  margin-left: 10px;
}

.nickname {
  font-size: 14px;
  color: #333;
}

.status {
  font-size: 12px;
  color: #999;
  margin-top: 3px;
}

.detail-container {
  flex: 1;
  padding: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.basic-info {
  margin-left: 20px;
}

.basic-info h2 {
  margin: 0 0 10px 0;
}

.info-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
}

.info-item .label {
  width: 80px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.create-group-btn {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.avatar-uploader {
  display: flex;
  justify-content: center;
}

.avatar-uploader .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader .avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  object-fit: cover;
}

.avatar-uploader .el-upload:hover {
  border-color: #409EFF;
}
</style>
