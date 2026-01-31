import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AvatarCircle from "../../../components/AvatarCircle";
import Button from "../../../components/Button";
import UniversalLoader from "../../../components/UniversalLoader";
import {
  ChevronsUpDown,
  User,
  Bed,
  CalendarClock,
  Calendar,
  UserX,
  Undo2,
  ChevronDown,
  Play,
} from "lucide-react";
import { arrowLeft, arrowRight } from "../../../../public/index.js";

// Dimensions for sticky columns (px)
const COL_W = {
  token: 64,
  patient: 200,
  actions: 90,
};

const rows = [
  {
    token: 1,
    name: "Rahul Sharma",
    gender: "M",
    dob: "12/05/1985",
    age: 39,
    apptType: "Review Visit",
    exptTime: "10:30 AM",
    bookingType: "Online",
    reason: "Fever & Weakness",
  },
  {
    token: 2,
    name: "Priya Mehta",
    gender: "F",
    dob: "08/09/1992",
    age: 31,
    apptType: "Follow-up Consultation",
    exptTime: "11:00 AM",
    bookingType: "Online",
    reason: "Annual Checkup",
  },
  {
    token: 3,
    name: "Arjun Verma",
    gender: "M",
    dob: "23/11/1987",
    age: 36,
    apptType: "New Consultation",
    exptTime: "11:45 AM",
    bookingType: "Online",
    reason: "Back Pain",
  },
  {
    token: 4,
    name: "Sneha Deshpande",
    gender: "F",
    dob: "14/07/1998",
    age: 25,
    apptType: "New Consultation",
    exptTime: "12:30 PM",
    bookingType: "Walk-In",
    reason: "Skin Allergy",
  },
  {
    token: 5,
    name: "Kunal Joshi",
    gender: "M",
    dob: "05/02/1976",
    age: 48,
    apptType: "Second Opinion",
    exptTime: "1:30 PM",
    bookingType: "Walk-In",
    reason: "High BP",
  },
  {
    token: 6,
    name: "Neha Iyer",
    gender: "F",
    dob: "30/10/1995",
    age: 28,
    apptType: "New Consultation",
    exptTime: "2:00 PM",
    bookingType: "Online",
    reason: "Migraine",
  },
  {
    token: 7,
    name: "Vikas Gupta",
    gender: "M",
    dob: "19/04/1983",
    age: 41,
    apptType: "Second Opinion",
    exptTime: "2:30 PM",
    bookingType: "Walk-In",
    reason: "Diabetes Check",
  },
  {
    token: 8,
    name: "Radhika Nair",
    gender: "F",
    dob: "06/01/1991",
    age: 33,
    apptType: "Review Visit",
    exptTime: "3:15 PM",
    bookingType: "Online",
    reason: "Pregnancy Consultation",
  },
  {
    token: 9,
    name: "Ankit Saxena",
    gender: "M",
    dob: "11/06/1989",
    age: 35,
    apptType: "Review Visit",
    exptTime: "4:15 PM",
    bookingType: "Online",
    reason: "Heartburn & Acidity",
  },
  {
    token: 10,
    name: "Pooja Kulkarni",
    gender: "F",
    dob: "15/08/1993",
    age: 30,
    apptType: "Second Opinion",
    exptTime: "4:45 PM",
    bookingType: "Online",
    reason: "Thyroid Checkup",
  },
  {
    token: 11,
    name: "Manish Choudhary",
    gender: "M",
    dob: "02/12/1986",
    age: 37,
    apptType: "Follow-up Consultation",
    exptTime: "5:45 PM",
    bookingType: "Walk-In",
    reason: "Anxiety & Stress",
  },
  {
    token: 12,
    name: "Kavita Rao",
    gender: "F",
    dob: "20/03/1980",
    age: 44,
    apptType: "New Consultation",
    exptTime: "6:15 PM",
    bookingType: "Walk-In",
    reason: "Menopause Symptoms",
  },
  {
    token: 13,
    name: "Rohan Agarwal",
    gender: "M",
    dob: "07/05/1994",
    age: 30,
    apptType: "Follow-up Consultation",
    exptTime: "10:15 AM",
    bookingType: "Online",
    reason: "Asthma",
  },
  {
    token: 14,
    name: "Deepika Singh",
    gender: "F",
    dob: "09/11/1987",
    age: 36,
    apptType: "Review Visit",
    exptTime: "11:00 AM",
    bookingType: "Walk-In",
    reason: "PCOD Treatment",
  },
  {
    token: 15,
    name: "Anirudh Patel",
    gender: "M",
    dob: "15/07/1982",
    age: 42,
    apptType: "Review Visit",
    exptTime: "12:15 PM",
    bookingType: "Online",
    reason: "Knee Pain",
  },
  {
    token: 16,
    name: "Swati Mishra",
    gender: "F",
    dob: "03/09/1990",
    age: 33,
    apptType: "Second Opinion",
    exptTime: "12:45 PM",
    bookingType: "Online",
    reason: "Eye Checkup",
  },
  {
    token: 17,
    name: "Harsh Vardhan",
    gender: "M",
    dob: "21/04/1988",
    age: 37,
    apptType: "Review Visit",
    exptTime: "1:30 PM",
    bookingType: "Online",
    reason: "Stomach Pain",
  },
  {
    token: 18,
    name: "Isha Kapoor",
    gender: "F",
    dob: "12/12/1991",
    age: 33,
    apptType: "New Consultation",
    exptTime: "2:00 PM",
    bookingType: "Walk-In",
    reason: "Allergy",
  },
  {
    token: 19,
    name: "Jatin Arora",
    gender: "M",
    dob: "10/10/1985",
    age: 39,
    apptType: "Follow-up Consultation",
    exptTime: "2:30 PM",
    bookingType: "Online",
    reason: "Cholesterol",
  },
  {
    token: 20,
    name: "Kritika Jain",
    gender: "F",
    dob: "05/05/1990",
    age: 35,
    apptType: "Second Opinion",
    exptTime: "3:00 PM",
    bookingType: "Online",
    reason: "Back Pain",
  },
  {
    token: 21,
    name: "Lokesh Gupta",
    gender: "M",
    dob: "18/07/1982",
    age: 43,
    apptType: "Review Visit",
    exptTime: "3:30 PM",
    bookingType: "Walk-In",
    reason: "Headache",
  },
  {
    token: 22,
    name: "Meera Nanda",
    gender: "F",
    dob: "22/08/1989",
    age: 36,
    apptType: "New Consultation",
    exptTime: "4:00 PM",
    bookingType: "Online",
    reason: "Anemia",
  },
  {
    token: 23,
    name: "Nikhil Sharma",
    gender: "M",
    dob: "30/01/1987",
    age: 38,
    apptType: "Follow-up Consultation",
    exptTime: "4:30 PM",
    bookingType: "Walk-In",
    reason: "Hypertension",
  },
  {
    token: 24,
    name: "Ojasvi Rao",
    gender: "F",
    dob: "14/02/1993",
    age: 32,
    apptType: "Second Opinion",
    exptTime: "5:00 PM",
    bookingType: "Online",
    reason: "PCOD",
  },
];

