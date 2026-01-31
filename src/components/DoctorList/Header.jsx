import { useNavigate } from "react-router-dom";
import Badge from "../Badge";
import { vertical, searchIcon, filerIcon } from "../../../public";

const fmt = (n) => {
  if (typeof n !== "number") return String(n ?? 0);
  if (n >= 1000) return `${Math.round(n / 100) / 10}K`;
  return String(n);
};

export default function Header({
  counts = { all: 0, active: 0, inactive: 0 },
  selected = "all",
  onChange = () => {},
  addLabel = "Add New Doctor",
  addPath,
  // Optional custom tabs: [{ key: 'active', label: 'Active' }, ...]
  tabs,
  // When false, hides counts next to labels
  showCounts = true,
  // When false, renders a non-interactive header showing only a title and total count
  showTabs = true,
  // Optional title shown when showTabs=false
  title,
  // Show/hide the title text when showTabs=false
  showTitle = true,
  // Variant for counts display when showTabs=false: 'pill' | 'plain'
  countsVariant = "pill",
  // Optional custom label for counts (e.g., "300 Total Patients"); default is "Total: N"
  countsLabel,
}) {
  const navigate = useNavigate();
  const defaultTabs = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
  ];
  const activeTabs = Array.isArray(tabs) && tabs.length ? tabs : defaultTabs;

  return (
    <div className="flex items-center justify-between px-4 py-2 ">
      {/* Left header: tabs or counts-only */}
      {showTabs ? (
        <div
          className="flex items-center gap-1 text-sm"
          role="tablist"
          aria-label="Doctor filters"
        >
          {activeTabs.map((t) => {
            const isSel = selected === t.key;
            const label = showCounts
              ? `${t.label} (${fmt(counts?.[t.key])})`
              : t.label;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={isSel}
                className={
                  `h-8 inline-flex items-center px-3 rounded-md border font-medium transition-colors ` +
                  (isSel
                    ? "border-blue-400 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-200")
                }
                onClick={isSel ? undefined : () => onChange(t.key)}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className="flex items-center gap-2 text-sm"
          aria-label="List summary"
        >
          {showTitle && (
            <div className="text-gray-900 font-medium">{title || "List"}</div>
          )}
          {countsVariant === "plain" ? (
            <span className="font-inter font-medium text-[16px] leading-[120%] text-secondary-grey400">
              {countsLabel ?? `Total: ${fmt(counts?.all ?? 0)}`}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-0.5 text-xs">
              {countsLabel ?? `Total: ${fmt(counts?.all ?? 0)}`}
            </span>
          )}
        </div>
      )}

      {/* Search + Filter icons and Add button */}
      <div className="flex items-center gap-2">
        <button
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
          aria-label="Search"
        >
          <img src={searchIcon} alt="Search" className="h-7 w-7" />
        </button>
        <div className="w-[1px] h-5 bg-secondary-grey100/50"></div>
        <button
          className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
          aria-label="Filter"
        >
          <img src={filerIcon} alt="Filter" className="h-7 w-7" />
        </button>
        <div className="w-[1px] h-5 bg-secondary-grey100/50 mr-2"></div>
        {/* Blue button matching Walk-in Appointment style */}
        <button
          onClick={() => {
            if (typeof (/** @type any */ addPath) === "function") {
              addPath();
            } else if (addPath) {
              navigate(addPath);
            }
          }}
          className="inline-flex items-center gap-2 h-[32px] min-w-[32px] px-4 rounded-md border text-sm border-[#BFD6FF] bg-[#F3F8FF] text-[#2372EC] hover:bg-[#2372EC] hover:text-white transition-colors"
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}
