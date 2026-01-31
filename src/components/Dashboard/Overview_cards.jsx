import {
  ArrowDownRight,
  ArrowUpRight,

} from "lucide-react";
import React from "react";
import {
  userAvatar, calenderCheck

} from "../../../public/index.js";
const Overview_cards = ({
  title = "Title",
  value = 0,
  percent = 0,
  periodText = "from last period",
  variant = "profit",
  icon,
  className = "",
}) => {
  const isProfit = variant === "profit";
  const isNeutral = variant === "neutral";

  const gradient = isNeutral
    ? "none"
    : isProfit
      ? "linear-gradient(to right, rgba(255,255,255,1) 70%, rgba(109,219,114,0.15) 100%)"
      : "linear-gradient(to right, rgba(255,255,255,1) 70%, rgba(240,68,56,0.12) 100%)";

  const borderClass = isNeutral
    ? "border-secondary-grey100" // using grey100 as per user request for grey border (assuming grey100 is appropriate, or I can use a safe default)
    : isProfit
      ? "border-[rgba(109,219,114,0.5)]"
      : "border-[rgba(235,139,133,0.5)]";
  const BadgeIcon = isProfit ? ArrowUpRight : ArrowDownRight;
  const badgeTone = isNeutral
    ? "text-secondary-grey400 bg-secondary-grey50"
    : isProfit
      ? "text-green-600 bg-green-50"
      : "text-red-500 bg-red-50";

  const RightIcon = ({ className = "" }) => (
    <div
      className={`w-12 h-12 rounded-full border flex items-center justify-center bg-white shadow-sm ${className}`}
    >
      {icon ? (
        icon
      ) : isNeutral ? (
        <img src={calenderCheck} alt="neutral" className="opacity-0" /> // Hiding icon or showing generic for neutral if needed, keeping simple for now
      ) : isProfit ? (
        <img src={userAvatar} alt="user-avatar" />
      ) : (
        <img src={calenderCheck} alt="calendar-check" />
      )}
    </div>
  );

  const formattedValue =
    typeof value === "number" ? new Intl.NumberFormat().format(value) : value;

  return (
    <div
      className={`p-4 rounded-[12px] border-[0.5px] bg-white relative ${borderClass} ${className}`}
    >
      <div
        className="absolute inset-0 rounded-[12px]"
        style={{
          background: isNeutral
            ? 'transparent'
            : isProfit
              ? 'linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 65.54%, rgba(109,219,114,0.25) 100%)'
              : 'linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,255,255,1) 65.54%, rgba(240,68,56,0.25) 100%)',
        }}
      ></div>
      <div className="relative z-10 flex items-stretch justify-between gap-6">
        <div className="flex flex-col">
          <div className="flex flex-col gap-1">
            <h2 className="text-[#424242] text-sm sm:text-base font-medium leading-tight">
              {title}
            </h2>
            <p className="text-[22px] sm:text-2xl font-bold text-[#424242] leading-tight">
              {formattedValue}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-normal text-[#626060] mt-1">
            <span
              className={`inline-flex  items-center gap-1 px-1.5 py-0.5 rounded leading-none ${badgeTone}`}
            >
              <BadgeIcon className="w-3 h-3" /> {percent}%
            </span>
            <span className="leading-none">{periodText}</span>
          </div>
        </div>
        <RightIcon className="self-center mb-8" />
      </div>
    </div>
  );
};

export default Overview_cards;
