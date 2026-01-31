import React, { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import SearchInput from "../SearchInput";
import {
  settingUnselect,
  calenderArrowLeft,
  calenderArrowRight,
  calenderUndo,
} from "../../../public/index.js";

/**
 * Full-featured Calendar Component
 * Supports Day, Week, and Month views with event display
 *
 * @param {Object} props
 * @param {Array} props.events - Array of event objects {id, title, start, end, color, info}
 * @param {Function} props.onEventClick - Callback when event is clicked
 * @param {Function} props.onAddNew - Callback for add new button
 * @param {Function} props.onDateSelect - Callback when date is selected
 * @param {string} props.className - Additional CSS classes
 */
const Calendar = ({
  events = [],
  onEventClick,
  onAddNew,
  onDateSelect,
  className = "",
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get calendar data
  const { year, month, monthName } = useMemo(() => {
    return {
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
      monthName: currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [currentDate]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days = [];

    // Previous month days
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthDays - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i),
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i),
      });
    }

    return days;
  }, [year, month]);

  // Mini calendar days
  const miniCalendarDays = useMemo(() => {
    return calendarDays.filter((d) => d.isCurrentMonth);
  }, [calendarDays]);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Get week days
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const first = curr.getDate() - curr.getDay();
    const days = [];

    for (let i = 0; i < 7; i++) {
      days.push(new Date(curr.setDate(first + i)));
    }
    return days;
  };

  // Navigation
  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (view === "month") {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (view === "week") {
      newDate.setDate(currentDate.getDate() + direction * 7);
    } else {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className={`flex flex-col h-full bg-gray-50 ${className}`}>
      <style>{`
        .flex-1.overflow-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {/* Header - Spans full width */}
      <div className="px-6 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Dynamic Month/Year with Navigation */}
          <div className="flex items-center gap-3">
            {view === "day" && (
              <>
                <h2 className="font-inter font-semibold text-[20px] leading-[140%] text-[#14181F]">
                  {monthName}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <img
                      src={calenderArrowLeft}
                      alt="Previous"
                      className="w-3 h-3"
                    />
                  </button>
                  <span className="font-inter font-semibold text-[14px] leading-[22px] text-secondary-grey400 whitespace-nowrap">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                    ,{" "}
                    {selectedDate.toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-2 py-0.5 text-xs border border-blue-500 text-blue-600 rounded hover:bg-blue-50"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigate(1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <img
                      src={calenderArrowRight}
                      alt="Next"
                      className="w-3 h-3"
                    />
                  </button>
                  {!isToday(selectedDate) && (
                    <>
                      <div className="w-[0.5px] h-5 bg-secondary-grey150 mx-1"></div>
                      <button
                        onClick={() => {
                          const today = new Date();
                          setSelectedDate(today);
                          setCurrentDate(today);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded"
                      >
                        <img
                          src={calenderUndo}
                          alt="Back to Current"
                          className="w-4 h-4"
                        />
                        <span className="font-inter font-normal text-[14px] leading-[120%] text-blue-primary250">
                          Back to Current
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
            {view === "week" && (
              <>
                <h2 className="font-inter font-semibold text-[20px] leading-[140%] text-[#14181F]">
                  {(() => {
                    const weekDays = getWeekDays();
                    const firstDay = weekDays[0];
                    const lastDay = weekDays[6];
                    if (firstDay.getMonth() === lastDay.getMonth()) {
                      return monthName;
                    }
                    return `${firstDay.toLocaleDateString("en-US", {
                      month: "short",
                    })} - ${lastDay.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}`;
                  })()}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <img
                      src={calenderArrowLeft}
                      alt="Previous"
                      className="w-3 h-3"
                    />
                  </button>
                  <span className="font-inter font-semibold text-[14px] leading-[22px] text-secondary-grey400 whitespace-nowrap">
                    {(() => {
                      const weekDays = getWeekDays();
                      const firstDay = weekDays[0];
                      const lastDay = weekDays[6];
                      return `${firstDay.getDate()} ${firstDay.toLocaleDateString(
                        "en-US",
                        { month: "short" }
                      )} - ${lastDay.getDate()} ${lastDay.toLocaleDateString(
                        "en-US",
                        { month: "short" }
                      )}`;
                    })()}
                  </span>
                  <button
                    onClick={() => navigate(1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <img
                      src={calenderArrowRight}
                      alt="Next"
                      className="w-3 h-3"
                    />
                  </button>
                  {(() => {
                    const today = new Date();
                    const weekDays = getWeekDays();
                    const isTodayInWeek = weekDays.some(
                      (day) => day.toDateString() === today.toDateString()
                    );
                    return !isTodayInWeek ? (
                      <>
                        <div className="w-[0.5px] h-5 bg-secondary-grey150 mx-1"></div>
                        <button
                          onClick={() => {
                            setSelectedDate(today);
                            setCurrentDate(today);
                          }}
                          className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded"
                        >
                          <img
                            src={calenderUndo}
                            alt="Back to Current"
                            className="w-4 h-4"
                          />
                          <span className="font-inter font-normal text-[14px] leading-[120%] text-blue-primary250">
                            Back to Current
                          </span>
                        </button>
                      </>
                    ) : null;
                  })()}
                </div>
              </>
            )}
            {view === "month" && (
              <>
                <h2 className="font-inter font-semibold text-[20px] leading-[140%] text-[#14181F]">
                  {monthName}
                </h2>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <img
                      src={calenderArrowLeft}
                      alt="Previous"
                      className="w-3 h-3"
                    />
                  </button>
                  <button
                    onClick={() => navigate(1)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <img
                      src={calenderArrowRight}
                      alt="Next"
                      className="w-3 h-3"
                    />
                  </button>
                  {(() => {
                    const today = new Date();
                    return currentDate.getMonth() !== today.getMonth() ||
                      currentDate.getFullYear() !== today.getFullYear() ? (
                      <>
                        <div className="w-[0.5px] h-5 bg-secondary-grey150 mx-1"></div>
                        <button
                          onClick={() => {
                            const today = new Date();
                            setSelectedDate(today);
                            setCurrentDate(today);
                          }}
                          className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded"
                        >
                          <img
                            src={calenderUndo}
                            alt="Back to Current"
                            className="w-4 h-4"
                          />
                          <span className="font-inter font-normal text-[14px] leading-[120%] text-blue-primary250">
                            Back to Current
                          </span>
                        </button>
                      </>
                    ) : null;
                  })()}
                </div>
              </>
            )}
          </div>

          {/* Right: Search and View Toggle */}
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Search Patient" width="w-[250px]" />

            {/* Divider */}
            <div className="w-[0.5px] h-5 bg-secondary-grey150"></div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 w-[169px] h-8 p-0.5 bg-monochrom-white rounded">
              {["Day", "Week", "Month"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v.toLowerCase())}
                  className={`
                    flex-1 h-7 px-1.5 py-1 font-inter font-normal text-[16px] leading-[120%] rounded transition-colors
                    ${
                      view === v.toLowerCase()
                        ? "bg-blue-primary50 border-[0.5px] border-blue-primary150 text-blue-primary250"
                        : "text-secondary-grey200 hover:bg-blue-primary50"
                    }
                  `}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-[0.5px] h-5 bg-secondary-grey150"></div>

            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <img src={settingUnselect} alt="Settings" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Sidebar and Calendar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 flex flex-col">
          {/* Walk-In Appointment Button */}
          <div className="p-4 pb-2">
            <button
              onClick={onAddNew}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Walk-In Appointment
            </button>
          </div>

          {/* Divider */}
          <div className="border-b border-secondary-grey100 mx-4"></div>

          {/* Mini Calendar */}
          <div className="p-4 pt-2">
            <div className="rounded-lg p-3 bg-white overflow-hidden">
              <ShadcnCalendar
                mode="single"
                selected={selectedDate}
                month={currentDate}
                onMonthChange={setCurrentDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCurrentDate(date);
                    onDateSelect?.(date);
                  }
                }}
                className="rounded-md border-0 p-0"
                captionLayout="dropdown"
              />
            </div>
          </div>
        </div>

        {/* Main Calendar Area */}
        <div className="flex-1 flex flex-col overflow-hidden rounded-lg ml-2 mt-4 mr-6 mb-6 bg-white">
          {/* Calendar Grid */}
          <div
            className="flex-1 overflow-auto"
            style={{
              scrollbarWidth: "none" /* Firefox */,
              msOverflowStyle: "none" /* IE and Edge */,
            }}
          >
            {view === "month" && (
              <div className="h-full flex flex-col">
                {/* Day headers - sticky */}
                <div className="grid grid-cols-7 sticky top-0 z-10">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
                    (day, index) => (
                      <div
                        key={day}
                        className="border-b border-secondary-grey100 px-4 py-2 font-inter font-medium text-[15px] leading-[140%] text-secondary-grey300 bg-gray-50"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendar days - scrollable */}
                <div
                  className="grid grid-cols-7 flex-1 overflow-auto"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  {calendarDays.map((day, idx) => {
                    const dayEvents = getEventsForDate(day.date);
                    return (
                      <div
                        key={idx}
                        className={`
                      border-b border-r border-secondary-grey100 p-2 min-h-[120px]
                      ${idx % 7 === 0 ? "border-l" : ""}
                      ${
                        isSelected(day.date)
                          ? "bg-blue-primary100 ring-2 ring-blue-primary250 ring-inset"
                          : "bg-secondary-grey50"
                      }
                    `}
                      >
                        <div
                          className={`mb-1 font-inter font-semibold text-[20px] leading-[140%] ${
                            !day.isCurrentMonth
                              ? "text-secondary-grey200"
                              : "text-secondary-grey400"
                          }`}
                        >
                          {day.day}
                        </div>

                        {/* Events */}
                        <div className="space-y-1">
                          {dayEvents.map((event) => (
                            <button
                              key={event.id}
                              onClick={() => onEventClick?.(event)}
                              className={`
                            w-full text-left px-2 py-1 rounded text-xs font-medium
                            ${
                              event.color === "orange"
                                ? "bg-orange-400 text-white"
                                : ""
                            }
                            ${
                              event.color === "green"
                                ? "bg-green-500 text-white"
                                : ""
                            }
                            ${
                              event.color === "blue"
                                ? "bg-blue-500 text-white"
                                : ""
                            }
                            hover:opacity-90
                          `}
                            >
                              <div>
                                {new Date(event.start).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                              </div>
                              {event.info && (
                                <div className="text-[10px] opacity-90">
                                  ({event.info})
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {view === "week" && (
              <div className="flex flex-col h-full border border-secondary-grey100 rounded-lg">
                {/* Week header */}
                <div className="flex border-b border-secondary-grey100 sticky top-0 z-10 overflow-hidden">
                  {/* GMT column - fixed width to match time column, sticky */}
                  <div className="w-20 flex-shrink-0 border-r border-secondary-grey100 p-3 font-inter font-normal text-[15px] leading-[140%] text-center text-secondary-grey300 flex items-center justify-center bg-secondary-grey50 whitespace-nowrap sticky left-0 z-20">
                    GMT +5
                  </div>

                  {/* Day columns container - horizontally scrollable */}
                  <div
                    className="flex flex-1"
                    id="week-header-scroll"
                    style={{
                      overflowX: "auto",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                    onScroll={(e) => {
                      const timeGrid = document.getElementById(
                        "week-time-grid-scroll"
                      );
                      if (timeGrid) {
                        timeGrid.scrollLeft = e.target.scrollLeft;
                      }
                    }}
                  >
                    {/* Day columns - responsive width with min 161px */}
                    {getWeekDays().map((day, idx) => {
                      const isDaySelected = isSelected(day);
                      const textColor = isDaySelected
                        ? "text-blue-primary250"
                        : "text-secondary-grey400";
                      const bgColor = isDaySelected ? "bg-blue-primary50" : "";

                      return (
                        <div
                          key={idx}
                          className={`flex-1 border-r border-secondary-grey100 p-3 text-left last:border-r-0 ${bgColor}`}
                          style={{ minWidth: "161px" }}
                        >
                          <div
                            className={`font-inter font-semibold text-[20px] leading-[140%] ${textColor} whitespace-nowrap`}
                          >
                            {day.getDate().toString().padStart(2, "0")}
                          </div>
                          <div
                            className={`font-inter font-normal text-[15px] leading-[140%] ${textColor} mt-1 whitespace-nowrap`}
                          >
                            {day.toLocaleDateString("en-US", {
                              month: "short",
                            })}
                            ,{" "}
                            {day.toLocaleDateString("en-US", {
                              weekday: "long",
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <style>{`
                  #week-header-scroll::-webkit-scrollbar,
                  #week-time-grid-scroll::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                {/* Time grid */}
                <div className="flex-1 overflow-auto">
                  <div className="flex">
                    {/* Time column - fixed width to match header GMT column, sticky */}
                    <div className="w-20 flex-shrink-0 border-r border-secondary-grey100 bg-secondary-grey50 sticky left-0 z-10">
                      {Array.from({ length: 15 }, (_, i) => i + 7).map(
                        (hour) => (
                          <div
                            key={hour}
                            className="h-16 border-b border-secondary-grey100 px-2 py-1 font-inter font-normal text-[15px] leading-[140%] text-center text-secondary-grey400 flex items-center justify-center"
                          >
                            {`${hour.toString().padStart(2, "0")}:00`}
                          </div>
                        )
                      )}
                    </div>

                    {/* Day columns container - horizontally scrollable */}
                    <div
                      className="flex flex-1"
                      id="week-time-grid-scroll"
                      style={{
                        overflowX: "auto",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                      onScroll={(e) => {
                        const header =
                          document.getElementById("week-header-scroll");
                        if (header) {
                          header.scrollLeft = e.target.scrollLeft;
                        }
                      }}
                    >
                      {/* Day columns - responsive width with min 161px to match header day columns */}
                      {getWeekDays().map((day, dayIdx) => {
                        const dayEvents = getEventsForDate(day);
                        const isDaySelected = isSelected(day);
                        const bgColor = isDaySelected
                          ? "bg-blue-primary50"
                          : "";

                        return (
                          <div
                            key={dayIdx}
                            className={`flex-1 border-r border-secondary-grey100 relative last:border-r-0 ${bgColor}`}
                            style={{ minWidth: "161px" }}
                          >
                            {Array.from({ length: 15 }, (_, i) => i + 7).map(
                              (hour) => (
                                <div
                                  key={hour}
                                  className="h-16 border-b border-secondary-grey100"
                                />
                              )
                            )}

                            {/* Events for this day */}
                            {dayEvents.map((event) => {
                              const eventStart = new Date(event.start);
                              const eventEnd = new Date(event.end);
                              const startHour = eventStart.getHours();
                              const startMinute = eventStart.getMinutes();
                              const duration =
                                (eventEnd - eventStart) / (1000 * 60); // minutes

                              // Calculate position
                              const top =
                                (startHour - 7) * 64 + (startMinute / 60) * 64;
                              const height = (duration / 60) * 64;

                              return (
                                <button
                                  key={event.id}
                                  onClick={() => onEventClick?.(event)}
                                  className={`absolute left-1 right-1 rounded px-2 py-1 text-xs font-medium text-white
                                  ${
                                    event.color === "orange"
                                      ? "bg-orange-500"
                                      : ""
                                  }
                                  ${
                                    event.color === "green"
                                      ? "bg-green-500"
                                      : ""
                                  }
                                  ${event.color === "blue" ? "bg-blue-500" : ""}
                                  hover:opacity-90
                                `}
                                  style={{
                                    top: `${top}px`,
                                    height: `${height}px`,
                                  }}
                                >
                                  <div className="truncate">{event.title}</div>
                                  <div className="text-[10px] opacity-90">
                                    ({event.info})
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === "day" && (
              <div className="flex flex-col h-full border border-secondary-grey100 rounded-lg">
                {/* Day header - matching time grid layout */}
                <div className="border-b border-secondary-grey100 sticky top-0 z-10">
                  <div className="relative">
                    {/* Time zone label - aligned with time column */}
                    <div className="absolute left-0 w-20 h-full flex items-center justify-center border-r border-secondary-grey100 bg-secondary-grey50">
                      <div className="font-inter font-normal text-[15px] leading-[140%] text-center text-secondary-grey300">
                        GMT +5
                      </div>
                    </div>

                    {/* Date info - aligned with main calendar area */}
                    <div className="ml-20 p-3">
                      <div className="font-inter font-semibold text-[24px] leading-[140%] text-blue-primary250">
                        {selectedDate.getDate().toString().padStart(2, "0")}
                      </div>
                      <div className="font-inter font-normal text-[15px] leading-[140%] text-blue-primary250 mt-1">
                        {selectedDate.toLocaleDateString("en-US", {
                          month: "short",
                        })}
                        ,{" "}
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time grid */}
                <div className="flex-1 overflow-auto">
                  <div className="relative">
                    {/* Time labels */}
                    <div className="absolute left-0 w-20 bg-secondary-grey50">
                      {Array.from({ length: 15 }, (_, i) => i + 7).map(
                        (hour) => (
                          <div
                            key={hour}
                            className="h-16 px-2 py-1 font-inter font-normal text-[15px] leading-[140%] text-center text-secondary-grey400 border-b border-secondary-grey100 flex items-center justify-center"
                          >
                            {`${hour.toString().padStart(2, "0")}:00`}
                          </div>
                        )
                      )}
                    </div>

                    {/* Event area */}
                    <div className="ml-20 border-l border-secondary-grey100 relative">
                      {/* Hour lines */}
                      {Array.from({ length: 15 }, (_, i) => i + 7).map(
                        (hour) => (
                          <div
                            key={hour}
                            className="h-16 border-b border-secondary-grey100"
                          />
                        )
                      )}

                      {/* Events */}
                      {getEventsForDate(selectedDate).map((event) => {
                        const eventStart = new Date(event.start);
                        const eventEnd = new Date(event.end);
                        const startHour = eventStart.getHours();
                        const startMinute = eventStart.getMinutes();
                        const duration = (eventEnd - eventStart) / (1000 * 60); // minutes

                        // Calculate position
                        const top =
                          (startHour - 7) * 64 + (startMinute / 60) * 64;
                        const height = (duration / 60) * 64;

                        return (
                          <button
                            key={event.id}
                            onClick={() => onEventClick?.(event)}
                            className={`absolute left-2 right-2 rounded px-3 py-2 text-sm font-medium text-white
                            ${event.color === "orange" ? "bg-orange-500" : ""}
                            ${event.color === "green" ? "bg-green-500" : ""}
                            ${event.color === "blue" ? "bg-blue-500" : ""}
                            hover:opacity-90
                          `}
                            style={{ top: `${top}px`, height: `${height}px` }}
                          >
                            <div>{event.title}</div>
                            <div className="text-xs opacity-90">
                              {eventStart.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: false,
                              })}{" "}
                              ({event.info})
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
