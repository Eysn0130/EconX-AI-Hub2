import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css';
import { usePoliceId } from '../hooks/usePoliceId.js';
import { withPoliceId } from '../utils/navigation.js';

const LoginPage = () => {
  const navigate = useNavigate();
  const policeId = usePoliceId();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      navigate(withPoliceId('/', policeId));
    }, 1000);
  };

  return (
    <div className="login-page">
      <video className="login-video" autoPlay muted loop playsInline>
        <source src="folder/login_background.mp4" type="video/mp4" />
      </video>
      <div className="login-container">
        <div className="login-header">
          <div className="login-branding">
            <div className="login-logo">
              <i className="fa-solid fa-shield-halved" />
            </div>
            <div className="login-title-container">
              <div className="login-title-main">经智AI</div>
              <div className="login-title-sub">智能体工作平台</div>
              <div className="login-subtitle">Guiyang Economic Crime AI Platform</div>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin" /> 登录中...
              </>
            ) : (
              '登 录'
            )}
          </button>
          <div className="login-browser-notice">
            <p>如果无法正常使用系统，请点击下方按钮安装推荐的浏览器</p>
            <a
              href={withPoliceId('/chrome-installer', policeId)}
              className="login-download-button"
              onClick={(event) => {
                event.preventDefault();
                navigate(withPoliceId('/chrome-installer', policeId));
              }}
            >
              <i className="fa-brands fa-chrome" /> 安装Chrome浏览器
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
