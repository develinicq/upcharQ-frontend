import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Radio = ({
  className,
  compulsory,
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  stacked = false,
}) => {
  const handleValueChange = (newValue) => {
    // Create a synthetic event to match the original onChange signature
    const syntheticEvent = {
      target: {
        name: name,
        value: newValue,
      },
    };
    onChange(syntheticEvent);
  };

  return (
    <div
      className={`${className} ${
        stacked ? "flex flex-col gap-2" : "flex gap-6"
      }`}
    >
      <div className="flex gap-1 items-center">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {compulsory && <div className="bg-red-500 w-1 h-1 rounded-full"></div>}
      </div>

      <RadioGroup
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled}
        className={`${stacked ? "mt-1" : ""} flex gap-6`}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <RadioGroupItem
              value={option.value}
              id={`${name}-${option.value}`}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className="text-sm text-gray-700 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default Radio;
