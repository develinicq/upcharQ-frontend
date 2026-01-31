import React from 'react';
import Toggle from './Toggle';
import TimeInput from './TimeInput';

const DayCard = ({ 
  day, 
  isAvailable, 
  onToggleChange, 
  startTime, 
  endTime, 
  onStartTimeChange, 
  onEndTimeChange,
  is24Hours,
  on24HoursChange 
}) => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      {/* Day Header with Toggle */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">{day}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Available</span>
          <Toggle
            checked={isAvailable}
            onChange={onToggleChange}
          />
        </div>
      </div>
      
      {/* Expanded Time Selection (only show if day is available) */}
      {isAvailable && (
        <div className="space-y-3">
          {/* Time Selection */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 whitespace-nowrap">Availability Time:</span>
            <div className="flex items-center gap-2">
              <TimeInput
                value={startTime}
                onChange={onStartTimeChange}
              />
              <span className="text-xs text-gray-400">-</span>
              <TimeInput
                value={endTime}
                onChange={onEndTimeChange}
              />
            </div>
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-2">
              + Add More
            </button>
          </div>
          
          {/* 24 Hours Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`${day.toLowerCase()}24Hours`}
              className="h-3 w-3 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
              checked={is24Hours}
              onChange={on24HoursChange}
            />
            <label htmlFor={`${day.toLowerCase()}24Hours`} className="text-xs text-gray-600">
              Avaible 24 Hours
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayCard;
