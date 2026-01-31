import React, { useMemo, useRef, useState, useEffect } from "react";
const clock = '/clock.png';
const hours12 = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);

const TimeInput = ({
  value,
  onChange,
  placeholder = "09:00",
  className = "",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close popover on outside click or Escape
  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Parse value "HH:MM" into 12h + ampm
  const parsed = useMemo(() => {
    if (!value) return { h12: "09", m: "00", ap: "AM" };
    const [hh, mm] = String(value).split(":");
    let h = parseInt(hh, 10);
    const ap = h >= 12 ? "PM" : "AM";
    const h12 = String(h % 12 || 12).padStart(2, "0");
    return { h12, m: String(mm).padStart(2, "0"), ap };
  }, [value]);

  const displayLabel = `${parsed.h12}:${parsed.m} ${parsed.ap}`;

  // Convert 12h selection back to 24h "HH:MM"
  const to24hm = (h12, m, ap) => {
    let h = parseInt(h12, 10) % 12;
    if (ap === "PM") h += 12;
    const hh = String(h).padStart(2, "0");
    return `${hh}:${m}`;
  };

  const update = (next) => {
    const v = to24hm(
      next.h12 || parsed.h12,
      next.m || parsed.m,
      next.ap || parsed.ap
    );
    onChange?.({ target: { value: v } });
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <div
        className={`h-8 p-2 text-[13px] border-[0.5px] border-secondary-grey200 text-secondary-grey400 rounded flex items-center gap-3 whitespace-nowrap ${disabled ? "bg-secondary-grey50 cursor-not-allowed" : "bg-white"
          }`}
      >
        <span className="">{displayLabel}</span>
        <button
          type="button"
          className="p-0 m-0"
          disabled={disabled}
          onClick={() => !disabled && setOpen((v) => !v)}
          aria-label="Pick time"
        >
          <img src={clock} alt="" className={`w-4 h-4 ${disabled ? "opacity-50" : ""}`} />
        </button>
      </div>
      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg p-2 grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2">
          <div>
            <div className="text-xs text-gray-500 mb-1.5 text-center font-medium">
              Hr
            </div>
            <div className="max-h-48 overflow-auto no-scrollbar space-y-0.5">
              {hours12.map((h) => (
                <button
                  key={h}
                  className={`w-[2rem] aspect-square flex items-center justify-center text-xs rounded-lg font-medium p-0 ${h === parsed.h12
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                  onClick={() => update({ h12: h })}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-gray-200 self-stretch"></div>

          <div>
            <div className="text-xs text-gray-500 mb-1.5 text-center font-medium">
              Min
            </div>
            <div className="max-h-48 overflow-auto no-scrollbar space-y-0.5">
              {minutes.map((m) => (
                <button
                  key={m}
                  className={`w-full aspect-square flex items-center justify-center text-xs rounded-lg font-medium p-1 ${m === parsed.m
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                  onClick={() => update({ m })}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-gray-200 self-stretch"></div>

          <div>
            <div className="text-xs text-gray-500 mb-1.5 text-center font-medium">
              AM
            </div>
            <div className="flex flex-col space-y-0.5">
              {["AM", "PM"].map((ap) => (
                <button
                  key={ap}
                  className={`w-full aspect-square flex items-center justify-center text-xs rounded-lg font-medium p-1 ${ap === parsed.ap
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                  onClick={() => update({ ap })}
                >
                  {ap}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeInput;
