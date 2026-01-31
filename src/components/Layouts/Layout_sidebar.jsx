import { Outlet } from "react-router-dom";
import Sidebar from "../../SuperAdmin/components/MainSidebar/Sidebar";
import Navbar from "../Navbar";

export default function Layout() {
  return (
    <div className="flex h-screen">
      {/* Fixed Sidebar */}
      <div className="fixed left-0 top-0 h-full z-[100]">
        <Sidebar className="w-64" />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 ml-[210px] max-w-[calc(100vw-210px)] overflow-x-hidden">
        {/* Fixed Navbar */}
        <div className="fixed top-0 right-0 left-[210px] z-[110] bg-white">
          <Navbar className="w-full" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 pt-12 overflow-auto no-scrollbar bg-secondary-grey50">
          <Outlet />
        </div>
      </div>
    </div>
  );
}