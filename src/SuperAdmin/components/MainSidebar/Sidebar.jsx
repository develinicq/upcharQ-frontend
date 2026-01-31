import React from "react";
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

const Sidebar = () => {
  const location = useLocation();

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
      <div className="px-4 py-3 border-t border-[#D6D6D6] flex justify-between items-center text-[#626060]">
        <div
          className={`flex items-center gap-[6px] w-full text-left `}
        >
          <img src={helpCircle} alt="help-circle" /> Help & Support
        </div>

        <div>
           
          <img src={arrowRight} alt="arrow-right" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
