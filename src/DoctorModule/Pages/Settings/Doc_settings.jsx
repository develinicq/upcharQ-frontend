import React, { useEffect, useMemo, useState } from "react";
import {
  Phone,
  Mail,
  Trash2,
  ChevronDown,
  Eye,
  ClipboardList,
  Crown,
  Trophy,
} from "lucide-react";
import AvatarCircle from "../../../components/AvatarCircle";
import Badge from "../../../components/Badge";
import {
  cap,
  add,
  hospital,
  verifiedTick,
  inviteUserIcon,
  pencil,
  pdf_blue,
  experience,
  publication,
  award
} from "../../../../public/index.js";

import InputWithMeta from "../../../components/GeneralDrawer/InputWithMeta";

import Toggle from "../../../components/FormItems/Toggle";
import TimeInput from "../../../components/FormItems/TimeInput";
import { Checkbox } from "../../../components/ui/checkbox";
import MapLocation from "../../../components/FormItems/MapLocation";

import useProfileStore from "../../../store/settings/useProfileStore.js";
import usePracticeStore from "../../../store/settings/usePracticeStore.js";
import useEducationStore from "../../../store/settings/useEducationStore.js";
import useExperienceStore from "../../../store/settings/useExperienceStore.js";
import useAwardsPublicationsStore from "../../../store/settings/useAwardsPublicationsStore.js";
import useClinicStore from "../../../store/settings/useClinicStore.js";
import { fetchAllPermissions } from "../../../services/rbac/permissionService";
import { fetchAllRoles, createRole } from "../../../services/rbac/roleService";
import useDoctorAuthStore from "../../../store/useDoctorAuthStore";
import axiosClient from "../../../lib/axios";
import { fetchClinicStaff } from "../../../services/staffService";
import { registerStaff } from "../../../services/staff/registerStaffService";
import EditBasicInfoDrawer from "./Drawers/EditBasicInfoDrawer.jsx";
import AddEducationDrawer from "./Drawers/AddEducationDrawer.jsx";
import AddAwardDrawer from "./Drawers/AddAwardDrawer.jsx";
import AddPublicationDrawer from "./Drawers/AddPublicationDrawer.jsx";
import EditClinicDetailsDrawer from "./Drawers/EditClinicDetailsDrawer.jsx";
import ExperienceDrawerNew from "./Drawers/ExperienceDrawer.jsx";
import InviteStaffDrawer from "./Drawers/InviteStaffDrawer.jsx";
import RoleDrawerShared from "./Drawers/RoleDrawer.jsx";
import EditPracticeDetailsDrawer from "./Drawers/EditPracticeDetailsDrawer.jsx";
import SecurityTab from "./Tabs/SecurityTab.jsx";
import ConsultationTab from "./Tabs/ConsultationTab.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import useHospitalAuthStore from "../../../store/useHospitalAuthStore";
import { getPublicUrl } from "../../../services/uploadsService";

// Global drawer animation keyframes (used by all drawers in this page)
const DrawerKeyframes = () => (
  <style>{`
    @keyframes drawerIn { from { transform: translateX(100%); opacity: 0.6; } to { transform: translateX(0%); opacity: 1; } }
    @keyframes drawerOut { from { transform: translateX(0%); opacity: 1; } to { transform: translateX(100%); opacity: 0.6; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: .3; } }
    @keyframes fadeOut { from { opacity: .3; } to { opacity: 0; } }
  `}</style>
);

// A light-weight field renderer

// A light-weight field renderer
const InfoField = ({ label, value, right, className: Class }) => (
  <div
    className={`${Class} flex flex-col gap-1 text-[14px] border-b-[0.5px] pb-2 border-secondary-grey100`}
  >
    <div className="col-span-4  text-secondary-grey200">{label}</div>
    <div className="col-span-8 text-secondary-grey400 flex items-center justify-between">
      <span className="truncate">{value || "-"}</span>
      {right}
    </div>
  </div>
);

