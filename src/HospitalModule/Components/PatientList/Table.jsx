import { MoreVertical, ChevronsUpDown, Eye } from "lucide-react";
import AvatarCircle from "../../../components/AvatarCircle";
import Badge from "../../../components/Badge";
import { useNavigate } from "react-router-dom";

// Hospital-specific Patients table.
// Differences:
// - Default row click navigates to Hospital patients route.
// - UI fine-tuned spacing and fewer action buttons.
// - This component is data-display only; fetching should be handled by its parent
//   using the Hospital API endpoint.

export default function HospitalPatientTable({ patients = [], onView, onRowClick }) {
  const navigate = useNavigate();
  const openPatient = (p) => {
    if (typeof onRowClick === "function") { onRowClick(p); return; }
    const routeId = p?.patientId || p?.patientCode;
    navigate(`/hospital/patients/${encodeURIComponent(routeId)}`, { state: { patient: p } });
  };

  return (
    <div className="bg-white flex flex-col">
      <div className="overflow-x-auto">
        <div className="max-h-[82vh] overflow-y-auto">
          <table className="min-w-full table-fixed text-sm text-left text-gray-700">
            <colgroup>
              <col className="w-[300px]" />
              <col className="w-[120px]" />
              <col className="w-[180px]" />
              <col className="w-[220px]" />
              <col className="w-[160px]" />
              <col className="w-[84px]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-white text-[12px] uppercase font-medium text-gray-500 border-b">
              <tr className="h-8">
                <th className="pl-4 pr-4 py-0 h-8 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2 h-8">
                    <input type="checkbox" className="accent-blue-600" aria-label="Select all" />
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">Patient <ChevronsUpDown className="h-3.5 w-3.5" /></span>
                  </span>
                </th>
                <th className="px-4 py-0 h-8 whitespace-nowrap">Patient ID</th>
                <th className="px-4 py-0 h-8 whitespace-nowrap">Contact</th>
                <th className="px-4 py-0 h-8 whitespace-nowrap">Email</th>
                <th className="px-4 py-0 h-8 whitespace-nowrap">Last Visit</th>
                <th className="px-6 py-0 h-8 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 text-sm cursor-pointer" onClick={() => openPatient(p)}>
                  <td className="pl-4 pr-4 py-2">
                    <div className="flex items-center gap-2">
                      <AvatarCircle name={p.name} size="s" color="blue" />
                      <div>
                        <p className="font-medium text-gray-900 leading-5">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.gender} | {p.dob}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.patientCode || p.patientId}</td>
                  <td className="px-4 py-3 text-gray-700">{p.contact}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-normal break-words">{p.email}</td>
                  <td className="px-4 py-3 text-gray-700">{p.lastVisit}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 text-gray-600" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1.5 rounded hover:bg-gray-100" aria-label="View" onClick={() => (onView ? onView(p) : openPatient(p))}>
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-gray-100" aria-label="More">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="border-t border-gray-200 px-3 py-2">
        <div className="flex items-center justify-center gap-2 text-sm">
          <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded" aria-label="First">«</button>
          <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded" aria-label="Prev">‹</button>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={`w-7 h-7 rounded text-xs ${n === 1 ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
              aria-current={n === 1 ? "page" : undefined}
            >
              {n}
            </button>
          ))}
          <span className="px-1">…</span>
          <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded" aria-label="Next">›</button>
          <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded" aria-label="Last">»</button>
          <span className="text-sm text-gray-500 ml-2">10 / Page</span>
          <Badge size="s" type="ghost" color="gray">Go to Page</Badge>
        </div>
      </div>
    </div>
  );
}
