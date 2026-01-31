import React from "react";
import { searchIcon } from "../../public/index.js";

/**
 * Reusable Search Input Component
 *
 * @param {Object} props
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.value - Controlled input value
 * @param {Function} props.onChange - onChange handler
 * @param {string} props.className - Additional CSS classes for the container
 * @param {string} props.width - Width class (default: w-[360px])
 * @param {boolean} props.showCtrlK - Show Ctrl+K indicator (default: false)
 * @param {React.Ref} props.inputRef - Ref for the input element
 */
const SearchInput = React.forwardRef(
  (
    {
      placeholder = "Search...",
      value,
      onChange,
      className = "",
      width = "w-[360px]",
      showCtrlK = false,
      ...rest
    },
    ref
  ) => {
    return (
      <div className={`relative ${width} max-w-[60vw] ${className}`}>
        <img
          src={searchIcon}
          alt="Search"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4"
        />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full h-8 rounded border-[0.5px] border-secondary-grey300 bg-white pl-8 pr-2 p-2 text-sm text-secondary-grey400 font-inter font-normal text-[14px] leading-[120%] placeholder:text-secondary-grey100 focus:outline-none hover:border-blue-primary250 focus:border-blue-primary250 transition-colors"
          {...rest}
        />
        {showCtrlK && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-secondary-grey200 rounded px-1 py-0.5 bg-white">
            Ctrl+K
          </div>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export default SearchInput;
