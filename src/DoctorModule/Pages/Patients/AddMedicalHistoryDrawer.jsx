import React, { useState, useEffect } from "react";
import { ChevronDown, Plus, Edit2 } from "lucide-react";
import { calendarMinimalistic } from "../../../../public/index.js";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";
import GeneralDrawer from "../../../components/GeneralDrawer/GeneralDrawer";
import InputWithMeta from "../../../components/GeneralDrawer/InputWithMeta";
import RadioButton from "../../../components/GeneralDrawer/RadioButton";
import Badge from "../../../components/Badge";
import { addMedicalRecordByDoctor } from "../../../services/doctorService";
import useToastStore from "@/store/useToastStore";
import UniversalLoader from "../../../components/UniversalLoader";

const SUB_TABS = ["Problems", "Conditions", "Allergies", "Immunizations", "Family History", "Social"];
const SEVERITY_OPTIONS = ["High", "Moderate", "Low", "Mild", "Critical"];
const STATUS_OPTIONS = ["Active", "Inactive", "Resolved", "Enter In Error"];
const RELATION_OPTIONS = ["Father", "Mother", "Sibling", "Grandparent", "Aunt", "Uncle", "Cousin", "Child", "Other"];
const FAMILY_STATUS_OPTIONS = ["Alive", "Deceased", "Unknown"];
const SOCIAL_STATUS_OPTIONS = ["Current", "Former"];

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "");

const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
        return new Date(dateStr).toLocaleDateString("en-GB");
    } catch (e) {
        return dateStr;
    }
};

function SubTabs({ value, onChange }) {
    return (
        <div className="flex items-center gap-[4px] text-xs">
            {SUB_TABS.map((t) => (
                <button
                    key={t}
                    onClick={() => onChange(t)}
                    className={`group flex items-center gap-[2px] p-1 rounded-md border text-nowrap ${value === t
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "text-gray-700 border-none hover:bg-gray-50"
                        }`}
                >
                    <img
                        src={`/${t}.svg`}
                        alt={`${t} icon`}
                        width={16}
                        height={16}
                        className=""
                    />
                    {t}
                </button>
            ))}
        </div>
    );
}


