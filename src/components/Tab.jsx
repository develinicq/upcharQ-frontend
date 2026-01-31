import React from "react";

const Tab = ({
  variant = "tabs",
  size = "md",
  status = "default",
  leadingIcon,
  showText = true,
  countBadge,
  notificationDot = false,
  dropdown = false,
  children,
  className = "",
  ...rest
}) => {
  const base = "inline-flex items-center select-none cursor-pointer transition-colors pt-[4px] pr-[6px] pb-[4px] pl-[6px] gap-[4px]";

  // Typography per size for default status
  const defaultTypographyBySize = {
    sm: "text-secondary-grey300 font-normal text-[14px] leading-[120%]",
    md: "text-secondary-grey300 font-normal text-[16px] leading-[120%]",
  };

  // Base container styles per variant + status (without default typography)
  const variantStatusBase = {
    tabs: {
      default: "rounded-md bg-transparent hover:bg-secondary-grey50",
      hover: "rounded-md bg-secondary-grey50 text-secondary-grey300",
      active: "rounded-md ",
    },
    underline: {
      default: "border-b-2 border-transparent text-secondary-grey300 hover:text-secondary-grey400 hover:border-secondary-grey300",
      hover: "text-secondary-grey400",
      active: "border-b-2 border-blue-primary250 text-blue-primary250",
    },
  };

  const variantHeights = {
    tabs: "h-[28px]",
    underline: "h-[40px]",
  };

  const getStatusClasses = (variant, status, size) => {
    const baseCls = variantStatusBase[variant]?.[status] || variantStatusBase.tabs.default;
    if (status === "default") return `${baseCls} ${defaultTypographyBySize[size] || defaultTypographyBySize.md}`;
    return baseCls;
  };

  const cls = [
    base,
    getStatusClasses(variant, status, size),
    variantHeights[variant] || variantHeights.tabs,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type="button" className={cls} {...rest}>
      {notificationDot && (
        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" aria-hidden="true" />
      )}
      {leadingIcon ? (
        <span className="inline-flex items-center justify-center w-[16px] h-[16px]" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      {showText && children ? <span className="truncate">{children}</span> : null}
      {typeof countBadge === "number" && (
        <span className="ml-1 inline-flex items-center justify-center text-xs rounded-full px-1.5 py-0.5 bg-gray-200 text-gray-800">
          {countBadge}
        </span>
      )}
      {dropdown && (
        <svg
          className="ml-1 w-3.5 h-3.5 text-current"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.146l3.71-3.915a.75.75 0 111.08 1.04l-4.24 4.475a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" />
        </svg>
      )}
    </button>
  );
};

export default Tab;
