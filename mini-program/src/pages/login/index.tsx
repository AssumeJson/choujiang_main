import React, { useState } from 'react'
import { View, Text, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { login } from '@/services/api'
import styles from './index.module.scss'

const LoginPage: React.FC = () => {
  const [phone, setPhone] = useState('')
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGetUserProfile = async () => {
    try {
      const userInfoRes = await Taro.getUserProfile({
        desc: '用于完善会员资料'
      })
      if (userInfoRes.userInfo) {
        setNickname(userInfoRes.userInfo.nickName)
        setAvatar(userInfoRes.userInfo.avatarUrl)
        Taro.showToast({
          title: '获取信息成功',
          icon: 'success'
        })
      }
    } catch (error: any) {
      console.error('[Login] Failed to get user info:', error)
      if (error.errMsg && error.errMsg.includes('auth deny')) {
        Taro.showToast({
          title: '需要授权才能继续',
          icon: 'none'
        })
      }
    }
  }

  const handleGetPhoneNumber = async (e: any) => {
    try {
      const phoneRes = await Taro.requestPhoneNumber({})
      if (phoneRes.code) {
        Taro.showToast({
          title: '获取手机号成功',
          icon: 'success'
        })
      } else if (phoneRes.errMsg && phoneRes.errMsg.includes('auth deny')) {
        Taro.showToast({
          title: '需要授权手机号',
          icon: 'none'
        })
      }
    } catch (error: any) {
      console.error('[Login] Failed to get phone number:', error)
    }
  }

  const handleSubmit = async () => {
    if (!nickname) {
      Taro.showToast({
        title: '请先获取微信信息',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    try {
      let code = ''
      try {
        const loginRes = await Taro.login({})
        code = loginRes.code || ''
        console.log('[Login] 获取微信code:', code)
      } catch (e) {
        console.log('[Login] 微信登录失败，使用模拟登录')
      }

      const result = await login({
        code,
        phone: phone || undefined,
        nickname: nickname,
        avatar: avatar || 'https://picsum.photos/id/64/200/200'
      })

      if (result) {
        const { token, userId, nickname: resNickname, avatar: resAvatar, hasBindIdCard } = result
        
        Taro.setStorageSync('token', token)
        Taro.setStorageSync('userId', userId)
        Taro.setStorageSync('nickname', resNickname)
        Taro.setStorageSync('avatar', resAvatar)
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
        <Text className={styles.title}>🎬 电影票抽奖</Text>
        <Text className={styles.subtitle}>登录参与活动</Text>
      </View>

      <View className={styles.loginForm}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>👤 昵称</Text>
          <View className={styles.formInputWrapper}>
            <Input
              className={styles.formInput}
              placeholder='请点击下方按钮获取'
              value={nickname}
              disabled
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>📱 手机号</Text>
          <Input
            className={styles.formInput}
            type='number'
            placeholder='请输入手机号或点击下方按钮获取'
            value={phone}
            onChange={(e) => setPhone(e.detail.value)}
          />
        </View>

        <Button
          className={styles.btnWechat}
          onClick={handleGetUserProfile}
          loading={loading}
          openType='getUserProfile'
        >
          📷 获取微信头像和昵称
        </Button>

        <Button
          className={styles.btnPhone}
          onClick={handleGetPhoneNumber}
          loading={loading}
          openType='getPhoneNumber'
        >
          📱 获取微信手机号
        </Button>

        <Button
          className={styles.btnPrimary}
          onClick={handleSubmit}
          loading={loading}
          disabled={loading || !nickname}
        >
          {loading ? '登录中...' : '立即登录'}
        </Button>

        <View className={styles.tipText}>
          <Text>登录即表示同意《活动参与协议》</Text>
        </View>
      </View>

      <View className={styles.guestLogin}>
        <Text className={styles.guestText}>不想授权？</Text>
        <Text className={styles.guestLink} onClick={() => handleQuickLogin()}>游客登录</Text>
      </View>
    </View>
  )

  const handleQuickLogin = () => {
    Taro.showModal({
      title: '游客登录',
      content: '游客登录无法参与抽奖和兑奖，是否继续？',
      success: (res) => {
        if (res.confirm) {
          setNickname('游客' + Math.random().toString(36).substr(2, 8))
          setAvatar('https://picsum.photos/id/64/200/200')
          handleSubmit()
        }
      }
    })
  }
}

export default LoginPage