const SectionCard = ({
  title,
  subtitle,
  subo,
  Icon,
  onIconClick,
  headerRight,
  children,
}) => (
  <div className="px-4 py-3 flex flex-col gap-3 bg-white rounded-lg ">
    <div className="flex items-center justify-between">
      {/* LEFT */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-sm">
          <div className="font-medium text-[14px] text-gray-900">{title}</div>

          {subtitle && (
            <div className="px-1 border border-secondary-grey50 bg-secondary-grey50 rounded-sm text-[12px] text-gray-500 hover:border hover:border-blue-primary150 hover:text-blue-primary250 cursor-pointer">
              {subtitle}
            </div>
          )}
        </div>

        {subo && (
          <div className="flex gap-1 text-[12px] text-secondary-grey200">
            <span>{subo}</span>
            <span className="text-blue-primary250">Call Us</span>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3 shrink-0">
        {headerRight}

        {Icon && (
          <button
            onClick={onIconClick}
            className="p-1 text-gray-500 hover:bg-gray-50"
          >
            {typeof Icon === "string" ? (
              <img src={Icon} alt="icon" className="w-6 h-6" />
            ) : (
              <Icon className="w-6 h-6" />
            )}
          </button>
        )}
      </div>
    </div>

    <div>{children}</div>
  </div>
);

const ProfileItemCard = ({
  icon,
  title,
  badge,
  subtitle,
  date,
  location, // new optional line under date
  linkLabel,
  linkUrl,
  description, // new long text with See more toggle when no link
  initiallyExpanded = false,
  rightActions, // JSX slot (optional)
  // Optional inline edit-education control
  showEditEducation = false,
  editEducationIcon, // string URL or React component
  onEditEducationClick, // handler to open drawer
  editEducationAriaLabel = "Edit education",
}) => {
  const [expanded, setExpanded] = useState(!!initiallyExpanded);
  const MAX_CHARS = 220;
  const showSeeMore = !linkUrl && typeof description === 'string' && description.length > MAX_CHARS;
  const visibleText =
    !linkUrl && typeof description === 'string'
      ? expanded
        ? description
        : description.length > MAX_CHARS
          ? description.slice(0, MAX_CHARS).trimEnd() + '…'
          : description
      : '';
  return (
    <div className="flex  py-3 border-b rounded-md bg-white">
      {/* Icon */}
      <div className="w-[64px] mr-4 h-[64px] rounded-full border border-secondary-grey50 bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
        {typeof icon === "string" ? (
          <img src={icon} alt="" className="w-8 h-8 object-contain" />
        ) : (
          icon
        )}
      </div>

      {/* Content */}
      <div className="flex  flex-col gap-[2px] w-full">
        <div className="flex items-center justify-between">
          <div className="flex flex-shrink-0  items-center gap-1 text-sm text-secondary-grey400">
            <span className="font-semibold">{title}</span>
            {badge && (
              <span className="text-[12px]   min-w-[18px]  text-secondary-grey400 bg-secondary-grey50 rounded px-1 ">
                {badge}
              </span>
            )}
          </div>
          {showEditEducation && (

            <button
              type="button"
              onClick={onEditEducationClick}
              aria-label={editEducationAriaLabel}
              title={editEducationAriaLabel}
              className=" inline-flex items-center justify-center rounded hover:bg-secondary-grey50 text-secondary-grey300 mr-2"
            >
              {typeof editEducationIcon === "string" && editEducationIcon ? (
                <img src={editEducationIcon} alt="edit" className="w-6" />
              ) : editEducationIcon ? (
                React.createElement(editEducationIcon, { className: "w-6" })
              ) : (
                <img src={pencil} alt="edit" className="w-6" />
              )}
            </button>


          )}


        </div>

        {subtitle && <div className="text-sm text-secondary-grey400 w-4/5">{subtitle}</div>}

        {date && <div className="text-sm text-secondary-grey200">{date}</div>}
        {location && (
          <div className="text-sm text-secondary-grey200">{location}</div>
        )}

        {linkUrl ? (
          <div className="flex items-center gap-1">
            <img src={pdf_blue} alt="" className="w-4 h-4" />
            <a
              href={linkUrl}
              className="inline-flex items-center gap-1 text-sm text-blue-primary250"
              target="_blank"
              rel="noreferrer"
            >
              {linkLabel}
            </a>
          </div>
        ) : (
          description ? (
            <div className="mt-2">
              <div className="text-[13px] text-secondary-grey400">{visibleText}</div>
              {showSeeMore && (
                <button
                  type="button"
                  className="mt-1 text-[13px] text-secondary-grey200 inline-flex items-center gap-1 hover:text-secondary-grey300"
                  onClick={() => setExpanded((v) => !v)}
                >
                  {expanded ? 'See Less' : 'See More'}
                  <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          ) : null
        )}
      </div>

      {/* Right actions – render ONLY if provided */}
      {rightActions && (
        <div className="flex items-center gap-2">{rightActions}</div>
      )}
    </div>
  );
};

// Small helpers to format experience period and duration consistently
const formatMonthYear = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  if (isNaN(date)) return "-";
  // Custom month labels to match UI (use 'Sept')
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",
  ];
  const m = months[date.getMonth()] ?? date.toLocaleString("en-US", { month: "short" });
  const y = date.getFullYear();
  return `${m}, ${y}`; // e.g., Aug, 2014
};

// Compute precise diff in years, months, and days
const diffYearsMonthsDays = (start, end = new Date()) => {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e)) return null;
  // Normalize to avoid timezone drift
  const sY = s.getFullYear();
  const sM = s.getMonth();
  const sD = s.getDate();
  let y = e.getFullYear() - sY;
  let m = e.getMonth() - sM;
  let d = e.getDate() - sD;

  if (d < 0) {
    // Borrow days from previous month
    const prevMonth = new Date(e.getFullYear(), e.getMonth(), 0);
    d += prevMonth.getDate();
    m -= 1;
  }
  if (m < 0) {
    m += 12;
    y -= 1;
  }
  if (y < 0) y = 0;

  const totalMonths = y * 12 + m;
  return { years: y, months: m, days: d, totalMonths };
};

const formatExperienceRange = (startDate, endDate, isCurrent) => {
  if (!startDate) return "-";
  const start = formatMonthYear(startDate);
  const end = isCurrent || !endDate ? "Present" : formatMonthYear(endDate);
  // Duration
  const d = diffYearsMonthsDays(startDate, isCurrent || !endDate ? new Date() : new Date(endDate));
  let dur = "";
  if (d) {
    if (d.years >= 1) {
      // Show years and months when months > 0
      dur = d.months > 0 ? `${d.years} Yrs ${d.months} Mos` : `${d.years} Yrs`;
    } else if (d.totalMonths >= 1) {
      // Less than a year → show months
      dur = `${d.totalMonths} Mos`;
    } else {
      // Less than a month → show days (show 0 as 0 Days if same-day)
      dur = `${d.days} Days`;
    }
  }
  return `${start} - ${end} | ${dur}`;
};

// ======== Staff Permissions (copied inline; not linked) ========
const StaffTab = () => {
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
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");

  const { user, loading: docLoading, fetchMe } = useDoctorAuthStore();

  useEffect(() => {
    if (!user && !docLoading) {
      fetchMe?.();
    }
  }, [user, docLoading, fetchMe]);

  // Resolve clinicId dynamically from auth/profile stores
  const resolveClinicId = () => {
    try {
      const doctorDetails = user;
      console.log("[StaffTab] Auth store snapshot:", { user, doctorDetails });
      // Common places to find clinicId
      const fromUser =
        user?.clinicId ||
        user?.clinic?.id ||
        user?.currentClinicId ||
        user?.currentClinic?.id;
      const fromDoctor =
        doctorDetails?.clinicId ||
        doctorDetails?.clinic?.id ||
        doctorDetails?.currentClinicId ||
        doctorDetails?.currentClinic?.id ||
        doctorDetails?.primaryClinic?.id ||
        doctorDetails?.associatedWorkplaces?.clinic?.id; // from provided /doctors/me shape
      // Fallback from clinic store if loaded
      const maybeClinic = clinic?.id || clinic?.clinicId;
      // Last resort: persisted value
      const persisted = (() => {
        try {
          return (
            JSON.parse(localStorage.getItem("auth-store") || "{}")?.state?.user
              ?.clinicId || null
          );
        } catch {
          return null;
        }
      })();
      const resolved =
        fromUser || fromDoctor || maybeClinic || persisted || null;
      console.log("[StaffTab] Resolved clinicId:", resolved, {
        fromUser,
        fromDoctor,
        maybeClinic,
        persisted,
      });
      return resolved;
    } catch (e) {
      return null;
    }
  };

  // Fetch roles immediately when Settings opens and when auth changes
  useEffect(() => {
    let unsub;
    const loadRoles = async () => {
      // Prefer direct path from getMe response
      const doctorDetails = user;
      const clinicId =
        doctorDetails?.associatedWorkplaces?.clinic?.id || resolveClinicId();
      if (!clinicId) {
        console.warn("[StaffTab] No clinicId resolved; skipping roles fetch");
        return;
      }
      try {
        setRolesLoading(true);
        setRolesError("");
        const base = axiosClient?.defaults?.baseURL;
        const url = `${base}/rbac/all-roles?clinicId=${clinicId}`;
        console.log(
          "[StaffTab] Fetching roles for clinicId:",
          clinicId,
          "baseURL:",
          base,
          "url:",
          url
        );
        const data = await fetchAllRoles(clinicId);
        const list = data?.data || [];
        const mapped = list.map((r) => ({
          id: r.id,
          name: r.name,
          subtitle: r.description || "",
          staffCount: r._count?.userRoles || 0,
          permissions: Array.isArray(r.permissions) ? r.permissions.length : 0,
          created: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString()
            : "",
          icon: /senior|admin|super/i.test(r.name) ? "crown" : "clipboard",
        }));
        setRoles(mapped);
        setRolesLoading(false);
      } catch (e) {
        console.error("Failed to load roles", e);
        setRolesError(
          e?.response?.data?.message || e?.message || "Failed to load roles"
        );
        // Fallback: seed dummy roles so permissions UI remains usable
        const dummy = [
          { id: "role-frontdesk", name: "Front Desk", description: "Reception and queue ops", permissions: 8, _count: { userRoles: 3 }, createdAt: new Date().toISOString() },
          { id: "role-consultant", name: "Consultant", description: "Consultation management", permissions: 12, _count: { userRoles: 2 }, createdAt: new Date().toISOString() },
          { id: "role-admin", name: "Admin", description: "Administrative access", permissions: 20, _count: { userRoles: 1 }, createdAt: new Date().toISOString() }
        ];
        const mapped = dummy.map((r) => ({
          id: r.id,
          name: r.name,
          subtitle: r.description,
          staffCount: r._count?.userRoles || 0,
          permissions: r.permissions,
          created: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
          icon: /admin/i.test(r.name) ? "crown" : "clipboard",
        }));
        setRoles(mapped);
        setRolesLoading(false);
      }
    };
    // initial fetch on mount
    loadRoles();
    // subscribe to auth store for relevant changes (user/doctorDetails)
    try {
      unsub = useDoctorAuthStore.subscribe((state, prev) => {
        const changed =
          state.user !== prev.user;
        if (changed) {
          console.log(
            "[StaffTab] Auth store changed; re-evaluating clinicId and roles fetch"
          );
          loadRoles();
        }
      });
    } catch { }
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  // Fetch staff list for the clinic on mount and when auth changes
  useEffect(() => {
    let unsub;
    const loadStaff = async () => {
      const doctorDetails = user;
      const clinicId =
        doctorDetails?.associatedWorkplaces?.clinic?.id || resolveClinicId();
      if (!clinicId) {
        console.warn("[StaffTab] No clinicId resolved; skipping staff fetch");
        return;
      }
      try {
        console.log(
          "[StaffTab] Fetching staff for clinicId:",
          clinicId,
          "baseURL:",
          axiosClient?.defaults?.baseURL
        );
        const data = await fetchClinicStaff(clinicId);
        const list = data?.data || [];
        // Map API staff to UI StaffRow shape
        const mapped = list.map((s) => ({
          name: s.name,
          email: s.email,
          phone: s.phone,
          position: s.position,
          role: s.role,
          joined: (() => {
            const d = s.joinedAt || s.joinedDate || s.createdAt;
            return d ? new Date(d).toLocaleDateString("en-GB") : "";
          })(),
          status: "Active",
        }));
        setStaff(mapped);
      } catch (e) {
        console.error("Failed to load staff", e);
        // Fallback: seed dummy staff
        const dummy = [
          { name: "Anita Rao", email: "anita.rao@example.com", phone: "9876543210", position: "Receptionist", role: "Front Desk", joined: new Date().toLocaleDateString("en-GB"), status: "Active" },
          { name: "Karan Mehta", email: "karan.mehta@example.com", phone: "9812345678", position: "Nurse", role: "Consultant", joined: new Date().toLocaleDateString("en-GB"), status: "Active" },
          { name: "Sana Khan", email: "sana.khan@example.com", phone: "9890011223", position: "Assistant", role: "Admin", joined: new Date().toLocaleDateString("en-GB"), status: "Inactive" }
        ];
        setStaff(dummy);
      }
    };
    // initial fetch
    loadStaff();
    // subscribe to auth changes to refetch when doctorDetails is set
    try {
      unsub = useDoctorAuthStore.subscribe((state, prev) => {
        const changed =
          state.user !== prev.user;
        if (changed) loadStaff();
      });
    } catch { }
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, []);

  return (
    <div className="p-4 flex flex-col gap-3 no-scrollbar">
      <div className="flex items-center justify-between">
        <div className="flex p-[2px] gap-2 bg-white rounded-md">
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
          {rolesLoading && (
            <div className="col-span-full text-[12px] text-[#626060]">
              Loading roles…
            </div>
          )}
          {!!rolesError && (
            <div className="col-span-full text-[12px] text-red-600">
              Error: {rolesError}
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
        onSend={(rows) => {
          // Resolve clinicId
          const { user: doctorDetails } = useDoctorAuthStore.getState();
          const clinicId =
            doctorDetails?.associatedWorkplaces?.clinic?.id ||
            resolveClinicId();
          // Fire POST for each row
          Promise.all(
            rows.map(async (r) => {
              const [firstName = "", lastName = ""] =
                String(r.fullName || "").split(" ").length > 1
                  ? [
                    String(r.fullName).split(" ")[0],
                    String(r.fullName).split(" ").slice(1).join(" "),
                  ]
                  : [r.fullName || "", ""];
              const payload = {
                firstName,
                lastName,
                emailId: r.email,
                phone: r.phone,
                position: r.position,
                clinicId,
                roleId: r.roleId || null,
              };
              try {
                await registerStaff(payload);
              } catch (e) {
                console.error("Failed to register staff", payload, e);
              }
              const selectedRole = roles.find((x) => x.id === r.roleId);
              return {
                name: r.fullName,
                email: r.email,
                phone: r.phone,
                position: r.position,
                role: selectedRole?.name || "",
                status: "Inactive",
              };
            })
          ).then((created) => {
            setStaff((s) => [...created, ...s]);
            setInviteOpen(false);
          });
        }}
        roleOptions={roles}
      />
      <RoleDrawerShared
        open={roleOpen}
        onClose={() => setRoleOpen(false)}
        onCreated={(role) => {
          setRoles((r) => [role, ...r]);
          setRoleOpen(false);
        }}
      />
   
    </div>
  );
};

import BillingTab from "./Tabs/BillingTab";

const Doc_settings = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hospital Auth Store for role check
  const { roleNames: hospitalRoles } = useHospitalAuthStore();
  const isDualRole = hospitalRoles?.includes("HOSPITAL_ADMIN") && hospitalRoles?.includes("DOCTOR");



  // Grab global profile + actions from Zustand
  const { profile, fetchBasicInfo, updateBasicInfo } = useProfileStore();
  const { fetchMe, user: doctorDetails, loading: doctorLoading } =
    useDoctorAuthStore();

  // Education store
  const {
    education,
    fetchEducation,
    addEducation,
    updateEducation,
    deleteEducation,
  } = useEducationStore();

  // Experience store
  const {
    experiences,
    fetchExperiences,
    addExperience,
    updateExperience,
    deleteExperience,
  } = useExperienceStore();

  // Awards & Publications store
  const {
    awards,
    publications,
    fetchAwardsAndPublications,
    addAward,
    updateAward,
    deleteAward,
    addPublication,
    updatePublication,
    deletePublication,
  } = useAwardsPublicationsStore();

  // Practice store (professional details)
  const {
    medicalRegistration,
    practiceDetails,
    fetchProfessionalDetails,
    updatePracticeDetails,
  } = usePracticeStore();

  // Clinic store
  const { clinic, fetchClinicInfo, updateClinicInfo } = useClinicStore();

  // Tabs under Settings (as per screenshot)
  const allTabs = [
    { key: "personal", label: "Personal Info" },
    { key: "consultation", label: "Consultation Details" },
    { key: "clinical", label: "Clinical Details" },
    { key: "staff", label: "Staff Permissions" },
    { key: "security", label: "Security Settings" },
    { key: "billing", label: "Subscriptions/Billing" }
  ];

  const tabs = isDualRole
    ? allTabs.filter(t => ["personal", "consultation"].includes(t.key))
    : allTabs;

  const pathTab = useMemo(() => {
    const p = location.pathname;
    if (p.endsWith("/settings/account")) return "personal";
    if (p.endsWith("/settings/consultation")) return "consultation";
    if (p.endsWith("/settings/clinics")) return "clinical";
    if (p.endsWith("/settings/staff-permissions")) return "staff";
    if (p.startsWith("/doc/settings/security")) return "security";
    if (p.endsWith("/settings/billing")) return "billing";
    return "personal";
  }, [location.pathname]);

  const [activeTab, setActiveTab] = useState(pathTab);
  useEffect(() => {
    setActiveTab(pathTab);
  }, [pathTab]);

  const tabToPath = (key) => {
    const seg1 = location.pathname.split("/")[1] || "doc";
    const base = seg1 === "hospital" ? "/hospital" : "/doc";
    switch (key) {
      case "personal":
        return `${base}/settings/account`;
      case "consultation":
        return `${base}/settings/consultation`;
      case "clinical":
        return `${base}/settings/clinics`;
      case "staff":
        return `${base}/settings/staff-permissions`;
      case "security":
        return `${base}/settings/security`;
      case "billing":
        return `${base}/settings/billing`;
      default:
        return `${base}/settings/account`;
    }
  };

  const [basicOpen, setBasicOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);
  const [eduEditMode, setEduEditMode] = useState("add"); // 'add' or 'edit'
  const [eduEditData, setEduEditData] = useState(null); // holds education entry being edited
  const [expOpen, setExpOpen] = useState(false);
  const [expEditMode, setExpEditMode] = useState("add"); // 'add' or 'edit'
  const [expEditData, setExpEditData] = useState(null); // holds experience being edited
  const [awardOpen, setAwardOpen] = useState(false);
  const [awardEditMode, setAwardEditMode] = useState("add"); // 'add' or 'edit'
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [pubOpen, setPubOpen] = useState(false);
  const [pubEditMode, setPubEditMode] = useState("add");
  const [pubEditData, setPubEditData] = useState(null);
  // Ensure /doctors/me is fetched on Settings mount so clinicId is available for roles
  useEffect(() => {
    try {
      if (
        !doctorDetails &&
        !doctorLoading &&
        typeof fetchDoctorDetails === "function"
      ) {
        import("../../../services/authService")
          .then(({ getDoctorMe }) => {
            fetchDoctorDetails(getDoctorMe);
          })
          .catch(() => { });
      }
    } catch { }
  }, []);
  const [awardEditData, setAwardEditData] = useState(null); // holds award being edited
  // publication drawer state defined above; avoid duplicate declarations
  const [profOpen, setProfOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [clinicEditMode, setClinicEditMode] = useState(false);
  const [clinicDrawerOpen, setClinicDrawerOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Clinic form state
  const [clinicForm, setClinicForm] = useState({
    name: "",
    phone: "",
    email: "",
    establishmentDate: "",
    noOfBeds: "",
    about: "",
    blockNo: "",
    areaStreet: "",
    landmark: "",
    pincode: "",
    city: "",
    state: "",
  });

  // Update clinic form when clinic data is loaded
  useEffect(() => {
    if (clinic) {
      setClinicForm({
        name: clinic.name || "",
        phone: clinic.phone || "",
        email: clinic.email || "",
        establishmentDate: clinic.establishmentDate
          ? clinic.establishmentDate.split("T")[0]
          : "",
        noOfBeds: clinic.noOfBeds || "",
        about: clinic.about || "",
        blockNo: clinic.blockNo || "",
        areaStreet: clinic.areaStreet || "",
        landmark: clinic.landmark || "",
        pincode: clinic.pincode || "",
        city: clinic.city || "",
        state: clinic.state || "Maharashtra",
      });
    }
  }, [clinic]);

  useEffect(() => {
    // Fetch all settings data on component mount
    fetchBasicInfo().catch(() => {
      console.log("Error in fetch basic info");
    });

    fetchEducation().catch(() => {
      console.log("Error in fetch education");
    });

    fetchExperiences().catch(() => {
      console.log("Error in fetch experiences");
    });

    fetchAwardsAndPublications().catch(() => {
      console.log("Error in fetch awards and publications");
    });

    fetchProfessionalDetails().catch(() => {
      console.log("Error in fetch professional details");
    });

    fetchClinicInfo().catch(() => {
      console.log("Error in fetch clinic info");
    });
  }, [
    fetchBasicInfo,
    fetchEducation,
    fetchExperiences,
    fetchAwardsAndPublications,
    fetchProfessionalDetails,
    fetchClinicInfo,
  ]);

  const [resolvedClinicPhotos, setResolvedClinicPhotos] = useState([]);

  useEffect(() => {
    const resolvePhotos = async () => {
      if (!clinic) return;

      const photosToResolve = Array.isArray(clinic.clinicPhotos) && clinic.clinicPhotos.length > 0
        ? clinic.clinicPhotos
        : (clinic.image ? [clinic.image] : []);

      if (photosToResolve.length > 0) {
        try {
          const urls = await Promise.all(photosToResolve.map(key => getPublicUrl(key)));
          setResolvedClinicPhotos(urls.filter(Boolean));
        } catch (e) {
          console.error("Failed to resolve clinic photos", e);
        }
      } else {
        setResolvedClinicPhotos([]);
      }
    };
    resolvePhotos();
  }, [clinic]);
  if (!profile) {
    return (
      <div className="px-6 py-10 text-sm text-gray-600">Loading profile...</div>
    );
  }

  return (
    <div className="bg-gray-50 h-full">
      <DrawerKeyframes />
      {/* Top banner + centered avatar + tabs (as in screenshot) */}

      <div className="relative">
        <img src={hospital} alt="cover" className="w-full h-40 object-cover" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
          <div className="rounded-full ring-4 ring-white shadow-md">
            <AvatarCircle
              name={profile.basic?.name}
              size="l"
              color="blue"
              className="w-24 h-24 text-3xl"
            />
          </div>
        </div>
      </div>

      <div className="px-2 pt-10 border-b">
        <nav className="flex items-center gap-2 overflow-x-auto text-sm">
          {tabs.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  const next = t.key;
                  setActiveTab(next);
                  const dest = tabToPath(next);
                  if (location.pathname !== dest) navigate(dest);
                }}
                className={`whitespace-nowrap px-[6px] py-1 pb-2 border-b-2 transition-colors ${active
                  ? "border-blue-600 text-blue-primary250"
                  : "border-transparent text-secondary-grey300 hover:text-gray-900"
                  }`}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === "personal" ? (
        <div className="pt-6 px-4 grid grid-cols-12 gap-6 bg-secondary-grey50">
          {/* Left column */}
          <div className="col-span-12 xl:col-span-6 space-y-6">
            <SectionCard
              title="Basic Info"
              subtitle="Visible to Patient"
              Icon={pencil}
              onIconClick={() => setBasicOpen(true)}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-[14px] mb-4">
                  <InfoField
                    label="First Name"
                    value={profile.basic?.firstName}
                  />
                  <InfoField
                    label="Last Name"
                    value={profile.basic?.lastName}
                  />
                  <InfoField
                    label="Mobile Number"
                    value={profile.basic?.phone}
                    right={
                      <span className="inline-flex items-center text-success-300 border bg-success-100 border-success-300 py-0.5 px-1 rounded-md text-[12px]">
                        <img
                          src={verifiedTick}
                          alt="Verified"
                          className="w-3.5 h-3.5 mr-1"
                        />
                        Verified
                      </span>
                    }
                  />
                  <InfoField
                    label="Email"
                    value={profile.basic?.email}
                    right={
                      <span className="inline-flex items-center text-success-300 border bg-success-100 border-success-300 py-0.5 px-1 rounded-md text-[12px]">
                        <img
                          src={verifiedTick}
                          alt="Verified"
                          className="w-3.5 h-3.5 mr-1"
                        />
                        Verified
                      </span>
                    }
                  />
                  <InfoField
                    label="Gender"
                    value={
                      profile.basic?.gender?.charAt(0).toUpperCase() +
                      profile.basic?.gender?.slice(1).toLowerCase()
                    }
                  />

                  <InfoField
                    label="Language"
                    value={
                      Array.isArray(profile.basic?.languages) && profile.basic.languages.length > 0 ? (
                        <div className="flex gap-1">
                          {profile.basic.languages.map((lang, idx) => (
                            <span
                              key={`${lang}-${idx}`}
                              className="inline-flex items-center h-5 gap-2 px-[6px] rounded-[4px] bg-secondary-grey50 text-secondary-grey400"
                            >
                              <span className="text-[14px] text-secondary-grey400 inline-flex items-center">{lang}</span>
                              {/* removable button omitted in read-only view */}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-secondary-grey100 px-1">Select Language</span>
                      )
                    }
                  />
                  <InfoField label="City" value={profile.basic?.city} />
                  <InfoField label="Website" value={profile.basic?.website} />
                </div>

                <div className="flex flex-col gap-5">
                  <InfoField
                    label="Profile Headline"
                    value={profile.basic?.headline}
                  />
                  <InfoField label="About" value={profile.basic?.about} />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Educational Details"
              subtitle="Visible to Patient"
              Icon={add}
              onIconClick={() => setEduOpen(true)}
              subo="To Change your Graduation Details please"
            >
              <div className="space-y-3">
                {education.map((ed, idx) => (
                  <ProfileItemCard
                    key={ed.id || idx}
                    icon={cap}
                    title={`${ed.degree}${ed.fieldOfStudy ? ` in ${ed.fieldOfStudy}` : ""
                      }`}
                    badge={ed.graduationType}
                    subtitle={ed.instituteName}
                    date={`${ed.startYear} - ${ed.completionYear}`}
                    linkLabel="Degree_Certificate.pdf"
                    linkUrl={ed.proofDocumentUrl}
                    showEditEducation={true}
                    editEducationIcon={pencil}
                    onEditEducationClick={() => {
                      setEduEditData({
                        id: ed.id,
                        school: ed.instituteName,
                        gradType: ed.graduationType,
                        degree: ed.degree,
                        field: ed.fieldOfStudy || "",
                        start: ed.startYear?.toString() || "",
                        end: ed.completionYear?.toString() || "",
                        proof: ed.proofDocumentUrl || "",
                      });
                      setEduEditMode("edit");
                      setEduOpen(true);
                    }}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Awards & Publications"
              subtitle="Visible to Patient"
              Icon={add}
              onIconClick={() => setShowAddMenu((v) => !v)}
            >
              <div className="relative">
                {showAddMenu && (
                  <div className="absolute right-0 -top-2 mt-0.5 bg-white border border-gray-200 shadow-2xl rounded-md p-1 text-[13px] z-20">
                    <button
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 w-full text-left"
                      onClick={() => { setShowAddMenu(false); setAwardEditMode("add"); setAwardEditData(null); setAwardOpen(true); }}
                    >
                      <img src={award} alt="" className="w-4 h-4" /> Add Awards
                    </button>
                    <button
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 w-full text-left"

                      onClick={() => {
                        setShowAddMenu(false);
                        setPubEditMode("add");
                        setPubEditData(null);
                        setPubOpen(true);
                      }}
                    >
                      <img src={publication} alt="" className="w-4 h-4" /> Add Publications
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {Array.isArray(awards) &&
                  awards.map((aw) => (
                    <ProfileItemCard
                      key={aw.id}
                      icon={award}
                      title={aw.awardName}
                      subtitle={aw.issuerName}
                      date={formatMonthYear(aw.issueDate)}
                      linkLabel="Certificate ↗"
                      linkUrl={aw.awardUrl}
                      showEditEducation={true}
                      editEducationIcon={pencil}
                      onEditEducationClick={() => {
                        setAwardEditData(aw);
                        setAwardEditMode("edit");
                        setAwardOpen(true);
                      }}

                    />
                  ))}

                {Array.isArray(publications) &&
                  publications.map((pub) => (
                    <ProfileItemCard
                      key={pub.id}
                      icon={publication}
                      title={pub.title}
                      subtitle={pub.publisher || pub.associatedWith}
                      date={pub.publicationDate ? formatMonthYear(pub.publicationDate) : undefined}
                      linkLabel="Publication ↗"
                      linkUrl={pub.publicationUrl}
                      description={pub.description}
                      rightActions={
                        <button
                          onClick={() => {
                            setPubEditData(pub);
                            setPubEditMode("edit");
                            setPubOpen(true);
                          }}
                          className="text-gray-400 hover:text-blue-600 transition"
                          title="Edit"
                        >
                          <img src={pencil} alt="edit" className="w-4 h-4" />
                        </button>
                      }
                    />
                  ))}
              </div>
            </SectionCard>
          </div>

          {/* Right column */}
          <div className="col-span-12 xl:col-span-6 space-y-6">
            <SectionCard
              title="Professional Details"
              subtitle="Visible to Patient"
            >
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-12 gap-y-1 gap-x-6 text-[13px]">

                  <div className="col-span-12 text-[14px] text-secondary-grey400 font-semibold">
                    Medical Registration Details
                  </div>
                  <div className="relative col-span-12 mt-[0.7px] text-[12px] text-secondary-grey200 pb-2 mb-3">
                    To Change your MRN proof please{" "}
                    <a
                      className="text-blue-primary250"
                      href="#"
                      onClick={(e) => e.preventDefault()}
                    >
                      Call Us
                    </a>

                    <span className="absolute left-0 bottom-0 h-[0.5px] w-[50px] bg-blue-primary250" />
                  </div>


                  <div className="col-span-12 md:col-span-6 space-y-3 ">
                    <InfoField
                      label="Medical Council Registration Number"
                      value={
                        medicalRegistration?.medicalCouncilRegistrationNumber ||
                        "-"
                      }
                    />
                    <InfoField
                      label="Registration Year"
                      value={medicalRegistration?.registrationYear || "-"}
                    />
                  </div>
                  <div className="col-span-12 md:col-span-6 space-y-5">
                    <InfoField
                      label="Registration Council"
                      value={medicalRegistration?.registrationCouncil || "-"}
                    />

                    <InputWithMeta

                      imageUpload={true}
                      fileName={(() => {
                        const url = String(medicalRegistration?.proofDocumentUrl || "");
                        return url ? (url.split("/").pop() || "MRN Proof.pdf") : "MRN Proof.pdf";
                      })()}
                      onFileView={() => {
                        if (medicalRegistration?.proofDocumentUrl) {
                          window.open(medicalRegistration.proofDocumentUrl, "_blank");
                        }
                      }}
                      disabled={true}
                    />


                  </div>
                </div>

                <div className="grid grid-cols-12 gap-3 text-[13px]">
                  {/* Section title */}
                  <div className="relative col-span-12 text-[14px] text-gray-600 font-semibold flex items-center justify-between ">
                    <div className="col-span-12 text-[14px] text-secondary-grey400 font-semibold mb-3">
                      Practice Details
                    </div>
                    <span className="absolute left-0 bottom-0 h-[0.5px] w-[50px] bg-blue-primary250" />
                    <button
                      type="button"
                      onClick={() => setPracticeOpen(true)}
                      className="inline-flex items-center justify-center rounded hover:bg-secondary-grey50 text-secondary-grey300"
                      title="Edit Practice Details"
                      aria-label="Edit Practice Details"
                    >
                      <img src={pencil} alt="edit" className="w-7" />
                    </button>
                  </div>

                  {/* Content grid MUST span full width */}
                  <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                    <InfoField
                      label="Work Experience"
                      value={
                        practiceDetails?.workExperience
                          ? `${practiceDetails.workExperience} years`
                          : "-"
                      }
                    />

                    <InfoField
                      label="Medical Practice Type"
                      value={practiceDetails?.medicalPracticeType || "-"}
                    />

                    {/* Specialization */}
                    <div className="md:col-span-2">
                      <InfoField
                        label="Specialization"
                        value={
                          Array.isArray(practiceDetails?.specialties) &&
                            practiceDetails.specialties.length > 0 ? (
                            practiceDetails.specialties.map((spec, idx) => (
                              <span key={spec.id}>
                                {spec.specialtyName} (Exp: {spec.expYears}{" "}
                                years)
                                {idx < practiceDetails.specialties.length - 1 &&
                                  ", "}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">—</span>
                          )
                        }
                      />
                    </div>

                    {/* Practice Area */}
                    <div className="md:col-span-2">
                      <InfoField
                        label="Practice Area"
                        className="border-none"
                        value={
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {Array.isArray(practiceDetails?.practiceArea) &&
                              practiceDetails.practiceArea.length > 0 ? (
                              practiceDetails.practiceArea.map((a) => (
                                <Badge key={a} color="gray" size="s">
                                  {a}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-[12px] text-gray-600">
                                No details available
                              </span>
                            )}
                          </div>
                        }
                      />
                    </div>
                  </div>
                </div>


              </div>
            </SectionCard>

            <SectionCard
              title="Experience Details"
              subtitle="Visible to Patient"
              Icon={add}
              onIconClick={() => setExpOpen(true)}
            >
              <div className="space-y-3">
                {Array.isArray(experiences) &&
                  experiences.map((ex) => (
                    <ProfileItemCard
                      key={ex.id}
                      icon={experience}
                      title={ex.jobTitle}
                      badge={
                        ex.isCurrentlyWorking
                          ? 'Current'
                          : ex.employmentType
                      }
                      subtitle={ex.hospitalOrClinicName}
                      date={formatExperienceRange(ex.startDate, ex.endDate, ex.isCurrentlyWorking)}
                      showEditEducation={true}
                      editEducationIcon={pencil}
                      location={[ex.city, ex.state, ex.location]
                        .filter(Boolean)
                        .join(', ') || undefined}
                      description={ex.description}
                      onEditEducationClick={() => {
                        setExpEditData(ex);
                        setExpEditMode('edit');
                        setExpOpen(true);
                      }}

                    />
                  ))}
              </div>
            </SectionCard>
          </div>
        </div>








      ) : activeTab === "consultation" ? (
        <ConsultationTab />
      ) : activeTab === "clinical" ? (
        <div className="p-4 grid grid-cols-12 gap-4">
          {/* LEFT: Clinic Info */}
          <div className="col-span-12 xl:col-span-6">
            <SectionCard
              title="Clinic Info"
              subtitle="Visible to Patient"
              Icon={pencil}
              onIconClick={() => setClinicDrawerOpen(true)}
            >
              <div className="space-y-4 text-sm">
                {/* Clinic Name */}
                <InfoField
                  label="Clinic Name"
                  value={clinic?.name}
                  full
                  divider
                />

                {/* Mobile + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    label="Mobile Number"
                    value={clinic?.phone}
                    right={
                      <span className="inline-flex items-center text-green-600 border border-green-400 py-0.5 px-1 rounded-md text-[12px]">
                        <img
                          src={verifiedTick}
                          alt="Verified"
                          className="w-3.5 h-3.5 mr-1"
                        />
                        Verified
                      </span>
                    }
                  />

                  <InfoField
                    label="Email"
                    value={clinic?.email}
                    right={
                      <span className="inline-flex items-center text-green-600 border border-green-400 py-0.5 px-1 rounded-md text-[12px]">
                        <img
                          src={verifiedTick}
                          alt="Verified"
                          className="w-3.5 h-3.5 mr-1"
                        />
                        Verified
                      </span>
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Establishment Date */}
                  <InfoField
                    label="Establishment Date"
                    value={
                      clinic?.establishmentDate
                        ? new Date(clinic.establishmentDate).toLocaleDateString()
                        : "-"
                    }
                  />

                  <InputWithMeta
                    label="Establishment Proof"
                    imageUpload={true}
                    fileName={(() => {
                      const url = String(clinic?.proofDocumentUrl || "");
                      return url ? (url.split("/").pop() || "MRN Proof.pdf") : "Establishment.pdf";
                    })()}
                    onFileView={() => {
                      if (clinic?.proofDocumentUrl) {
                        window.open(clinic.proofDocumentUrl, "_blank");
                      }
                    }}
                    disabled={true}
                  />

                </div>

                {/* About */}
                <div>
                  <div className="text-[14px] text-secondary-grey200 mb-1">About</div>
                  <p className="text-sm text-secondary-grey400 leading-relaxed">
                    {clinic?.about || "-"}
                  </p>
                </div>

                {/* Clinic Photos */}
                <div>
                  <div className="text-[14px] text-secondary-grey200  mb-2">
                    Clinic Photos
                  </div>

                  <div className="flex gap-4 flex-wrap">
                    {resolvedClinicPhotos.length > 0 ? (
                      resolvedClinicPhotos.map((url, idx) => (
                        <div key={idx} className="w-[120px] h-[120px] rounded-md overflow-hidden border bg-gray-100">
                          <img
                            src={url}
                            alt={`Clinic ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      [1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-[120px] h-[120px] rounded-md overflow-hidden border bg-gray-100" />
                      ))
                    )}
                  </div>

                  <div className="mt-2 text-[11px] text-gray-400">
                    Support Size upto 2MB in .png, .jpg, .svg, .webp
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* RIGHT: Address */}
          <div className="col-span-12 xl:col-span-6">
            <SectionCard
              title="Clinic Address"
              subtitle="Visible to Patient"
              Icon={pencil}
              onIconClick={() => setClinicDrawerOpen(true)}
            >
              <div className="mb-3">
                <div className="text-[13px] text-gray-500 mb-1">
                  Map Location
                </div>
                <div className="h-[220px] rounded overflow-hidden border">
                  <MapLocation
                    heightClass="h-full"
                    initialPosition={[
                      parseFloat(clinic?.latitude) || 19.07,
                      parseFloat(clinic?.longitude) || 72.87,
                    ]}
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <InfoField
                  label="Block no./Shop no./House no."
                  value={clinic?.blockNo}
                />
                <InfoField
                  label="Road/Area/Street"
                  value={clinic?.areaStreet}
                />
                <InfoField label="Landmark" value={clinic?.landmark} />
                <InfoField label="Pincode" value={clinic?.pincode} />
                <InfoField label="City" value={clinic?.city} />
                <InfoField label="State" value={clinic?.state} />
              </div>
            </SectionCard>
          </div>
        </div>
      ) : activeTab === "staff" ? (
        <StaffTab />
      ) : activeTab === "billing" ? (
        <BillingTab />
      ) : (
        <SecurityTab />
      )}

      {/* Drawer: Edit Basic Info (shared component) */}
      <EditBasicInfoDrawer
        open={basicOpen}
        onClose={() => setBasicOpen(false)}
        initialData={{
          firstName: profile.basic?.firstName,
          lastName: profile.basic?.lastName,
          mobile: profile.basic?.phone,
          email: profile.basic?.email,
          gender: (() => {
            const g = profile.basic?.gender;
            return g ? g.charAt(0).toUpperCase() + g.slice(1).toLowerCase() : "";
          })(),
          city: profile.basic?.city,
          languages: profile.basic?.languages || [],
          website: profile.basic?.website,
          headline: profile.basic?.headline,
          about: profile.basic?.about,
        }}
        onSave={async () => {
          await fetchBasicInfo();
        }}
      />

      {/* Drawer: Education (shared) */}
      <AddEducationDrawer
        open={eduOpen}
        onClose={() => {
          setEduOpen(false);
          setEduEditData(null);
          setEduEditMode("add");
        }}
        initial={eduEditData}
        mode={eduEditMode}
        onSave={async () => {
          await fetchEducation();
        }}
      />

      {/* Drawer: Experience (new shared component) */}
      <ExperienceDrawerNew
        open={expOpen}
        onClose={() => {
          setExpOpen(false);
          setExpEditData(null);
          setExpEditMode("add");
        }}
        initial={expEditData}
        mode={expEditMode}
        onSave={async () => {
          await fetchExperiences();
        }}
      />

      {/* Drawer: Award (shared) */}
      <AddAwardDrawer
        open={awardOpen}
        onClose={() => {
          setAwardOpen(false);
          setAwardEditData(null);
          setAwardEditMode("add");
        }}
        initial={awardEditData}
        mode={awardEditMode}
        onSave={async () => {
          await fetchAwardsAndPublications();
        }}
      />

      {/* Drawer: Publication — uses AddPublicationDrawer above */}
      <AddPublicationDrawer
        open={pubOpen}
        onClose={() => {
          setPubOpen(false);
          setPubEditData(null);
          setPubEditMode("add");
        }}
        mode={pubEditMode}
        initial={pubEditData || {}}
        onSave={async () => {
          await fetchAwardsAndPublications();
        }}
      />


      {/* Drawer: Practice Details */}
      <EditPracticeDetailsDrawer
        open={practiceOpen}
        onClose={() => setPracticeOpen(false)}
        initial={practiceDetails}
        onSave={async () => {
          await fetchProfessionalDetails();
        }}
      />

      {/* Drawer: Clinic Details (unified) */}
      <EditClinicDetailsDrawer
        open={clinicDrawerOpen}
        onClose={() => setClinicDrawerOpen(false)}
        initial={{
          name: clinic?.name || "",
          phone: clinic?.phone || "",
          email: clinic?.email || "",
          establishmentDate: clinic?.establishmentDate || "",
          proof: clinic?.proof || clinic?.establishmentProof || "",
          noOfBeds: clinic?.noOfBeds || "",
          about: clinic?.about || "",
          clinicPhotos: Array.isArray(clinic?.clinicPhotos) && clinic.clinicPhotos.length > 0 ? clinic.clinicPhotos : (clinic?.image ? [clinic.image] : []),
          latitude: clinic?.latitude || null,
          longitude: clinic?.longitude || null,
          blockNo: clinic?.blockNo || "",
          areaStreet: clinic?.areaStreet || "",
          landmark: clinic?.landmark || "",
          pincode: clinic?.pincode || "",
          city: clinic?.city || "",
          state: clinic?.state || "Maharashtra",
        }}
        onSave={async () => {
          await fetchClinicInfo();
        }}
      />

      {/* Drawer: Invite Staff */}
      <InviteStaffDrawer
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSendInvite={async (rows) => {
          try {
            await Promise.all(
              rows.map((r) =>
                registerStaff({
                  name: r.name,
                  email: r.email,
                  phone: r.phone,
                  position: r.position,
                  role: r.role,
                  status: "Inactive",
                })
              )
            );
            // Optionally refresh staff list here
            setInviteOpen(false);
          } catch (err) {
            console.error("Failed to send invites:", err);
            alert("Failed to send invites");
          }
        }}
      />
    </div>
  );
};

export default Doc_settings;
