import 'antd/dist/reset.css';
import './app/workbench.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { BrowserRouter } from 'react-router-dom';

import { AdminAuthProvider } from './app/admin-auth-context';
import { AppRouter } from './router';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          borderRadius: 14,
          colorPrimary: '#2f70ff',
          fontSize: 14,
          lineHeight: 1.45,
        },
      }}
    >
      <BrowserRouter>
        <AdminAuthProvider>
          <AppRouter />
        </AdminAuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);
