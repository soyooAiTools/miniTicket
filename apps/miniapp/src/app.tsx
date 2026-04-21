import { useLaunch } from '@tarojs/taro';

import './styles/theme.css';

export default function App({ children }) {
  useLaunch(() => {
    console.log('App launched.');
  });

  return children;
}
