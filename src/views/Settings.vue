<template>
  <div class="settings">
    <header class="glass-header">
      <h1>设置</h1>
      <button class="icon-btn" @click="router.push('/home')">⬅️</button>
    </header>
    
    <div class="glass-card">
      <div class="setting-section">
        <h2>安全设置</h2>
        
        <div class="setting-item">
          <label>修改主密码</label>
          <button class="secondary-btn" @click="showChangePassword = true">修改</button>
        </div>
        
        <div class="setting-item">
          <label>自动锁定时间</label>
          <select v-model="lockTime" class="setting-select" @change="handleSaveLockTime">
            <option value="1">1分钟</option>
            <option value="5">5分钟</option>
            <option value="15">15分钟</option>
            <option value="30">30分钟</option>
          </select>
        </div>
      </div>
      
      <div class="setting-section">
        <h2>数据管理</h2>
        
        <div class="setting-item">
          <label>导出备份</label>
          <button class="secondary-btn" @click="exportData">导出</button>
        </div>
        
        <div class="setting-item">
          <label>导入备份</label>
          <input 
            type="file" 
            ref="fileInput" 
            style="display: none;" 
            accept=".json,.pwm" 
            @change="importData"
          />
          <button class="secondary-btn" @click="$refs.fileInput.click()">导入</button>
        </div>
        
        <div class="setting-item danger">
          <label>清空所有数据</label>
          <button class="danger-btn" @click="clearAllData">清空</button>
        </div>
      </div>
      
      <div class="setting-section">
        <h2>关于</h2>
        <div class="about-info">
          <p>密码管理器 v1.0.0</p>
          <p>本地优先、轻量安全的密码管理工具</p>
          <p>当前设备作为默认账号，无需额外注册</p>
        </div>
      </div>
    </div>
    
    <!-- 修改密码弹窗 -->
    <div v-if="showChangePassword" class="modal-overlay" @click="showChangePassword = false">
      <div class="modal-content" @click.stop>
        <h3>修改主密码</h3>
        <div class="form-group">
          <label for="oldPassword">原密码</label>
          <input 
            type="password" 
            id="oldPassword" 
            v-model="oldPassword" 
            placeholder="请输入原密码"
          />
        </div>
        <div class="form-group">
          <label for="newPassword">新密码</label>
          <input 
            type="password" 
            id="newPassword" 
            v-model="newPassword" 
            placeholder="请输入新密码"
          />
        </div>
        <div class="form-group">
          <label for="confirmNewPassword">确认新密码</label>
          <input 
            type="password" 
            id="confirmNewPassword" 
            v-model="confirmNewPassword" 
            placeholder="请再次输入新密码"
          />
        </div>
        <div class="modal-actions">
          <button class="secondary-btn" @click="showChangePassword = false">取消</button>
          <button class="primary-btn" @click="changePassword">确定</button>
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </div>
    
    <div v-if="showCopySuccess" class="copy-success">操作成功</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  saveMasterPassword, 
  validateMasterPassword, 
  getPasswords, 
  savePasswords, 
  saveLockTime, 
  getLockTime, 
  clearAllData as clearStorageData, 
  exportData as exportStorageData, 
  importData as importStorageData,
  getMasterPasswordHash, // 新增
  getMasterPassword // 新增
} from '../utils/storage.js'

const router = useRouter()
const showChangePassword = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const error = ref('')
const lockTime = ref(getLockTime())
const showCopySuccess = ref(false)

// 修复：读取真实的主密码（从storage，而非硬编码）
const masterPassword = ref(getMasterPassword() || '') 

