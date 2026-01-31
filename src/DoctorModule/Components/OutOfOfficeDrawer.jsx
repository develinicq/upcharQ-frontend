import React, { useState, useMemo, useEffect } from "react";
import GeneralDrawer from "../../components/GeneralDrawer/GeneralDrawer";
import Toggle from "../../components/FormItems/Toggle";
import InputWithMeta from "../../components/GeneralDrawer/InputWithMeta";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import calendarWhite from "../../../public/Doctor_module/sidebar/calendar_white.png";
import { updateOutOfOfficeStatus, getOutOfOfficeStatus } from "../../services/doctorService";
import useToastStore from "@/store/useToastStore";
import useOOOStore from "@/store/useOOOStore";
import UniversalLoader from "../../components/UniversalLoader";

const clockIcon = '/clock.png';
const hours12 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const minutesArr = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

const CalendarWhiteIcon = ({ disabled }) => (
    <img src={calendarWhite} alt="Calendar" className={`w-4 h-4 ${disabled ? "opacity-30" : ""}`} />
);

export default function OutOfOfficeDrawer({ isOpen, onClose, onSave, initialData }) {
    const { addToast } = useToastStore();

    // Default dates (today and tomorrow)
    const getToday = () => new Date().toISOString().split('T')[0];
    const getTomorrow = () => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    };

    const [enabled, setEnabled] = useState(false);
    const [startDate, setStartDate] = useState(getToday());
    const [startTime, setStartTime] = useState("09:00");
    const [endDate, setEndDate] = useState(getTomorrow());
    const [endTime, setEndTime] = useState("09:00");
    const [isSaving, setIsSaving] = useState(false);

    // Initialize state from initialData when drawer opens
    useEffect(() => {
        if (isOpen && initialData) {
            setEnabled(initialData.isOutOfOffice || false);
            if (initialData.OutOfOfficeStart) {
                const [d, t] = initialData.OutOfOfficeStart.split("T");
                setStartDate(d);
                setStartTime(t.slice(0, 5));
            }
            if (initialData.OutOfOfficeEnd) {
                const [d, t] = initialData.OutOfOfficeEnd.split("T");
                setEndDate(d);
                setEndTime(t.slice(0, 5));
            }
        } else if (isOpen && !initialData) {
            // Default reset if no initialData provided
            setEnabled(false);
        }
    }, [isOpen, initialData]);

    const isDirty = useMemo(() => {
        const initialEnabled = initialData?.isOutOfOffice || false;

        // Use component defaults for comparison if initialData fields are missing
        const initialStartRaw = initialData?.OutOfOfficeStart || `${getToday()}T09:00`;
        const initialEndRaw = initialData?.OutOfOfficeEnd || `${getTomorrow()}T09:00`;

        const [iStartDate, iStartTime] = initialStartRaw.split('T');
        const [iEndDate, iEndTime] = initialEndRaw.split('T');

        // If toggle changed, it's dirty
        if (enabled !== initialEnabled) return true;

        // If both are OFF, it's not dirty (dates don't matter in OFF state)
        if (!enabled && !initialEnabled) return false;

        // If it's ON (or stays ON), check if dates/times changed
        return (
            startDate !== iStartDate ||
            startTime !== (iStartTime?.slice(0, 5) || '') ||
            endDate !== iEndDate ||
            endTime !== (iEndTime?.slice(0, 5) || '')
        );
    }, [enabled, startDate, startTime, endDate, endTime, initialData]);

    const [showStartCalendar, setShowStartCalendar] = useState(false);
    const [showEndCalendar, setShowEndCalendar] = useState(false);
    const [showStartTimeDD, setShowStartTimeDD] = useState(false);
    const [showEndTimeDD, setShowEndTimeDD] = useState(false);

    // Helpers
    const formatDateForDisplay = (isoStr) => {
        if (!isoStr) return "";
        const [y, m, d] = isoStr.split("-");
        return `${d}/${m}/${y}`;
    };

    const handleDateSelect = (date, setter, calendarCloseSetter) => {
        if (!date) return;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        setter(`${year}-${month}-${day}`);
        calendarCloseSetter(false);
    };

    const handleSave = async () => {
        if (!isDirty || isSaving) return;
        setIsSaving(true);
        const payload = {
            isOutOfOffice: enabled,
            OutOfOfficeStart: `${startDate}T${startTime}:00.000Z`,
            OutOfOfficeEnd: `${endDate}T${endTime}:00.000Z`,
        };

        try {
            // Use store's update method which fetches verified status automatically
            const latestData = await useOOOStore.getState().updateOOOStatus(payload);

            addToast({
                title: "Success",
                message: enabled ? "Out of office set successfully" : "Resumed work successfully",
                type: "success"
            });
            onSave?.(latestData);
            onClose();
        } catch (e) {
            console.error("Failed to update status:", e);
            addToast({
                title: "Error",
                message: "Failed to update status. Please try again.",
                type: "error"
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Time Picker Logic (Integrated)
    const parseTime = (val) => {
        if (!val) return { h12: "09", m: "00", ap: "AM" };
        const [hh, mm] = String(val).split(":");
        let h = parseInt(hh, 10);
        const ap = h >= 12 ? "PM" : "AM";
        const h12 = String(h % 12 || 12).padStart(2, "0");
        return { h12, m: String(mm).padStart(2, "0"), ap };
    };

    const to24h = (h12, m, ap) => {
        let h = parseInt(h12, 10) % 12;
        if (ap === "PM") h += 12;
        return `${String(h).padStart(2, "0")}:${m}`;
    };

    const renderTimeDropdown = (val, setter, closeSetter) => {
        const p = parseTime(val);
        const update = (next) => {
            const v = to24h(next.h12 || p.h12, next.m || p.m, next.ap || p.ap);
            setter(v);
        };

        return (
            <div className="absolute z-[10001] mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg p-2 grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 top-full right-0">
                <div>
                    <div className="text-[12px] text-gray-500 mb-1 text-center font-medium">Hr</div>
                    <div className="max-h-48 overflow-y-auto no-scrollbar space-y-0.5">
                        {hours12.map((h) => (
                            <button
                                key={h}
                                className={`w-full aspect-square flex items-center justify-center text-[12px] rounded-[4px] font-medium ${h === p.h12 ? "bg-blue-primary250 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                onClick={() => update({ h12: h })}
                            >
                                {h}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-px bg-gray-100 self-stretch"></div>
                <div>
                    <div className="text-[12px] text-gray-500 mb-1 text-center font-medium">Min</div>
                    <div className="max-h-48 overflow-y-auto no-scrollbar space-y-0.5">
                        {minutesArr.map((m) => (
                            <button
                                key={m}
                                className={`w-full aspect-square flex items-center justify-center text-[12px] rounded-[4px] font-medium ${m === p.m ? "bg-blue-primary250 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                                onClick={() => update({ m })}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="w-px bg-gray-100 self-stretch"></div>
                <div className="flex flex-col gap-1 justify-center">
                    {["AM", "PM"].map((ap) => (
                        <button
                            key={ap}
                            className={`w-full h-8 flex items-center justify-center text-[12px] rounded-[4px] font-medium ${ap === p.ap ? "bg-blue-primary250 text-white" : "text-gray-700 hover:bg-gray-100"}`}
                            onClick={() => update({ ap })}
                        >
                            {ap}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <GeneralDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Set Out of Office"
            primaryActionLabel={isSaving ? (
                <div className="flex items-center gap-2">
                    <UniversalLoader size={16} style={{ width: 'auto', height: 'auto' }} />
                    <span>Saving...</span>
                </div>
            ) : "Save"}
            onPrimaryAction={handleSave}
            primaryActionDisabled={!isDirty || isSaving}
            width={600}
        >
            <div className="flex flex-col gap-4">
                {/* Toggle Section */}
                <div className="flex items-center gap-3">
                    <Toggle checked={enabled} onChange={() => setEnabled(!enabled)} />
                    <span className="text-[14px] text-secondary-grey300">Set as Out of Office</span>
                </div>

                {/* Description */}
                <p className="text-[14px] text-secondary-grey200 leading-[16px] font-normal font-inter">
                    This feature lets doctors set their availability status when they're away. Once
                    enabled, it automatically updates their profile to reflect unavailability,
                    helping teams and patients know when not to expect responses or appointments.
                </p>

                {/* Date/Time Inputs Container */}
                <div className="flex flex-col gap-4">
                    {/* Start Date & Time Pair */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <InputWithMeta
                                label={<span className={enabled ? "text-secondary-grey300" : "text-secondary-grey150"}>Start Date & Time</span>}
                                requiredDot={enabled}
                                value={formatDateForDisplay(startDate)}
                                placeholder="Select Date"
                                RightIcon={() => <CalendarWhiteIcon disabled={!enabled} />}
                                onFieldOpen={() => enabled && setShowStartCalendar(!showStartCalendar)}
                                dropdownOpen={showStartCalendar}
                                onRequestClose={() => setShowStartCalendar(false)}
                                disabled={!enabled}
                                className={!enabled ? "opacity-50" : ""}
                            />
                            {showStartCalendar && enabled && (
                                <div className="shadcn-calendar-dropdown absolute z-[10001] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-2 left-0 top-full">
                                    <ShadcnCalendar
                                        mode="single"
                                        selected={startDate ? new Date(startDate) : undefined}
                                        onSelect={(d) => handleDateSelect(d, setStartDate, setShowStartCalendar)}
                                        className="rounded-lg p-1"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <InputWithMeta
                                label={<div className="h-[20px]" />} // Placeholder for alignment
                                value={(() => {
                                    const p = parseTime(startTime);
                                    return `${p.h12}:${p.m} ${p.ap}`;
                                })()}
                                placeholder="Select Time"
                                RightIcon={() => <img src={clockIcon} className={`w-4 h-4 ${!enabled ? "opacity-30" : ""}`} alt="clock" />}
                                onFieldOpen={() => enabled && setShowStartTimeDD(!showStartTimeDD)}
                                dropdownOpen={showStartTimeDD}
                                onRequestClose={() => setShowStartTimeDD(false)}
                                disabled={!enabled}
                                dropdown={showStartTimeDD && enabled && renderTimeDropdown(startTime, setStartTime, setShowStartTimeDD)}
                                className={!enabled ? "opacity-50" : ""}
                            />
                        </div>
                    </div>

                    {/* End Date & Time Pair */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <InputWithMeta
                                label={<span className={enabled ? "text-secondary-grey300" : "text-secondary-grey150"}>End Date & Time</span>}
                                requiredDot={enabled}
                                value={formatDateForDisplay(endDate)}
                                placeholder="Select Date"
                                RightIcon={() => <CalendarWhiteIcon disabled={!enabled} />}
                                onFieldOpen={() => enabled && setShowEndCalendar(!showEndCalendar)}
                                dropdownOpen={showEndCalendar}
                                onRequestClose={() => setShowEndCalendar(false)}
                                disabled={!enabled}
                                className={!enabled ? "opacity-50" : ""}
                            />
                            {showEndCalendar && enabled && (
                                <div className="shadcn-calendar-dropdown absolute z-[10001] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl p-2 left-0 top-full">
                                    <ShadcnCalendar
                                        mode="single"
                                        selected={endDate ? new Date(endDate) : undefined}
                                        onSelect={(d) => handleDateSelect(d, setEndDate, setShowEndCalendar)}
                                        className="rounded-lg p-1"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <InputWithMeta
                                label={<div className="h-[20px]" />} // Placeholder for alignment
                                value={(() => {
                                    const p = parseTime(endTime);
                                    return `${p.h12}:${p.m} ${p.ap}`;
                                })()}
                                placeholder="Select Time"
                                RightIcon={() => <img src={clockIcon} className={`w-4 h-4 ${!enabled ? "opacity-30" : ""}`} alt="clock" />}
                                onFieldOpen={() => enabled && setShowEndTimeDD(!showEndTimeDD)}
                                dropdownOpen={showEndTimeDD}
                                onRequestClose={() => setShowEndTimeDD(false)}
                                disabled={!enabled}
                                dropdown={showEndTimeDD && enabled && renderTimeDropdown(endTime, setEndTime, setShowEndTimeDD)}
                                className={!enabled ? "opacity-50" : ""}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </GeneralDrawer>
    );
}
