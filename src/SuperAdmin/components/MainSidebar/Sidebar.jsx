import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import BaseNavbar from "../../../components/Sidebar/BaseNavbar.jsx";
import {
  logo,
  dashboardSelected,
  dashboardUnselect,
  doctorSelect,
  doctorUnselect,
  hospitalSelected,
  hospitalUnselect,
  patientUnselect,
  settingUnselect,
  helpCircle,
  arrowRight
} from "../../../../public/index.js";
import HelpSupportDrawer from "../../components/HelpSupport/HelpSupportDrawer";
import RaiseQueryDrawer from "../../components/HelpSupport/RaiseQueryDrawer";

const Sidebar = () => {
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [showQueryDrawer, setShowQueryDrawer] = useState(false);
  const helpRef = useRef(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setShowHelp(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const menuItems = [
    {
      name: "Dashboard",
      iconSelected: dashboardSelected,
      iconUnselected: dashboardUnselect,
      path: "/dashboard",
      alt: "Dashboard",
    },
    {
      name: "Doctors",
      iconSelected: doctorSelect,
      iconUnselected: doctorUnselect,
      path: "/doctor",
      alt: "Doctors",
    },
    {
      name: "Hospitals",
      iconSelected: hospitalSelected,
      iconUnselected: hospitalUnselect,
      path: "/hospitals",
      alt: "Hospitals",
    },
    {
      name: "Patients",
      iconSelected: patientUnselect,
      iconUnselected: patientUnselect,
      path: "/patients",
      alt: "Patients",
    },
    {
      name: "Settings",
      iconSelected: settingUnselect,
      iconUnselected: settingUnselect,
      path: "/settings",
      alt: "Settings",
    },
  ];

  const isItemActive = (itemPath) => {
    const pathname = location.pathname || "";
    // Treat registration routes as part of Dashboard
    const dashboardLike = pathname.startsWith("/register/doctor") || pathname.startsWith("/register/hospital");

    if (itemPath === "/dashboard") {
      return pathname.startsWith("/dashboard") || dashboardLike;
    }
    if (itemPath === "/hospitals") {
      // Consider both list (/hospitals) and details (/hospital/:id) as active for this item
      return pathname.startsWith("/hospitals") || pathname.startsWith("/hospital/");
    }
    return pathname === itemPath || pathname.startsWith(itemPath + "/");
  };

  return (
    <div className="sidebar flex flex-col justify-between min-h-screen w-[210px] bg-white border-r border-secondary-grey100/50">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="px-4 py-3 h-16 w-full flex items-center">
          <img src={logo} alt="logo" className="w-[128px]" />
        </div>

        {/* Quick nav removed as requested */}

        {/* Menu Items using BaseNavbar */}
        <nav className="">
          {menuItems.map((item) => {
            const active = isItemActive(item.path);
            return (
              <Link key={item.name} to={item.path} className="block ">
                <BaseNavbar
                  title={item.name}
                  active={active}
                  iconSelected={item.iconSelected}
                  iconUnselected={item.iconUnselected}
                />
              </Link>
            );
          })}
        </nav>
      </div>



      {/* Bottom Section */}
      <div className="relative z-50" ref={helpRef}>
        {showHelp && (
          <div className="absolute bottom-0 left-[214px] mb-1.5 w-48 bg-white rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 z-50 p-1 flex flex-col ">
            <a
              href="#"
              className="flex items-center gap-2 px-3 py-2 text-[14px] text-gray-700 hover:bg-gray-50 rounded-md group transition-colors"
            >
              <img src="/icons/book-open.svg" alt="" className="w-4 h-4 opacity-70 group-hover:opacity-100 hidden" onError={(e) => e.target.style.display = 'none'} />
              {/* Fallback svg */}
              <svg width="16" height="16  " viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 ">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span className="flex-1 font-normal whitespace-nowrap">Upchar-Q Guide</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 ">
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
            </a>

            <button
              onClick={() => {
                setShowHelp(false);
                setShowHelpDrawer(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-gray-700 hover:bg-gray-50 rounded-md group transition-colors text-left"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-blue-600">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="4"></circle>
                <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
                <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
                <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
                <line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line>
                <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
              </svg>
              <span className="font-normal">Help & Support</span>
            </button>

            <button
              onClick={() => {
                setShowHelp(false);
                setShowQueryDrawer(true);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-gray-700 hover:bg-gray-50 rounded-md text-left group transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-blue-600">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              <span className="font-normal">Raise Queries</span>
            </button>

            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-[14px] text-gray-700 hover:bg-gray-50 rounded-md text-left group transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 group-hover:text-blue-600">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span className="font-normal">FAQ's</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full px-4 py-3 border-t border-[#D6D6D6] flex justify-between items-center text-[#626060] hover:bg-gray-50 transition-colors cursor-pointer outline-none"
        >
          <div
            className={`flex items-center gap-[6px] w-full text-left `}
          >
            <img src={helpCircle} alt="help-circle" /> Help & Support
          </div>

          <div className={`transition-transform duration-200 ${showHelp ? 'rotate-180' : ''}`}>
            <img src={arrowRight} alt="arrow-right" style={{ transform: showHelp ? 'rotate(-90deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>
        </button>
      </div>

      <HelpSupportDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
      />
      <RaiseQueryDrawer
        isOpen={showQueryDrawer}
        onClose={() => setShowQueryDrawer(false)}
      />
    </div>
  );
};

export default Sidebar;
