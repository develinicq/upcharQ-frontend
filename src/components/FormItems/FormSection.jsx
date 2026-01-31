import React from 'react'

const FormSection = ({ 
  children, 
  className = "", 
  title, 
  subtitle,
  columns = 1,
  spacing = "space-y-6"
}) => {
  return (
    <div className={`${className} ${spacing} `}>
      {/* Section Header */}
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
          )}
          {subtitle && (
            <p className="text-gray-600 text-sm">{subtitle}</p>
          )}
        </div>
      )}
      
      {/* Form Fields Container */}
      <div className={`grid grid-cols-1  ${columns === 2 ? 'md:grid-cols-2' : ''} gap-4`}>
        {children}
      </div>
    </div>
  )
}

export default FormSection
