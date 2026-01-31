import React, { useState } from "react";
import Info from "./Sections/Info";
import Consultation from "./Sections/Consultation";
import { pencil } from "../../../../../public/index.js";

const PageNav = ({ doctor }) => {
    const [activeTab, setActiveTab] = useState("personal");
    const [isEditMode, setIsEditMode] = useState(false);

    const tabs = [
        { key: "personal", label: "Personal Info" },
        { key: "consultation", label: "Consultation Details" },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "personal":
                return <Info doctor={doctor} />;
            case "consultation":
                return <Consultation doctor={doctor} isEditMode={isEditMode} setIsEditMode={setIsEditMode} />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full bg-secondary-grey50 ">
            {/* Tabs */}
            <div className="px-2 border-b border-secondary-grey100 flex items-center justify-between">
                <nav className="px-2 flex items-center gap-2 overflow-x-auto text-sm">
                    {tabs.map((t) => {
                        const active = activeTab === t.key;
                        return (
                            <button
                                key={t.key}
                                onClick={() => {
                                    setActiveTab(t.key);
                                    if (t.key !== 'consultation') setIsEditMode(false);
                                }}
                                className={`whitespace-nowrap px-[6px] py-1 pb-2 border-b-2 transition-colors ${active
                                    ? "border-blue-primary250 text-blue-primary250"
                                    : "border-transparent text-secondary-grey300 hover:text-gray-900"
                                    }`}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-4 pr-4">
                    {activeTab === 'consultation' && !isEditMode && (
                        <button
                            onClick={() => setIsEditMode(true)}
                            className="flex items-center gap-1 text-blue-primary250 text-sm font-medium hover:text-blue-700 transition-colors"
                        >
                            <img src={pencil} alt="edit" className="w-5 h-5" />
                            <span>Edit</span>
                        </button>
                    )}
                    <button className="p-1 hover:bg-gray-100 rounded transition-colors grayscale opacity-60">
                        <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className=" bg-secondary-grey50">{renderContent()}</div>
        </div>
    );
};

export default PageNav;
