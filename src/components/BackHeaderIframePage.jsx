import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoliceId } from '../hooks/usePoliceId.js';
import { withPoliceId } from '../utils/navigation.js';
import '../styles/backHeaderIframe.css';

const BackHeaderIframePage = ({ title, subtitle, iframeSrc, icon = 'fa-solid fa-shield-halved', allow = '*' }) => {
  const navigate = useNavigate();
  const policeId = usePoliceId();

  return (
    <div className="back-iframe-root">
      <header className="back-iframe-header">
        <div className="back-iframe-logo">
          <i className={icon} />
          <div>
            <div className="back-iframe-title">{title}</div>
            <div className="back-iframe-subtitle">{subtitle}</div>
          </div>
        </div>
        <button
          type="button"
          className="back-iframe-button"
          onClick={() => navigate(withPoliceId('/', policeId))}
        >
          <i className="fa-solid fa-house" />
          <span>返回主页</span>
        </button>
      </header>
      <main className="back-iframe-main">
        <div className="back-iframe-wrapper">
          <iframe src={iframeSrc} allow={allow} title={title} />
        </div>
      </main>
    </div>
  );
};

export default BackHeaderIframePage;
