import React, { useState } from "react";
import Calendar from "../../../components/Calendar/Calendar";

const HCalendar = () => {
  // Sample events data - replace with actual API data later
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Appointment",
      start: new Date(2025, 5, 12, 13, 0),
      end: new Date(2025, 5, 12, 14, 0),
      color: "orange",
      info: "info here",
    },
    {
      id: 2,
      title: "Appointment",
      start: new Date(2025, 5, 12, 15, 0),
      end: new Date(2025, 5, 12, 16, 0),
      color: "orange",
      info: "info here",
    },
    {
      id: 3,
      title: "Walk-in",
      start: new Date(2025, 5, 24, 18, 0),
      end: new Date(2025, 5, 24, 19, 0),
      color: "green",
      info: "60 min",
    },
  ]);

  const handleEventClick = (event) => {
    // TODO: Open event details modal/drawer
  };

  const handleAddNew = () => {
    // TODO: Open add appointment/event modal
  };

  const handleDateSelect = (date) => {
    // TODO: Handle date selection - could filter events or navigate
  };

  return (
    <div className="h-full">
      <Calendar
        events={events}
        onEventClick={handleEventClick}
        onAddNew={handleAddNew}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
};

export default HCalendar;
