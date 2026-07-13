import React, { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getWinningRecords, getCurrentLotteryConfig, claimPrize } from '@/services/api'
import type { LotteryRecord, LotteryConfig } from '@/types'
import styles from './index.module.scss'

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<LotteryRecord[]>([])
  const [config, setConfig] = useState<LotteryConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [recordsRes, configRes] = await Promise.all([
        getWinningRecords(),
        getCurrentLotteryConfig()
      ])
      if (recordsRes) {
        setRecords(recordsRes)
      }
      if (configRes) {
        setConfig(configRes)
      }
    } catch (error) {
      console.error('[Records] Failed to load records:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    } catch {
      return timeStr
    }
  }

  const handleClaim = async (recordId: number) => {
    try {
      await claimPrize(recordId)
      Taro.showToast({
        title: '兑奖成功',
        icon: 'success'
      })
      loadData()
    } catch (error: any) {
      Taro.showToast({
        title: error.message || '兑奖失败',
        icon: 'none'
      })
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
        <Text className={styles.title}>🎉 中奖记录</Text>
        <Text className={styles.subtitle}>查看您的中奖情况</Text>
      </View>

      {config && (
        <View className={styles.configCard}>
          <View className={styles.configInfo}>
            <Text className={styles.configName}>{config.name}</Text>
            <Text className={`${styles.statusTag} ${styles['status' + config.status]}`}>
              {getStatusText(config.status)}
            </Text>
          </View>
          {config.status === 1 && (
            <View className={styles.waitingInfo}>
              <Text className={styles.waitingText}>⏰ 开奖时间：</Text>
              <Text className={styles.waitingValue}>{formatTime(config.drawTime)}</Text>
              <Text className={styles.waitingTip}>届时将从所有有效票根中抽取中奖者，每人只能中一次奖</Text>
            </View>
          )}
          {config.status === 0 && (
            <View className={styles.waitingInfo}>
              <Text className={styles.waitingText}>🔔 活动尚未开始，请耐心等待</Text>
              <Text className={styles.waitingValue}>活动开始后即可上传票根参与抽奖</Text>
            </View>
          )}
        </View>
      )}

      {config?.status === 2 && records.length === 0 && (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>😢</Text>
          <Text className={styles.emptyText}>暂无中奖记录</Text>
          <Text className={styles.emptyTip}>再接再厉，下次好运！</Text>
        </View>
      )}

      {records.length > 0 && (
        <View className={styles.recordsList}>
          <Text className={styles.listTitle}>🏆 我的中奖记录</Text>
          {records.map((record) => (
            <View key={record.id || record._id} className={styles.recordCard}>
              <View className={styles.recordIcon}>🎁</View>
              <View className={styles.recordContent}>
                <Text className={styles.prizeName}>{record.prizeName || record.prize}</Text>
                <Text className={styles.recordTime}>
                  中奖时间：{formatTime(record.createdAt || record.createTime || '')}
                </Text>
                {record.isClaimed === 1 && (
                  <Text className={styles.claimedTag}>✅ 已兑奖</Text>
                )}
                {record.isClaimed === 0 && (
                  <Text className={styles.unclaimedTag}>🔄 待兑奖</Text>
                )}
              </View>
              {record.isClaimed === 0 && (
                <Button
                  className={styles.btnClaim}
                  onClick={() => handleClaim(record.id || 0)}
                >
                  立即兑奖
                </Button>
              )}
            </View>
          ))}
        </View>
      )}

      {!loading && config?.status !== 2 && records.length === 0 && (
        <View className={styles.tipCard}>
          <Text className={styles.tipIcon}>💡</Text>
          <Text className={styles.tipTitle}>上传票根参与抽奖</Text>
          <Text className={styles.tipDesc}>每次上传一张有效的电影票根，即可获得一次中奖机会。开奖后将在本页面显示中奖结果。</Text>
          <Button className={styles.btnUpload} onClick={() => Taro.switchTab({ url: '/pages/upload/index' })}>
            去上传票根
          </Button>
        </View>
      )}
    </View>
  )
}

export default RecordsPage