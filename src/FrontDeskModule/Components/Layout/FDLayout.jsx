import { Outlet } from "react-router-dom";
import FDSidebar from "../FDSidebar";
import FDNavbar from "../FDNavbar";

export default function FDLayout() {
  return (
    <div className="flex h-screen">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full z-20">
        <FDSidebar className="w-64" />
      </div>

      {/* Main Content Area - Constrained to viewport minus sidebar */}
      <div className="flex flex-col flex-1 ml-[210px] max-w-[calc(100vw-210px)] overflow-x-hidden">
        {/* Fixed Navbar */}
        <div className="fixed top-0 right-0 left-[210px] z-30 bg-white">
          <FDNavbar className="w-full" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 pt-12 overflow-auto no-scrollbar">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
