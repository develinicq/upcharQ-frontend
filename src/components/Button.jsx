import React from "react";
import clsx from "clsx";
import { XCircle, Clipboard, Clock, ChevronDown } from "lucide-react";

// Variants
const variants = {
  primary: "bg-blue-primary250  text-white hover:bg-blue-primary400 shadow-[0px_2px_10px_0px_rgba(35,114,236,0.27)] min-w-[32px]",
  secondary: "border border-gray-400 text-gray-800 hover:bg-gray-100",
  tertiary: "text-blue-600 hover:text-blue-800",
  success: "bg-green-600 text-white hover:bg-green-700",
  error: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-gray-800 hover:bg-gray-100",
  disabled: "bg-gray-200 text-gray-400 cursor-not-allowed hover:none",
};

// Sizes
const sizes = {
  small: "px-3 py-1 text-sm rounded-md",
  large: "p-2 h-8 text-sm rounded-sm",
};

export default function Button({
  children = "Button Text",
  variant = "primary",
  size = "large",
  disabled = false,
  leadingIcon = null, // Component (e.g., XCircle)
  trailingIcon = null, // Component (e.g., Clipboard)
  dropdown = false,
  trailingAction = null, // Component (e.g., Clock)
  hover = false, // useful for storybook preview
  className,
  ...props
}) {
  const CompLeading = leadingIcon;
  const CompTrailing = trailingIcon;
  const CompTrailingAction = trailingAction;

  return (
    <button
      className={clsx(
        sizes[size],
        disabled ? variants["disabled"] : variants[variant],
        "inline-flex items-center justify-center gap-2 transition-colors duration-200 font-medium",
        hover && !disabled && "brightness-90", // force hover preview
        className
      )}
      disabled={disabled}
      {...props}
    >
      {/* Leading Icon */}
      {CompLeading && <CompLeading size={16} />}

      {/* Button Text */}
      {children}

      {/* Trailing Icon */}
      {CompTrailing && <CompTrailing size={16} />}

      {/* Dropdown Chevron */}
      {dropdown && <ChevronDown size={16} />}

      {/* Trailing Action (like Clock) */}
      {CompTrailingAction && (
        <span className="ml-2 border-l pl-2">
          <CompTrailingAction size={16} />
        </span>
      )}
    </button>
  );
}
