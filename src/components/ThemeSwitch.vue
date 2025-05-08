<template>
  <div class="theme-switch">
    <div class="theme-options">
      <div
        v-for="theme in themes"
        :key="theme.name"
        class="theme-option"
        :class="{ active: currentTheme === theme.name }"
        @click="handleThemeChange(theme.name)"
      >
        <el-icon class="theme-icon">
          <Sunny v-if="theme.name === 'light'" />
          <Moon v-else />
        </el-icon>
        <span>{{ theme.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { themes, getCurrentTheme, setTheme } from '../utils/theme'

const currentTheme = ref(getCurrentTheme())

const handleThemeChange = (themeName) => {
  setTheme(themeName)
  currentTheme.value = themeName
}

onMounted(() => {
  setTheme(currentTheme.value)
})
</script>

<style scoped>
.theme-switch {
  padding: 4px 0;
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.theme-option {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-color);
}

.theme-option:hover {
  background-color: var(--hover-color);
}

.theme-option.active {
  color: var(--primary-color);
  background-color: var(--active-color);
}

.theme-icon {
  margin-right: 8px;
  font-size: 18px;
}

.theme-option.active .theme-icon {
  color: var(--primary-color);
}

/* 添加图标颜色 */
.theme-option .el-icon-sunny {
  color: #f5a623;
}

.theme-option .el-icon-moon {
  color: #7c3aed;
}
</style> 