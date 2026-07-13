import React, { useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { callFunction } from '@/services/cloud'
import type { LotteryRecord } from '@/types'
import styles from './index.module.scss'

const LotteryPage: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false)
  const [result, setResult] = useState<LotteryRecord | null>(null)
  const [hasSpun, setHasSpun] = useState(false)

  const handleLottery = async () => {
    if (isSpinning) return
    setIsSpinning(true)
    try {
      // 模拟转盘动画效果
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const data = await callFunction<LotteryRecord>('doLottery')
      if (data) {
        setResult(data)
        setHasSpun(true)
      }
    } catch (error) {
      console.error('[Lottery] Failed to do lottery:', error)
      Taro.showToast({
        title: '抽奖失败',
        icon: 'error'
      })
    } finally {
      setIsSpinning(false)
    }
  }

  const handleBack = () => {
    Taro.switchTab({ url: '/pages/home/index' })
  }

  const handleCheckRecords = () => {
    Taro.switchTab({ url: '/pages/records/index' })
  }

  const isWinning = (prize?: string) => {
    if (!prize) return false
    return !prize.includes('谢谢') && !prize.includes('未中奖')
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>🎰 幸运抽奖</Text>
        <Text className={styles.subtitle}>点击按钮，试试运气！</Text>
      </View>

      <View className={styles.wheelContainer}>
        <View className={styles.wheel}>
          <View className={styles.wheelInner}>
            <Text className={styles.wheelIcon}>
              {hasSpun && result ? (isWinning(result.prize) ? '🎁' : '🎟️') : '🎰'}
            </Text>
            <Text className={styles.wheelText}>
              {hasSpun && result ? result.prize : '点击抽奖'}
            </Text>
          </View>
        </View>
      </View>

      {!hasSpun ? (
        <Button
          className={styles.btnLottery}
          onClick={handleLottery}
          disabled={isSpinning}
        >
          {isSpinning ? '抽奖中...' : '立即抽奖'}
        </Button>
      ) : (
        <View className={styles.resultCard}>
          <Text className={styles.resultIcon}>
          {isWinning(result?.prize) ? '🎉' : '😊'}
          </Text>
          <Text className={styles.resultTitle}>
          {isWinning(result?.prize) ? '恭喜中奖！' : '谢谢参与'}
          </Text>
          <Text className={styles.resultPrize}>{result?.prize}</Text>
          <View className={styles.btnGroup}>
            <Button className={styles.btnSecondary} onClick={handleBack}>
              返回首页
            </Button>
            <Button className={styles.btnPrimary} onClick={handleCheckRecords}>
              查看记录
            </Button>
          </View>
        </View>
      )}
    </View>
  )
}

export default LotteryPage
