import React from 'react';
import { Building2 } from "lucide-react"

// Size tokens: L(48px), MD(40px), S(32px), XS(24px)
const sizeMap = {
  xl: 'w-[90px] h-[90px] text-[30px]', // 64px
  l: 'w-12 h-12 text-xl', // 48px
  md: 'w-10 h-10 text-[16px]', // 40px
  s: 'w-8 h-8 text-sm', // 32px
  xs: 'w-6 h-6 text-[10px]', // 24px
  f4: 'w-16 h-16 text-[30px]', // 64px
};

const colorTokens = {
  blue: { bg: '#F8FAFF', border: '#96BFFF', text: '#2372EC' },
  orange: { bg: '#FFF7F0', border: '#EC7600', text: '#EC7600' },
  grey: { bg: '#F9F9F9', border: '#D6D6D6', text: '#424242' },
};

/**
 * AvatarCircle
 * @param {string} name - The name to display (first letter used)
 * @param {'l'|'md'|'s'|'xs'} [size]
 * @param {'blue'|'orange'|'grey'} [color]
 * @param {string} [className]
 */
const AvatarCircle = ({ name, size = 'md', color = 'blue', className = '', icon = null }) => {
  const initial = name?.[0]?.toUpperCase() || '?';
  const sz = sizeMap[size] || sizeMap.md;
  const { bg, border, text } = colorTokens[color] || colorTokens.blue;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full  ${sz} ${className}`}
      style={{
        backgroundColor: bg,
        color: text,
        borderColor: border,
        borderStyle: 'solid',
        borderWidth: '0.5px', // approximates 0.5px across d
        // isplays
      }}
    >
      {icon || initial}
    </span>
  );
};

export default AvatarCircle;
