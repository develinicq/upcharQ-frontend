import React from 'react'


const ProgressBar = ({ step, total }) => (
    <div className="flex items-center justify-center">
      <div className="flex items-center gap-2">
        
        <div className="w-[100px] h-[10px] bg-secondary-grey50 border-[0.5px] border-secondary-grey200/50 rounded-full">
          <div
            className="bg-blue-primary250 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
        <span className="text-sm text-secondary-grey300 ">{step} of {total}</span>
      </div>
    </div>
  );
export default ProgressBar


