import React, { useEffect, useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Eye, Pencil, ChevronDown, Crown, ClipboardList } from 'lucide-react'
import AvatarCircle from '../../../components/AvatarCircle'
import { hospital, pencil, inviteUserIcon } from '../../../../public/index.js'
import useFrontDeskAuthStore from '../../../store/useFrontDeskAuthStore'
import useClinicStore from '../../../store/settings/useClinicStore'
import axiosClient from "../../../lib/axios"
import { fetchClinicStaff } from "../../../services/staffService"
import { fetchAllRoles } from "../../../services/rbac/roleService"
import { registerStaff } from "../../../services/staff/registerStaffService"
import InviteStaffDrawer from "../../../DoctorModule/Pages/Settings/Drawers/InviteStaffDrawer.jsx"
import RoleDrawerShared from "../../../DoctorModule/Pages/Settings/Drawers/RoleDrawer.jsx"
import SettingsHeader from './SettingsHeader'

const StaffUI = ({ useAuthStore = useFrontDeskAuthStore }) => {
  const TabBtn = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`px-[6px] py-1 text-[16px] md:text-sm rounded-md transition-colors ${active ? "text-blue-primary250 border-[0.5px] border-blue-primary150 bg-blue-primary50" : "text-secondary-grey300 hover:bg-[#F9FAFB] hover:text-[#424242]"}`}
    >
      {label}
    </button>
  );

  const CardSVG = ({ color = "#FDE68A" }) => (
    <svg viewBox="0 0 60 74" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" rx="8" ry="8" width="60" height="74" fill="#F7FAFF" stroke="#D7DDF8" />
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
      if (pos === "center") return { left: "50%", transform: "translate(-50%, -50%) scale(1)", zIndex: 30 };
      if (pos === "left") return { left: "30%", transform: "translate(-50%, -50%) scale(0.88)", zIndex: 20 };
      return { left: "70%", transform: "translate(-50%, -50%) scale(0.88)", zIndex: 20 };
    };
    return (
      <div className="relative w-[520px] max-w-[90vw] h-[180px]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-36 bg-[#EAF2FF] rounded-full" />
        {[0, 1, 2].map((i) => {
          const { pos } = positions(i);
          return (
            <div key={i} className={"absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out drop-shadow-sm rounded-lg bg-white ring-1 " + (pos === "center" ? "ring-[#BFD3FF]" : "ring-[#E6ECFF]")} style={{ width: pos === "center" ? 140 : 108, height: pos === "center" ? 172 : 134, ...styleFor(pos) }}><CardSVG color={colors[i]} /></div>
          );
        })}
      </div>
    );
  };

  const StaffRow = ({ data }) => (
    <div className="border-[0.5px] border-secondary-grey100 rounded-lg bg-white p-3 flex flex-col gap-2" style={{ width: "280px", minHeight: "228px" }}>
      <div className="flex items-start gap-2">
        <div className="w-12 h-12 rounded-full grid place-items-center text-blue-primary250 bg-blue-primary50 border-[0.5px] border-blue-primary150">
          <span className="text-[20px]">{data.name?.[0]?.toUpperCase() || "U"}</span>
        </div>
        <div className="flex-1">
          <div className="text-[16px] font-semibold text-secondary-grey400">{data.name}</div>
          <div className="text-[12px] text-secondary-grey300">{data.position}</div>
        </div>
      </div>
      <div className="text-[14px] text-secondary-grey300">
        <div className="flex justify-between py-1"><span>Role:</span><span className="text-right font-medium">{data.role}</span></div>
        <div className="flex justify-between py-1"><span>Contact Number:</span><span className="text-right font-medium">{data.phone || "-"}</span></div>
        <div className="flex justify-between py-1"><span>Last Active:</span><span className="text-right">-</span></div>
        <div className="flex justify-between py-1"><span>Joined:</span><span className="text-right font-medium">{data.joined || "-"}</span></div>
      </div>
      <div className="flex border-t pt-2 items-center gap-2">
        <button className="h-8 py-1 px-[6px] rounded-md border text-[12px] text-[#424242] hover:bg-gray-50 inline-flex items-center gap-1"><Eye size={14} /> View</button>
        <button className="h-8 py-1 px-[6px] rounded-md border text-[12px] text-[#424242] hover:bg-gray-50 inline-flex items-center gap-1"><img src={pencil} className="w-5" /> Edit</button>
        <div className="w-[0.5px] h-6 ml-1 bg-secondary-grey100"></div>
        <div className="ml-auto flex text-warning2-400 items-center bg-warning2-50 rounded-md">
          <button className="h-8 px-3 rounded-l-md text-[12px]">Inactive</button>
          <button className="h-5 px-2 mr-1 rounded-r-md py-1"><ChevronDown size={14} /></button>
        </div>
      </div>
    </div>
  );

  const RoleCard = ({ role }) => {
    const Icon = role.icon === "crown" ? Crown : ClipboardList;
    return (
      <div className="border border-[#E2E2E2] rounded-lg bg-white p-3 shadow-sm flex flex-col gap-2" style={{ borderWidth: "0.5px", width: "280px", minHeight: "180px" }}>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full grid place-items-center text-[#2F66F6] bg-white border border-[#DDE6FF]"><Icon size={16} /></div>
          <div className="flex-1">
            <div className="text-[15px] font-semibold text-secondary-grey400 leading-tight">{role.name}</div>
            <div className="text-[12px] text-secondary-grey300">{role.subtitle}</div>
          </div>
        </div>
        <div className="mt-2 flex flex-col gap-2 text-[13px] text-secondary-grey300">
          <div className="flex justify-between"><span>Staff Member:</span><span className="font-medium">{role.staffCount}</span></div>
          <div className="flex justify-between"><span>Total Permissions:</span><span className="font-medium">{role.permissions}</span></div>
          <div className="flex justify-between border-b pb-2"><span>Creation Date:</span><span className="font-medium">{role.created}</span></div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button className="h-7 rounded-md border text-[12px] hover:bg-gray-50 inline-flex items-center justify-center gap-1"><Eye size={14} /> View</button>
          <button className="h-7 rounded-md border text-[12px] hover:bg-gray-50 inline-flex items-center justify-center gap-1"><img src={pencil} className="w-[14px] h-[14px]" /> Edit</button>
        </div>
      </div>
    );
  };

  const [tab, setTab] = useState("staff");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();
  const { clinic } = useClinicStore();

  const resolveClinicId = () => user?.clinicId || user?.clinic?.id || clinic?.id || clinic?.clinicId;

  const loadData = async () => {
    const clinicId = resolveClinicId();
    if (!clinicId) return;
    setLoading(true);
    try {
      const [staffRes, rolesRes] = await Promise.all([
        fetchClinicStaff(clinicId),
        fetchAllRoles(clinicId)
      ]);
      setStaff((staffRes?.data || []).map(s => ({
        name: s.name, email: s.email, phone: s.phone, position: s.position, role: s.role, joined: s.joinedAt ? new Date(s.joinedAt).toLocaleDateString("en-GB") : ""
      })));
      setRoles((rolesRes?.data || []).map(r => ({
        id: r.id, name: r.name, subtitle: r.description || "", staffCount: r._count?.userRoles || 0, permissions: r.permissions?.length || 0, created: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-GB") : "", icon: /admin|super/i.test(r.name) ? "crown" : "clipboard"
      })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user, clinic]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex p-[2px] gap-2 bg-white rounded-md">
          <TabBtn label="Staff" active={tab === "staff"} onClick={() => setTab("staff")} />
          <TabBtn label="Roles & Permission" active={tab === "roles"} onClick={() => setTab("roles")} />
        </div>
        {tab === "staff" ? (
          <button onClick={() => setInviteOpen(true)} className="text-sm font-medium text-blue-primary250">+ Invite Staff</button>
        ) : (
          <button onClick={() => setRoleOpen(true)} className="text-sm font-medium text-[#2F66F6]">+ New Role</button>
        )}
      </div>

      {loading ? <div className="text-sm text-secondary-grey300">Loading...</div> : (
        tab === "staff" ? (
          staff.length === 0 ? (
            <div className="border border-[#E6E6E6] rounded-md bg-white min-h-[220px] flex flex-col items-center justify-center p-8 text-center gap-3">
              <AvatarCarousel />
              <p className="max-w-[560px] text-sm text-[#626060]">Staff will receive an email invitation to create their account</p>
              <button onClick={() => setInviteOpen(true)} className="text-sm font-medium text-[#2F66F6]">+ Invite Staff</button>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,280px)] gap-4 pt-1">
              {staff.map((s, i) => <StaffRow key={i} data={s} />)}
              <button onClick={() => setInviteOpen(true)} className="rounded-lg w-[280px] min-h-[228px] flex flex-col items-center justify-center gap-2 bg-white text-[#2F66F6] border border-dashed border-blue-primary250 hover:bg-[#F8FBFF]">
                <span className="w-10 h-10 rounded-full grid place-items-center bg-white border border-blue-primary150"><img src={inviteUserIcon} className="w-6 h-6" /></span>
                <span className="text-[12px] text-secondary-grey300">Invite More Users</span>
              </button>
            </div>
          )
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,280px)] gap-4 pt-1">
            {roles.map((r, i) => <RoleCard key={i} role={r} />)}
            <button onClick={() => setRoleOpen(true)} className="rounded-lg w-[280px] min-h-[180px] flex flex-col items-center justify-center gap-2 bg-white text-[#2F66F6] border border-dashed border-blue-primary250 hover:bg-[#F8FBFF]">
              <span className="w-12 h-12 rounded-full grid place-items-center border border-blue-primary150 bg-blue-primary50"><ShieldPlus className="w-6 h-6" /></span>
              <span className="text-[12px] text-secondary-grey300">Create New Role</span>
            </button>
          </div>
        )
      )}

      <InviteStaffDrawer
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        roleOptions={roles}
        onSend={async (rows) => {
          const clinicId = resolveClinicId();
          await Promise.all(rows.map(r => {
            const [f = "", l = ""] = String(r.fullName).split(" ");
            return registerStaff({ firstName: f, lastName: l, emailId: r.email, phone: r.phone, position: r.position, clinicId, roleId: r.roleId });
          }));
          loadData();
          setInviteOpen(false);
        }}
      />
      <RoleDrawerShared open={roleOpen} onClose={() => setRoleOpen(false)} onCreated={() => { loadData(); setRoleOpen(false); }} />
    </div>
  );
};

const ShieldPlus = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

export default function FDStaffPermissions({
  basePath = "/fd/settings",
  useAuthStore = useFrontDeskAuthStore
}) {
  const { user } = useAuthStore();
  return (
    <div className="bg-gray-50 min-h-full px-6 pb-10">
      <SettingsHeader name={user?.name}>
        <nav className="flex items-center gap-6 overflow-x-auto text-sm">
          <NavLink to={`${basePath}/clinics`} className={({ isActive }) => `pb-3 border-b-2 ${isActive ? 'border-blue-600 text-blue-primary250' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>Clinic Details</NavLink>
          <NavLink to={`${basePath}/consultation`} className={({ isActive }) => `pb-3 border-b-2 ${isActive ? 'border-blue-600 text-blue-primary250' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>Consultation Details</NavLink>
          <NavLink to={`${basePath}/staff-permissions`} className={({ isActive }) => `pb-3 border-b-2 ${isActive ? 'border-blue-600 text-blue-primary250' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>Staff Permissions</NavLink>
        </nav>
      </SettingsHeader>
      <div className="mt-6"><StaffUI useAuthStore={useAuthStore} /></div>
    </div>
  );
}
