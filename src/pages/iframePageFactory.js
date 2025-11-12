import React from 'react';
import SideNavLayout from '../components/SideNavLayout.jsx';
import { iframePages } from '../data/iframePages.js';

export const iframePageComponents = iframePages.reduce((acc, config) => {
  acc[config.path] = () => (
    <SideNavLayout
      icon={config.icon}
      title={config.title}
      subtitle={config.subtitle}
      iframeSrc={config.iframeSrc}
      iframeAllow={config.allow}
      moduleId={config.moduleId}
    />
  );
  return acc;
}, {});
