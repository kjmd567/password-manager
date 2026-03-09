<template>
  <div class="home">
    <header class="glass-header">
      <h1>密码管理</h1>
      <div class="header-actions">
        <button class="icon-btn" @click="router.push('/settings')">⚙️</button>
      </div>
    </header>
    
    <div class="search-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="搜索网站、账号或备注..."
        class="search-input"
      />
    </div>
    
    <div class="sort-container">
      <select v-model="sortBy" class="sort-select">
        <option value="createTime">创建时间</option>
        <option value="name">网站名称</option>
      </select>
    </div>
    
    <div class="password-list">
      <div 
        v-for="password in filteredPasswords" 
        :key="password.id"
        class="password-card"
      >
        <div class="card-header">
          <h3>{{ password.name }}</h3>
          <div class="card-actions">
            <button class="action-btn" @click="editPassword(password.id)">编辑</button>
            <button class="action-btn delete-btn" @click="deletePassword(password.id)">删除</button>
          </div>
        </div>
        <div class="card-body">
          <div class="info-item">
            <span class="label">账号:</span>
            <span class="value">{{ password.username }}</span>
            <button class="copy-btn" @click="copyToClipboard(password.username)">📋</button>
          </div>
          <div class="info-item">
            <span class="label">密码:</span>
            <div class="password-container">
              <span class="value">{{ showPassword === password.id ? password.password : '●●●●●●' }}</span>
              <button class="eye-btn" @click="togglePassword(password.id)">
                {{ showPassword === password.id ? '👁️' : '👁️‍🗨️' }}
              </button>
              <button class="copy-btn" @click="copyToClipboard(password.password)">📋</button>
            </div>
          </div>
          <div v-if="password.url" class="info-item">
            <span class="label">网址:</span>
            <a :href="password.url" target="_blank" class="value link">{{ password.url }}</a>
          </div>
          <div v-if="password.remark" class="info-item">
            <span class="label">备注:</span>
            <span class="value">{{ password.remark }}</span>
          </div>
          <div v-if="password.tags && password.tags.length > 0" class="tags">
            <span v-for="tag in password.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="card-footer">
            <span class="create-time">{{ formatDate(password.createTime) }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="filteredPasswords.length === 0" class="empty-state">
        <p>暂无密码数据</p>
        <button class="primary-btn" @click="router.push('/add')">添加密码</button>
      </div>
    </div>
    
    <button class="floating-btn" @click="router.push('/add')">+</button>
    
    <div v-if="showCopySuccess" class="copy-success">已复制到剪贴板</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPasswords, savePasswords } from '../utils/storage.js'

const router = useRouter()
const passwords = ref([])
const searchQuery = ref('')
const sortBy = ref('createTime')
const showPassword = ref(null)
const showCopySuccess = ref(false)
const lockTimer = ref(null)

// 模拟主密码（实际应用中应该从登录状态获取）
const masterPassword = ref('test123') // 临时值，实际应从全局状态获取

const filteredPasswords = computed(() => {
  let result = [...passwords.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(pw => 
      pw.name.toLowerCase().includes(query) ||
      pw.username.toLowerCase().includes(query) ||
      (pw.remark && pw.remark.toLowerCase().includes(query))
    )
  }
  
  // 排序
  result.sort((a, b) => {
    if (sortBy.value === 'createTime') {
      return new Date(b.createTime) - new Date(a.createTime)
    } else if (sortBy.value === 'name') {
      return a.name.localeCompare(b.name)
    }
    return 0
  })
  
  return result
})

function loadPasswords() {
  passwords.value = getPasswords(masterPassword.value)
}

function editPassword(id) {
  router.push(`/edit/${id}`)
}

function deletePassword(id) {
  if (confirm('确定要删除此密码吗？')) {
    passwords.value = passwords.value.filter(pw => pw.id !== id)
    savePasswords(passwords.value, masterPassword.value)
  }
}

