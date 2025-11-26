import React from 'react';
import '../styles/global.css';

const sizeClass = {
  xs: 'glass-icon--xs',
  sm: 'glass-icon--sm',
  md: '',
  lg: 'glass-icon--lg',
  xl: 'glass-icon--xl',
};

const GlassIcon = ({
  icon,
  size = 'md',
  tone = 'cool',
  floating = false,
  pulsing = false,
  className = '',
  label,
}) => {
  const iconClasses = Array.isArray(icon) ? icon.join(' ') : icon;
  const sizeModifier = sizeClass[size] || '';
  const classes = [
    'glass-icon',
    sizeModifier,
    `glass-icon--tone-${tone}`,
    floating ? 'glass-icon--floating' : '',
    pulsing ? 'glass-icon--pulse' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const accessibilityProps = label
    ? { role: 'img', 'aria-label': label }
    : { 'aria-hidden': true };

  return (
    <span className={classes} {...accessibilityProps}>
      <span className="glass-icon__halo" aria-hidden="true" />
      <span className="glass-icon__shine" aria-hidden="true" />
      <span className="glass-icon__texture" aria-hidden="true" />
      <i className={`glass-icon__glyph ${iconClasses}`} aria-hidden="true" />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
};

export default GlassIcon;
