import React, { useState, useEffect } from 'react'
import { View, Text, Button, Image, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { uploadTicket } from '@/services/api'
import { checkAuth, isLoggedIn } from '@/utils/auth'
import type { TicketStub } from '@/types'
import styles from './index.module.scss'

const UploadPage: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [ticketStub, setTicketStub] = useState<TicketStub | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    movieName: '',
    showTime: '',
    cinema: '',
    cinemaLocation: '',
    seat: ''
  })

  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    if (!isLoggedIn()) {
      const authorized = await checkAuth()
      if (!authorized) {
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/home/index' })
        }, 100)
      }
    }
  }

  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        setImageUrl(res.tempFilePaths[0])
        setTicketStub(null)
        setEditing(false)
      }
    } catch (error) {
      console.error('[Upload] Failed to choose image:', error)
    }
  }

  const handleUpload = async () => {
    setUploading(true)
    try {
      Taro.showLoading({ title: '识别中...' })
      const result = await uploadTicket({
        imageUrl,
        movieName: editForm.movieName || undefined,
        showTime: editForm.showTime || undefined,
        cinema: editForm.cinema || undefined,
        cinemaLocation: editForm.cinemaLocation || undefined,
        seat: editForm.seat || undefined
      })

      if (result) {
        const ticket: TicketStub = {
          ...result,
          imageUrl: imageUrl,
          movieName: result.movieName,
          showTime: result.showTime || result.createdAt,
          cinema: result.cinema,
          cinemaLocation: result.cinemaLocation,
          seat: result.seat
        }
        setTicketStub(ticket)
        setEditForm({
          movieName: ticket.movieName,
          showTime: ticket.showTime,
          cinema: ticket.cinema,
          cinemaLocation: ticket.cinemaLocation || '',
          seat: ticket.seat || ''
        })

        Taro.showToast({
          title: '识别成功',
          icon: 'success'
        })
      }
    } catch (error: any) {
      console.error('[Upload] Failed to upload:', error)
      Taro.showToast({
        title: error.message || '识别失败',
        icon: 'none'
      })
    } finally {
      Taro.hideLoading()
      setUploading(false)
    }
  }

  const handleRetake = () => {
    setImageUrl('')
    setTicketStub(null)
    setEditing(false)
    setEditForm({
      movieName: '',
      showTime: '',
      cinema: '',
      cinemaLocation: '',
      seat: ''
    })
  }

  const handleConfirm = () => {
    Taro.showModal({
      title: '确认信息',
      content: `电影：${editForm.movieName}\n时间：${editForm.showTime}\n影院：${editForm.cinema}\n位置：${editForm.cinemaLocation}\n座位：${editForm.seat}\n\n兑奖时将核对您的身份证和手机号信息，请确保信息准确！`,
      confirmText: '确认无误',
      cancelText: '返回修改',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({
            title: '上传成功！多一张票根多一次中奖机会',
            icon: 'success',
            duration: 2000
          })
          setTimeout(() => {
            handleRetake()
          }, 2000)
        }
      }
    })
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleFieldChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <View className={styles.container}>
      {!imageUrl ? (
        <View className={styles.uploadArea}>
          <View className={styles.uploadIcon}>📸</View>
          <Text className={styles.uploadTitle}>上传电影票根</Text>
          <Text className={styles.uploadDesc}>拍照或从相册选择您的电影票根照片</Text>
          <Button
            className={styles.btnUpload}
            onClick={handleChooseImage}
            loading={uploading}
          >
            {uploading ? '识别中...' : '选择图片'}
          </Button>
        </View>
      ) : (
        <View className={styles.previewArea}>
          <View className={styles.previewImage}>
            <Image
              className={styles.previewImg}
              src={imageUrl}
              mode='aspectFill'
            />
          </View>

          {ticketStub && !editing ? (
            <View className={styles.recognizedInfo}>
              <Text className={styles.infoTitle}>✅ 识别成功</Text>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>影片名称</Text>
                <Text className={styles.infoValue}>{ticketStub.movieName}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>放映时间</Text>
                <Text className={styles.infoValue}>{ticketStub.showTime}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>影院</Text>
                <Text className={styles.infoValue}>{ticketStub.cinema}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>位置</Text>
                <Text className={styles.infoValue}>{ticketStub.cinemaLocation || '未识别'}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>座位</Text>
                <Text className={styles.infoValue}>{ticketStub.seat || '未识别'}</Text>
              </View>

              <View className={styles.btnGroup}>
                <Button className={styles.btnSecondary} onClick={handleRetake}>
                  重新上传
                </Button>
                <Button className={styles.btnEdit} onClick={handleEdit}>
                  修改信息
                </Button>
                <Button className={styles.btnConfirm} onClick={handleConfirm}>
                  确认提交
                </Button>
              </View>
            </View>
          ) : (
            <View className={styles.editForm}>
              <Text className={styles.infoTitle}>📝 编辑票根信息</Text>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>影片名称</Text>
                <Input
                  className={styles.formInput}
                  placeholder='请输入影片名称'
                  value={editForm.movieName}
                  onChange={(e) => handleFieldChange('movieName', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>放映时间</Text>
                <Input
                  className={styles.formInput}
                  placeholder='请输入放映时间'
                  value={editForm.showTime}
                  onChange={(e) => handleFieldChange('showTime', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>影院</Text>
                <Input
                  className={styles.formInput}
                  placeholder='请输入影院名称'
                  value={editForm.cinema}
                  onChange={(e) => handleFieldChange('cinema', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>位置</Text>
                <Input
                  className={styles.formInput}
                  placeholder='请输入影院位置'
                  value={editForm.cinemaLocation}
                  onChange={(e) => handleFieldChange('cinemaLocation', e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>座位</Text>
                <Input
                  className={styles.formInput}
                  placeholder='请输入座位号'
                  value={editForm.seat}
                  onChange={(e) => handleFieldChange('seat', e.detail.value)}
                />
              </View>

              <View className={styles.btnGroup}>
                <Button className={styles.btnSecondary} onClick={() => setEditing(false)}>
                  取消
                </Button>
                <Button className={styles.btnConfirm} onClick={handleUpload}>
                  确认上传
                </Button>
              </View>
            </View>
          )}
        </View>
      )}

      <View className={styles.tipsSection}>
        <Text className={styles.tipsTitle}>📝 上传提示</Text>
        <View className={styles.tipsList}>
          <View className={styles.tipItem}>
            <View className={styles.tipDot}></View>
            <Text className={styles.tipText}>请确保票根照片清晰可见，包含影片名称、放映时间等信息</Text>
          </View>
          <View className={styles.tipItem}>
            <View className={styles.tipDot}></View>
            <Text className={styles.tipText}>建议在光线充足的环境下拍摄，避免反光和模糊</Text>
          </View>
          <View className={styles.tipItem}>
            <View className={styles.tipDot}></View>
            <Text className={styles.tipText}>每张票根只能使用一次，多次上传同一张票根无效</Text>
          </View>
          <View className={styles.tipItem}>
            <View className={styles.tipDot}></View>
            <Text className={styles.tipText}>上传票根越多，中奖机会越多，但每人只能中一次奖</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default UploadPage