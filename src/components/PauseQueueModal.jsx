import React from "react";
import { createPortal } from "react-dom";
import { pauseMenuIcon, infoCircle } from "../../public/index.js";

const PauseQueueModal = ({
  show,
  onClose,
  pauseMinutes,
  setPauseMinutes,
  pauseSubmitting,
  pauseError,
  onConfirm,
}) => {
  if (!show) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className="relative bg-monochrom-white rounded-xl shadow-2xl flex flex-col"
        style={{ width: "400px", gap: "16px", padding: "16px" }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center">
          <div
            className="bg-error-50 rounded-full flex items-center justify-center"
            style={{
              width: "48px",
              height: "48px",
              border: "0.5px solid #DC2626",
            }}
          >
            <img src={pauseMenuIcon} alt="Pause" className="w-6 h-6" />
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-center text-secondary-grey400"
          style={{
            fontFamily: "Inter",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "100%",
            verticalAlign: "middle",
          }}
        >
          Set Pause Duration
        </h3>

        {/* Description */}
        <p
          className="text-center text-secondary-grey300"
          style={{
            fontFamily: "Inter",
            fontWeight: 400,
            fontSize: "13px",
            lineHeight: "100%",
            verticalAlign: "middle",
          }}
        >
          Select the duration to pause your queue. It will resume automatically
          afterward.
        </p>

        {/* Duration buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          {[5, 10, 15, 20, 30, 45, 60].map((min) => (
            <button
              key={min}
              onClick={() => setPauseMinutes(min)}
              className={`text-center ${
                pauseMinutes === min
                  ? "bg-blue-primary50 text-blue-primary250"
                  : "bg-secondary-grey50 text-secondary-grey400 hover:bg-blue-primary50 hover:text-blue-primary250"
              }`}
              style={{
                minWidth: "22px",
                height: "22px",
                paddingTop: "3px",
                paddingRight: "6px",
                paddingBottom: "3px",
                paddingLeft: "6px",
                borderRadius: "4px",
                border:
                  pauseMinutes === min
                    ? "0.5px solid #2372EC"
                    : "0.5px solid #D1D5DB",
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "120%",
                verticalAlign: "middle",
              }}
            >
              {min} min
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            className="bg-monochrom-white text-secondary-grey400 hover:bg-secondary-grey50"
            style={{
              width: "178px",
              height: "32px",
              minWidth: "32px",
              borderRadius: "4px",
              padding: "8px",
              border: "0.5px solid #8E8E8E",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "120%",
              verticalAlign: "middle",
            }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            disabled={!pauseMinutes || pauseSubmitting}
            className={
              pauseMinutes && !pauseSubmitting
                ? "bg-blue-primary250 hover:bg-blue-primary300"
                : "bg-secondary-grey50 cursor-not-allowed"
            }
            style={{
              width: "178px",
              height: "32px",
              minWidth: "32px",
              borderRadius: "4px",
              padding: "8px",
              fontFamily: "Inter",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "120%",
              verticalAlign: "middle",
              color: pauseMinutes && !pauseSubmitting ? "#FFFFFF" : "#D6D6D6",
            }}
            onClick={onConfirm}
          >
            {pauseSubmitting ? "Pausing…" : "Confirm"}
          </button>
        </div>

        {/* Warning section */}
        <div
          className="bg-secondary-grey50 flex items-center gap-1"
          style={{
            width: "400px",
            height: "32px",
            marginLeft: "-16px",
            marginRight: "-16px",
            marginBottom: "-16px",
            padding: "8px",
            borderTop: "0.5px solid #D6D6D6",
            borderBottomLeftRadius: "12px",
            borderBottomRightRadius: "12px",
          }}
        >
          <img src={infoCircle} alt="Info" className="w-4 h-4" />
          <span
            className="text-secondary-grey300"
            style={{
              fontFamily: "Inter",
              fontWeight: 400,
              fontSize: "11px",
              lineHeight: "100%",
              verticalAlign: "middle",
            }}
          >
            Queue will automatically resume after selected time.
          </span>
        </div>

        {pauseError && (
          <div className="mt-2 text-[12px] text-red-600 text-center">
            {pauseError}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default PauseQueueModal;
