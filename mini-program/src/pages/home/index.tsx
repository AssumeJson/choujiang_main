import React, { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getUserInfo, getCurrentLotteryConfig, getTicketStats } from '@/services/api'
import { checkAuth, isLoggedIn } from '@/utils/auth'
import type { User, LotteryConfig, TicketStats } from '@/types'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [config, setConfig] = useState<LotteryConfig | null>(null)
  const [stats, setStats] = useState<TicketStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initData()
  }, [])

  const initData = async () => {
    try {
      const [configRes, statsRes] = await Promise.all([
        getCurrentLotteryConfig(),
        getTicketStats()
      ])
      if (configRes) {
        setConfig(configRes)
      }
      if (statsRes) {
        setStats(statsRes)
      }

      if (isLoggedIn()) {
        try {
          const userRes = await getUserInfo()
          if (userRes) {
            setUser(userRes)
          }
        } catch {
        }
      }
    } catch (error) {
      console.error('[Home] Failed to init data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    const authorized = await checkAuth()
    if (!authorized) return

    const hasBindIdCard = Taro.getStorageSync('hasBindIdCard')
    if (!hasBindIdCard || hasBindIdCard === 0) {
      Taro.showModal({
        title: '提示',
        content: '兑奖时需要核对身份证信息，建议先绑定身份证',
        confirmText: '去绑定',
        cancelText: '暂不绑定',
        success: (res) => {
          if (res.confirm) {
            Taro.switchTab({ url: '/pages/profile/index' })
          } else {
            Taro.switchTab({ url: '/pages/upload/index' })
          }
        }
      })
    } else {
      Taro.switchTab({ url: '/pages/upload/index' })
    }
  }

  const handleRecords = async () => {
    const authorized = await checkAuth()
    if (!authorized) return
    Taro.switchTab({ url: '/pages/records/index' })
  }

  const handleProfile = async () => {
    const authorized = await checkAuth()
    if (!authorized) return
    Taro.switchTab({ url: '/pages/profile/index' })
  }

  const formatDrawTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    } catch {
      return timeStr
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '未开始'
      case 1: return '进行中'
      case 2: return '已开奖'
      default: return '未知'
    }
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>🎬 电影票抽奖</Text>
        <Text className={styles.subtitle}>上传票根，赢取好礼</Text>
      </View>

      {config && (
        <View className={styles.configCard}>
          <View className={styles.configHeader}>
            <Text className={styles.configTitle}>{config.name}</Text>
            <Text className={`${styles.statusTag} ${styles['status' + config.status]}`}>
              {getStatusText(config.status)}
            </Text>
          </View>
          {config.status === 1 && (
            <View className={styles.drawTime}>
              <Text className={styles.drawLabel}>🎰 开奖时间：</Text>
              <Text className={styles.drawValue}>{formatDrawTime(config.drawTime)}</Text>
            </View>
          )}
          {config.description && (
            <Text className={styles.configDesc}>{config.description}</Text>
          )}
        </View>
      )}

      <View className={styles.statsCard}>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{user && user.ticketCount || 0}</Text>
            <Text className={styles.statLabel}>已上传票根</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNumber}>{stats && stats.uniqueUserCount || 0}</Text>
            <Text className={styles.statLabel}>参与人数</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>立即参与</Text>
        <View className={styles.actionCard}>
          <View className={styles.actionIcon}>🎟️</View>
          <Text className={styles.actionTitle}>上传电影票根</Text>
          <Text className={styles.actionDesc}>每次上传一张有效的电影票根，即可获得一次中奖机会</Text>
          <Button className={styles.btnPrimary} onClick={handleUpload}>
            开始上传
          </Button>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>活动规则</Text>
        <View className={styles.rulesCard}>
          <View className={styles.ruleItem}>
            <View className={styles.ruleIndex}>1</View>
            <Text className={styles.ruleText}>每次上传一张有效的电影票根，即可获得一次中奖机会</Text>
          </View>
          <View className={styles.ruleItem}>
            <View className={styles.ruleIndex}>2</View>
            <Text className={styles.ruleText}>一个用户只能中奖一次，上传越多票根中奖概率越高</Text>
          </View>
          <View className={styles.ruleItem}>
            <View className={styles.ruleIndex}>3</View>
            <Text className={styles.ruleText}>兑奖时需要核对身份证和手机号信息</Text>
          </View>
          <View className={styles.ruleItem}>
            <View className={styles.ruleIndex}>4</View>
            <Text className={styles.ruleText}>活动最终解释权归主办方所有</Text>
          </View>
        </View>
      </View>

      <Button className={styles.btnRecords} onClick={handleRecords}>
        🎉 查看中奖记录
      </Button>
    </View>
  )
}

export default HomePage