function changePassword() {
  error.value = ''
  
  if (!validateMasterPassword(oldPassword.value)) {
    error.value = '原密码错误'
    return
  }
  
  if (!newPassword.value) {
    error.value = '请输入新密码'
    return
  }
  
  if (newPassword.value !== confirmNewPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  
  // 更新主密码
  saveMasterPassword(newPassword.value)
  
  // 用新密码重新加密所有数据
  const passwords = getPasswords(oldPassword.value)
  savePasswords(passwords, newPassword.value)
  
  // 更新当前主密码
  localStorage.setItem('pwm_master_password_temp', newPassword.value)
  masterPassword.value = newPassword.value
  
  showChangePassword.value = false
  showSuccessMessage()
}

function handleSaveLockTime() {
  saveLockTime(lockTime.value)
  showSuccessMessage()
}

function exportData() {
  const data = exportStorageData(masterPassword.value)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `password-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  showSuccessMessage()
}

function importData(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = function(e) {
    try {
      const jsonData = e.target.result
      if (importStorageData(jsonData, masterPassword.value)) {
        showSuccessMessage()
        router.push('/home')
      } else {
        alert('导入失败：密码错误或文件格式不正确')
      }
    } catch (error) {
      alert('导入失败：文件格式错误')
    }
  }
  reader.readAsText(file)
}

function clearAllData() {
  if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
    clearStorageData()
    router.push('/')
  }
}

function showSuccessMessage() {
  showCopySuccess.value = true
  setTimeout(() => {
    showCopySuccess.value = false
  }, 2000)
}

onMounted(() => {
  lockTime.value = getLockTime()
})
</script>

<style scoped>
.settings {
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

.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(200, 200, 255, 0.3);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(31, 38, 135, 0.2);
  max-width: 600px;
  margin: 0 auto;
}

.setting-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(200, 200, 255, 0.3);
}

.setting-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

h2 {
  color: #3a5f8b;
  font-size: 18px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.setting-item:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 8px rgba(58, 95, 139, 0.2);
}

.setting-item.danger:hover {
  background: rgba(255, 77, 79, 0.1);
}

.setting-item label {
  color: #3a5f8b;
  font-size: 16px;
}

.setting-select {
  padding: 6px 12px;
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
}

.secondary-btn {
  padding: 6px 12px;
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  color: #3a5f8b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 8px rgba(58, 95, 139, 0.3);
}

.danger-btn {
  padding: 6px 12px;
  border: 1px solid rgba(255, 77, 79, 0.3);
  border-radius: 6px;
  background: rgba(255, 77, 79, 0.1);
  font-size: 14px;
  color: #ff4d4f;
  cursor: pointer;
  transition: all 0.3s ease;
}

.danger-btn:hover {
  background: rgba(255, 77, 79, 0.2);
  box-shadow: 0 0 8px rgba(255, 77, 79, 0.3);
}

.about-info {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  padding: 15px;
}

.about-info p {
  color: #666;
  margin-bottom: 8px;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(200, 200, 255, 0.3);
  border-radius: 12px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

.modal-content h3 {
  color: #3a5f8b;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #3a5f8b;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #3a5f8b;
  box-shadow: 0 0 8px rgba(58, 95, 139, 0.3);
}

.modal-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
}

.primary-btn {
  padding: 8px 16px;
  background: #3a5f8b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  background: #2c4a6b;
  box-shadow: 0 0 10px rgba(58, 95, 139, 0.4);
}

.error-message {
  color: #ff4d4f;
  margin-top: 10px;
  font-size: 14px;
  text-align: center;
}

.copy-success {
  position: fixed;
  bottom: 30px;
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
  .settings {
    padding: 10px;
  }
  
  .glass-header {
    padding: 15px;
  }
  
  h1 {
    font-size: 20px;
  }
  
  .glass-card {
    padding: 20px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .setting-item label {
    width: 100%;
  }
  
  .setting-select,
  .secondary-btn,
  .danger-btn {
    align-self: flex-end;
  }
  
  .modal-content {
    padding: 20px;
  }
  
  .copy-success {
    bottom: 20px;
    right: 20px;
    padding: 10px 16px;
    font-size: 12px;
  }
}
</style>