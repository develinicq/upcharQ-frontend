import React from 'react'

const ReviewCard = ({
  className = '',
  title,
  statusRight,
  children
}) => {
  return (
    <div className={`bg-white border border-gray-300 rounded-md ${className}`}>
      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        {statusRight && (
          <span className="text-green-600 text-sm font-medium">{statusRight}</span>
        )}
      </div>
      <div className="p-4 pt-2">
        {children}
      </div>
    </div>
  )
}

export default ReviewCard
