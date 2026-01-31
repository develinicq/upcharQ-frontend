import React, { useState } from 'react';
import AvatarCircle from '../../../components/AvatarCircle';
import { Eye, MoreVertical, Filter } from 'lucide-react';

const allDocuments = [
  {
    name: 'Tobacco Use History',
    type: 'Attachment',
    uploadedOn: '02/02/2025',
    note: 'Patient wants to quit. Counseled during last visit.',
    uploadedBy: 'Milind Chauhan',
    category: 'Attachment',
  },
  {
    name: 'Cigarette Consumption Details',
    type: 'Attachment',
    uploadedOn: '02/02/2025',
    note: 'Patient wants to quit. Counseled during last visit.',
    uploadedBy: 'Milind Chauhan',
    category: 'Attachment',
  },
];

const subTabs = ['All', 'Attachment', 'Certificates', 'Consent Form', 'Reports'];

function SubTabs({ value, onChange }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {subTabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-2.5 py-1 rounded-md border ${value===t ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function DocumentsTable({ rows }) {
  return (
    <div className="mt-2 border border-gray-200 rounded-md">
      <table className="min-w-full table-fixed text-sm text-left text-gray-700">
        <colgroup>
          <col />
          <col className="w-[160px]" />
          <col className="w-[160px]" />
          <col />
          <col className="w-[220px]" />
          <col className="w-[64px]" />
        </colgroup>
        <thead className="bg-gray-50 text-[12px] uppercase font-medium text-gray-500 border-b">
          <tr className="h-8">
            <th className="pl-3">Document Name</th>
            <th>Type</th>
            <th>Uploaded On</th>
            <th>Note</th>
            <th>Uploaded by</th>
            <th className="pr-2 text-right"> </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="pl-3 py-2 text-gray-800">{r.name}</td>
              <td className="py-2 text-gray-700">{r.type}</td>
              <td className="py-2 text-gray-700">{r.uploadedOn}</td>
              <td className="py-2 text-gray-700">{r.note}</td>
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <AvatarCircle name={r.uploadedBy} size="s" />
                  <span className="text-gray-800">{r.uploadedBy}</span>
                </div>
              </td>
              <td className="py-2 pr-2">
                <div className="flex items-center justify-end gap-2 text-gray-600">
                  <button className="p-1.5 rounded hover:bg-gray-100" aria-label="View"><Eye className="h-4 w-4" /></button>
                  <button className="p-1.5 rounded hover:bg-gray-100" aria-label="More"><MoreVertical className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PatientDocuments() {
  const [active, setActive] = useState('All');
  const filtered = active === 'All' ? allDocuments : allDocuments.filter(d => d.category === active);
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-2">
        <SubTabs value={active} onChange={setActive} />
        <div className="flex items-center gap-3 text-sm">
          <button className="text-blue-600 hover:underline">+ Add Document</button>
          <button className="p-1.5 rounded hover:bg-gray-100" aria-label="Filter"><Filter className="h-4 w-4 text-gray-600" /></button>
        </div>
      </div>
      <DocumentsTable rows={filtered} />
    </div>
  );
}
