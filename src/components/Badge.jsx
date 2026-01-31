import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

// Simple className joiner to avoid external deps
const cn = (...classes) => classes.filter(Boolean).join(" ");

// Color tokens for "ghost" style (border + soft background + colored text)
const colorTokens = {
  gray: {
    text: "text-secondary-grey400",
    border: "border-secondary-grey50",
    bg: "bg-secondary-grey50",
    hoverBorder: "hover:border-secondary-grey300",
  },
  red: {
    text: "text-red-600",
    border: "border-red-300",
    bg: "bg-red-50",
    hoverBg: "hover:bg-red-100",
  },
  warning: {
    text: "text-warning2-400",
    border: "border-warning2-50",
    bg: "bg-warning2-50",
    hoverBorder: "hover:border-warning2-400",
  },
  blue: {
    text: "text-blue-primary250",
    border: "border-blue-primary50",
    bg: "bg-blue-primary50",
    hoverBorder: "hover:border-blue-primary250",
  },
  success: {
    text: "text-success-300",
    border: "border-success-100",
    bg: "bg-success-100",
    hoverBorder: "hover:border-success-300",
  },
};

// Backwards-compatibility mapping for old variants
const legacyToColor = {
  primary: "blue",
  secondary: "blue",
  tertiary: "gray",
  success: "green",
  error: "red",
  disable: "gray",
  ghost: "gray",
};

// Size tokens
const sizeTokens = {
  xs: "flex h-[22px] px-[6px] text-sm rounded-sm",
  s: "h-6 px-2 text-xs rounded-md",
  l: "h-8 px-3 text-sm rounded-lg",
  small: "h-6 px-2 text-xs rounded-md", // legacy alias
  large: "h-8 px-3 text-sm rounded-md", // legacy alias
  ss: "h-4 w-4 rounded-sm flex items-center justify-center text-[10px] px-1 py-[2px]"
};


const Badge = ({
  type = "ghost",
  hover = false,
  size = "s",
  color,
  variant,
  leadingIcon,
  trailingIcon,
  dropdown = false,
  chevron = "down",
  showText = true,
  className = "",
  disabled = false,
  children,
  ...rest
}) => {
  // Resolve color from either `color` or legacy `variant`
  const resolvedColor = color || legacyToColor[variant] || "gray";
  const t = colorTokens[resolvedColor] || colorTokens.gray;
  const sizeCls = sizeTokens[size] || sizeTokens.s;

  // Style by type
  const base =
    "inline-flex items-center gap-1 border select-none transition-colors";

  // Custom logic: new modern tokens have explicit hoverBorder and expect a visible initial border
  const isModern = !!t.hoverBorder;

  const ghost = cn(
    t.text,
    isModern ? t.border : "border-transparent",
    isModern ? t.hoverBorder : `hover:${t.border}`,
    t.bg,
    hover ? t.hoverBg : ""
  );
  const solid = cn(
    "text-white",
    resolvedColor === "blue" && "bg-blue-600 border-blue-600 hover:bg-blue-700",
    resolvedColor === "green" &&
    "bg-green-600 border-green-600 hover:bg-green-700",
    resolvedColor === "orange" &&
    "bg-orange-600 border-orange-600 hover:bg-orange-700",
    resolvedColor === "yellow" &&
    "bg-amber-500 border-amber-500 hover:bg-amber-600",
    resolvedColor === "red" && "bg-red-600 border-red-600 hover:bg-red-700",
    resolvedColor === "gray" && "bg-gray-600 border-gray-600 hover:bg-gray-700",
    hover ? "" : ""
  );

  const appearance = type === "solid" ? solid : ghost;

  const ChevronIcon = chevron === "up" ? ChevronUp : ChevronDown;
  const Component = rest.onClick ? "button" : "span";

  return (
    <Component
      className={cn(
        base,
        sizeCls,
        appearance,
        disabled ? "opacity-60 pointer-events-none cursor-not-allowed" : "",
        className
      )}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {leadingIcon ? (
        <span className="inline-flex items-center">{leadingIcon}</span>
      ) : null}
      {showText ? <span>{children || "Badge"}</span> : null}
      {trailingIcon ? (
        <span className="inline-flex items-center">{trailingIcon}</span>
      ) : null}
      {dropdown ? <ChevronIcon className="w-3.5 h-3.5" /> : null}
    </Component>
  );
};

export default Badge;
