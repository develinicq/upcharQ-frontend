import React from 'react';
import { Loader } from 'lucide-react';

const UniversalLoader = ({ size = 64, style = {}, className = '', color = 'currentColor' }) => (
  <div
    className={className}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      ...style
    }}
  >
    <Loader
      className="animate-spin"
      size={size}
      color={color}
    />
  </div>
);

export default UniversalLoader;
