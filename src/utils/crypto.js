import CryptoJS from 'crypto-js'

// 生成设备标识
export function getDeviceId() {
  let deviceId = localStorage.getItem('pwm_device_id')
  if (!deviceId) {
    deviceId = btoa(navigator.userAgent + navigator.platform + new Date().getTime())
    localStorage.setItem('pwm_device_id', deviceId)
  }
  return deviceId
}

// 生成加密密钥
export function generateKey(password) {
  const deviceId = getDeviceId()
  return CryptoJS.SHA256(password + deviceId).toString()
}

// 加密数据
export function encrypt(data, password) {
  const key = generateKey(password)
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString()
}

// 解密数据
export function decrypt(encryptedData, password) {
  const key = generateKey(password)
  const bytes = CryptoJS.AES.decrypt(encryptedData, key)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

// 生成主密码哈希
export function hashPassword(password) {
  return CryptoJS.SHA256(password + getDeviceId()).toString()
}

// 验证主密码
export function verifyPassword(inputPassword, storedHash) {
  return hashPassword(inputPassword) === storedHash
}