import React from 'react'

const base = 'px-5 py-1 rounded-md transition-colors text-sm font-medium'

const VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200',
  outline: 'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50',
  aadhaar: 'bg-blue-600 text-white hover:bg-blue-700',
  pancard: 'border border-secondary-grey200/70 p-2 text-secondary-grey400'
}

const ActionButton = ({ variant = 'primary', onClick, children, className = '', type = 'button' }) => {
  const styles = VARIANTS[variant] || VARIANTS.primary
  return (
    <button type={type} onClick={onClick} className={`min-w-7 ${base} ${styles} ${className}`}>
      {children}
    </button>
  )
}

export default ActionButton


