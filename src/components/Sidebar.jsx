import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navSections } from '../data/navigation.js';
import '../styles/layout.css';
import GlassIcon from './GlassIcon.jsx';

const Sidebar = ({ visible, onToggle, onNavigate, buildLink }) => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/';
  };

  return (
    <nav className={`sidebar ${visible ? 'active' : ''}`}>
      <div
        className="sidebar-toggle"
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggle();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <GlassIcon icon={`fa-solid ${visible ? 'fa-chevron-left' : 'fa-chevron-right'}`} size="xs" tone="cool" />
      </div>
      {navSections.map((section) => (
        <div className="nav-section" key={section.title}>
          <div className="nav-section-title">{section.title}</div>
          <ul className="nav-menu">
            {section.items.map((item) => (
              <li className="nav-item" key={item.path}>
                <Link
                  to={buildLink(item.path)}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={(event) => {
                    event.preventDefault();
                    if (onNavigate) {
                      onNavigate(item.path, item.moduleId);
                    }
                  }}
                >
                  <GlassIcon icon={item.icon} size="sm" tone={item.tone || 'cool'} floating={isActive(item.path)} />
                  <div className="nav-icon-pulse" />
                  {item.label}
                  <span className="nav-tooltip">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default Sidebar;
