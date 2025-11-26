import React from 'react';
import '../styles/layout.css';
import GlassIcon from './GlassIcon.jsx';

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-logo">
        <GlassIcon icon="fa-solid fa-shield-halved" size="xs" tone="navy" />
        <span>贵阳经侦AI智能体工作平台</span>
      </div>
      <div className="footer-info">© 2025 贵阳市公安局经侦支队 | 技术支持：何国钦工作室</div>
    </div>
  </footer>
);

export default Footer;
