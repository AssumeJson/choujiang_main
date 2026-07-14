import React, { useState } from 'react'
import { View, Text, Button, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { login, updateUserInfo } from '@/services/api'
import { setLoginInfo } from '@/utils/auth'
import styles from './index.module.scss'

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [nickname, setNickname] = useState('')
  const [showProfileInput, setShowProfileInput] = useState(false)
  const [loginResult, setLoginResult] = useState<any>(null)

  const handleChooseAvatar = (e: any) => {
    console.log('[Login] 选择头像:', e)
    const avatar = e.detail.avatarUrl
    setAvatarUrl(avatar)
  }

  const handleNicknameChange = (e: any) => {
    setNickname(e.detail.value)
  }

  const handleGetPhoneNumber = async (e: any) => {
    console.log('[Login] getPhoneNumber回调触发:', e)

    if (!e.detail) {
      Taro.showToast({
        title: '请在微信开发者工具或真机上运行',
        icon: 'none'
      })
      return
    }

    setLoading(true)
    try {
      const phoneCode = e.detail.code
      console.log('[Login] 获取手机号code:', phoneCode)

      const loginRes = await Taro.login({})
      console.log('[Login] 获取微信登录code:', loginRes.code)
      const code = loginRes.code || ''

      console.log('[Login] 准备调用登录API...')
      const result = await login({
        code,
        phoneCode
      })
      console.log('[Login] 登录API返回:', result)

      if (result && result.token) {
        setLoginResult(result)
        setShowProfileInput(true)
      } else {
        throw new Error('登录返回数据异常')
      }
    } catch (error: any) {
      console.error('[Login] 登录失败:', error)
      Taro.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmProfile = async () => {
    if (!loginResult) return
    
    setLoading(true)
    try {
      if (nickname || avatarUrl) {
        console.log('[Login] 更新用户信息:', { nickname, avatarUrl })
        await updateUserInfo({ nickname, avatar: avatarUrl })
      }

      const { token, userId, hasBindIdCard } = loginResult
      
      console.log('[Login] 保存用户信息到本地存储...')
      setLoginInfo({
        token,
        userId,
        nickname: nickname || loginResult.nickname,
        avatar: avatarUrl || loginResult.avatar,
        hasBindIdCard,
        openid: loginResult.openid
      })

      Taro.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1500
      })

      setTimeout(() => {
        Taro.switchTab({ url: '/pages/home/index' })
      }, 1500)
    } catch (error: any) {
      console.error('[Login] 更新用户信息失败:', error)
      const { token, userId, nickname: defaultNickname, avatar: defaultAvatar, hasBindIdCard } = loginResult
      setLoginInfo({
        token,
        userId,
        nickname: defaultNickname,
        avatar: defaultAvatar,
        hasBindIdCard,
        openid: loginResult.openid
      })
      Taro.switchTab({ url: '/pages/home/index' })
    } finally {
      setLoading(false)
    }
  }

  const handleSkipProfile = () => {
    if (!loginResult) return
    
    const { token, userId, nickname: defaultNickname, avatar: defaultAvatar, hasBindIdCard } = loginResult
    setLoginInfo({
      token,
      userId,
      nickname: defaultNickname,
      avatar: defaultAvatar,
      hasBindIdCard,
      openid: loginResult.openid
    })
    Taro.switchTab({ url: '/pages/home/index' })
  }

  if (showProfileInput) {
    return (
      <View className={styles.container}>
        <View className={styles.header}>
          <Text className={styles.title}>完善个人信息</Text>
          <Text className={styles.subtitle}>设置您的头像和昵称</Text>
        </View>

        <View className={styles.profileSection}>
          <View className={styles.avatarSection}>
            <Text className={styles.label}>头像</Text>
            <Button 
              className={styles.avatarBtn}
              openType='chooseAvatar'
              onChooseAvatar={handleChooseAvatar}
            >
              {avatarUrl ? (
                <Image className={styles.avatar} src={avatarUrl} />
              ) : (
                <View className={styles.avatarPlaceholder}>点击选择</View>
              )}
            </Button>
          </View>

          <View className={styles.nicknameSection}>
            <Text className={styles.label}>昵称</Text>
            <Input
              className={styles.nicknameInput}
              type='nickname'
              placeholder='请输入昵称'
              value={nickname}
              onInput={handleNicknameChange}
            />
          </View>
        </View>

        <View className={styles.bottomArea}>
          <Button
            className={styles.btnPrimary}
            onClick={handleConfirmProfile}
            loading={loading}
          >
            确认保存
          </Button>
          <Button
            className={styles.btnSkip}
            onClick={handleSkipProfile}
          >
            跳过
          </Button>
        </View>
      </View>
    )
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
          onGetPhoneNumber={handleGetPhoneNumber}
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