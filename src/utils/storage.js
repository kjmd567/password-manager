import { encrypt, decrypt, hashPassword, verifyPassword } from './crypto.js'

// 存储主密码
export function saveMasterPassword(password) {
  const hashedPassword = hashPassword(password)
  localStorage.setItem('pwm_master_hash', hashedPassword)
}

// 验证主密码
export function validateMasterPassword(password) {
  const storedHash = localStorage.getItem('pwm_master_hash')
  if (!storedHash) return false
  return verifyPassword(password, storedHash)
}

// 保存密码数据
export function savePasswords(passwords, masterPassword) {
  const encryptedData = encrypt(passwords, masterPassword)
  localStorage.setItem('pwm_data', encryptedData)
}

// 获取密码数据
export function getPasswords(masterPassword) {
  const encryptedData = localStorage.getItem('pwm_data')
  if (!encryptedData) return []
  try {
    return decrypt(encryptedData, masterPassword)
  } catch (error) {
    console.error('解密失败:', error)
    return []
  }
}

// 保存记住状态
export function saveRememberStatus(status) {
  localStorage.setItem('pwm_remember', status.toString())
}

// 获取记住状态
export function getRememberStatus() {
  return localStorage.getItem('pwm_remember') === 'true'
}

// 保存自动锁定时间
export function saveLockTime(minutes) {
  localStorage.setItem('pwm_lock_time', minutes.toString())
}

// 获取自动锁定时间
export function getLockTime() {
  return parseInt(localStorage.getItem('pwm_lock_time')) || 5
}

// 检查是否首次使用
export function isFirstTime() {
  return !localStorage.getItem('pwm_master_hash')
}

// 清空所有数据
export function clearAllData() {
  localStorage.removeItem('pwm_master_hash')
  localStorage.removeItem('pwm_data')
  localStorage.removeItem('pwm_remember')
  localStorage.removeItem('pwm_lock_time')
}

// 导出数据
export function exportData(masterPassword) {
  const passwords = getPasswords(masterPassword)
  const data = {
    deviceId: localStorage.getItem('pwm_device_id'),
    masterHash: localStorage.getItem('pwm_master_hash'),
    passwords: passwords
  }
  return JSON.stringify(data)
}

// 导入数据
export function importData(jsonData, masterPassword) {
  try {
    const data = JSON.parse(jsonData)
    // 验证密码
    if (!verifyPassword(masterPassword, data.masterHash)) {
      return false
    }
    // 保存数据
    savePasswords(data.passwords, masterPassword)
    return true
  } catch (error) {
    console.error('导入失败:', error)
    return false
  }
}