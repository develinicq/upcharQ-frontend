import React from 'react'


const Input = ({
  className,
  compulsory,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  icon = null,
  meta
}) => {
  return (
    <div className={`${className} h-auto flex flex-col gap-1`}>
      <div className='flex gap-1 items-center'>
        <label className='text-sm font-normal text-gray-700'>
          {label}
        </label>
        {compulsory && (
          <div className='bg-red-500 w-1 h-1 rounded-full'></div>
        )}
      </div>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="w-full h-[32px] py-2 px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors pr-10"
        />
        {icon && (
          <span className="absolute inset-y-0 right-3 flex items-center cursor-pointer select-none">
            {icon}
          </span>
        )}
      </div>
      {meta && <p className="text-[10px] text-gray-400 leading-tight">{meta}</p>}
    </div>
  )
}

export default Input