function EntryCard({ title, subtitle, status, onEdit }) {
    const getSevColor = (s) => {
        const val = (s || "").toLowerCase();
        if (val === "high" || val === "critical") return "text-red-500 font-medium";
        if (val === "moderate") return "text-orange-500 font-medium";
        if (val === "low" || val === "mild") return "text-green-600 font-medium";
        return "";
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl mb-3 shadow-sm">
            <div className="flex flex-col gap-1">
                <div className="font-semibold text-gray-900">{title}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    {subtitle.split("|").map((part, i) => {
                        const trimmed = part.trim();
                        const isReaction = trimmed.startsWith("+");
                        const sevColor = getSevColor(trimmed);
                        return (
                            <React.Fragment key={i}>
                                {i > 0 && <span className="text-gray-300 mx-1">|</span>}
                                <span className={isReaction ? "text-orange-500 font-medium" : sevColor}>
                                    {trimmed}
                                </span>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Badge size="xs" type="ghost" color={status.toLowerCase() === "active" ? "red" : status.toLowerCase() === "resolved" ? "green" : "gray"}>
                    {capitalize(status)}
                </Badge>
                <div className="h-4 w-[0.5px] bg-gray-200"></div>
                <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
                    <Edit2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export default function AddMedicalHistoryDrawer({ open, onClose, onSave, patientId, initialTab = "Problems", existingData = null }) {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [showCalendar, setShowCalendar] = useState(false);
    const [dropdowns, setDropdowns] = useState({ severity: false, type: false, status: false, relation: false });
    const [isAdding, setIsAdding] = useState(true);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToastStore();
    const [savedEntries, setSavedEntries] = useState({
        Problems: [],
        Conditions: [],
        Allergies: [],
        Immunizations: [],
        "Family History": [],
        Social: [],
    });

    const initialFormData = {
        Problems: { name: "", onsetDate: "", severity: "", status: "Active", notes: "" },
        Conditions: { name: "", onsetDate: "", severity: "", type: "Chronic", status: "Active", notes: "" },
        Allergies: { name: "", onsetDate: "", severity: "", type: "", status: "Active", reactions: [], notes: "" },
        Immunizations: { name: "", dateAdministered: "", dose: "", notes: "" },
        "Family History": { relationship: "", condition: "", onsetDate: "", status: "Alive", notes: "" },
        Social: { category: "", date: "", frequency: "", status: "Current", source: "Patient", notes: "" },
    };

    // Form states for current draft
    const [formData, setFormData] = useState(JSON.parse(JSON.stringify(initialFormData)));

    useEffect(() => {
        if (open) {
            setActiveTab(initialTab);
            setIsAdding(true);
            setFormData(JSON.parse(JSON.stringify(initialFormData)));

            // Sync with existing data from parent when drawer opens
            if (existingData) {
                setSavedEntries({
                    Problems: existingData.problems || [],
                    Conditions: existingData.conditions || [],
                    Allergies: existingData.allergies || [],
                    Immunizations: existingData.immunization || [],
                    "Family History": existingData.family_history || [],
                    Social: existingData.social || [],
                });

                // If there's existing data for the initial tab, don't default to "adding" mode
                const currentExisting = {
                    Problems: existingData.problems,
                    Conditions: existingData.conditions,
                    Allergies: existingData.allergies,
                    Immunizations: existingData.immunization,
                    "Family History": existingData.family_history,
                    Social: existingData.social
                };
                if (currentExisting[initialTab]?.length > 0) {
                    setIsAdding(false);
                }
            }
        }
    }, [initialTab, open, existingData]);

    const updateForm = (tab, k, v) => {
        setFormData((prev) => ({
            ...prev,
            [tab]: { ...prev[tab], [k]: v }
        }));
    };

    const toggleDD = (name) => setDropdowns(prev => ({ ...prev, [name]: !prev[name] }));
    const closeDDs = () => setDropdowns({ severity: false, type: false, status: false });

    const handleDateSelect = (date) => {
        if (date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${day}`;

            if (activeTab === "Immunizations") {
                updateForm(activeTab, "dateAdministered", dateStr);
            } else if (activeTab === "Social") {
                updateForm(activeTab, "date", dateStr);
            } else {
                updateForm(activeTab, "onsetDate", dateStr);
            }
            setShowCalendar(false);
        }
    };

    const isSaveDisabled = () => {
        const current = formData[activeTab];
        if (saving) return true;

        const hasValue = (v) => typeof v === 'string' ? v.trim().length > 0 : !!v;

        switch (activeTab) {
            case "Problems":
                return !hasValue(current.name) || !hasValue(current.onsetDate) || !hasValue(current.severity) || !hasValue(current.status);
            case "Conditions":
                return !hasValue(current.name) || !hasValue(current.onsetDate) || !hasValue(current.severity) || !hasValue(current.type) || !hasValue(current.status);
            case "Allergies":
                // name is checked in handleSaveEntry to show a specific toast
                return !hasValue(current.onsetDate) || !hasValue(current.severity) || !hasValue(current.type) || !hasValue(current.status);
            case "Immunizations":
                return !hasValue(current.name) || !hasValue(current.dateAdministered) || !hasValue(current.dose);
            case "Family History":
                return !hasValue(current.condition) || !hasValue(current.relationship) || !hasValue(current.onsetDate);
            case "Social":
                return !hasValue(current.category);
            default:
                return false;
        }
    };

    const handleSaveEntry = async () => {
        if (isSaveDisabled()) return;

        const current = formData[activeTab];

        if (activeTab === "Allergies" && !current.name?.trim()) {
            addToast({ title: "Error", message: "Allergen is required", type: "error" });
            return;
        }

        setSaving(true);

        try {
            const recordTypeMap = {
                "Problems": "PROBLEMS",
                "Conditions": "CONDITIONS",
                "Allergies": "ALLERGIES",
                "Immunizations": "IMMUNIZATION",
                "Family History": "FAMILY_HISTORY",
                "Social": "SOCIAL"
            };

            const payload = {
                patientId,
                recordType: recordTypeMap[activeTab],
                recordData: {}
            };

            // Common field mapping with uppercase conversion
            const formatValue = (v) => v?.toUpperCase() || "";

            if (activeTab === "Problems") {
                payload.recordData = {
                    problemName: current.name,
                    onsetDate: current.onsetDate,
                    severity: formatValue(current.severity),
                    status: formatValue(current.status),
                    notes: current.notes
                };
            } else if (activeTab === "Conditions") {
                payload.recordData = {
                    conditionName: current.name,
                    onsetDate: current.onsetDate,
                    severity: formatValue(current.severity),
                    type: formatValue(current.type),
                    status: formatValue(current.status),
                    notes: current.notes
                };
            } else if (activeTab === "Allergies") {
                payload.recordData = {
                    allergen: current.name,
                    onsetDate: current.onsetDate,
                    severity: formatValue(current.severity),
                    allergyType: formatValue(current.type),
                    status: formatValue(current.status),
                    reactions: current.reactions,
                    notes: current.notes
                };
            } else if (activeTab === "Immunizations") {
                payload.recordData = {
                    vaccineName: current.name,
                    dateAdministered: current.dateAdministered,
                    dose: current.dose,
                    notes: current.notes
                };
            } else if (activeTab === "Family History") {
                payload.recordData = {
                    relationship: formatValue(current.relationship),
                    condition: current.condition,
                    onsetDate: current.onsetDate,
                    status: formatValue(current.status),
                    notes: current.notes
                };
            } else if (activeTab === "Social") {
                payload.recordData = {
                    category: current.category,
                    date: current.date,
                    frequency: current.frequency,
                    source: current.source,
                    status: current.status?.toLowerCase() || "",
                    notes: current.notes
                };
            }

            await addMedicalRecordByDoctor(payload);

            addToast({
                title: "Success",
                message: `${activeTab} recorded successfully`,
                type: "success"
            });

            // Update local saved entries for display in drawer
            setSavedEntries(prev => ({
                ...prev,
                [activeTab]: [...prev[activeTab], current]
            }));

            // Reset form for this tab but keep isAdding true for batch entry
            setFormData(prev => ({
                ...prev,
                [activeTab]: JSON.parse(JSON.stringify(initialFormData[activeTab]))
            }));

            // Call parent onSave to refresh main list
            onSave?.();

        } catch (error) {
            console.error(`Error saving ${activeTab}:`, error);
            addToast({
                title: "Error",
                message: error?.response?.data?.message || `Failed to save ${activeTab}`,
                type: "error"
            });
        } finally {
            setSaving(false);
        }
    };

    const renderForm = () => {
        const current = formData[activeTab];

        switch (activeTab) {
            case "Problems":
                return (
                    <div className="flex flex-col gap-4">
                        <InputWithMeta
                            label="Problem"
                            requiredDot
                            value={current.name}
                            onChange={(v) => updateForm("Problems", "name", v)}
                            placeholder="Search or Enter Problem"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <InputWithMeta
                                    label="Since"
                                    requiredDot
                                    value={current.onsetDate}
                                    placeholder="Select Date"
                                    RightIcon={() => <img src={calendarMinimalistic} className="w-4 h-4" alt="cal" />}
                                    onIconClick={() => setShowCalendar(!showCalendar)}
                                    dropdownOpen={showCalendar}
                                    onRequestClose={() => setShowCalendar(false)}
                                />
                                {showCalendar && (
                                    <div className="shadcn-calendar-dropdown absolute z-[10000] bg-white border border-gray-200 rounded-xl shadow-2xl p-2 top-full mt-1">
                                        <ShadcnCalendar
                                            mode="single"
                                            selected={current.onsetDate ? new Date(current.onsetDate) : undefined}
                                            onSelect={handleDateSelect}
                                        />
                                    </div>
                                )}
                            </div>
                            <InputWithMeta
                                label="Severity"
                                requiredDot
                                value={current.severity}
                                placeholder="Select Severity"
                                RightIcon={ChevronDown}
                                dropdownOpen={dropdowns.severity}
                                onFieldOpen={() => toggleDD("severity")}
                                onRequestClose={closeDDs}
                                dropdownItems={SEVERITY_OPTIONS}
                                onSelectItem={(v) => updateForm("Problems", "severity", v)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-secondary-grey300 flex items-center gap-1">
                                Select Status<span className="bg-red-500 w-1 h-1 rounded-full"></span>
                            </label>
                            <div className="flex items-center gap-4">
                                {STATUS_OPTIONS.map(opt => (
                                    <RadioButton
                                        key={opt}
                                        label={opt}
                                        checked={current.status === opt}
                                        onChange={() => updateForm("Problems", "status", opt)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-grey300">Note</label>
                            <textarea
                                className="w-full rounded-sm border-[0.5px] border-secondary-grey200 p-2 text-sm text-secondary-grey400 focus:outline-none focus:ring-0 focus:border-blue-primary150 focus:border-[2px] placeholder:text-secondary-grey100 min-h-[100px]"
                                placeholder="Enter Note"
                                value={current.notes}
                                onChange={(e) => updateForm("Problems", "notes", e.target.value)}
                            />
                        </div>
                    </div>
                );

            case "Conditions":
                return (
                    <div className="flex flex-col gap-4">
                        <InputWithMeta
                            label="Condition"
                            requiredDot
                            value={current.name}
                            onChange={(v) => updateForm("Conditions", "name", v)}
                            placeholder="Search or Enter Condition"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <InputWithMeta
                                    label="Onset Date"
                                    requiredDot
                                    value={current.onsetDate}
                                    placeholder="Select Date"
                                    RightIcon={() => <img src={calendarMinimalistic} className="w-4 h-4" alt="cal" />}
                                    onIconClick={() => setShowCalendar(!showCalendar)}
                                    dropdownOpen={showCalendar}
                                    onRequestClose={() => setShowCalendar(false)}
                                />
                                {showCalendar && (
                                    <div className="shadcn-calendar-dropdown absolute z-[10000] bg-white border border-gray-200 rounded-xl shadow-2xl p-2 top-full mt-1">
                                        <ShadcnCalendar
                                            mode="single"
                                            selected={current.onsetDate ? new Date(current.onsetDate) : undefined}
                                            onSelect={handleDateSelect}
                                        />
                                    </div>
                                )}
                            </div>
                            <InputWithMeta
                                label="Severity"
                                requiredDot
                                value={current.severity}
                                placeholder="Select Severity"
                                RightIcon={ChevronDown}
                                dropdownOpen={dropdowns.severity}
                                onFieldOpen={() => toggleDD("severity")}
                                onRequestClose={closeDDs}
                                dropdownItems={SEVERITY_OPTIONS}
                                onSelectItem={(v) => updateForm("Conditions", "severity", v)}
                            />
                        </div>
                        <div className="grid grid-cols-2 items-center">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm text-secondary-grey300 flex items-center gap-1">
                                    Type<span className="bg-red-500 w-1 h-1 rounded-full"></span>
                                </label>
                                <div className="flex items-center gap-4">
                                    {["Chronic", "Acute"].map(opt => (
                                        <RadioButton
                                            key={opt}
                                            label={opt}
                                            checked={current.type === opt}
                                            onChange={() => updateForm("Conditions", "type", opt)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-secondary-grey300 flex items-center gap-1">
                                Select Status<span className="bg-red-500 w-1 h-1 rounded-full"></span>
                            </label>
                            <div className="flex items-center gap-4">
                                {STATUS_OPTIONS.map(opt => (
                                    <RadioButton
                                        key={opt}
                                        label={opt}
                                        checked={current.status === opt}
                                        onChange={() => updateForm("Conditions", "status", opt)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-grey300">Note</label>
                            <textarea
                                className="w-full rounded-sm border-[0.5px] border-secondary-grey200 p-2 text-sm text-secondary-grey400 focus:outline-none focus:ring-0 focus:border-blue-primary150 focus:border-[2px] placeholder:text-secondary-grey100 min-h-[100px]"
                                placeholder="Enter Note"
                                value={current.notes}
                                onChange={(e) => updateForm("Conditions", "notes", e.target.value)}
                            />
                        </div>
                    </div>
                );

            case "Allergies":
                return (
                    <div className="flex flex-col gap-4">
                        <InputWithMeta
                            label="Allergen"
                            requiredDot
                            value={current.name}
                            onChange={(v) => updateForm("Allergies", "name", v)}
                            placeholder="Search or Enter Allergen Name"
                        />
                        <div className="grid grid-cols-3 gap-3">
                            <div className="relative">
                                <InputWithMeta
                                    label="Since"
                                    requiredDot
                                    value={current.onsetDate}
                                    placeholder="Select Date"
                                    RightIcon={() => <img src={calendarMinimalistic} className="w-4 h-4" alt="cal" />}
                                    onIconClick={() => setShowCalendar(!showCalendar)}
                                    dropdownOpen={showCalendar}
                                    onRequestClose={() => setShowCalendar(false)}
                                />
                                {showCalendar && (
                                    <div className="shadcn-calendar-dropdown absolute z-[10000] bg-white border border-gray-200 rounded-xl shadow-2xl p-2 top-full mt-1">
                                        <ShadcnCalendar
                                            mode="single"
                                            selected={current.onsetDate ? new Date(current.onsetDate) : undefined}
                                            onSelect={handleDateSelect}
                                        />
                                    </div>
                                )}
                            </div>
                            <InputWithMeta
                                label="Severity"
                                requiredDot
                                value={current.severity}
                                placeholder="Select Severity"
                                RightIcon={ChevronDown}
                                dropdownOpen={dropdowns.severity}
                                onFieldOpen={() => toggleDD("severity")}
                                onRequestClose={closeDDs}
                                dropdownItems={SEVERITY_OPTIONS}
                                onSelectItem={(v) => updateForm("Allergies", "severity", v)}
                            />
                            <InputWithMeta
                                label="Type"
                                requiredDot
                                value={current.type}
                                placeholder="Select Type"
                                RightIcon={ChevronDown}
                                dropdownOpen={dropdowns.type}
                                onFieldOpen={() => toggleDD("type")}
                                onRequestClose={closeDDs}
                                dropdownItems={["Drug", "Food", "Environmental", "Other"]}
                                onSelectItem={(v) => updateForm("Allergies", "type", v)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-secondary-grey300 flex items-center gap-1">
                                Select Status<span className="bg-red-500 w-1 h-1 rounded-full"></span>
                            </label>
                            <div className="flex items-center gap-4">
                                {STATUS_OPTIONS.map(opt => (
                                    <RadioButton
                                        key={opt}
                                        label={opt}
                                        checked={current.status === opt}
                                        onChange={() => updateForm("Allergies", "status", opt)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-secondary-grey300">Reactions</label>
                            <div className="flex flex-wrap gap-2">
                                {current.reactions.map((r, idx) => (
                                    <div key={idx} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm border border-blue-100">
                                        {r}
                                        <button onClick={() => {
                                            const newReactions = [...current.reactions];
                                            newReactions.splice(idx, 1);
                                            updateForm("Allergies", "reactions", newReactions);
                                        }} className="hover:text-red-500 ml-1 font-bold">×</button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <input
                                    type="text"
                                    placeholder="Enter reaction and press Enter"
                                    className="flex-1 rounded-sm border-[0.5px] border-secondary-grey200 p-2 h-8 text-sm text-secondary-grey400 focus:outline-none focus:border-blue-primary150"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && e.target.value.trim()) {
                                            e.preventDefault();
                                            updateForm("Allergies", "reactions", [...current.reactions, e.target.value.trim()]);
                                            e.target.value = "";
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    className="text-blue-primary250 hover:bg-blue-50 p-1 rounded-md"
                                    onClick={(e) => {
                                        const input = e.currentTarget.previousSibling;
                                        if (input.value.trim()) {
                                            updateForm("Allergies", "reactions", [...current.reactions, input.value.trim()]);
                                            input.value = "";
                                        }
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-grey300">Note</label>
                            <textarea
                                className="w-full rounded-sm border-[0.5px] border-secondary-grey200 p-2 text-sm text-secondary-grey400 focus:outline-none focus:ring-0 focus:border-blue-primary150 focus:border-[2px] placeholder:text-secondary-grey100 min-h-[100px]"
                                placeholder="Enter Note"
                                value={current.notes}
                                onChange={(e) => updateForm("Allergies", "notes", e.target.value)}
                            />
                        </div>
                    </div>
                );

            case "Immunizations":
                return (
                    <div className="flex flex-col gap-4">
                        <InputWithMeta
                            label="Vaccine Name"
                            requiredDot
                            value={current.name}
                            onChange={(v) => updateForm("Immunizations", "name", v)}
                            placeholder="Search or Enter Vaccine Name"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <InputWithMeta
                                    label="Date Administered"
                                    requiredDot
                                    value={current.dateAdministered}
                                    placeholder="Select Date"
                                    RightIcon={() => <img src={calendarMinimalistic} className="w-4 h-4" alt="cal" />}
                                    onIconClick={() => setShowCalendar(!showCalendar)}
                                    dropdownOpen={showCalendar}
                                    onRequestClose={() => setShowCalendar(false)}
                                />
                                {showCalendar && (
                                    <div className="shadcn-calendar-dropdown absolute z-[10000] bg-white border border-gray-200 rounded-xl shadow-2xl p-2 top-full mt-1">
                                        <ShadcnCalendar
                                            mode="single"
                                            selected={current.dateAdministered ? new Date(current.dateAdministered) : undefined}
                                            onSelect={handleDateSelect}
                                        />
                                    </div>
                                )}
                            </div>
                            <InputWithMeta
                                label="Dose"
                                requiredDot
                                value={current.dose}
                                onChange={(v) => updateForm("Immunizations", "dose", v)}
                                placeholder="Enter Number of Dose"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-grey300">Note</label>
                            <textarea
                                className="w-full rounded-sm border-[0.5px] border-secondary-grey200 p-2 text-sm text-secondary-grey400 focus:outline-none focus:ring-0 focus:border-blue-primary150 focus:border-[2px] placeholder:text-secondary-grey100 min-h-[100px]"
                                placeholder="Enter Note"
                                value={current.notes}
                                onChange={(e) => updateForm("Immunizations", "notes", e.target.value)}
                            />
                        </div>
                    </div>
                );

            case "Family History":
                return (
                    <div className="flex flex-col gap-4">
                        <InputWithMeta
                            label="Enter Problem or Conditions"
                            requiredDot
                            value={current.condition}
                            onChange={(v) => updateForm("Family History", "condition", v)}
                            placeholder="Enter Problem"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <InputWithMeta
                                label="Relation"
                                requiredDot
                                value={current.relationship}
                                placeholder="Select Relation"
                                RightIcon={ChevronDown}
                                dropdownOpen={dropdowns.relation}
                                onFieldOpen={() => toggleDD("relation")}
                                onRequestClose={closeDDs}
                                dropdownItems={RELATION_OPTIONS}
                                onSelectItem={(v) => updateForm("Family History", "relationship", v)}
                            />
                            <div className="relative">
                                <InputWithMeta
                                    label="Sinces"
                                    requiredDot
                                    value={current.onsetDate}
                                    placeholder="Select Date"
                                    RightIcon={() => <img src={calendarMinimalistic} className="w-4 h-4" alt="cal" />}
                                    onIconClick={() => setShowCalendar(!showCalendar)}
                                    dropdownOpen={showCalendar}
                                    onRequestClose={() => setShowCalendar(false)}
                                />
                                {showCalendar && (
                                    <div className="shadcn-calendar-dropdown absolute z-[10000] bg-white border border-gray-200 rounded-xl shadow-2xl p-2 top-full mt-1">
                                        <ShadcnCalendar
                                            mode="single"
                                            selected={current.onsetDate ? new Date(current.onsetDate) : undefined}
                                            onSelect={handleDateSelect}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-secondary-grey300 flex items-center gap-1">
                                Select Status<span className="bg-red-500 w-1 h-1 rounded-full"></span>
                            </label>
                            <div className="flex items-center gap-4">
                                {FAMILY_STATUS_OPTIONS.map(opt => (
                                    <RadioButton
                                        key={opt}
                                        label={opt}
                                        checked={current.status === opt}
                                        onChange={() => updateForm("Family History", "status", opt)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-grey300">Note</label>
                            <textarea
                                className="w-full rounded-sm border-[0.5px] border-secondary-grey200 p-2 text-sm text-secondary-grey400 focus:outline-none focus:ring-0 focus:border-blue-primary150 focus:border-[2px] placeholder:text-secondary-grey100 min-h-[100px]"
                                placeholder="Enter Note"
                                value={current.notes}
                                onChange={(e) => updateForm("Family History", "notes", e.target.value)}
                            />
                        </div>
                    </div>
                );

            case "Social":
                return (
                    <div className="flex flex-col gap-4">
                        <InputWithMeta
                            label="Category"
                            requiredDot
                            value={current.category}
                            onChange={(v) => updateForm("Social", "category", v)}
                            placeholder="e.g. Smoking, Alcohol"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative">
                                <InputWithMeta
                                    label="Since"
                                    value={current.date}
                                    placeholder="Select Date"
                                    RightIcon={() => <img src={calendarMinimalistic} className="w-4 h-4" alt="cal" />}
                                    onIconClick={() => setShowCalendar(!showCalendar)}
                                    dropdownOpen={showCalendar}
                                    onRequestClose={() => setShowCalendar(false)}
                                />
                                {showCalendar && (
                                    <div className="shadcn-calendar-dropdown absolute z-[10000] bg-white border border-gray-200 rounded-xl shadow-2xl p-2 top-full mt-1">
                                        <ShadcnCalendar
                                            mode="single"
                                            selected={current.date ? new Date(current.date) : undefined}
                                            onSelect={handleDateSelect}
                                        />
                                    </div>
                                )}
                            </div>
                            <InputWithMeta
                                label="Frequency"
                                value={current.frequency}
                                onChange={(v) => updateForm("Social", "frequency", v)}
                                placeholder="e.g. Daily, Weekly"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <InputWithMeta
                                label="Source"
                                value={current.source}
                                onChange={(v) => updateForm("Social", "source", v)}
                                placeholder="e.g. Patient"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-secondary-grey300 flex items-center gap-1">
                                Select Status<span className="bg-red-500 w-1 h-1 rounded-full"></span>
                            </label>
                            <div className="flex items-center gap-4">
                                {SOCIAL_STATUS_OPTIONS.map(opt => (
                                    <RadioButton
                                        key={opt}
                                        label={opt}
                                        checked={current.status === opt}
                                        onChange={() => updateForm("Social", "status", opt)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-secondary-grey300">Note</label>
                            <textarea
                                className="w-full rounded-sm border-[0.5px] border-secondary-grey200 p-2 text-sm text-secondary-grey400 focus:outline-none focus:ring-0 focus:border-blue-primary150 focus:border-[2px] placeholder:text-secondary-grey100 min-h-[100px]"
                                placeholder="Enter Note"
                                value={current.notes}
                                onChange={(e) => updateForm("Social", "notes", e.target.value)}
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const getEntryTitle = (entry, tab) => {
        if (tab === "Problems") return capitalize(entry.name || entry.problemName);
        if (tab === "Conditions") return capitalize(entry.name || entry.conditionName);
        if (tab === "Allergies") return capitalize(entry.name || entry.allergen);
        if (tab === "Immunizations") return capitalize(entry.name || entry.vaccineName);
        if (tab === "Family History") return `${capitalize(entry.relationship)}: ${capitalize(entry.condition)}`;
        if (tab === "Social") return capitalize(entry.category);
        return "";
    };

    const getEntrySubtitle = (entry, tab) => {
        const dateStr = entry.onsetDate || entry.dateAdministered || entry.date;
        const date = formatDate(dateStr);
        const parts = [];
        if (date) parts.push(`Since ${date}`);
        if (tab === "Allergies" && (entry.reactions?.length > 0 || entry.notes)) parts.push("+ Reactions");
        if (entry.type || entry.allergyType) parts.push(entry.type || entry.allergyType);
        if (entry.severity) parts.push(entry.severity);
        if (entry.dose || entry.doseNumber) parts.push(`${entry.dose || entry.doseNumber} Dose`);
        return parts.join(" | ");
    };

    return (
        <GeneralDrawer
            isOpen={open}
            onClose={onClose}
            title={`Add ${activeTab === "Social" ? "Social History" : activeTab}`}
            showPrimaryAction={false}
            width={600}
        >
            <div className="flex flex-col h-full overflow-hidden">
                <div className="mb-6">
                    <SubTabs value={activeTab} onChange={(t) => {
                        setActiveTab(t);
                        setIsAdding(savedEntries[t].length === 0);
                        closeDDs();
                    }} />
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-20 px-1">
                    {savedEntries[activeTab].length > 0 && (
                        <div className="mb-4">
                            {savedEntries[activeTab].map((entry, idx) => (
                                <EntryCard
                                    key={idx}
                                    title={getEntryTitle(entry, activeTab)}
                                    subtitle={getEntrySubtitle(entry, activeTab)}
                                    status={entry.status || "Active"}
                                    onEdit={() => {
                                        setFormData(prev => ({ ...prev, [activeTab]: entry }));
                                        setIsAdding(true);
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {isAdding ? (
                        <div className="border border-gray-100 rounded-xl p-4 mb-4 bg-white/50">
                            {renderForm()}

                            <div className="flex items-center gap-3 mt-6 border-t pt-4">
                                <button
                                    onClick={handleSaveEntry}
                                    disabled={isSaveDisabled()}
                                    className="h-8 px-4 bg-blue-primary250 text-white rounded-md text-sm font-medium hover:bg-blue-primary300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[70px]"
                                    style={{ backgroundColor: "#2372EC" }}
                                >
                                    {saving ? (
                                        <div className="flex items-center gap-2">
                                            <UniversalLoader size={16} color="white" style={{ width: 'auto', height: 'auto' }} />
                                            <span>Saving...</span>
                                        </div>
                                    ) : "Save"}
                                </button>
                                <button
                                    onClick={() => {
                                        if (savedEntries[activeTab].length > 0) setIsAdding(false);
                                        else onClose();
                                    }}
                                    className="h-8 px-4 border border-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Discard
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-6 border-2 border-dashed border-blue-100 rounded-xl text-blue-primary250 flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors bg-white/30"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="font-medium">Add {activeTab}</span>
                        </button>
                    )}
                </div>
            </div>
        </GeneralDrawer>
    );
}
