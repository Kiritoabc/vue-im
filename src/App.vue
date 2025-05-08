<script setup>
import { onMounted } from 'vue'
import { initTheme } from './utils/theme'
// import Login from './views/Login.vue'

onMounted(() => {
  initTheme()
})
</script>

<template>
  <div id="app">
    <!-- <Login /> -->
    <router-view />
  </div>
</template>

<style>
#app {
  width: 100%;
  height: 100vh;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>