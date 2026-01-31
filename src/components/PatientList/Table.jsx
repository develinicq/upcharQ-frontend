import { MoreVertical, ChevronsUpDown, Trash2, Edit, Eye } from "lucide-react";
import AvatarCircle from "../AvatarCircle";
import Badge from "../Badge";
import { useNavigate } from "react-router-dom";

export default function PatientTable({ patients = [], onView, onEdit, onDelete, onRowClick }) {
  const navigate = useNavigate();
  const openPatient = (p) => {
    if (typeof onRowClick === 'function') { onRowClick(p); return; }
    // Default behavior: navigate to doctor module patient details
    const routeId = p?.patientId;
    navigate(`/doc/patients/${encodeURIComponent(routeId)}`, { state: { patient: p } });
  };
  return (
    <div className="flex flex-col h-[calc(100vh-135px)] bg-white">
      <div className="flex-1 overflow-auto">
        <table className="min-w-full table-fixed text-sm text-left text-gray-700">
          <colgroup>
            <col className="w-[300px]" />
            <col className="w-[110px]" />
            <col className="w-[160px]" />
            <col className="w-[220px]" />
            <col className="w-[140px]" />
            <col className="w-[240px]" />
            <col className="w-[120px]" />
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
              <th className="px-4 py-0 h-8 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 whitespace-nowrap h-8">Patient ID <ChevronsUpDown className="h-3.5 w-3.5" /></span>
              </th>
              <th className="px-4 py-0 h-8 whitespace-nowrap"><span className="inline-flex items-center gap-1 whitespace-nowrap h-8">Contact Number <ChevronsUpDown className="h-3.5 w-3.5" /></span></th>
              <th className="px-4 py-0 h-8 whitespace-nowrap">Email</th>
              <th className="px-4 py-0 h-8 whitespace-nowrap">Location</th>
              <th className="px-4 py-0 h-8 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 whitespace-nowrap h-8">Last Visit Date & Time <ChevronsUpDown className="h-3.5 w-3.5" /></span>
              </th>
              <th className="px-4 py-0 h-8 whitespace-nowrap">
                <span className="inline-flex items-center gap-1 whitespace-nowrap h-8">Reason for Last Visit <ChevronsUpDown className="h-3.5 w-3.5" /></span>
              </th>
              <th className="px-11 py-0 h-8 whitespace-nowrap text-right">Actions</th>
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
                <td className="px-4 py-3 text-gray-700">
                  <Badge size="s" type="ghost" color="gray" className="!h-6 !text-[12px] !px-2 whitespace-nowrap">{p.location}</Badge>
                </td>
                <td className="px-4 py-3 text-gray-700">{p.lastVisit}</td>
                <td className="px-4 py-3 text-gray-700">
                  <span className="truncate block max-w-[280px]" title={p.reason}>{p.reason}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 text-gray-600" onClick={(e) => e.stopPropagation()}>
                    <button className="p-1.5 rounded hover:bg-gray-100" aria-label="View" onClick={() => (onView ? onView(p) : openPatient(p))}>
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-gray-100" aria-label="Edit" onClick={() => onEdit && onEdit(p)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-gray-100" aria-label="Delete" onClick={() => onDelete && onDelete(p)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="mx-2 h-4 w-px bg-gray-200" aria-hidden="true" />
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
      <div className="border-t border-gray-200 px-3 py-2 z-30 bg-white">
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
