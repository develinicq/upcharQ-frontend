import React from 'react'

const FormContainer = ({ 
  children, 
  className = "", 
  maxWidth = "px-40",
  onSubmit,
  ...props
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <div className={`rounded-md bg-white p-8 min-h-full ${className}`}>
      <div className="rounded-xl items-center mx-auto">
        <form onSubmit={handleSubmit} {...props}>
          <div className={`space-y-6 ${maxWidth}`}>
            {children}
          </div>
        </form>
      </div>
    </div>
  )
}

export default FormContainer
