import React from 'react';
import { Route, Routes, Outlet } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import { iframePageComponents } from './pages/iframePageFactory.js';
import { backIframePageComponents } from './pages/backIframePageFactory.js';
import ChromeInstallerPage from './pages/ChromeInstallerPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import LoginPKIPage from './pages/LoginPKIPage.jsx';
import StatsPage from './pages/StatsPage.jsx';

const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const renderIframeRoutes = () =>
  Object.entries(iframePageComponents).map(([path, Component]) => (
    <Route key={path} path={path.substring(1)} element={<Component />} />
  ));

const renderBackIframeRoutes = () =>
  Object.entries(backIframePageComponents).map(([path, Component]) => (
    <Route key={path} path={path.substring(1)} element={<Component />} />
  ));

const App = () => (
  <Routes>
    <Route element={<LayoutWrapper />}>
      <Route index element={<HomePage />} />
    </Route>
    {renderIframeRoutes()}
    {renderBackIframeRoutes()}
    <Route path="chrome-installer" element={<ChromeInstallerPage />} />
    <Route path="login" element={<LoginPage />} />
    <Route path="login2" element={<LoginPKIPage />} />
    <Route path="stats" element={<StatsPage />} />
    <Route path="*" element={<HomePage />} />
  </Routes>
);

export default App;
