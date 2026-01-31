import React from "react";
import { sortIcon } from "../../public/index.js";

export default function TableHeader({
  label,
  showIcon = true,
  iconSrc = sortIcon,
  iconAlt = "table icon",
  className = "",
  children,
}) {
  return (
    <div
      className={`flex items-center gap-2  text-secondary-grey400 text-sm text-secondary-grey400 font-medium  ${className}`}
      
    >
      {children ? children : <span>{label}</span>}
      {showIcon && <img src={iconSrc} alt={iconAlt} className="h-4 w-4" />}
    </div>
  );
}
