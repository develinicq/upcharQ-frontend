import React from "react";

export default function RadioButton({
  name,
  value,
  checked = false,
  onChange,
  label,
  disabled = false,
  className = "",
}) {
  return (
    <label
      className={
        "inline-flex items-center gap-2 cursor-pointer select-none " +
        (disabled ? "opacity-60 cursor-not-allowed " : "") +
        className
      }
    >
      {/* Hidden native input for accessibility */}
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange?.(value)}
        disabled={disabled}
        className="sr-only"
      />

      {/* Custom radio visual */}
      <span
        className={
          "relative inline-flex items-center justify-center w-5 h-5 rounded-full border " +
          (checked
            ? "border-blue-600 bg-blue-primary250"
            : "border-secondary-grey200 bg-white")
        }
        aria-hidden="true"
      >
        {/* inner dot */}
        <span
          className={
            "block rounded-full " + (checked ? "w-2.5 h-2.5 bg-white" : "w-0 h-0")
          }
        />
      </span>

      {/* Label */}
      <span className="text-sm text-secondary-grey300 text-base">{label}</span>
    </label>
  );
}
