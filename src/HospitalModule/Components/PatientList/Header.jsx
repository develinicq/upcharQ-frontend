import { Search } from "lucide-react";

// Hospital-specific Patient list header (tabs + search + actions)
export default function HospitalPatientHeader({ counts = { all: 0, online: 0, walkin: 0 }, selected = 'all', onChange }) {
  return (
    <div className="bg-white px-3 py-2 rounded-md border border-gray-200">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm">
          {['all', 'online', 'walkin'].map((tab) => (
            <button
              key={tab}
              onClick={() => onChange && onChange(tab)}
              className={`h-8 px-3 rounded ${selected === tab ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              {tab === 'all' ? `All (${counts.all || 0})` : tab === 'online' ? `Online (${counts.online || 0})` : `Walk-in (${counts.walkin || 0})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              className="pl-7 pr-3 h-8 w-[280px] border border-gray-200 rounded text-sm focus:outline-none"
              placeholder="Search Patient"
            />
          </div>
          <button className="px-3 h-8 bg-blue-600 text-white rounded text-sm">Add New Patient</button>
        </div>
      </div>
    </div>
  );
}
