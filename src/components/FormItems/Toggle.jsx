import React from "react";

const Toggle = ({ checked, onChange, disabled = false, className = "" }) => {
  return (
    <label
      className={`relative inline-flex items-center cursor-pointer ${
        disabled ? "cursor-not-allowed" : ""
      } ${className}`}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <div
        className={`flex items-center min-w-8  rounded-sm transition-all py-[1px] px-[1px] ${
          checked ? "bg-blue-primary300" : "bg-secondary-grey100"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <div
          className={`w-4 h-4  bg-white rounded-[3px] transition-all transform ${
            checked ? "translate-x-[14px]" : "translate-x-0"
          }`}
        />
      </div>
    </label>
  );
};

export default Toggle;