function togglePassword(id) {
  if (showPassword.value === id) {
    showPassword.value = null
  } else {
    showPassword.value = id
    // 10秒后自动隐藏
    setTimeout(() => {
      if (showPassword.value === id) {
        showPassword.value = null
      }
    }, 10000)
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showCopySuccess.value = true
    setTimeout(() => {
      showCopySuccess.value = false
    }, 2000)
  })
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString()
}

function resetLockTimer() {
  clearTimeout(lockTimer.value)
  lockTimer.value = setTimeout(() => {
    // 自动锁定，跳转回登录页
    router.push('/')
  }, 5 * 60 * 1000) // 5分钟
}

onMounted(() => {
  loadPasswords()
  resetLockTimer()
  
  // 监听用户操作，重置锁定计时器
  window.addEventListener('mousemove', resetLockTimer)
  window.addEventListener('keypress', resetLockTimer)
  window.addEventListener('click', resetLockTimer)
})

onUnmounted(() => {
  clearTimeout(lockTimer.value)
  window.removeEventListener('mousemove', resetLockTimer)
  window.removeEventListener('keypress', resetLockTimer)
  window.removeEventListener('click', resetLockTimer)
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding: 20px;
}

.glass-header {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(200, 200, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(31, 38, 135, 0.2);
}

h1 {
  color: #3a5f8b;
  font-size: 24px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.icon-btn {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 8px;
  padding: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 10px rgba(58, 95, 139, 0.3);
}

.search-container {
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3a5f8b;
  box-shadow: 0 0 10px rgba(58, 95, 139, 0.3);
}

.sort-container {
  margin-bottom: 20px;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
}

.password-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 80px;
}

.password-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(200, 200, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(31, 38, 135, 0.2);
  transition: all 0.3s ease;
}

.password-card:hover {
  box-shadow: 0 0 20px rgba(58, 95, 139, 0.4);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.card-header h3 {
  color: #3a5f8b;
  font-size: 18px;
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 8px rgba(58, 95, 139, 0.3);
}

.delete-btn {
  color: #ff4d4f;
  border-color: rgba(255, 77, 79, 0.3);
}

.delete-btn:hover {
  background: rgba(255, 77, 79, 0.1);
}

.card-body {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.label {
  width: 60px;
  color: #666;
  font-size: 14px;
  flex-shrink: 0;
}

.value {
  flex: 1;
  color: #333;
  font-size: 14px;
  word-break: break-all;
}

.link {
  color: #3a5f8b;
  text-decoration: none;
  border-bottom: 1px solid #3a5f8b;
}

.link:hover {
  color: #2c4a6b;
}

.password-container {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 8px;
}

.eye-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.copy-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.copy-btn:hover {
  opacity: 1;
}

.tags {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.tag {
  background: rgba(58, 95, 139, 0.1);
  color: #3a5f8b;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.card-footer {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid rgba(200, 200, 255, 0.3);
}

.create-time {
  font-size: 12px;
  color: #999;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(200, 200, 255, 0.3);
  border-radius: 12px;
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
  font-size: 16px;
}

.floating-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #3a5f8b;
  color: white;
  border: none;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(58, 95, 139, 0.4);
  transition: all 0.3s ease;
  z-index: 1000;
}

.floating-btn:hover {
  background: #2c4a6b;
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(58, 95, 139, 0.5);
}

.copy-success {
  position: fixed;
  bottom: 100px;
  right: 30px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(200, 200, 255, 0.3);
  border-radius: 8px;
  padding: 12px 20px;
  color: #3a5f8b;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(31, 38, 135, 0.2);
  z-index: 1001;
  animation: fadeInOut 2s ease-in-out;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(20px); }
}

@media (max-width: 768px) {
  .home {
    padding: 10px;
  }
  
  .glass-header {
    padding: 15px;
  }
  
  h1 {
    font-size: 20px;
  }
  
  .password-list {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .password-card {
    padding: 15px;
  }
  
  .card-header h3 {
    font-size: 16px;
  }
  
  .floating-btn {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .copy-success {
    bottom: 80px;
    right: 20px;
    padding: 10px 16px;
    font-size: 12px;
  }
}
</style>