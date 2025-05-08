// 主题配置
export const themes = {
  light: {
    name: 'light',
    label: '浅色',
    colors: {
      primary: '#409EFF',
      background: '#ffffff',
      text: '#303133',
      border: '#dcdfe6',
      hover: '#f5f7fa',
      active: '#e6f1fc',
      card: '#ffffff',
      shadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)'
    }
  },
  dark: {
    name: 'dark',
    label: '深色',
    colors: {
      primary: '#409EFF',
      background: '#1a1a1a',
      text: '#ffffff',
      border: '#434343',
      hover: '#2c2c2c',
      active: '#2c2c2c',
      card: '#2c2c2c',
      shadow: '0 2px 12px 0 rgba(0, 0, 0, 0.3)'
    }
  }
}

// 获取当前主题
export const getCurrentTheme = () => {
  return localStorage.getItem('theme') || 'light'
}

// 设置主题
export const setTheme = (themeName) => {
  const theme = themes[themeName]
  if (!theme) return

  // 保存主题设置
  localStorage.setItem('theme', themeName)

  // 设置CSS变量
  const root = document.documentElement
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}-color`, value)
  })

  // 设置body背景色
  document.body.style.backgroundColor = theme.colors.background
  document.body.style.color = theme.colors.text
}

// 初始化主题
export const initTheme = () => {
  const currentTheme = getCurrentTheme()
  setTheme(currentTheme)
} 