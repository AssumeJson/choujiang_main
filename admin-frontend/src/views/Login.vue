<template>
  <div class="login-container">
    <div class="login-box">
      <h2>电影票抽奖管理系统</h2>
      <el-form :model="loginForm" label-width="0">
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <p class="hint">默认账号：admin / admin123</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const loginForm = ref({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  
  loading.value = true
  try {
    const response = await axios.post('/api/auth/login', loginForm.value, {
      timeout: 10000
    })
    
    console.log('Raw response:', response)
    const res = response.data
    console.log('Response data:', res)
    
    if (res && res.code === 0 && res.data && res.data.token) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userInfo', JSON.stringify(res.data))
      console.log('Token stored:', localStorage.getItem('token'))
      ElMessage.success('登录成功')
      
      setTimeout(() => {
        router.push('/dashboard').then(() => {
          console.log('Router push succeeded')
        }).catch(err => {
          console.error('Router push failed:', err)
        })
      }, 500)
    } else {
      ElMessage.error(res?.message || '登录失败，未获取到token')
      console.error('Login failed:', res)
    }
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error(error.message || '登录失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.hint {
  text-align: center;
  margin-top: 20px;
  color: #999;
  font-size: 14px;
}
</style>
