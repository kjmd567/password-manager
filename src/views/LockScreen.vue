<template>
  <div class="lock-screen">
    <div class="glass-card">
      <h1>密码管理器</h1>
      
      <div v-if="isFirstTime">
        <h2>设置主密码</h2>
        <p>当前设备将作为默认账号</p>
        <div class="form-group">
          <label for="password">设置主密码</label>
          <div class="password-input">
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="请输入主密码"
              @keyup.enter="handleSubmit"
            />
            <button class="eye-btn" @click="togglePassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认主密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            placeholder="请再次输入主密码"
            @keyup.enter="handleSubmit"
          />
        </div>
        <button class="primary-btn" @click="handleSubmit">设置密码</button>
      </div>
      
      <div v-else>
        <h2>解锁密码管理器</h2>
        <div class="form-group">
          <label for="password">主密码</label>
          <div class="password-input">
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              placeholder="请输入主密码"
              @keyup.enter="handleUnlock"
            />
            <button class="eye-btn" @click="togglePassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>
        <div class="remember-container">
          <input type="checkbox" id="remember" v-model="remember" />
          <label for="remember">记住解锁状态</label>
        </div>
        <button class="primary-btn" @click="handleUnlock">解锁</button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  saveMasterPassword, 
  validateMasterPassword, 
  saveRememberStatus, 
  getRememberStatus, 
  isFirstTime 
} from '../utils/storage.js'

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const remember = ref(getRememberStatus())
const error = ref('')
const loginAttempts = ref(0)
const lastAttemptTime = ref(0)

const isFirstTimeUser = computed(() => isFirstTime())

function togglePassword() {
  showPassword.value = !showPassword.value
}

function handleSubmit() {
  if (!password.value) {
    error.value = '请输入主密码'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  
  saveMasterPassword(password.value)
  saveRememberStatus(remember.value)
  router.push('/home')
}

function handleUnlock() {
  const now = Date.now()
  if (loginAttempts.value >= 5 && now - lastAttemptTime.value < 10 * 60 * 1000) {
    error.value = '错误次数过多，请10分钟后再试'
    return
  }
  
  if (!validateMasterPassword(password.value)) {
    error.value = '密码错误'
    loginAttempts.value++
    lastAttemptTime.value = now
    return
  }
  
  saveRememberStatus(remember.value)
  router.push('/home')
}

onMounted(() => {
  // 检查是否已记住解锁状态
  if (getRememberStatus() && !isFirstTimeUser.value) {
    router.push('/home')
  }
})
</script>

<style scoped>
.lock-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(200, 200, 255, 0.3);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
}

h1 {
  text-align: center;
  color: #3a5f8b;
  margin-bottom: 30px;
  font-size: 24px;
}

h2 {
  text-align: center;
  color: #3a5f8b;
  margin-bottom: 20px;
  font-size: 18px;
}

p {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #3a5f8b;
  font-weight: 500;
}

.password-input {
  position: relative;
}

input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #3a5f8b;
  box-shadow: 0 0 10px rgba(58, 95, 139, 0.3);
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
}

.remember-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.remember-container input {
  width: auto;
  margin-right: 8px;
}

.primary-btn {
  width: 100%;
  padding: 12px;
  background: #3a5f8b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  background: #2c4a6b;
  box-shadow: 0 0 15px rgba(58, 95, 139, 0.4);
}

.error-message {
  color: #ff4d4f;
  margin-top: 10px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .glass-card {
    padding: 30px 20px;
  }
  
  h1 {
    font-size: 20px;
  }
  
  h2 {
    font-size: 16px;
  }
  
  input {
    padding: 10px 35px 10px 12px;
    font-size: 14px;
  }
  
  .primary-btn {
    padding: 10px;
    font-size: 14px;
  }
}
</style>