import { MoreVertical,  ChevronsUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AvatarCircle from "../AvatarCircle";
import Badge from "../Badge";
import { Eye,threedots } from "/Users/khushiagrawal1367/Desktop/eclinicQ-frontend/public/index.js";
export default function Table({ doctors = [] }) {
  const navigate = useNavigate();

  const openDoctor = (doc) => {
  // Route param will carry userId for details API call
  navigate(`/doctor/${encodeURIComponent(doc.userId || doc.id)}`, { state: { doctor: doc } });
  };
  return (
  <div className="bg-white flex flex-col">
      {/* Sticky table header + scrollable body */}
      <div className="overflow-x-auto">
  <div className="max-h-[82vh] overflow-y-auto">
          <table className="min-w-full table-fixed text-sm text-left text-gray-700">
            <colgroup>
              <col className="w-[280px]" />
              <col className="w-[110px]" />
              <col className="w-[150px]" />
              <col className="w-[220px]" />
              <col className="w-[130px]" />
              <col className="w-[210px]" />
              <col className="w-[260px]" />
              <col className="w-[84px]" />
            </colgroup>
            <thead className="sticky  top-0 z-10 bg-white text-[12px] uppercase font-medium text-gray-500 border-b">
              <tr className="h-8">
                <th className="pl-4 pr-4 py-0 h-8 whitespace-nowrap">
                  <span className="inline-flex items-center gap-2 h-8">
                    <input type="checkbox" className="accent-blue-600" aria-label="Select all" />
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">Doctors <ChevronsUpDown className="h-3.5 w-3.5" /></span>
                  </span>
                </th>
                <th className="px-4 py-0 h-8 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap h-8">Doc ID <ChevronsUpDown className="h-3.5 w-3.5" /></span>
                </th>
                <th className="px-4 py-0 h-8 whitespace-nowrap"><span className="inline-flex items-center gap-1 whitespace-nowrap h-8">Contact Number <ChevronsUpDown className="h-3.5 w-3.5" /></span></th>
                <th className="px-4 py-0 h-8 whitespace-nowrap">Email</th>
                <th className="px-4 py-0 h-8 whitespace-nowrap">Location</th>
                <th className="px-4 py-0 h-8 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap h-8">Specializations <ChevronsUpDown className="h-3.5 w-3.5" /></span>
                </th>
                <th className="px-4 py-0 h-8 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 whitespace-nowrap h-8">Designation <ChevronsUpDown className="h-3.5 w-3.5" /></span>
                </th>
                <th className="px-11 py-0 h-8 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
  {doctors.map((doc, idx) => (
    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 text-sm cursor-pointer" onClick={() => openDoctor(doc)}>
      <td className="pl-4 pr-4 py-2">
                    <div className="flex items-center gap-2">
            <AvatarCircle name={doc.name} size="s" color="orange" />
                      <div>
                        <p className="font-medium text-gray-900 leading-5">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.gender ? `${String(doc.gender).charAt(0).toUpperCase()} | ` : ''}
                          {doc.exp}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{doc.id}</td>
                  <td className="px-4 py-3 text-gray-700">{doc.contact}</td>
                  <td className="px-4 py-3 text-gray-700 whitespace-normal break-words">{doc.email}</td>
                  <td className="px-4 py-3 text-gray-700">{doc.location}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      {/* If specialization looks like a date, show it as a pill to match UI */}
                      {doc.specialization?.includes('/') ? (
                        <Badge size="s" type="ghost" color="gray" className="!h-6 !text-[12px] !px-2 whitespace-nowrap">{doc.specialization}</Badge>
                      ) : (
                        <span>{doc.specialization}</span>
                      )}
                      {doc.specializationMore ? (
                        <Badge size="s" type="ghost" color="gray" className="!h-5 !text-[11px] !px-1.5">+{doc.specializationMore}</Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[240px]">{doc.designation}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 text-gray-600" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1.5 rounded hover:bg-gray-100" aria-label="View" onClick={() => openDoctor(doc)}>
                        <img src={Eye} alt="eye" />
                      </button>
                      <span className="mx-2 h-4 w-px bg-gray-200" aria-hidden="true" />
                      <button className="p-1.5 rounded hover:bg-gray-100" aria-label="More">
                        <img src={threedots} alt="more" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Internal pagination footer */}
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
