import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import './App.less';
import { Routes } from './components/Routes';
import { AuthProvider } from './ctx/auth';
import { DeviceProvider } from './ctx/device';
import { MetaProvider } from './ctx/meta';
import { RouteInfoProvider } from './ctx/route-info';
import { ViewportProvider } from './ctx/viewport';
import { theme } from './theme';

export const App: React.FC = (props) => {
  return (
    <React.StrictMode>
      <MetaProvider>
        <ConfigProvider locale={enUS}>
          <ThemeProvider theme={theme}>
            <ViewportProvider>
              <DeviceProvider>
                <AuthProvider>
                  <BrowserRouter>
                    <RouteInfoProvider>
                      <Routes />
                    </RouteInfoProvider>
                  </BrowserRouter>
                </AuthProvider>
              </DeviceProvider>
            </ViewportProvider>
          </ThemeProvider>
        </ConfigProvider>
      </MetaProvider>
    </React.StrictMode>
  );
};
