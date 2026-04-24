import Taro, { useLaunch } from '@tarojs/taro';

import { resolveApiBaseUrl } from './services/session';
import './styles/theme.css';

export default function App({ children }) {
  useLaunch(() => {
    console.log('App launched.');
    Taro.request({
      url: `http://120.55.70.226:3000/api/health`,
      method: 'GET',
      success: (res) => console.log('health:', res.data),
      fail: (err) => console.error('health failed:', err),
    });
  });

  return children;
}
