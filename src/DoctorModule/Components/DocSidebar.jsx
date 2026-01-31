import React, { useEffect, useState, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Building2,
  Circle,
  CircleDot,
  Plus,
} from "lucide-react";
// Use icons from public/index.js (MainSidebar + Doctor module sidebar icons)
import {
  logo,
  // existing main sidebar icons (may still be used elsewhere)
  dashboardSelected,
  dashboardUnselect,
  doctorSelect,
  doctorUnselect,
  hospitalSelected,
  hospitalUnselect,
  patientUnselect,
  settingUnselect,
  // Doctor module sidebar icons (white/blue variants)
  calendarWhite,
  dashboardWhite,
  patientBlue,
  patientWhite,
  queueBlue,
  queueWhite,
  settingBlue,
  helpWhite,
} from "../../../public/index.js";
import AvatarCircle from "../../components/AvatarCircle";
import useDoctorAuthStore from "../../store/useDoctorAuthStore";
import useHospitalAuthStore from "../../store/useHospitalAuthStore";
import useClinicStore from "../../store/settings/useClinicStore";

const DocSidebar = () => {
  const location = useLocation();
  const isSettingsRoute = location.pathname.startsWith("/doc/settings");
  const [openSettings, setOpenSettings] = useState(isSettingsRoute);

  // Get doctor data
  const { user: doctorData } = useDoctorAuthStore();

  // Check for dual role
  const { roleNames: hospitalRoles } = useHospitalAuthStore();
  const isDualRole = hospitalRoles?.includes("HOSPITAL_ADMIN") && hospitalRoles?.includes("DOCTOR");

  // Switch account popover state
  const { selectedClinicId, setSelectedClinicId } = useClinicStore();
  const [showSwitch, setShowSwitch] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(selectedClinicId);
  const switchRef = useRef(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 });

  // Build accounts from API data
  const accounts = [];

  // Add clinic if available
  if (doctorData?.associatedWorkplaces?.clinic) {
    const clinic = doctorData.associatedWorkplaces.clinic;
    accounts.push({
      id: clinic.id,
      name: clinic.name,
      type: "Clinic",
      location: "",
      isSelf: true,
      color: "orange",
    });
  }

  // Add hospitals if available
  if (doctorData?.associatedWorkplaces?.hospitals?.length > 0) {
    doctorData.associatedWorkplaces.hospitals.forEach(hospital => {
      accounts.push({
        id: hospital.id,
        name: hospital.name,
        type: hospital.type === "HOSPITAL" ? "Hospital" : "Clinic",
        location: "",
        isSelf: false,
        color: "blue",
      });
    });
  }

  // Set default selected account if nothing is persisted
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      const firstAcc = accounts[0];
      setSelectedAccount(firstAcc.id);
      setSelectedClinicId(firstAcc.id, firstAcc.type);
    }
  }, [accounts.length, selectedAccount, setSelectedClinicId]);

  // Handle account switch
  const handleAccountSwitch = (id) => {
    const acc = accounts.find(a => a.id === id);
    setSelectedAccount(id);
    setSelectedClinicId(id, acc?.type);
    setShowSwitch(false);
  };

  // Get currently selected account details
  const currentAccount = accounts.find(acc => acc.id === selectedAccount) || accounts[0];

  useEffect(() => {
    // Auto open when user navigates to a settings page
    if (isSettingsRoute) setOpenSettings(true);
  }, [isSettingsRoute]);

  // Close popover on outside click / escape
  useEffect(() => {
    const onClick = (e) => {
      const clickedInsideTrigger =
        switchRef.current && switchRef.current.contains(e.target);
      const clickedInsidePopover =
        popoverRef.current && popoverRef.current.contains(e.target);
      if (showSwitch && !clickedInsideTrigger && !clickedInsidePopover) {
        setShowSwitch(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setShowSwitch(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showSwitch]);

  // Position popover directly under trigger, left-aligned with slight inset
  useEffect(() => {
    if (showSwitch && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const WIDTH = 320;
      const INSET_X = 2; // slight left inset
      const GAP_Y = 4; // small vertical gap
      let left = rect.left + INSET_X;
      let top = rect.bottom + GAP_Y;
      if (left + WIDTH > window.innerWidth - 8)
        left = window.innerWidth - WIDTH - 8;
      if (left < 8) left = 8;
      const EST_HEIGHT = 300;
      if (top + EST_HEIGHT > window.innerHeight - 8)
        top = Math.max(8, window.innerHeight - EST_HEIGHT - 8);
      setPopoverPos({ top, left });
    }
  }, [showSwitch]);

  // Sidebar menu items using blue icon when active, white otherwise
  const menuItems = [
    {
      name: "Dashboard",
      iconSelected: dashboardSelected,
      iconUnselected: dashboardWhite,
      path: "/doc",
      alt: "Dashboard",
    },
    {
      name: "Queue",
      iconSelected: queueBlue,
      iconUnselected: queueWhite,
      path: "/doc/queue",
      alt: "Queue",
    },
    {
      name: "Patients",
      iconSelected: patientBlue,
      iconUnselected: patientWhite,
      path: "/doc/patients",
      alt: "Patients",
    },
    {
      name: "Calendar",
      // Only white provided; use white for both states
      iconSelected: calendarWhite,
      iconUnselected: calendarWhite,
      path: "/doc/calendar",
      alt: "Calendar",
    },
    {
      name: "Settings",
      iconSelected: settingBlue,
      iconUnselected: settingUnselect, // fallback white/grey from previous set
      path: "/doc/settings",
      alt: "Settings",
    },
  ];

  const allSettingsSubItems = [
    { label: "My Account", to: "/doc/settings/account" },
    { label: "Consultation Details", to: "/doc/settings/consultation" },
    { label: "Clinics Details", to: "/doc/settings/clinics" },
    { label: "Staff Permissions", to: "/doc/settings/staff-permissions" },
    { label: "Security Settings", to: "/doc/settings/security" },
    { label: "Subscriptions/Billing", to: "/doc/settings/billing" },
  ];

  const settingsSubItems = isDualRole
    ? allSettingsSubItems.filter(item => ["/doc/settings/account", "/doc/settings/consultation"].includes(item.to))
    : allSettingsSubItems;

  return (
    <div className="sidebar flex flex-col justify-between min-h-screen w-[210px] bg-white border-r border-secondary-grey100/50">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="px-4 py-3">
          <img src={logo} alt="logo" className="w-[128px] h-auto" />
        </div>

        {/* Hospital/Clinic selector card (below logo) + Switch Account popover */}
        <div className="px-3 pb-2 mb-3 mt-2 relative" ref={switchRef}>
          <button
            type="button"
            onClick={() => setShowSwitch((v) => !v)}
            className={`w-full border-[0.5px] border-[#B8B8B8] rounded-md px-2 py-2 bg-white flex items-center gap-2 hover:bg-gray-50 ${showSwitch ? "ring-1 ring-[#2372EC]/30" : ""
              }`}
            ref={triggerRef}
            aria-haspopup="true"
            aria-expanded={showSwitch}
            disabled={accounts.length === 0}
          >
            <AvatarCircle
              name={currentAccount?.name || doctorData?.name || "Doctor"}
              size="s"
              color={currentAccount?.color || "orange"}
              icon={<Building2 size={14} />}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0 text-left">
              <div className="text-[13px] font-medium text-gray-900 truncate">
                {currentAccount?.name || "No workplace"}
              </div>
              <div className="text-[11px] text-gray-500 leading-tight">
                {currentAccount?.type || "—"}
              </div>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${showSwitch ? "rotate-180" : ""
                }`}
            />
          </button>

          {showSwitch && (
            <div
              ref={popoverRef}
              className="fixed z-[1000] rounded-md border border-[#D0D7E2] bg-white shadow-lg"
              style={{ top: popoverPos.top, left: popoverPos.left, width: 320 }}
              role="dialog"
              aria-label="Switch Account"
            >
              <div className="absolute -top-2 left-8 w-0 h-0 border-l-6 border-r-6 border-b-6 border-l-transparent border-r-transparent border-b-white" />
              <div className="px-3 pt-3 pb-2">
                <div className="text-[11px] font-semibold tracking-wide text-gray-600">
                  SWITCH ACCOUNT
                </div>
              </div>
              <div className="px-2 pb-2">
                {accounts.map((acc, i) => (
                  <React.Fragment key={acc.id}>
                    <button
                      type="button"
                      onClick={() => handleAccountSwitch(acc.id)}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded text-left ${selectedAccount === acc.id
                        ? "bg-[#F7FAFF] border border-blue-200"
                        : "hover:bg-gray-50"
                        }`}
                    >
                      {/* custom radio */}
                      <span
                        className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center ${selectedAccount === acc.id
                          ? "border-[#2372EC] bg-[#2372EC]"
                          : "border-gray-400 bg-white"
                          }`}
                      >
                        {selectedAccount === acc.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                      <span className="shrink-0 w-5 h-5 rounded-sm bg-[#F3F8FF] border border-[#BFD6FF] flex items-center justify-center">
                        <AvatarCircle
                          name={acc.name}
                          size="s"
                          color={acc.color}
                          icon={<Building2 size={14} />}
                          className="shrink-0"
                        />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-gray-700 truncate">
                          {acc.name}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate">
                          {acc.type}
                          {acc.location ? ` | ${acc.location}` : ""}
                        </div>
                      </div>
                      {acc.isSelf && (
                        <span className="ml-2 text-[14px]  px-1.5 py-0.5 rounded border border-green-300 bg-green-50 text-green-500 font-light">
                          Self
                        </span>
                      )}
                    </button>
                    {i === 0 && (
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-50 text-[#2372EC]"
                      >
                        <Plus size={16} />
                        <span className="text-[13px]">Add Branch</span>
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav>
          {menuItems.map((item) => {
            if (item.name !== "Settings") {
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === "/doc"}
                  className={({ isActive }) =>
                    `flex items-center gap-[6px] py-3 px-4 h-[44px] w-full text-left transition-colors ${isActive
                      ? "  bg-gradient-to-r from-[#2372EC] via-[#68A3FF] to-[#2373EC] hover:from-[#1760cd] hover:via-[#1760cd] hover:to-[#1760cd] text-white border-l-[3px] border-[#96BFFF] "
                      : "text-gray-800 hover:bg-gray-100"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <img
                        src={isActive ? item.iconSelected : item.iconUnselected}
                        alt={item.alt}
                        className="w-5 h-5"
                      />
                      <span className="font-normal text-sm">{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            }

            // Settings group (collapsible)
            return (
              <div key="Settings" className="">
                <button
                  type="button"
                  onClick={() => setOpenSettings((v) => !v)}
                  className={`w-full flex items-center justify-between py-3 px-4 h-[44px] transition-colors ${isSettingsRoute
                    ? "bg-[#2372EC] text-white border-l-[3px] border-[#96BFFF]"
                    : "text-gray-800 hover:bg-gray-100"
                    }`}
                >
                  <span className="inline-flex items-center gap-[6px]">
                    <img
                      src={isSettingsRoute ? settingBlue : settingUnselect}
                      alt="Settings"
                      className="w-5 h-5"
                    />
                    <span className="font-normal text-sm">Settings</span>
                  </span>
                  {openSettings ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                {openSettings && (
                  <div className="ml-5 pl-2 border-l border-gray-200">
                    {settingsSubItems.map((s) =>
                      s.subItems ? (
                        <div key={s.to}>
                          <NavLink
                            to={s.to}
                            className={({ isActive }) =>
                              `block text-sm px-3 py-2 my-[2px] rounded-sm ${isActive
                                ? "bg-blue-50 text-gray-900"
                                : "text-gray-700 hover:bg-gray-50"
                              }`
                            }
                          >
                            {s.label}
                          </NavLink>
                          <div className="ml-4">
                            {s.subItems.map((sub) => (
                              <NavLink
                                key={sub.to}
                                to={sub.to}
                                className={({ isActive }) =>
                                  `block text-xs px-3 py-1 my-[2px] rounded-sm ${isActive
                                    ? "bg-blue-100 text-gray-900"
                                    : "text-gray-700 hover:bg-gray-50"
                                  }`
                                }
                              >
                                {sub.label}
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <NavLink
                          key={s.to}
                          to={s.to}
                          className={({ isActive }) =>
                            `block text-sm px-3 py-2 my-[2px] rounded-sm ${isActive
                              ? "bg-blue-50 text-gray-900"
                              : "text-gray-700 hover:bg-gray-50"
                            }`
                          }
                        >
                          {s.label}
                        </NavLink>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="px-4 py-3 border-t border-[#D6D6D6] flex justify-between items-center text-[#626060]">
        <div className={`flex items-center gap-[6px] w-full text-left `}>
          <img src={helpWhite} alt="Help & Support" className="w-5 h-5" /> Help
          & Support
        </div>

        <div>
          <ArrowRight size={18} />
        </div>
      </div>
    </div>
  );
};

export default DocSidebar;
