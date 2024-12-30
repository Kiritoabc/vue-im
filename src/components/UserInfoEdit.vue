<template>
  <el-dialog v-model="dialogVisible" title="编辑个人资料" width="500px">
    <el-form :model="form" label-width="80px">
      <el-form-item label="昵称">
        <el-input v-model="form.nickname" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item label="性别">
        <el-radio-group v-model="form.gender">
          <el-radio label="男">男</el-radio>
          <el-radio label="女">女</el-radio>
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
  nickname: '',
  gender: '',
  birthday: '',
  location: '',
  signature: ''
})

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    // 打开弹窗时初始化表单数据
    form.value = {
      nickname: props.userInfo.nickname,
      gender: props.userInfo.gender,
      birthday: props.userInfo.birthday,
      location: props.userInfo.location,
      signature: props.userInfo.signature
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
</style>