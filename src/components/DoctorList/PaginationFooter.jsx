import React from "react";
import Badge from "../Badge";

const PaginationFooter = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm z-20">
      <div className="mx-auto max-w-screen-2xl px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Left: selection actions (icons replaced with badges for now) */}
          <div className="flex items-center gap-2">
            <Badge size="s" type="ghost" color="gray">Download</Badge>
            <Badge size="s" type="ghost" color="gray">Delete</Badge>
            <Badge size="s" type="ghost" color="gray">More</Badge>
          </div>

          {/* Middle: pager */}
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded" aria-label="First">
              «
            </button>
            <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded" aria-label="Prev">
              ‹
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`w-8 h-8 rounded text-sm ${n === 1 ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                aria-current={n === 1 ? "page" : undefined}
              >
                {n}
              </button>
            ))}
            <span className="px-1">…</span>
            <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded" aria-label="Next">
              ›
            </button>
            <button className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded" aria-label="Last">
              »
            </button>
            <span className="text-sm text-gray-500 ml-2">10 / Page</span>
            <Badge size="s" type="ghost" color="gray">Go to Page</Badge>
          </div>

          {/* Right: summary */}
          <div className="text-sm text-gray-500">All (2k) • Active (1.8k) • Inactive (200)</div>
        </div>
      </div>
    </div>
  );
};

export default PaginationFooter;