const QueueTable = ({
  onCheckIn,
  checkedInToken,
  checkedInTokens,
  checkingInTokens,
  items,
  removingToken,
  incomingToken,
  onRevokeCheckIn,
  onMarkNoShow,
  isMarkingNoShowState,
  allowSampleFallback = true,
  prescreeningEnabled = true,
  hideCheckIn = false,
  onStartSession,
  isStartingPatient,
  sessionStarted,
  activeFilter,
}) => {
  const [menuRow, setMenuRow] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    const close = () => {
      if (!isMarkingNoShowState) setMenuRow(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [isMarkingNoShowState]);


  // Normalize input rows: prefer items from parent (live queue), else fallback to local sample
  const data =
    Array.isArray(items) && items.length
      ? items.map((p) => {
        if (p.isSeparator) return p;
        return {
          id: p.id || p.appointmentId,
          token: p.token,
          name: p.patientName,
          gender: p.gender,
          dob: (p.age || "").split(" (")[0],
          age: parseInt(
            ((p.age || "").match(/\((\d+)Y\)/) || [])[1] || "0",
            10
          ),
          apptType: p.appointmentType,
          exptTime: p.expectedTime,
          startTime: p.startTime,
          endTime: p.endTime,
          bookingType: p.bookingType,
          reason: p.reasonForVisit,
        };
      })
      : allowSampleFallback
        ? rows
        : [];
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full min-h-0 flex flex-col">
      {/* Scroll area for the table content */}
      <div className="relative overflow-x-auto overflow-y-auto rounded-t-lg flex-1 min-h-0">
        <table className="min-w-full text-sm table-fixed border-separate border-spacing-0">
          <colgroup>
            <col style={{ width: COL_W.token }} />
            <col style={{ width: COL_W.patient }} />
            {activeFilter === "Engaged" ? (
              <>
                <col style={{ width: 140 }} /> {/* Appt. Type */}
                <col style={{ width: 120 }} /> {/* Start Time */}
                <col style={{ width: 120 }} /> {/* End Time */}
                <col style={{ width: 140 }} /> {/* Booking Type */}
                <col style={{ width: 430 }} /> {/* Reason For Visit */}
              </>
            ) : (
              <>
                <col style={{ width: 160 }} />
                <col style={{ width: 220 }} />
                <col style={{ width: 140 }} />
                <col style={{ width: 530 }} />
              </>
            )}
            <col style={{ width: COL_W.actions }} />
          </colgroup>

          <thead className="bg-white border-b border-gray-200 sticky top-0 z-20">
            <tr>
              <th
                className="px-3 py-2.5 text-center sticky left-0 z-30 bg-white border-r border-b border-gray-200"
                style={{
                  minWidth: COL_W.token,
                  width: COL_W.token,
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "120%",
                  color: "rgba(66, 66, 66, 1)",
                  verticalAlign: "middle",
                }}
              >
                T. No
              </th>
              <th
                className="px-3 py-2.5 text-left sticky z-20 bg-white border-r border-b border-gray-200"
                style={{
                  left: COL_W.token,
                  minWidth: COL_W.patient,
                  width: COL_W.patient,
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "120%",
                  color: "rgba(66, 66, 66, 1)",
                  verticalAlign: "middle",
                }}
              >
                <span className="inline-flex items-center gap-1">
                  Patient{" "}
                  <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />
                </span>
              </th>
              {activeFilter === "Engaged" ? (
                <>
                  <th
                    className="px-3 py-2.5 text-left border-r border-b border-gray-200"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "120%",
                      color: "rgba(66, 66, 66, 1)",
                      verticalAlign: "middle",
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      Appt. Type{" "}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />
                    </span>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left border-r border-b border-gray-200"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "120%",
                      color: "rgba(66, 66, 66, 1)",
                      verticalAlign: "middle",
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      Start Time{" "}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />
                    </span>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left border-r border-b border-gray-200"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "120%",
                      color: "rgba(66, 66, 66, 1)",
                      verticalAlign: "middle",
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      End Time{" "}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />
                    </span>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left border-r border-b border-gray-200"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "120%",
                      color: "rgba(66, 66, 66, 1)",
                      verticalAlign: "middle",
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      Booking Type{" "}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />
                    </span>
                  </th>
                </>
              ) : (
                <>
                  <th
                    className="px-3 py-2.5 text-left border-r border-b border-gray-200"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "120%",
                      color: "rgba(66, 66, 66, 1)",
                      verticalAlign: "middle",
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      Booking Type{" "}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />
                    </span>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left border-r border-b border-gray-200"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "120%",
                      color: "rgba(66, 66, 66, 1)",
                      verticalAlign: "middle",
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      Appt. Type{" "}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />
                    </span>
                  </th>
                  <th
                    className="px-3 py-2.5 text-left border-r border-b border-gray-200"
                    style={{
                      fontFamily: "Inter",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "120%",
                      color: "rgba(66, 66, 66, 1)",
                      verticalAlign: "middle",
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      Expt. Time{" "}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />
                    </span>
                  </th>
                </>
              )}
              <th
                className="px-3 py-2.5 text-left border-r border-b border-gray-200"
                style={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "120%",
                  color: "rgba(66, 66, 66, 1)",
                  verticalAlign: "middle",
                }}
              >
                Reason For Visit
              </th>
              <th
                className="px-3 py-2.5 text-left sticky right-0 z-30 bg-white border-l border-b border-gray-200"
                style={{
                  minWidth: COL_W.actions,
                  width: COL_W.actions,
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "120%",
                  color: "rgba(66, 66, 66, 1)",
                  verticalAlign: "middle",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No appointments for this filter.
                </td>
              </tr>
            )}
            {data.map((row, idx) => {
              if (row.isSeparator) {
                return (
                  <tr key={`sep-${idx}`} className="bg-gray-50/50">
                    <td
                      colSpan={7}
                      className="px-4 py-2 text-[13px] font-semibold text-gray-500 border-b border-gray-200"
                    >
                      {row.label}
                    </td>
                  </tr>
                );
              }
              return (
                <tr
                  key={row.token}
                  className={`group hover:bg-gray-50 ${removingToken === row.token ? "row-exit" : ""
                    } ${incomingToken === row.token ? "row-enter" : ""}`}
                >
                  {/* Token (sticky left) */}
                  <td
                    className="px-3 py-3 font-bold text-blue-600 text-lg text-center sticky left-0 z-10 bg-white group-hover:bg-gray-50 transition-colors border-r border-b border-gray-200"
                    style={{ minWidth: COL_W.token, width: COL_W.token }}
                  >
                    {row.token}
                  </td>

                  {/* Patient (sticky left after Token) */}
                  <td
                    className="px-3 py-3 sticky z-10 bg-white group-hover:bg-gray-50 transition-colors border-r border-b border-gray-200"
                    style={{
                      left: COL_W.token,
                      minWidth: COL_W.patient,
                      width: COL_W.patient,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <AvatarCircle name={row.name} size="s" />
                      <div className="leading-tight">
                        <div className="text-sm font-medium text-gray-900">
                          {row.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {row.gender} | {row.dob} ({row.age}Y)
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Middle scrollable columns */}
                  {activeFilter === "Engaged" ? (
                    <>
                      <td className="px-3 py-3 text-gray-900 border-r border-b border-gray-200">
                        {row.apptType || "—"}
                      </td>
                      <td className="px-3 py-3 text-gray-900 border-r border-b border-gray-200">
                        {row.startTime || "—"}
                      </td>
                      <td className="px-3 py-3 text-gray-900 border-r border-b border-gray-200">
                        {row.endTime || "—"}
                      </td>
                      <td className="px-3 py-3 text-gray-900 border-r border-b border-gray-200">
                        {row.bookingType || "—"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-3 text-gray-900 border-r border-b border-gray-200">
                        {row.bookingType || "—"}
                      </td>
                      <td className="px-3 py-3 text-gray-900 border-r border-b border-gray-200">
                        {row.apptType || "—"}
                      </td>
                      <td className="px-3 py-3 text-gray-900 border-r border-b border-gray-200">
                        {row.exptTime || "—"}
                      </td>
                    </>
                  )}
                  <td className="px-3 py-3 text-gray-900 border-r border-b border-gray-200">
                    {row.reason}
                  </td>

                  {/* Actions (sticky right) */}
                  <td
                    className="px-3 py-3 sticky right-0 z-20 bg-white group-hover:bg-gray-50 transition-colors border-l border-b border-gray-200"
                    style={{ minWidth: COL_W.actions, width: COL_W.actions }}
                  >
                    <div
                      className="relative flex items-center gap-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!hideCheckIn &&
                        (prescreeningEnabled ? (
                          checkedInTokens && checkedInTokens.has?.(row.token) ? (
                            <Button
                              size="large"
                              variant="primary"
                              className="h-9 py-0 text-sm w-full flex-1 shadow-lg whitespace-nowrap"
                              style={{
                                boxShadow: "0 4px 24px 0 rgba(37, 99, 235, 0.15)",
                              }}
                              onClick={() => onCheckIn(row)}
                            >
                              {checkingInTokens &&
                                checkingInTokens.has?.(row.token)
                                ? "Checking in…"
                                : "Add Pre-screening"}
                            </Button>
                          ) : (
                            <Button
                              size="large"
                              variant="secondary"
                              className="h-9 py-0 px-4 text-sm w-full flex-1 whitespace-nowrap"
                              disabled={
                                !!(
                                  checkingInTokens &&
                                  checkingInTokens.has?.(row.token)
                                )
                              }
                              onClick={() => onCheckIn(row)}
                            >
                              {checkingInTokens &&
                                checkingInTokens.has?.(row.token)
                                ? "Checking in…"
                                : "Check-In"}
                            </Button>
                          )
                        ) : (
                          <Button
                            size="large"
                            variant="secondary"
                            className="h-9 py-0 px-4 text-sm w-full flex-1 whitespace-nowrap"
                            disabled={
                              !!(
                                checkingInTokens &&
                                checkingInTokens.has?.(row.token)
                              )
                            }
                            onClick={() => onCheckIn(row)}
                          >
                            {checkingInTokens && checkingInTokens.has?.(row.token)
                              ? "Checking in…"
                              : "Check-In"}
                          </Button>
                        ))}
                      {/* 3-dots action */}
                      <button
                        type="button"
                        title="More"
                        aria-label="More actions"
                        className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus:outline-none focus:ring-0"
                        onClick={(e) => {
                          const width = 224; // w-56
                          const H = 280; // approx menu height
                          const rect = e.currentTarget.getBoundingClientRect();
                          let top = Math.round(rect.bottom + 8);
                          let left = Math.max(8, Math.round(rect.right - width));
                          const vw = window.innerWidth;
                          const vh = window.innerHeight;
                          if (left + width > vw - 8) left = vw - width - 8;
                          if (top + H > vh - 8)
                            top = Math.max(8, rect.top - H - 8); // flip up if near bottom
                          setMenuPos({ top, left });
                          setMenuRow((t) => (t === row.token ? null : row.token));
                        }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-hidden="true"
                        >
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM18 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>

                      {/* Manual Start Session Button */}
                      {sessionStarted && (
                        <button
                          type="button"
                          title="Start Session"
                          disabled={isStartingPatient === row.token}
                          onClick={() => onStartSession?.(row.token)}
                          className="shrink-0 h-9 w-9 inline-flex items-center justify-center rounded-md border border-blue-primary250 bg-blue-primary50 text-blue-primary250 hover:bg-blue-primary250 hover:text-white transition-all disabled:opacity-50"
                        >
                          {isStartingPatient === row.token ? (
                            <UniversalLoader size={14} className="text-blue-primary250" />
                          ) : (
                            <Play size={16} />
                          )}
                        </button>
                      )}

                      {/* Dropdown menu (fixed, bottom-left from trigger) */}
                      {menuRow === row.token &&
                        createPortal(
                          <div
                            className="fixed z-[9999]"
                            style={{ top: menuPos.top, left: menuPos.left }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="w-56 rounded-md border border-gray-200 bg-white shadow-lg">
                              <ul className="py-1 text-sm text-gray-700">
                                <li>
                                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    View Profile
                                  </button>
                                </li>
                                <li>
                                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2">
                                    <Bed className="w-4 h-4 text-gray-500" />
                                    Mark as Admitted
                                  </button>
                                </li>
                                <li>
                                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2">
                                    <CalendarClock className="w-4 h-4 text-gray-500" />
                                    Schedule Follow-up
                                  </button>
                                </li>
                                <li>
                                  <button className="w-full text-left px-3 py-2 hover:bg-gray-50 inline-flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    Reschedule
                                  </button>
                                </li>
                              </ul>
                              <div className="h-px bg-gray-200" />
                              <ul className="py-1 text-sm">
                                <li>
                                  <button
                                    disabled={isMarkingNoShowState}
                                    onClick={async (e) => {
                                      e.stopPropagation(); // prevent document click close
                                      if (onMarkNoShow) await onMarkNoShow(row);
                                      setMenuRow(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 inline-flex items-center gap-2 ${isMarkingNoShowState ? "opacity-50 cursor-not-allowed" : ""
                                      }`}
                                  >
                                    {isMarkingNoShowState ? (
                                      <div className="flex items-center gap-2">
                                        <UniversalLoader size={16} className="text-[#ef4444]" style={{ width: 'auto', height: 'auto' }} />
                                        <span>Marking...</span>
                                      </div>
                                    ) : (
                                      <>
                                        <UserX className="w-4 h-4" />
                                        Mark as No-Show
                                      </>
                                    )}
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => {
                                      onRevokeCheckIn?.(row.token);
                                      setMenuRow(null);
                                    }}
                                    className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 inline-flex items-center gap-2"
                                  >
                                    <Undo2 className="w-4 h-4" />
                                    Revoke Check-In
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>,
                          document.body
                        )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer pagination bar fixed within panel */}
      <div className="flex items-center justify-center border-t border-gray-200 bg-white rounded-b-lg sticky bottom-0 py-2 mt-4">
        <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-600">
          {/* Left Arrow */}
          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100">
            <img src={arrowLeft} alt="Previous" className="w-3 h-3" />
          </button>

          {/* Page numbers */}
          <button className="h-7 min-w-[28px] rounded border border-gray-300 bg-white px-2 text-gray-900">
            1
          </button>
          <button className="h-7 min-w-[28px] rounded px-2 hover:bg-gray-100">
            2
          </button>
          <button className="h-7 min-w-[28px] rounded px-2 hover:bg-gray-100">
            3
          </button>

          <span className="px-1">…</span>

          <button className="h-7 min-w-[28px] rounded px-2 hover:bg-gray-100">
            10
          </button>

          {/* Right Arrow */}
          <button className="flex h-7 w-7 items-center justify-center rounded hover:bg-gray-100">
            <img src={arrowRight} alt="Next" className="w-3 h-3" />
          </button>

          {/* Divider */}
          <span className="mx-1 h-5 w-px bg-gray-200" />

          {/* Page size selector */}
          <button className="flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm">
            10 / Page
            <ChevronDown size={14} />
          </button>

          {/* Go to page */}
          <button className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-500">
            Go to Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueTable;
