<template>
  <el-dialog v-model="dialogVisible" title="编辑个人资料" width="500px">
    <el-form :model="form" label-width="80px">
      <el-form-item label="头像">
        <el-upload
          class="avatar-uploader"
          action="http://localhost:8080/im-server/upload-avatar"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar" />
          <el-button size="small" type="primary">上传头像</el-button>
        </el-upload>
      </el-form-item>

      <el-form-item label="昵称">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item label="性别">
        <el-radio-group v-model="form.gender">
          <el-radio label="male">男</el-radio>
          <el-radio label="female">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="生日">
        <el-date-picker v-model="form.birthday" type="date" placeholder="选择生日" format="YYYY-MM-DD"
          value-format="YYYY-MM-DD" />
      </el-form-item>

      <el-form-item label="所在地">
        <el-input v-model="form.location" placeholder="请输入所在地" />
      </el-form-item>

      <el-form-item label="个性签名">
        <el-input v-model="form.signature" type="textarea" :rows="3" placeholder="请输入个性签名" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  userInfo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'save'])

const dialogVisible = ref(props.visible)
const form = ref({
  avatarUrl: '',  // 新增字段用于存储头像URL
  nickname: '',
  gender: '',
  birthday: '2000-01-01',  // 默认值
  location: '北京',  // 默认值
  signature: '人生就是旷野'  // 默认值
})

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    // 打开弹窗时初始化表单数据
    form.value = {
      avatarUrl: props.userInfo.avatar_url,  // 初始化头像URL
      nickname: props.userInfo.username,
      gender: props.userInfo.gender,
      birthday: props.userInfo.data_of_birth || '2000-01-01',  // 使用默认值
      location: props.userInfo.city || '北京',  // 使用默认值
      signature: props.userInfo.bio || '人生就是旷野'  // 使用默认值
    }
  }
})

// 监听弹窗关闭
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    emit('update:visible', false)
  }
})

// 取消编辑
const handleCancel = () => {
  dialogVisible.value = false
}

// 保存修改
const handleSave = () => {
  emit('save', { ...form.value })
  dialogVisible.value = false
}

// 处理头像上传成功
const handleAvatarSuccess = (response, file) => {
  form.value.avatarUrl = URL.createObjectURL(file.raw);  // 显示上传后的头像
}

// 限制头像上传的文件类型
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    this.$message.error('上传头像图片只能是 JPG/PNG 格式!');
  }
  return isImage;
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 10px;
}
</style>