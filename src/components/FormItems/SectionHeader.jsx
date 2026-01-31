import React from 'react'

const SectionHeader = ({ title, subtitle, align = 'center', className = '' }) => {
  const alignment = align === 'left' ? 'text-left' : 'text-center'
  return (
    <div className={`${alignment} mb-4 ${className}`}>
      {title && (
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h1>
      )}
      {subtitle && (
        <p className="text-gray-600 text-sm">{subtitle}</p>
      )}
    </div>
  )
}

export default SectionHeader
