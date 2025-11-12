import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoliceId } from '../hooks/usePoliceId.js';
import { withPoliceId } from '../utils/navigation.js';
import {
  recordModuleActive,
  recordModuleTimeSpent,
  recordModuleVisit,
} from '../hooks/useModuleTracking.js';
import { recordLoginEvent } from '../hooks/useLoginTracking.js';
import '../styles/backHeaderIframe.css';

const BackHeaderIframePage = ({
  title,
  subtitle,
  iframeSrc,
  icon = 'fa-solid fa-shield-halved',
  allow = '*',
  moduleId,
}) => {
  const navigate = useNavigate();
  const policeId = usePoliceId();
  const sessionRef = useRef({ moduleId: null, start: null });
  const timerRef = useRef(null);

  useEffect(() => {
    if (!moduleId) {
      return undefined;
    }

    recordModuleVisit(moduleId);
    sessionRef.current = { moduleId, start: Date.now() };
    timerRef.current = setTimeout(() => {
      recordModuleActive(moduleId);
      timerRef.current = null;
    }, 10000);

    const handleBeforeUnload = () => {
      if (!sessionRef.current.start) {
        return;
      }
      recordModuleTimeSpent(moduleId, Date.now() - sessionRef.current.start);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (sessionRef.current.start) {
        recordModuleTimeSpent(moduleId, Date.now() - sessionRef.current.start);
        sessionRef.current = { moduleId: null, start: null };
      }
    };
  }, [moduleId]);

  useEffect(() => {
    if (policeId) {
      recordLoginEvent(policeId);
    }
  }, [policeId]);

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
