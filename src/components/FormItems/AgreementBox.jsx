import React from 'react'
import { Checkbox } from '../ui/checkbox'

const AgreementBox = ({
  title,
  description,
  bullets = [],
  accepted = false,
  onToggle,
  confirmText,
  className = ''
}) => {
  return (
    <div className={`bg-white border-[0.5px] border-secondary-grey150/80 rounded-lg p-3 flex flex-col gap-2 ${className}`}>
      <div className='w-[668px] '>
        {title && (
          <h3 className="text-sm font-semibold text-secondary-grey400">{title}</h3>
        )}
        {description && (
          <p className="text-xs  text-secondary-grey300">{description}</p>
        )}
      </div>

      {bullets.length > 0 && (
        <div className="bg-secondary-grey50 p-2 flex flex-col text-xs gap-1 text-secondary-grey400">
          {bullets.map((item, idx) => (
            <div key={idx}>
              <span className="font-medium ">{idx + 1}. {item.title}</span>
              {item.text ? <span className="">: {item.text}</span> : null}
            </div>
          ))}
        </div>
      )}

      {typeof onToggle === 'function' && (
        <div className="flex items-center">
          <Checkbox
            checked={accepted}
            onCheckedChange={onToggle}
            className="mr-2"
          />
          <span className="text-sm text-secondary-grey300">{confirmText}</span>
        </div>
      )}
    </div>
  )
}

export default AgreementBox


