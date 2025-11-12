import React from 'react';
import '../styles/chromeInstaller.css';

const ChromeInstallerPage = () => (
  <div className="chrome-container">
    <header className="chrome-header">
      <svg className="chrome-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="white" />
        <path
          fill="#EA4335"
          d="M50,25.1c7.1,0,13.4,2.6,18.4,7.7l14.1-14.1C73.7,10.4,62.7,5.2,50,5.2C30.9,5.2,14.7,16.8,8.3,33.5l16.6,12.8C28.3,33.7,38.3,25.1,50,25.1z"
        />
        <path
          fill="#4285F4"
          d="M79.5,51.2c0-3.3-0.3-5.8-0.8-8.3H50v17.2h17.2c-0.7,4-3,7.5-6.2,9.9l15.8,12.3C83.8,75.3,79.5,62.2,79.5,51.2z"
        />
        <path
          fill="#FBBC05"
          d="M24.9,59.6c-1.2-3.6-1.9-7.5-1.9-11.5c0-4,0.7-7.8,1.9-11.5L8.3,23.8C4.7,31.4,2.6,40.4,2.6,48.1c0,7.7,2.1,14.8,5.7,22.4L24.9,59.6z"
        />
        <path
          fill="#34A853"
          d="M50,94.8c13.8,0,25.4-4.6,33.9-12.4L68.1,70.1c-4.4,3-10.2,4.8-18.1,4.8c-11.7,0-21.7-7.9-25.3-18.5l-16.6,12.8C14.7,85.3,30.9,94.8,50,94.8z"
        />
      </svg>
      <h1>Chrome浏览器安装指南</h1>
      <p className="chrome-subtitle">完成以下步骤，轻松安装Chrome浏览器</p>
    </header>

    <section className="chrome-card">
      <h2>一、下载安装包</h2>
      <div className="chrome-step">
        <div className="chrome-step-number">1</div>
        <div className="chrome-step-content">
          <p>访问下方官方链接下载安装包：</p>
          <a className="chrome-button" href="https://www.google.cn/chrome/" target="_blank" rel="noreferrer">
            前往Chrome官方下载页面
          </a>
          <p className="chrome-note">如无法访问，可尝试使用网络加速工具或联系技术支持</p>
        </div>
      </div>
    </section>

    <section className="chrome-card">
      <h2>二、安装步骤</h2>
      <div className="chrome-step">
        <div className="chrome-step-number">1</div>
        <div className="chrome-step-content">
          <p>双击下载的安装包</p>
          <p className="chrome-note">文件名通常为 <strong>ChromeSetup.exe</strong></p>
        </div>
      </div>
      <div className="chrome-step">
        <div className="chrome-step-number">2</div>
        <div className="chrome-step-content">
          <p>安装程序会自动下载并安装，等待进度条完成</p>
          <p className="chrome-note">根据网络情况，可能需要等待数分钟</p>
        </div>
      </div>
      <div className="chrome-step">
        <div className="chrome-step-number">3</div>
        <div className="chrome-step-content">
          <p>安装完成后，Chrome会自动启动</p>
        </div>
      </div>
    </section>

    <section className="chrome-card">
      <h2>三、首次设置</h2>
      <div className="chrome-step">
        <div className="chrome-step-number">1</div>
        <div className="chrome-step-content">
          <p>如提示登录账号，可点击跳过</p>
        </div>
      </div>
      <div className="chrome-step">
        <div className="chrome-step-number">2</div>
        <div className="chrome-step-content">
          <p>在设置中将Chrome设为默认浏览器（可选）</p>
        </div>
      </div>
      <div className="chrome-step">
        <div className="chrome-step-number">3</div>
        <div className="chrome-step-content">
          <p>建议启用同步功能，可同步收藏夹、密码等数据（可选）</p>
        </div>
      </div>
    </section>

    <div className="chrome-warning">
      <strong>注意事项：</strong>
      <ul>
        <li>安装过程中请勿关闭网络连接</li>
        <li>如遇到安全提示，请选择“允许”或“信任”</li>
        <li>若安装失败，请尝试以管理员身份运行安装包</li>
      </ul>
    </div>

    <div className="chrome-tip">
      <strong>技术支持</strong>
      <p>如需要帮助，请联系信息化技术支持人员。</p>
    </div>

    <footer className="chrome-footer">© 2025 贵阳市公安局经侦支队 | 技术支持：何国钦工作室</footer>
  </div>
);

export default ChromeInstallerPage;
