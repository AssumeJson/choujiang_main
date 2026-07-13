import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { login } from '@/services/api'
import styles from './index.module.scss'

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)

  const handleGetPhoneNumber = async (e: any) => {
    console.log('[Login] 按钮点击事件触发:', e)

    if (!e.detail) {
      Taro.showToast({
        title: '请在微信开发者工具或真机上运行',
        icon: 'none'
      })
      return
    }

    if (!e.detail.code) {
      if (e.detail.errMsg && e.detail.errMsg.includes('auth deny')) {
        Taro.showToast({
          title: '需要授权手机号才能登录',
          icon: 'none'
        })
      } else {
        Taro.showToast({
          title: '授权失败，请重试',
          icon: 'none'
        })
      }
      return
    }

    setLoading(true)
    try {
      const phoneCode = e.detail.code
      console.log('[Login] 获取手机号code:', phoneCode)

      const loginRes = await Taro.login({})
      const code = loginRes.code || ''
      console.log('[Login] 获取微信登录code:', code)

      const result = await login({
        code,
        phoneCode
      })

      if (result) {
        const { token, userId, nickname, avatar, hasBindIdCard } = result
        
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('userId', userId)
        Taro.setStorageSync('nickname', nickname)
        Taro.setStorageSync('avatar', avatar)
        Taro.setStorageSync('hasBindIdCard', hasBindIdCard)

        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        })

        setTimeout(() => {
          Taro.switchTab({ url: '/pages/home/index' })
        }, 1500)
      }
    } catch (error: any) {
      console.error('[Login] 登录失败:', error)
      Taro.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>电影票抽奖</Text>
        <Text className={styles.subtitle}>上传票根，赢取好礼</Text>
      </View>

      <View className={styles.content}>
        <View className={styles.featureCard}>
          <Text className={styles.featureIcon}>🎬</Text>
          <Text className={styles.featureTitle}>参与活动</Text>
          <Text className={styles.featureDesc}>上传有效的电影票根，即可获得中奖机会</Text>
        </View>
        <View className={styles.featureCard}>
          <Text className={styles.featureIcon}>🎁</Text>
          <Text className={styles.featureTitle}>赢取奖品</Text>
          <Text className={styles.featureDesc}>开奖后从所有有效票根中抽取中奖者</Text>
        </View>
        <View className={styles.featureCard}>
          <Text className={styles.featureIcon}>🔒</Text>
          <Text className={styles.featureTitle}>安全可靠</Text>
          <Text className={styles.featureDesc}>兑奖时需要核对身份证信息</Text>
        </View>
      </View>

      <View className={styles.bottomArea}>
        <Button
          className={styles.btnLogin}
          onClick={handleGetPhoneNumber}
          loading={loading}
          openType='getPhoneNumber'
        >
          {loading ? '登录中...' : '微信一键登录'}
        </Button>
        <View className={styles.tipText}>
          <Text>登录即表示同意《活动参与协议》</Text>
        </View>
      </View>
    </View>
  )
}

export default LoginPage