import React, { useState, useEffect } from "react";
import Badge from "../../../components/Badge";
import AvatarCircle from "../../../components/AvatarCircle";
import { Filter, MoreVertical } from "lucide-react";
import { getPatientMedicalHistoryForDoctor } from "../../../services/doctorService";
import useDoctorAuthStore from "../../../store/useDoctorAuthStore";
import AddMedicalHistoryDrawer from "./AddMedicalHistoryDrawer";

const SUB_TABS = [
  "Problems",
  "Conditions",
  "Allergies",
  "Immunizations",
  "Family History",
  "Social",
];

function SubTabs({ value, onChange }) {
  return (
    <div className="flex items-center gap-[4px] text-xs">
      {SUB_TABS.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`group flex items-center gap-[2px] p-1 rounded-md border text-nowrap ${value === t
            ? "bg-blue-50 text-blue-700 border-blue-200"
            : "text-gray-700 border-none hover:bg-gray-50"
            }`}
        >
          <img
            src={`/${t}.svg`}
            alt={`${t} icon`}
            width={16}
            height={16}
            className=""
          />
          {t}
        </button>
      ))}
    </div>
  );
}

function statusColor(s) {
  const status = (s || "").toUpperCase();
  if (status === "RESOLVED" || status === "COMPLETED" || status === "MANAGED" || status === "ALIVE") return "green";
  if (status === "ACTIVE" || status === "CURRENT") return "red";
  if (status === "FORMER" || status === "DECEASED") return "gray";
  if (
    status === "PENDING" ||
    status === "INACTIVE" ||
    status === "IN-ACTIVE" ||
    status === "ENTERED IN ERROR" ||
    status === "HISTORICAL"
  )
    return "yellow";
  return "gray";
}

function severityColor(s) {
  const sev = (s || "").toUpperCase();
  if (sev === "SEVERE" || sev === "HIGH") return "red";
  if (sev === "MODERATE") return "yellow";
  if (sev === "LOW" || sev === "MILD") return "gray";
  return "gray";
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB");
  } catch (e) {
    return "-";
  }
}

