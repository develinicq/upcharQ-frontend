import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  LifeBuoy,
  MessageSquarePlus,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  HelpCircle
} from "lucide-react";

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
} from "../../../../public/index.js";
import HelpSupportDrawer from "../../components/HelpSupport/HelpSupportDrawer";
import RaiseQueryDrawer from "../../components/HelpSupport/RaiseQueryDrawer";
import FAQDrawer from "../../components/HelpSupport/FAQDrawer";

const Sidebar = () => {
  const location = useLocation();

  // Drawer states
  const [helpOpen, setHelpOpen] = useState(false);
  const [queryOpen, setQueryOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  // Help Menu Popover state
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const helpTriggerRef = useRef(null);
  const helpPopoverRef = useRef(null);

  // Close help menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showHelpMenu &&
        helpTriggerRef.current &&
        !helpTriggerRef.current.contains(event.target) &&
        helpPopoverRef.current &&
        !helpPopoverRef.current.contains(event.target)
      ) {
        setShowHelpMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showHelpMenu]);

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
      <div className="relative z-50">
        {showHelpMenu && (
          <div
            ref={helpPopoverRef}
            className="absolute left-full bottom-4 ml-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
          >
            <div
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm text-gray-700"
              onClick={() => {
                window.open("https://upchar-q-guide.com", "_blank");
                setShowHelpMenu(false);
              }}
            >
              <BookOpen size={16} className="text-gray-500" />
              <span>Upchar-Q Guide</span>
              <ExternalLink size={14} className="ml-auto text-gray-400" />
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm text-gray-700"
              onClick={() => {
                setHelpOpen(true);
                setShowHelpMenu(false);
              }}
            >
              <LifeBuoy size={16} className="text-gray-500" />
              <span>Help & Support</span>
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm text-gray-700"
              onClick={() => {
                setQueryOpen(true);
                setShowHelpMenu(false);
              }}
            >
              <MessageSquarePlus size={16} className="text-gray-500" />
              <span>Raise Queries</span>
            </div>
            <div
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm text-gray-700"
              onClick={() => {
                setFaqOpen(true);
                setShowHelpMenu(false);
              }}
            >
              <HelpCircle size={16} className="text-gray-500" />
              <span>FAQ's</span>
            </div>
          </div>
        )}

        <div
          ref={helpTriggerRef}
          className="w-full px-4 py-3 border-t border-[#D6D6D6] flex justify-between items-center text-[#626060] hover:bg-gray-50 transition-colors cursor-pointer outline-none"
          onClick={() => setShowHelpMenu(!showHelpMenu)}
        >
          <div className={`flex items-center gap-[6px] w-full text-left `}>
            {/* Using Lucide HelpCircle instead of image for consistency if desired, or keep original looking text */}
            <img src="/icons/help-circle.svg" alt="" className="w-4 h-4 hidden" onError={(e) => e.target.style.display = 'none'} />
            <HelpCircle size={18} /> Help & Support
          </div>

          <div>
            {showHelpMenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        </div>
      </div>

      <HelpSupportDrawer
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
      />
      <RaiseQueryDrawer
        isOpen={queryOpen}
        onClose={() => setQueryOpen(false)}
      />
      <FAQDrawer
        isOpen={faqOpen}
        onClose={() => setFaqOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
