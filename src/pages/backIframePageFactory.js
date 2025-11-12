import React from 'react';
import BackHeaderIframePage from '../components/BackHeaderIframePage.jsx';
import { backIframePages } from '../data/backIframePages.js';

export const backIframePageComponents = backIframePages.reduce((acc, config) => {
  acc[config.path] = () => (
    <BackHeaderIframePage
      title={config.title}
      subtitle={config.subtitle}
      iframeSrc={config.iframeSrc}
      icon={config.icon}
      allow={config.allow}
      moduleId={config.moduleId}
    />
  );
  return acc;
}, {});