function formatSentenceCase(s) {
  if (!s) return "-";
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function ProblemsTable({ rows, onAdd }) {
  const { user: doctorDetails } = useDoctorAuthStore();
  if (!rows || rows.length === 0) return <NoData category="Problems" onAdd={onAdd} />;
  return (
    <table className="min-w-full border-t-[0.5px] border-b-[0.5px] border-[#D6D6D6]">
      <thead className="border-b border-[#D6D6D6]">
        <tr className="h-[32px]">
          {["Problem", "Since", "Severity", "Status", "Created by", ""].map((h, i) => (
            <th key={i} className={`px-[8px] font-inter font-medium text-sm leading-[120%] tracking-normal text-left text-[#424242]`}>
              <div className="flex items-center">
                <div>{h}</div>
                {h && <img src="/Action Button.svg" alt="sort" width={24} height={24} />}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const docName = r.createdBy || r.doctorName || r.doctor?.name || doctorDetails?.name || "-";
          return (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-[8px] py-2 text-sm text-[#424242]">{r.problemName || "-"}</td>
              <td className="px-[8px] py-2 text-sm text-[#424242]">{formatDate(r.onsetDate)}</td>
              <td className="px-[8px] py-2">
                <Badge size="s" type="ghost" color={severityColor(r.severity)}>{formatSentenceCase(r.severity)}</Badge>
              </td>
              <td className="px-[8px] py-2">
                <Badge size="s" type="ghost" color={statusColor(r.status)}>{formatSentenceCase(r.status)}</Badge>
              </td>
              <td className="px-[8px] py-2">
                <div className="flex items-center gap-2">
                  <AvatarCircle name={docName !== "-" ? docName : "Dr"} size="s" />
                  <span className="text-sm text-[#424242]">{docName}</span>
                </div>
              </td>
              <td className="px-[8px] py-2 text-right">
                <button className="p-1.5 rounded hover:bg-gray-100"><MoreVertical className="h-4 w-4 text-gray-600" /></button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ConditionsTable({ rows, onAdd }) {
  const { user: doctorDetails } = useDoctorAuthStore();
  if (!rows || rows.length === 0) return <NoData category="Conditions" onAdd={onAdd} />;
  return (
    <table className="min-w-full border-t-[0.5px] border-b-[0.5px] border-[#D6D6D6] mt-2">
      <thead className="border-b border-[#D6D6D6]">
        <tr className="h-[32px]">
          {["Condition", "Onset Date", "Severity", "Type", "Status", "Created by", ""].map((h, i) => (
            <th key={i} className="px-[8px] text-sm font-medium text-left text-[#424242]">
              <div className="flex items-center">
                <div>{h}</div>
                {h && <img src="/Action Button.svg" alt="sort" width={24} height={24} />}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const docName = r.createdBy || r.doctorName || r.doctor?.name || doctorDetails?.name || "-";
          return (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-[8px] py-2 text-sm text-[#424242]">{r.conditionName || "-"}</td>
              <td className="px-[8px] py-2 text-sm text-[#424242]">{formatDate(r.onsetDate)}</td>
              <td className="px-[8px] py-2">
                <Badge size="s" type="ghost" color={severityColor(r.severity)}>{formatSentenceCase(r.severity)}</Badge>
              </td>
              <td className="px-[8px] py-2 text-sm text-[#424242]">{formatSentenceCase(r.type || r.category)}</td>
              <td className="px-[8px] py-2">
                <Badge size="s" type="ghost" color={statusColor(r.status)}>{formatSentenceCase(r.status)}</Badge>
              </td>
              <td className="px-[8px] py-2">
                <div className="flex items-center gap-2">
                  <AvatarCircle name={docName !== "-" ? docName : "Dr"} size="s" />
                  <span className="text-sm text-[#424242]">{docName}</span>
                </div>
              </td>
              <td className="px-[8px] py-2 text-right">
                <button className="p-1.5 rounded hover:bg-gray-100"><MoreVertical className="h-4 w-4 text-gray-600" /></button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function AllergiesTable({ rows, onAdd }) {
  const { user: doctorDetails } = useDoctorAuthStore();
  if (!rows || rows.length === 0) return <NoData category="Allergies" onAdd={onAdd} />;
  return (
    <table className="min-w-full border-t-[0.5px] border-b-[0.5px] border-[#D6D6D6] mt-2">
      <thead className="border-b border-[#D6D6D6]">
        <tr className="h-[32px]">
          {["Allergen", "Reaction", "Since", "Severity", "Type", "Status", "Created by", ""].map((h, i) => (
            <th key={i} className="px-[8px] text-sm font-medium text-left text-[#424242]">
              <div className="flex items-center">
                <div>{h}</div>
                {h && <img src="/Action Button.svg" alt="sort" width={24} height={24} />}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const docName = r.createdBy || r.doctorName || r.doctor?.name || doctorDetails?.name || "-";
          return (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-[8px] py-2 text-sm text-[#424242]">{r.allergen || "-"}</td>
              <td className="px-[8px] py-2 text-sm text-[#424242] max-w-[150px] truncate">{r.reactions?.join(", ") || r.notes || "-"}</td>
              <td className="px-[8px] py-2 text-sm text-[#424242]">{formatDate(r.onsetDate)}</td>
              <td className="px-[8px] py-2">
                <Badge size="s" type="ghost" color={severityColor(r.severity)}>{formatSentenceCase(r.severity)}</Badge>
              </td>
              <td className="px-[8px] py-2 text-sm text-[#424242]">{formatSentenceCase(r.allergyType)}</td>
              <td className="px-[8px] py-2">
                <Badge size="s" type="ghost" color={statusColor(r.status)}>{formatSentenceCase(r.status)}</Badge>
              </td>
              <td className="px-[8px] py-2">
                <div className="flex items-center gap-2">
                  <AvatarCircle name={docName !== "-" ? docName : "Dr"} size="s" />
                  <span className="text-sm text-[#424242]">{docName}</span>
                </div>
              </td>
              <td className="px-[8px] py-2 text-right">
                <button className="p-1.5 rounded hover:bg-gray-100"><MoreVertical className="h-4 w-4 text-gray-600" /></button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ImmunizationsTable({ rows, onAdd }) {
  const { user: doctorDetails } = useDoctorAuthStore();
  if (!rows || rows.length === 0) return <NoData category="Immunizations" onAdd={onAdd} />;
  return (
    <table className="min-w-full border-t-[0.5px] border-b-[0.5px] border-[#D6D6D6] mt-2">
      <thead className="border-b border-[#D6D6D6]">
        <tr className="h-[32px]">
          {["Vaccine Name", "Date", "Dose", "Note", "Doctor", ""].map((h, i) => (
            <th key={i} className="px-[8px] text-sm font-medium text-left text-[#424242]">
              <div className="flex items-center">
                <div>{h}</div>
                {h && <img src="/Action Button.svg" alt="sort" width={24} height={24} />}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const docName = r.createdBy || r.doctorName || r.doctor?.name || doctorDetails?.name || "-";
          return (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="px-[8px] py-3 text-sm text-[#424242]">{r.vaccineName || "-"}</td>
              <td className="px-[8px] py-3 text-sm text-[#424242]">{formatDate(r.dateAdministered)}</td>
              <td className="px-[8px] py-3 text-sm text-[#424242]">{r.doseNumber || "-"}</td>
              <td className="px-[8px] py-3 text-sm text-gray-500">{formatSentenceCase(r.notes)}</td>
              <td className="px-[8px] py-3">
                <div className="flex items-center gap-2">
                  <AvatarCircle name={docName !== "-" ? docName : "Dr"} size="s" />
                  <span className="text-sm text-[#424242]">{docName}</span>
                </div>
              </td>
              <td className="px-[8px] py-3 text-right">
                <button className="p-1.5 rounded hover:bg-gray-100"><MoreVertical className="h-4 w-4 text-gray-600" /></button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function FamilyHistoryTable({ rows, onAdd }) {
  const { user: doctorDetails } = useDoctorAuthStore();
  if (!rows || rows.length === 0) return <NoData category="Family History" onAdd={onAdd} />;
  return (
    <table className="min-w-full border-t-[0.5px] border-b-[0.5px] border-[#D6D6D6] mt-2">
      <thead className="border-b border-[#D6D6D6]">
        <tr className="h-[32px]">
          {["Relationship", "Condition", "Onset Age", "Status", "Created by", ""].map((h, i) => (
            <th key={i} className="px-[8px] text-sm font-medium text-left text-[#424242]">
              <div className="flex items-center">
                <div className="text-nowrap">{h}</div>
                {h && <img src="/Action Button.svg" alt="sort" width={24} height={24} />}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const docName = r.createdBy || r.doctorName || r.doctor?.name || doctorDetails?.name || "-";
          return (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 text-sm text-[#424242]">
              <td className="px-[8px] py-3 font-medium">{r.relationship ? (r.relationship.charAt(0) + r.relationship.slice(1).toLowerCase()) : "-"}</td>
              <td className="px-[8px] py-3">{r.condition || "-"}</td>
              <td className="px-[8px] py-3">{r.ageOfOnset || "-"}</td>
              <td className="px-[8px] py-3">
                <Badge size="s" type="ghost" color={statusColor(r.status)}>{formatSentenceCase(r.status)}</Badge>
              </td>
              <td className="px-[8px] py-3">
                <div className="flex items-center gap-2 text-nowrap">
                  <AvatarCircle name={docName !== "-" ? docName : "Dr"} size="s" />
                  <span>{docName}</span>
                </div>
              </td>
              <td className="px-[8px] py-3 text-right">
                <button className="p-1.5 rounded hover:bg-gray-100"><MoreVertical className="h-4 w-4 text-gray-600" /></button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function SocialTable({ rows, onAdd }) {
  const { user: doctorDetails } = useDoctorAuthStore();
  if (!rows || rows.length === 0) return <NoData category="Social History" onAdd={onAdd} />;
  return (
    <table className="min-w-full border-t-[0.5px] border-b-[0.5px] border-[#D6D6D6] mt-2">
      <thead className="border-b border-[#D6D6D6]">
        <tr className="h-[32px]">
          {["Category", "Since", "Freq.", "Status", "Source", "Note", "Verified by", ""].map((h, i) => (
            <th key={i} className="px-[8px] text-sm font-medium text-left text-[#424242]">
              <div className="flex items-center">
                <div className="text-nowrap">{h}</div>
                {h && <img src="/Action Button.svg" alt="sort" width={24} height={24} />}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => {
          const docName = r.verifiedBy || r.createdBy || r.doctorName || r.doctor?.name || doctorDetails?.name || "-";
          const category = r.category || (r.smokingStatus ? "Smoking" : r.alcoholConsumption ? "Alcohol" : "-");
          return (
            <tr key={i} className="border-b border-gray-200 hover:bg-gray-50 text-sm text-[#424242]">
              <td className="px-[8px] py-3 font-medium">{formatSentenceCase(category)}</td>
              <td className="px-[8px] py-3 text-nowrap">{formatDate(r.date || r.onsetDate)}</td>
              <td className="px-[8px] py-3">{r.frequency || r.freq || "-"}</td>
              <td className="px-[8px] py-3">
                <Badge size="s" type="ghost" color={statusColor(r.status)}>{formatSentenceCase(r.status)}</Badge>
              </td>
              <td className="px-[8px] py-3">{r.source || "Patient"}</td>
              <td className="px-[8px] py-3 max-w-[200px] truncate" title={r.note || r.notes}>{formatSentenceCase(r.note || r.notes)}</td>
              <td className="px-[8px] py-3">
                <div className="flex items-center gap-2 text-nowrap">
                  <AvatarCircle name={docName !== "-" ? docName : "Dr"} size="s" />
                  <span>{docName}</span>
                </div>
              </td>
              <td className="px-[8px] py-3 text-right">
                <button className="p-1.5 rounded hover:bg-gray-100"><MoreVertical className="h-4 w-4 text-gray-600" /></button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function NoData({ category, onAdd }) {
  return (
    <div className="py-16 text-center border rounded-lg mt-2 flex flex-col items-center gap-4">
      <div className="text-gray-500 italic">No {category} data found for this patient.</div>
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors font-medium border border-blue-200"
        >
          <span>+ Add {category}</span>
        </button>
      )}
    </div>
  );
}

export default function PatientMedicalHistory({ patientId, historyData, onRefresh }) {
  const [active, setActive] = useState("Problems");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddDrawer, setShowAddDrawer] = useState(false);

  useEffect(() => {
    if (historyData) {
      setData(historyData);
    }
  }, [historyData]);

  useEffect(() => {
    // Initial data is already fetched by parent, but if patientId changes
    // it could trigger something if needed. For now, it depends on parent.
  }, [patientId]);

  const handleSaveData = () => {
    if (onRefresh) onRefresh();
  };

  if (!data) return (
    <div className="py-20 text-center text-gray-500">
      <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      Syncing history...
    </div>
  );

  if (error) return <div className="py-12 text-center text-red-600 font-medium border border-red-100 bg-red-50 rounded-lg">{error}</div>;

  const addLabel =
    active === "Problems" ? "Add Problem" :
      active === "Conditions" ? "Add Condition" :
        active === "Allergies" ? "Add Allergies" :
          active === "Immunizations" ? "Add Immunizations" :
            active === "Family History" ? "Add History" :
              active === "Social" ? "Add History" : `Add ${active}`;

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <SubTabs value={active} onChange={setActive} />
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => setShowAddDrawer(true)}
            className="text-blue-600 hover:underline font-medium"
          >
            + {addLabel}
          </button>
          <button className="p-1.5 rounded hover:bg-gray-100" aria-label="Filter"><Filter className="h-4 w-4 text-gray-600" /></button>
        </div>
      </div>

      <div className="min-h-[300px]">
        {active === "Problems" && <ProblemsTable rows={data?.problems} onAdd={() => setShowAddDrawer(true)} />}
        {active === "Conditions" && <ConditionsTable rows={data?.conditions} onAdd={() => setShowAddDrawer(true)} />}
        {active === "Allergies" && <AllergiesTable rows={data?.allergies} onAdd={() => setShowAddDrawer(true)} />}
        {active === "Immunizations" && <ImmunizationsTable rows={data?.immunization} onAdd={() => setShowAddDrawer(true)} />}
        {active === "Family History" && <FamilyHistoryTable rows={data?.family_history} onAdd={() => setShowAddDrawer(true)} />}
        {active === "Social" && <SocialTable rows={data?.social} onAdd={() => setShowAddDrawer(true)} />}
      </div>

      <AddMedicalHistoryDrawer
        open={showAddDrawer}
        onClose={() => setShowAddDrawer(false)}
        onSave={handleSaveData}
        patientId={patientId}
        initialTab={active}
        existingData={data}
      />
    </div>
  );
}
