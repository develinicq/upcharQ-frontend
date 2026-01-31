import React from 'react'


const ReviewBanner = ({
  className = '',
  icon = null,
  title = 'Ready to Activate',
  tone = 'success'
}) => {
  const tones = {
    success: {
      bg: 'bg-success-100',
      border: 'border-success-300',
      text: 'text-success-400',
      title: 'text-success-400'
    },
    warn: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      title: 'text-yellow-800'
    }
  }
  const t = tones[tone] || tones.success

  return (
    <div className={`${t.bg} border ${t.border} rounded-lg px-3 py-2 flex items-center gap-1 ${className}`}>
      {icon && <div className=" mt-0.5 flex-shrink-0">{icon}</div>}
      <div>
        <p className={`${t.title} font-medium text-sm`}>{title}</p>
      </div>
    </div>
  )
}

export default ReviewBanner
