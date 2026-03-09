<template>
  <div class="password-generator">
    <header class="glass-header">
      <h1>密码生成器</h1>
      <button class="icon-btn" @click="router.push('/add')">⬅️</button>
    </header>
    
    <div class="glass-card">
      <div class="password-display">
        <input 
          type="text" 
          v-model="generatedPassword" 
          readonly 
          class="password-input"
        />
        <button class="copy-btn" @click="copyToClipboard">📋</button>
      </div>
      
      <div class="options">
        <div class="option">
          <label for="length">长度: {{ length }}</label>
          <input 
            type="range" 
            id="length" 
            v-model.number="length" 
            min="8" 
            max="32" 
            @input="generatePassword"
          />
        </div>
        
        <div class="option">
          <input 
            type="checkbox" 
            id="uppercase" 
            v-model="includeUppercase" 
            @change="generatePassword"
          />
          <label for="uppercase">大写字母</label>
        </div>
        
        <div class="option">
          <input 
            type="checkbox" 
            id="lowercase" 
            v-model="includeLowercase" 
            @change="generatePassword"
          />
          <label for="lowercase">小写字母</label>
        </div>
        
        <div class="option">
          <input 
            type="checkbox" 
            id="numbers" 
            v-model="includeNumbers" 
            @change="generatePassword"
          />
          <label for="numbers">数字</label>
        </div>
        
        <div class="option">
          <input 
            type="checkbox" 
            id="symbols" 
            v-model="includeSymbols" 
            @change="generatePassword"
          />
          <label for="symbols">特殊符号</label>
        </div>
      </div>
      
      <button class="primary-btn" @click="generatePassword">重新生成</button>
      <!-- 新的按钮代码（绑定新函数） -->
      <button class="secondary-btn" @click="useGeneratedPassword">使用此密码</button>
    </div>
    
    <div v-if="showCopySuccess" class="copy-success">已复制到剪贴板</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const length = ref(16)
const includeUppercase = ref(true)
const includeLowercase = ref(true)
const includeNumbers = ref(true)
const includeSymbols = ref(false)
const generatedPassword = ref('')
const showCopySuccess = ref(false)

function generatePassword() {
  let charset = ''
  if (includeUppercase.value) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (includeLowercase.value) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (includeNumbers.value) charset += '0123456789'
  if (includeSymbols.value) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  if (charset.length === 0) {
    generatedPassword.value = '请至少选择一种字符类型'
    return
  }
  
  let password = ''
  for (let i = 0; i < length.value; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length)
    password += charset[randomIndex]
  }
  
  generatedPassword.value = password
}

function copyToClipboard() {
  if (generatedPassword.value && generatedPassword.value !== '请至少选择一种字符类型') {
    navigator.clipboard.writeText(generatedPassword.value).then(() => {
      showCopySuccess.value = true
      setTimeout(() => {
        showCopySuccess.value = false
      }, 2000)
    })
  }
}

// 修复：跳转时携带生成的密码
function useGeneratedPassword() {
  if (generatedPassword.value && generatedPassword.value !== '请至少选择一种字符类型') {
    router.push({
      path: '/add',
      query: { password: generatedPassword.value }
    })
  }
}

onMounted(() => {
  generatePassword()
})
</script>

<style scoped>
.password-generator {
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

.password-display {
  position: relative;
  margin-bottom: 30px;
}

.password-input {
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  font-family: 'Courier New', monospace;
  text-align: center;
  transition: all 0.3s ease;
}

.password-input:focus {
  outline: none;
  border-color: #3a5f8b;
  box-shadow: 0 0 10px rgba(58, 95, 139, 0.3);
}

.copy-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 6px;
  padding: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 0 8px rgba(58, 95, 139, 0.3);
}

.options {
  margin-bottom: 30px;
}

.option {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.option label {
  flex: 1;
  color: #3a5f8b;
  font-size: 16px;
}

.option input[type="range"] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(200, 200, 255, 0.5);
  outline: none;
  -webkit-appearance: none;
}

.option input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3a5f8b;
  cursor: pointer;
}

.option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.primary-btn {
  width: 100%;
  padding: 14px;
  background: #3a5f8b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 12px;
}

.primary-btn:hover {
  background: #2c4a6b;
  box-shadow: 0 0 15px rgba(58, 95, 139, 0.4);
}

.secondary-btn {
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 0.6);
  color: #3a5f8b;
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 10px rgba(58, 95, 139, 0.3);
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
  .password-generator {
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
  
  .password-input {
    padding: 12px;
    font-size: 16px;
  }
  
  .primary-btn,
  .secondary-btn {
    padding: 12px;
    font-size: 14px;
  }
  
  .copy-success {
    bottom: 20px;
    right: 20px;
    padding: 10px 16px;
    font-size: 12px;
  }
}
</style>