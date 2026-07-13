import React, { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { useDidShow, useDidHide } from '@tarojs/taro';
import './app.scss';

function App(props) {
  useEffect(() => {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init({
        env: '',
        traceUser: true
      })
    }
  }, []);

  useDidShow(() => {
    checkLoginStatus();
  });

  useDidHide(() => {});

  const checkLoginStatus = () => {
    const token = Taro.getStorageSync('token');
    const pages = Taro.getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      const currentRoute = currentPage.route || '';
      
      if (!token && !currentRoute.includes('login')) {
        Taro.showToast({
          title: '请先登录',
          icon: 'none',
          duration: 2000
        });
        
        setTimeout(() => {
          Taro.navigateTo({
            url: '/pages/login/index'
          });
        }, 2000);
      }
    }
  };

  return props.children;
}

export default App;