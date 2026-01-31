import React, { useState } from "react";
import { createPortal } from "react-dom";
import { dangerIcon } from "../../public/index.js";
import { Checkbox } from "@/components/ui/checkbox";

const TerminateQueueModal = ({
  show,
  onClose,
  onConfirm,
  sessions = [
    { id: "morning", label: "Morning (10:00 Am - 12:00 PM)" },
    { id: "afternoon", label: "Afternoon (2:00 PM - 4:00 PM)" },
    { id: "evening", label: "Evening (6:00 PM - 8:00 PM)" },
    { id: "night", label: "Night (8:00 PM - 10:00 PM)" },
  ],
  isSubmitting = false,
}) => {
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [reason, setReason] = useState("");

  if (!show) return null;

  const handleSessionToggle = (sessionId) => {
    if (sessionId === "all") {
      if (selectedSessions.length === sessions.length) {
        setSelectedSessions([]);
      } else {
        setSelectedSessions(sessions.map((s) => s.id));
      }
    } else {
      if (selectedSessions.includes(sessionId)) {
        setSelectedSessions(selectedSessions.filter((id) => id !== sessionId));
      } else {
        setSelectedSessions([...selectedSessions, sessionId]);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm({ sessions: selectedSessions, reason });
  };

  const isAllSelected = selectedSessions.length === sessions.length;
  const isDisabled = selectedSessions.length === 0 || !reason.trim() || isSubmitting;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-monochrom-white rounded-xl shadow-2xl flex flex-col"
        style={{ width: "400px", gap: "12px", padding: "16px" }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center">
          <div
            className="bg-error-50 rounded-full flex items-center justify-center"
            style={{
              width: "48px",
              height: "48px",
              border: "0.5px solid #DC2626",
            }}
          >
            <img src={dangerIcon} alt="Danger" className="w-6 h-6" />
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-center text-secondary-grey400"
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "100%",
            verticalAlign: "middle",
          }}
        >
          Are you sure you want to terminate queue?
        </h3>

        {/* Description */}
        <p
          className="text-center text-secondary-grey300"
          style={{
            fontFamily: "Inter",
            fontWeight: 400,
            fontSize: "13px",
            lineHeight: "100%",
            verticalAlign: "middle",
          }}
        >
          Terminating Queue will cancel the booked appointments. Please Select
          Session and write reason below:
        </p>

        {/* Session Checklist - Slim full-width rows */}
        <div className="flex flex-col gap-1 w-full">
          <div
            onClick={() => handleSessionToggle("all")}
            className="flex items-center gap-2 px-2 h-[28px] bg-secondary-grey50 rounded cursor-pointer hover:bg-secondary-grey100 transition-colors w-full"
          >
            <Checkbox
              id="terminate-all"
              checked={isAllSelected}
              onCheckedChange={() => handleSessionToggle("all")}
              className="w-3.5 h-3.5 rounded-sm border-secondary-grey200 data-[state=checked]:bg-blue-primary250 data-[state=checked]:border-blue-primary250"
            />
            <span className="text-secondary-grey400 text-[13px]" style={{ fontFamily: "Inter" }}>
              All Sessions
            </span>
          </div>

          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSessionToggle(session.id)}
              className="flex items-center gap-2 px-2 h-[28px] bg-secondary-grey50 rounded cursor-pointer hover:bg-secondary-grey100 transition-colors w-full"
            >
              <Checkbox
                id={`terminate-${session.id}`}
                checked={selectedSessions.includes(session.id)}
                onCheckedChange={() => handleSessionToggle(session.id)}
                className="w-3.5 h-3.5 rounded-sm border-secondary-grey200 data-[state=checked]:bg-blue-primary250 data-[state=checked]:border-blue-primary250"
              />
              <span className="text-secondary-grey400 text-[13px]" style={{ fontFamily: "Inter" }}>
                {session.label}
              </span>
            </div>
          ))}
        </div>

        {/* Reason Input */}
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter Your Reason*"
          className="w-full p-2 border border-secondary-grey200 rounded-md outline-none focus:border-blue-primary250 transition-all resize-none"
          style={{
            height: "70px",
            fontFamily: "Inter",
            fontSize: "13px",
            backgroundColor: "#FAFAFA",
          }}
        />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            className="bg-monochrom-white text-secondary-grey400 hover:bg-secondary-grey50 flex-1"
            style={{
              height: "32px",
              borderRadius: "4px",
              padding: "8px",
              border: "0.5px solid #8E8E8E",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "120%",
              verticalAlign: "middle",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            disabled={isDisabled}
            className={
              !isDisabled
                ? "bg-blue-primary250 hover:bg-blue-primary300 flex-1"
                : "bg-secondary-grey50 cursor-not-allowed flex-1"
            }
            style={{
              height: "32px",
              borderRadius: "4px",
              padding: "8px",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "120%",
              verticalAlign: "middle",
              color: !isDisabled ? "#FFFFFF" : "#D6D6D6",
            }}
            onClick={handleConfirm}
          >
            {isSubmitting ? "Terminating…" : "Yes, Terminate"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TerminateQueueModal;
