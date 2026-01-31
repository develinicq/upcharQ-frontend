import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import { calenderArrowLeft, calenderArrowRight } from "../../public/index.js";

// Reusable popover calendar for queue headers (doctor & front desk)
// Props: date (Date), onChange(newDate:Date)
export default function QueueDatePicker({ date, onChange }) {
  const [showCal, setShowCal] = useState(false);
  const [viewYear, setViewYear] = useState(date.getFullYear());
  const [viewMonth, setViewMonth] = useState(date.getMonth()); // 0-11
  const anchorRef = useRef(null);
  const popRef = useRef(null);

  // Close on outside click / esc
  useEffect(() => {
    const onClick = (e) => {
      if (anchorRef.current && anchorRef.current.contains(e.target)) return;
      if (popRef.current && popRef.current.contains(e.target)) return;
      setShowCal(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setShowCal(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Build days matrix
  const buildDays = () => {
    const first = new Date(viewYear, viewMonth, 1);
    const startDow = first.getDay(); // 0 Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  };
  const weeks = buildDays();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const currentKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  const apply = (d) => {
    const newDate = new Date(viewYear, viewMonth, d);
    onChange?.(newDate);
    setShowCal(false);
  };

  const goToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    onChange?.(t);
  };
  const goPrevDay = () => {
    const nd = new Date(date.getTime() - 24 * 3600 * 1000);
    onChange?.(nd);
    setViewYear(nd.getFullYear());
    setViewMonth(nd.getMonth());
  };
  const goNextDay = () => {
    const nd = new Date(date.getTime() + 24 * 3600 * 1000);
    onChange?.(nd);
    setViewYear(nd.getFullYear());
    setViewMonth(nd.getMonth());
  };

  // Get relative day label
  const getRelativeDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((compareDate - today) / (24 * 3600 * 1000));

    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";
    return null;
  };

  // Format date as "Mon, 03/04/2025"
  const getFormattedDate = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = days[date.getDay()];
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${dayName}, ${month}/${day}/${year}`;
  };

  const relativeDay = getRelativeDay();
  const formattedDate = getFormattedDate();

  // Compute portal container lazily
  const [portalEl, setPortalEl] = useState(null);
  useEffect(() => {
    let el = document.getElementById("queue-date-picker-root");
    if (!el) {
      el = document.createElement("div");
      el.id = "queue-date-picker-root";
      document.body.appendChild(el);
    }
    setPortalEl(el);
  }, []);

  // Position state for popover
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (showCal && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const width = 260; // match w-[260px]
      const top = rect.bottom + window.scrollY + 6; // gap
      let left = rect.left + window.scrollX + rect.width / 2 - width / 2;
      // Keep within viewport margins
      const margin = 8;
      if (left < margin) left = margin;
      const maxLeft = window.scrollX + window.innerWidth - width - margin;
      if (left > maxLeft) left = maxLeft;
      setPos({ top, left });
    }
  }, [showCal, date, viewMonth, viewYear]);

  return (
    <div className="flex items-center space-x-4" ref={anchorRef}>
      <img
        src={calenderArrowLeft}
        alt="Previous Day"
        className="h-3 w-3 cursor-pointer"
        onClick={goPrevDay}
      />
      <div className="flex items-center space-x-2">
        {relativeDay && (
          <button
            className="h-[22px] text-[14px] leading-tight text-center text-blue-primary250 bg-blue-primary50 px-2 rounded-sm border border-transparent hover:border-blue-primary250/50 hover:border-[0.5px] transition-colors"
            onClick={goToday}
          >
            {relativeDay}
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowCal((v) => !v)}
          className="text-secondary-grey400 font-semibold text-sm"
        >
          {formattedDate}
        </button>
      </div>
      <img
        src={calenderArrowRight}
        alt="Next Day"
        className="h-3 w-3 cursor-pointer"
        onClick={goNextDay}
      />
      {showCal &&
        portalEl &&
        createPortal(
          <div
            ref={popRef}
            style={{ top: pos.top, left: pos.left }}
            className="absolute bg-white border border-gray-200 rounded-lg shadow-xl z-[999] p-3"
          >
            <ShadcnCalendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  onChange?.(newDate);
                  setViewYear(newDate.getFullYear());
                  setViewMonth(newDate.getMonth());
                  setShowCal(false);
                }
              }}
              month={new Date(viewYear, viewMonth)}
              onMonthChange={(newMonth) => {
                setViewYear(newMonth.getFullYear());
                setViewMonth(newMonth.getMonth());
              }}
              className="rounded-md border-0 p-0"
              captionLayout="dropdown"
              fromYear={viewYear - 10}
              toYear={viewYear + 10}
            />
          </div>,
          portalEl
        )}
    </div>
  );
}
