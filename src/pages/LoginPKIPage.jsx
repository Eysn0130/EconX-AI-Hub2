import React from 'react';
import '../styles/login2.css';

const LoginPKIPage = () => {
  const handleClick = () => {
    alert('未检测到本地控件或证书驱动');
  };

  return (
    <div className="login2-page">
      <div className="login2-container">
        <div className="login2-key">
          <div className="login2-title">PKI登录</div>
          <button type="button" className="login2-link" onClick={handleClick}>
            点击进行证书登录
          </button>
          <span className="login2-desc">证书登录</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPKIPage;
