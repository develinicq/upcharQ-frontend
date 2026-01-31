import React from 'react'

const FormFieldRow = ({ 
  children, 
  className = "", 
  columns = 2,
  gap = "gap-6"
}) => {
  return (
    <div className={`grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : ''} ${gap} ${className}`}>
      {children}
    </div>
  )
}

export default FormFieldRow
