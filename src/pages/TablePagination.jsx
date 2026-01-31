import { useState } from "react";
import { arrowLeft, arrowRight, paginationDown } from "../../public/index.js";

export default function TablePagination({
  page = 1,
  pageSize = 10,
  total = 0,
  start = 1,
  end = 10,
  canPrev = false,
  canNext = false,
  goto = () => { },
  onPageSizeChange = () => { },
}) {
  const [goToValue, setGoToValue] = useState("");
  const [showPageSizeDD, setShowPageSizeDD] = useState(false);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      // Show all pages if total is 5 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Dynamic pagination based on current page
      if (page <= 3) {
        // Near the start: 1, 2, 3, ..., last
        pages.push(1, 2, 3, "...", totalPages);
      } else if (page >= totalPages - 2) {
        // Near the end: 1, ..., last-2, last-1, last
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle: 1, ..., current, ..., last
        pages.push(1, "...", page, "...", totalPages);
      }
    }
    return pages;
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(goToValue);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      goto(pageNum);
      setGoToValue("");
    }
  };

  return (
    <div className="flex items-center justify-center py-2 px-4">
      <div className="flex items-center justify-between gap-2 bg-secondary-grey50 rounded-lg px-3 py-1.5">
        {/* Left side - Page navigation */}
        <div className="flex items-center gap-2">
          {/* Left Arrow */}
          <button
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-secondary-grey100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => canPrev && goto(page - 1)}
            disabled={!canPrev}
          >
            <img src={arrowLeft} alt="Previous" className="w-3 h-3" />
          </button>

          {/* Page numbers */}
          {getPageNumbers().map((pageNum, idx) => {
            if (pageNum === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-1 text-secondary-grey200"
                  style={{
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "120%",
                    verticalAlign: "middle",
                  }}
                >
                  …
                </span>
              );
            }

            const isActive = pageNum === page;
            return (
              <button
                key={pageNum}
                onClick={() => goto(pageNum)}
                className={`h-6 min-w-[24px] px-1.5 py-1 rounded ${isActive
                    ? "bg-monochrom-white border border-secondary-grey100 text-secondary-grey400"
                    : "text-secondary-grey200 hover:text-secondary-grey300"
                  }`}
                style={{
                  fontFamily: "Inter",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "120%",
                  letterSpacing: "0%",
                  verticalAlign: "middle",
                  borderRadius: "4px",
                }}
              >
                {pageNum}
              </button>
            );
          })}

          {/* Right Arrow */}
          <button
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-secondary-grey100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => canNext && goto(page + 1)}
            disabled={!canNext}
          >
            <img src={arrowRight} alt="Next" className="w-3 h-3" />
          </button>
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center gap-2">
          {/* Divider */}

          {/* Page size selector */}
          <div className="relative">
            <div
              className="flex items-center gap-2 bg-monochrom-white border border-secondary-grey200 px-1.5 py-1 h-6 whitespace-nowrap cursor-pointer hover:bg-gray-50"
              style={{
                borderRadius: "4px",
                borderWidth: "0.5px",
              }}
              onClick={() => setShowPageSizeDD(!showPageSizeDD)}
            >
              <span
                className="text-secondary-grey300"
                style={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontSize: "12px",
                  lineHeight: "120%",
                  letterSpacing: "0%",
                  verticalAlign: "middle",
                }}
              >
                {pageSize} / Page
              </span>
              <img
                src={paginationDown}
                alt="Dropdown"
                className={`w-2.5 h-2.5 flex-shrink-0 transition-transform ${showPageSizeDD ? "rotate-180" : ""}`}
              />
            </div>
            {showPageSizeDD && (
              <div className="absolute bottom-full right-0 mb-1 w-20 bg-white border border-secondary-grey100 rounded shadow-lg z-50 overflow-hidden">
                {[10, 20, 50, 100].map((size) => (
                  <div
                    key={size}
                    className={`px-3 py-1.5 text-xs text-secondary-grey300 hover:bg-secondary-grey50 cursor-pointer ${pageSize === size ? "bg-secondary-grey50 font-semibold text-secondary-grey400" : ""}`}
                    onClick={() => {
                      onPageSizeChange(size);
                      setShowPageSizeDD(false);
                    }}
                  >
                    {size} / Page
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Go to page */}
          <input
            type="text"
            placeholder="Go to Page"
            value={goToValue}
            onChange={(e) => setGoToValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
            onBlur={handleGoToPage}
            className="bg-monochrom-white border border-secondary-grey200 px-2 py-1 w-[100px] h-6 placeholder:text-secondary-grey200"
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "120%",
              letterSpacing: "0%",
              borderRadius: "4px",
              borderWidth: "0.5px",
            }}
          />
        </div>
      </div>
    </div>
  );
}
