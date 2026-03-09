<template>
  <div class="edit-password">
    <header class="glass-header">
      <h1>编辑密码</h1>
      <button class="icon-btn" @click="router.push('/home')">⬅️</button>
    </header>
    
    <div class="glass-card" v-if="password">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">网站/软件名称 *</label>
          <input 
            type="text" 
            id="name" 
            v-model="form.name" 
            placeholder="请输入网站或软件名称"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="username">账号 *</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username" 
            placeholder="请输入账号"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">密码 *</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="form.password" 
              placeholder="请输入密码"
              required
            />
            <button type="button" class="eye-btn" @click="togglePassword">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <button type="button" class="generator-btn" @click="router.push('/generator')">
            生成密码
          </button>
        </div>
        
        <div class="form-group">
          <label for="url">网址</label>
          <input 
            type="url" 
            id="url" 
            v-model="form.url" 
            placeholder="请输入网址 (可选)"
          />
        </div>
        
        <div class="form-group">
          <label for="remark">备注</label>
          <textarea 
            id="remark" 
            v-model="form.remark" 
            placeholder="请输入备注 (可选)"
            rows="3"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="tags">标签</label>
          <input 
            type="text" 
            id="tags" 
            v-model="tagInput" 
            placeholder="输入标签后按回车添加"
            @keyup.enter.prevent="addTag"
          />
          <div class="tags">
            <span v-for="(tag, index) in form.tags" :key="index" class="tag">
              {{ tag }}
              <button type="button" class="tag-remove" @click="removeTag(index)">×</button>
            </span>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="secondary-btn" @click="router.push('/home')">取消</button>
          <button type="submit" class="primary-btn">保存</button>
        </div>
      </form>
    </div>
    
    <div class="glass-card" v-else>
      <p>密码不存在</p>
      <button class="primary-btn" @click="router.push('/home')">返回</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getPasswords, savePasswords } from '../utils/storage.js'

const router = useRouter()
const route = useRoute()
const passwordId = route.params.id
const form = ref({
  name: '',
  username: '',
  password: '',
  url: '',
  remark: '',
  tags: []
})
const showPassword = ref(false)
const tagInput = ref('')
const password = ref(null)

// 模拟主密码（实际应用中应该从登录状态获取）
const masterPassword = ref('test123') // 临时值，实际应从全局状态获取

function togglePassword() {
  showPassword.value = !showPassword.value
}

function addTag() {
  if (tagInput.value.trim()) {
    form.value.tags.push(tagInput.value.trim())
    tagInput.value = ''
  }
}

function removeTag(index) {
  form.value.tags.splice(index, 1)
}

function handleSubmit() {
  const passwords = getPasswords(masterPassword.value)
  const index = passwords.findIndex(pw => pw.id === passwordId)
  if (index !== -1) {
    passwords[index] = {
      ...form.value,
      id: passwordId,
      createTime: passwords[index].createTime,
      updateTime: new Date().toISOString()
    }
    savePasswords(passwords, masterPassword.value)
    router.push('/home')
  }
}

onMounted(() => {
  const passwords = getPasswords(masterPassword.value)
  const foundPassword = passwords.find(pw => pw.id === passwordId)
  if (foundPassword) {
    password.value = foundPassword
    form.value = { ...foundPassword }
  }
})
</script>

<style scoped>
.edit-password {
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
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #3a5f8b;
  font-weight: 500;
}

input[type="text"],
input[type="password"],
input[type="url"],
textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  transition: all 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus,
input[type="url"]:focus,
textarea:focus {
  outline: none;
  border-color: #3a5f8b;
  box-shadow: 0 0 10px rgba(58, 95, 139, 0.3);
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  flex: 1;
  padding-right: 40px;
}

.eye-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
}

.generator-btn {
  margin-top: 8px;
  padding: 6px 12px;
  border: 1px solid rgba(200, 200, 255, 0.5);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  color: #3a5f8b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.generator-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 8px rgba(58, 95, 139, 0.3);
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
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-remove {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #3a5f8b;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 30px;
  justify-content: flex-end;
}

.primary-btn {
  padding: 12px 24px;
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

.secondary-btn {
  padding: 12px 24px;
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

@media (max-width: 768px) {
  .edit-password {
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
  
  input,
  textarea {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .primary-btn,
  .secondary-btn {
    width: 100%;
    padding: 10px;
    font-size: 14px;
  }
}
</style>