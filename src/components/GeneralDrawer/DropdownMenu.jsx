import React from "react";
const checkBlue = "/superAdmin/check_blue.svg";

const DropdownMenu = ({
  items = [],
  selectedItem,
  onSelect,
  width = "w-[330px]",
  maxHeight = "300px",
  className = "",
  itemRenderer,
}) => {
  return (
    <div
      className={`absolute z-[50] left-0 top-full mt-1 ${width} rounded-lg bg-white p-2 animate-in fade-in zoom-in-95 duration-100 shadow-[0px_12px_60px_-15px_rgba(0,0,0,0.06)] border border-secondary-grey100 ${className}`}
      role="listbox"
    >
      <div className="overflow-y-auto no-scrollbar" style={{ maxHeight }}>
        {items.map((m, idx) => {
          const val = typeof m === "object" ? m.value ?? m.label : m;
          const label = typeof m === "object" ? m.label : m;
          const isSelected = selectedItem === val;

          return (
            <button
              key={val ?? idx}
              type="button"
              onClick={() => onSelect(m)}
              className={`w-full h-[32px] px-2 flex-shrink-0 mb-1 last:mb-0 rounded-md text-left text-secondary-grey400 transition-all flex items-center justify-between leading-none box-border ${
                isSelected
                  ? "bg-blue-primary50 border border-blue-primary150"
                  : "hover:bg-secondary-grey50"
              }`}
              role="option"
            >
              <span className="text-sm">
                {itemRenderer ? itemRenderer(m, { isSelected }) : label}
              </span>
              {isSelected && <img src={checkBlue} alt="" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DropdownMenu;
