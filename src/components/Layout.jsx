import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import Particles from './Particles.jsx';
import { NavigationContext } from '../context/NavigationContext.js';
import { recordLoginEvent } from '../hooks/useLoginTracking.js';
import { withPoliceId } from '../utils/navigation.js';
import '../styles/layout.css';

const LoaderOverlay = ({ visible }) => {
  if (!visible) {
    return null;
  }
  return (
    <div
      id="cover"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(255,255,255,.85)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
        backdropFilter: 'blur(3px)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            border: '4px solid var(--police-blue)',
            borderTopColor: 'var(--police-accent)',
            borderRadius: '50%',
            animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
        <div
          style={{
            marginTop: '16px',
            color: 'var(--police-blue)',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          正在加载...
        </div>
      </div>
    </div>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const policeId = params.get('policeid') || '';

  const buildLink = useCallback((path) => withPoliceId(path, policeId), [policeId]);

  const handleNavigate = useCallback(
    (path, moduleId) => {
      setSidebarVisible(false);
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const target = buildLink(path);
        if (typeof window !== 'undefined' && window.location.pathname.endsWith('.html')) {
          window.location.href = new URL(target, window.location.origin);
        } else {
          navigate(target);
        }
      }, 300);
    },
    [buildLink, navigate]
  );

  useEffect(() => {
    if (!policeId) {
      return;
    }
    recordLoginEvent(policeId);
  }, [policeId]);

  const handleMainClick = () => {
    if (sidebarVisible) {
      setSidebarVisible(false);
    }
  };

  return (
    <NavigationContext.Provider
      value={{ navigateTo: handleNavigate, buildLink, policeId }}
    >
      <div>
        <Particles />
        <LoaderOverlay visible={loading} />
        <Header policeId={policeId} onNavigate={handleNavigate} buildLink={buildLink} />
        <Sidebar
          visible={sidebarVisible}
          onToggle={() => setSidebarVisible((prev) => !prev)}
          onNavigate={handleNavigate}
          buildLink={buildLink}
        />
        <main
          className={`main-content ${sidebarVisible ? 'sidebar-visible' : ''}`}
          onClick={handleMainClick}
        >
          {children}
        </main>
        <Footer />
      </div>
    </NavigationContext.Provider>
  );
};

export default Layout;
