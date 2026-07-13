import React, { useState, useEffect } from 'react'
import { View, Text, Image, Button, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getUserInfo, bindIdCard } from '@/services/api'
import type { User } from '@/types'
import styles from './index.module.scss'

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [showBindModal, setShowBindModal] = useState(false)
  const [idCard, setIdCard] = useState('')
  const [binding, setBinding] = useState(false)

  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    try {
      const result = await getUserInfo()
      if (result) {
        setUser(result)
        Taro.setStorageSync('hasBindIdCard', result.hasBindIdCard || 0)
      }
    } catch (error) {
      console.error('[Profile] Failed to load user info:', error)
    }
  }

  const handleBindIdCard = async () => {
    if (!idCard || idCard.length !== 18) {
      Taro.showToast({
        title: '请输入有效的身份证号',
        icon: 'none'
      })
      return
    }

    setBinding(true)
    try {
      await bindIdCard(idCard)
      Taro.showToast({
        title: '绑定成功',
        icon: 'success'
      })
      setShowBindModal(false)
      setIdCard('')
      loadUserInfo()
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '绑定失败',
        icon: 'none'
      })
    } finally {
      setBinding(false)
    }
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.removeStorageSync('token')
          Taro.removeStorageSync('userId')
          Taro.removeStorageSync('nickname')
          Taro.removeStorageSync('avatar')
          Taro.removeStorageSync('hasBindIdCard')
          Taro.navigateTo({ url: '/pages/login/index' })
        }
      }
    })
  }

  const menuItems = [
    { icon: '🎟️', text: '我的票根', page: '', badge: user?.ticketCount || 0 },
    { icon: '🎁', text: '我的奖品', page: '', badge: user?.hasWon === 1 ? 1 : 0 },
    { icon: '⚙️', text: '设置', page: '' },
    { icon: '❓', text: '帮助与反馈', page: '' },
  ]

  return (
    <View className={styles.container}>
      <View className={styles.userInfo}>
        <View className={styles.avatar}>
          <Image
            className={styles.avatarImg}
            src={user?.avatar || 'https://picsum.photos/id/64/200/200'}
            mode='aspectFill'
          />
        </View>
        <Text className={styles.nickname}>{user?.nickname || '电影爱好者'}</Text>
        <Text className={styles.phone}>{user?.phone || '未绑定手机号'}</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user?.ticketCount || 0}</Text>
            <Text className={styles.statLabel}>上传票根</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user?.hasWon === 1 ? '1' : '0'}</Text>
            <Text className={styles.statLabel}>中奖次数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user?.hasBindIdCard === 1 ? '已绑定' : '未绑定'}</Text>
            <Text className={styles.statLabel}>身份证</Text>
          </View>
        </View>
      </View>

      <View className={styles.bindSection}>
        {user?.hasBindIdCard === 0 ? (
          <View className={styles.bindCard}>
            <View className={styles.bindIcon}>⚠️</View>
            <View className={styles.bindContent}>
              <Text className={styles.bindTitle}>未绑定身份证</Text>
              <Text className={styles.bindDesc}>兑奖时需要核对身份证信息，请尽快绑定</Text>
            </View>
            <Button className={styles.btnBind} onClick={() => setShowBindModal(true)}>
              立即绑定
            </Button>
          </View>
        ) : (
          <View className={styles.bindCard}>
            <View className={styles.bindIcon}>✅</View>
            <View className={styles.bindContent}>
              <Text className={styles.bindTitle}>已绑定身份证</Text>
              <Text className={styles.bindDesc}>兑奖时将使用此身份证进行核对</Text>
            </View>
            <Text className={styles.boundText}>已完成</Text>
          </View>
        )}
      </View>

      <View className={styles.menuSection}>
        {menuItems.map((item, index) => (
          <View key={index} className={styles.menuItem}>
            <View className={styles.menuIcon}>{item.icon}</View>
            <Text className={styles.menuText}>{item.text}</Text>
            {item.badge > 0 && (
              <View className={styles.menuBadge}>
                <Text className={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>

      <View className={styles.logoutSection}>
        <Button className={styles.btnLogout} onClick={handleLogout}>
          退出登录
        </Button>
      </View>

      {showBindModal && (
        <View className={styles.modalOverlay} onClick={() => setShowBindModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>绑定身份证</Text>
            <Text className={styles.modalDesc}>请输入您的身份证号码，用于兑奖时身份核对</Text>
            <Input
              className={styles.modalInput}
              type='number'
              placeholder='请输入18位身份证号'
              value={idCard}
              onChange={(e) => setIdCard(e.detail.value)}
              maxlength={18}
            />
            <View className={styles.modalBtnGroup}>
              <Button className={styles.btnCancel} onClick={() => setShowBindModal(false)}>
                取消
              </Button>
              <Button className={styles.btnConfirm} onClick={handleBindIdCard} loading={binding}>
                {binding ? '绑定中...' : '确认绑定'}
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

export default ProfilePage