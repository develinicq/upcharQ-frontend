import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const Dropdown = ({
  className,
  compulsory,
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  placeholder = "Select an option",
  meta
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(
    options.find((option) => option.value === value) || null
  )
  const dropdownRef = useRef(null)

  useEffect(() => {
    setSelectedOption(options.find((option) => option.value === value) || null)
  }, [value, options])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleOptionSelect = (option) => {
    setSelectedOption(option)
    onChange({ target: { name, value: option.value } })
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {compulsory && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div
        className={`relative w-full cursor-pointer rounded-lg border px-3 py-2 text-left shadow-sm focus:outline-none focus:ring-1 sm:text-sm
          ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900'}
          ${isOpen ? 'border-blue-500 ring-blue-500' : 'border-gray-300'}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        role="button"
        tabIndex={0}
      >
        <span className="block truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
              }`}
            aria-hidden="true"
          />
        </span>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {options.map((option) => (
              <div
                key={option.value}
                onClick={() => handleOptionSelect(option)}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between ${selectedOption?.value === option.value ? 'bg-blue-50' : ''
                  }`}
              >
                <span className="text-sm text-gray-900">{option.label}</span>
                {selectedOption?.value === option.value && (
                  <Check className="w-4 h-5 text-blue-600" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {meta && <p className="text-[10px] text-gray-400 leading-tight mt-1">{meta}</p>}
    </div>
  )
}

export default Dropdown
