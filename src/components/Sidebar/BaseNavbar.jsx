import React from "react";
// Minimal classnames helper to avoid external alias dependency
const cn = (...classes) => classes.filter(Boolean).join(" ");
import { ChevronDown } from "lucide-react";

const BaseNavbar = ({
  title = "Home",
  size = "normal", // normal, large (for extensibility)
  state = "default", // default, hover, disabled
  active = false,
  icon: Icon, // optional React icon component
  iconSelected, // optional image URL for selected state
  iconUnselected, // optional image URL for unselected state
  iconHover, // optional image URL for unselected hover state
  chevron = false,
  text = true,
  count = false,
}) => {
  const [isHovering, setIsHovering] = React.useState(false);
  // size styles
  const sizes = {
  normal: "h-11 px-4 py-3 gap-[6px]", // 44px height, 16px left/right, 12px top/bottom, 6px gap
    large: "h-12 px-5 py-3.5 gap-3",
  };

  // background styles with explicit hover handling
  // Four states:
  // 1) Unselected default
  // 2) Unselected hover (bg light, iconHover if provided)
  // 3) Selected default (blue gradient)
  // 4) Selected hover (slightly darker gradient variant), icon remains selected icon
  const background = (() => {
    if (state === "disabled") return "bg-gray-100 text-gray-400 cursor-not-allowed";
    if (active) {
      return isHovering
        ? "bg-gradient-to-r from-[#1E62CA] via-[#4F8FF5] to-[#1E62CA] text-white"
        : "bg-gradient-to-r from-[#2372EC] via-[#68A3FF] to-[#2372EC] text-white";
    }
    if (isHovering || state === "hover") return "bg-[#F8FAFF] text-gray-800";
    return "bg-white text-gray-800";
  })();

  return (
    <button
      type="button"
      className={cn(
        "flex items-center w-full transition-all",
        sizes[size],
        background,
  active ? "font-medium" : "font-normal",
  !active && (isHovering || state === "hover") && "border border-[#E6F0FF]"
      )}
      disabled={state === "disabled"}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Icon priority: image URLs > Icon component */}
      {iconSelected || iconUnselected ? (
        <img
          src={
            active
              ? iconSelected
              : (isHovering ? (iconHover || iconSelected || iconUnselected) : iconUnselected)
          }
          alt="icon"
          className="w-5 h-5"
        />
      ) : (
        Icon && (
          <Icon
            className={cn(
              "w-5 h-5",
              active ? "text-white" : (isHovering ? "text-gray-700" : "text-gray-600"),
              state === "disabled" && "text-gray-400"
            )}
          />
        )
      )}
      {text && <span className="text-[16px] leading-none">{title}</span>}

      {chevron && (
        <ChevronDown
          className={cn(
            "w-5 h-5 ml-auto",
            active ? "text-white" : "text-gray-500"
          )}
        />
      )}

      {count && (
        <span
          className={cn(
            "ml-auto text-xs font-semibold px-2 py-0.5 rounded-full",
            active
              ? "bg-white text-[#2372EC]"
              : "bg-blue-100 text-[#2372EC]"
          )}
        >
          3
        </span>
      )}
    </button>
  );
};

export default BaseNavbar;
