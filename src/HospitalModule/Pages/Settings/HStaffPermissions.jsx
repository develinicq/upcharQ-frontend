
import React, { useEffect, useState } from "react";
import {

  ChevronDown,
  Eye,
  ClipboardList,
  Crown,
  UserPlus
} from "lucide-react";

import {
  inviteUserIcon,
  pencil,
} from "../../../../public/index.js";


import { fetchAllRoles } from "../../../services/rbac/roleService";
import useAuthStore from "../../../store/useAuthStore";
import axiosClient from "../../../lib/axios";
import { fetchClinicStaff } from "../../../services/staffService";
import { registerStaff } from "../../../services/staff/registerStaffService";

import InviteStaffDrawer from "./Drawers/InviteStaffDrawer.jsx";
import RoleDrawer from "./Drawers/RoleDrawer.jsx";
import useClinicStore from "../../../store/settings/useClinicStore.js";
import useStaffStore from "../../../store/useStaffStore";

const HStaffPermissions = () => {
  const TabBtn = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={
        `px-[6px] py-1 text-[16px] md:text-sm rounded-md  transition-colors ` +
        (active
          ? "text-blue-primary250 border-[0.5px] border-blue-primary150 bg-blue-primary50"
          : "text-secondary-grey300 hover:bg-[#F9FAFB] hover:text-[#424242]")
      }
      aria-selected={active}
      role="tab"
    >
      {label}
    </button>
  );


  const CardSVG = ({ color = "#FDE68A" }) => (
    <svg viewBox="0 0 60 74" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="0"
        y="0"
        rx="8"
        ry="8"
        width="60"
        height="74"
        fill="#F7FAFF"
        stroke="#D7DDF8"
      />
      <circle cx="30" cy="22" r="10" fill={color} />
      <rect x="18" y="38" width="24" height="4" rx="2" fill="#9DB8FF" />
      <rect x="14" y="46" width="32" height="4" rx="2" fill="#C7D2FE" />
      <rect x="14" y="54" width="32" height="4" rx="2" fill="#E0E7FF" />
    </svg>
  );

  const AvatarCarousel = () => {
    const [active, setActive] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setActive((a) => (a + 1) % 3), 2600);
      return () => clearInterval(id);
    }, []);
    const colors = ["#FECACA", "#FDE68A", "#BFDBFE"];
    const positions = (i) => {
      const rel = (i - active + 3) % 3;
      if (rel === 0) return { pos: "center" };
      if (rel === 1) return { pos: "right" };
      return { pos: "left" };
    };
    const styleFor = (pos) => {
      switch (pos) {
        case "center":
          return {
            left: "50%",
            transform: "translate(-50%, -50%) scale(1)",
            zIndex: 30,
          };
        case "left":
          return {
            left: "30%",
            transform: "translate(-50%, -50%) scale(0.88)",
            zIndex: 20,
          };
        case "right":
          return {
            left: "70%",
            transform: "translate(-50%, -50%) scale(0.88)",
            zIndex: 20,
          };
        default:
          return {};
      }
    };
    return (
      <div className="relative w-[520px] max-w-[90vw] h-[180px]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-36 bg-[#EAF2FF] rounded-full" />
        {[0, 1, 2].map((i) => {
          const { pos } = positions(i);
          const center = pos === "center";
          return (
            <div
              key={i}
              className={
                "absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out drop-shadow-sm rounded-lg bg-white ring-1 " +
                (center ? "ring-[#BFD3FF]" : "ring-[#E6ECFF]")
              }
              style={{
                width: center ? 140 : 108,
                height: center ? 172 : 134,
                ...styleFor(pos),
              }}
            >
              <CardSVG color={colors[i]} />
            </div>
          );
        })}
      </div>
    );
  };

  const StaffRow = ({ data }) => (
    <div
      className="border-[0.5px] flex flex-col gap-2 border-secondary-grey100 rounded-lg bg-white p-3 "
      style={{ borderWidth: "0.5px", width: "280px", minHeight: "228px" }}
    >
      <div className="flex items-start gap-2">
        <div className="w-12 h-12 rounded-full grid place-items-center text-blue-primary250 bg-blue-primary50 border-[0.5px] border-blue-primary150">
          <span className="text-[20px]">
            {data.name?.[0]?.toUpperCase() || "U"}
          </span>
        </div>
        <div className="flex-1 ">
          <div className="text-[16px] font-semibold text-secondary-grey400">
            {data.name}
          </div>
          <div className="text-[12px] text-secondary-grey300">{data.position}</div>
        </div>
      </div>

      <div className="text-[14px] text-secondary-grey300">
        <div className="flex justify-between py-1">
          <span className="">Role:</span>
          <span className="text-right font-medium ">
            {data.role}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span>Contact Number:</span>
          <span className="text-right font-medium ">
            {data.phone || "-"}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span>Last Active:</span>
          <span className="text-right ">-</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Joined:</span>
          <span className="text-right font-medium ">
            {data.joined || "-"}
          </span>
        </div>
      </div>

      <div className="flex border-t pt-2 items-center gap-2">
        <button className="h-8 py-1 px-[6px] rounded-md border text-[12px] text-[#424242] hover:bg-gray-50 inline-flex items-center gap-1">
          <Eye size={14} /> View
        </button>
        <button className="h-8 py-1 px-[6px] rounded-md border text-[12px] text-[#424242] hover:bg-gray-50 inline-flex items-center gap-1">
          <img src={pencil} alt="Edit" className="w-5" /> Edit
        </button>
        <div className="w-[0.5px] h-6 ml-1 bg-secondary-grey100"></div>
        <div className="ml-auto flex text-warning2-400 items-center bg-warning2-50 rounded-md">
          <button className="h-8 px-3 rounded-l-md text-[12px] ">
            Inactive
          </button>

          <button className="h-5 px-2 mr-1 rounded-r-md py-1">
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  const RoleCard = ({ role }) => {
    const Icon = role.icon === "crown" ? Crown : ClipboardList;
    return (
      <div
        className="border border-[#E2E2E2] rounded-lg bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        style={{ borderWidth: "0.5px", width: "280px", minHeight: "180px" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full grid place-items-center text-[#2F66F6] bg-white border border-[#DDE6FF]">
            <Icon size={16} />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-secondary-grey400 leading-tight">
              {role.name}
            </div>
            <div className="text-[12px] text-secondary-grey300">{role.subtitle}</div>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-2 text-[13px] text-secondary-grey300">
          <div className="flex justify-between py-">
            <span>Staff Member:</span>
            <span className="font-medium ">
              {role.staffCount}
            </span>
          </div>
          <div className="flex justify-between py-">
            <span>Total Permissions:</span>
            <span className="font-medium ">
              {role.permissions}
            </span>
          </div>
          <div className="flex justify-between py- border-b pb-2">
            <span>Creation Date:</span>
            <span className="font-medium ">{role.created}</span>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button className="h-7 rounded-md border text-[12px]  hover:bg-gray-50 inline-flex items-center justify-center gap-1">
            <Eye size={14} /> View
          </button>
          <button className="h-7 rounded-md border text-[12px]  hover:bg-gray-50 inline-flex items-center justify-center gap-1">
            <img src={pencil} alt="Edit" className="w-[14px] h-[14px]" /> Edit
          </button>
        </div>
      </div>
    );
  };




  const [tab, setTab] = useState("staff");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  const { selectedClinicId } = useClinicStore();
  const {
    roles,
    staffList: staff,
    loadingRoles,
    loadingStaff,
    fetchRoles,
    fetchStaff
  } = useStaffStore();

  useEffect(() => {
    if (tab === "roles") fetchRoles({ hospitalId: selectedClinicId });
    if (tab === "staff") fetchStaff({ hospitalId: selectedClinicId });
  }, [tab, selectedClinicId, fetchRoles, fetchStaff]);

  const handleUpdate = () => {
    if (tab === "roles") fetchRoles({ hospitalId: selectedClinicId });
    if (tab === "staff") fetchStaff({ hospitalId: selectedClinicId });
  };

  return (
    <div className=" flex flex-col gap-3 no-scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex px-[2px] gap-2 bg-white rounded-md">
          <TabBtn
            label="Staff"
            active={tab === "staff"}
            onClick={() => setTab("staff")}
          />
          <TabBtn
            label="Roles & Permission"
            active={tab === "roles"}
            onClick={() => setTab("roles")}
          />
        </div>
        {tab === "staff" ? (
          <button
            onClick={() => setInviteOpen(true)}
            className="text-[16px] md:text-sm font-medium text-blue-primary250 hover:text-[#1e4cd8]"
          >
            <span> +  Invite Staff</span>
          </button>
        ) : (
          <button
            onClick={() => setRoleOpen(true)}
            className="text-[16px] md:text-sm font-medium text-[#2F66F6] hover:text-[#1e4cd8]"
          >
            + New Role
          </button>
        )}
      </div>

      {tab === "staff" ? (
        staff.length === 0 ? (
          <div className="border border-[#E6E6E6] rounded-md bg-white min-h-[220px] flex items-center justify-center">
            <div className="flex flex-col items-center text-center gap-3 py-8 px-4">
              <AvatarCarousel />
              <p className="max-w-[560px] text-xs md:text-sm text-[#626060]">
                Staff will receive an email invitation to create their account
                and set up Secure Account
              </p>
              <button
                onClick={() => setInviteOpen(true)}
                className="text-[13px] md:text-sm font-medium text-[#2F66F6] hover:text-[#1e4cd8]"
              >
                + Invite Staff
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,280px))] justify-start gap-4 pt-1">
            {staff.map((m, idx) => (
              <StaffRow key={idx} data={m} />
            ))}
            <button
              onClick={() => setInviteOpen(true)}
              className="rounded-lg w-[280px] min-h-[228px] flex items-center justify-center flex-col gap-2 bg-white text-[#2F66F6] border-[0.5px] border-dashed border-blue-primary250 hover:bg-[#F8FBFF] p-3"
            >
              <span className="w-10 h-10 rounded-full grid place-items-center bg-white border border-blue-primary150 text-[#2F66F6]">
                <img
                  src={inviteUserIcon}
                  alt="Invite User"
                  className="w-6 h-6"
                />
              </span>
              <span className="text-[12px] text-secondary-grey300">Invite More Users</span>
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,280px))] justify-start gap-4 pt-1">
          {loadingRoles && (
            <div className="col-span-full text-[12px] text-[#626060]">
              Loading roles…
            </div>
          )}
          {roles.map((role, i) => (
            <RoleCard key={i} role={role} />
          ))}
          <button
            onClick={() => setRoleOpen(true)}
            className="rounded-lg w-[280px] min-h-[180px] flex items-center justify-center flex-col gap-2 bg-white text-[#2F66F6] border-[0.5px] border-dashed border-blue-primary250 hover:bg-[#F8FBFF] p-3"
          >
            <span className="w-12 h-12 rounded-full grid place-items-center border border-blue-primary150 bg-blue-primary50 text-[#2F66F6]">
              <img src="/Doctor_module/settings/role.png" alt="" className="w-6 h-6" />
            </span>
            <span className="text-[12px] text-secondary-grey300">Create New Role</span>
          </button>
        </div>
      )}

      <InviteStaffDrawer
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSendInvite={handleUpdate}
        onSend={handleUpdate}
        roleOptions={roles}
      />
      <RoleDrawer
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        onCreated={handleUpdate}
      />
      {/* Drawer placeholders end for StaffTab */}
    </div>
  );
}

export default HStaffPermissions;
