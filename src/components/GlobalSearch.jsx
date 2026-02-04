import React, { useState, useEffect } from 'react';
import { Search, X, History, UserPlus, Calendar, Clock, ArrowUpRight } from 'lucide-react';

const GlobalSearch = ({ isOpen, onClose }) => {
    // Rotating placeholder logic
    const [placeholder, setPlaceholder] = useState("Search 'Patient'");
    const placeholders = [
        "Search 'Phone Number'",
        "Search 'Patient'",
        "Search 'Patient ID'",
        "Search 'Action'"
    ];

    useEffect(() => {
        if (!isOpen) return;

        let index = 0;
        // Set initial placeholder
        setPlaceholder(placeholders[0]);

        const interval = setInterval(() => {
            index = (index + 1) % placeholders.length;
            setPlaceholder(placeholders[index]);
        }, 1500); // 1.5s as requested ("one by one wthin 1sec" - slightly slower might read better, but I'll stick close to 1s)

        return () => clearInterval(interval);
    }, [isOpen]);

    // Trap focus or just handle closing
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/20 flex items-start justify-center pt-4"
            onClick={onClose}
        >
            <div
                className="w-[550px] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Header */}
                <div className="flex items-center px-4 py-4 border-b border-gray-200 gap-3">
                    {/* Blue bar indicator */}
                    <div className='w-[3px] h-[24px] bg-blue-4 rounded-full'></div>
                    <input
                        type="text"
                        placeholder={placeholder}
                        className="flex-1 text-[15px] outline-none text-gray-700 placeholder-gray-400 font-light "
                        autoFocus
                    />
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-5 pb-5 pt-3 flex flex-col gap-3">

                    {/* Recent Searches */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-light text-gray-400">Your Recent Searches</span>
                            <button className="text-xs text-blue-500 hover:underline">Clear</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded-md text-sm text-gray-700 hover:text-blue-600 transition-colors">
                                <History className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" /> Alok Sharma
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded-md text-sm text-gray-700 hover:text-blue-600 transition-colors">
                                <History className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" /> Add New Patient
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded-md text-sm text-gray-700 hover:text-blue-600 transition-colors">
                                <History className="w-3.5 h-3.5 text-gray-400 hover:text-blue-600" /> PA01234
                            </button>
                        </div>
                    </div>

                    {/* Patient Result */}
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-light text-gray-400">Patient</span>
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer group transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-sm bg-[#EBF5FF] text-[#2F66F6] flex items-center justify-center text-sm font-light">
                                    A
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-medium text-gray-700 leading-none">Alok Sharma</span>
                                    <span className="text-[11px] text-gray-500 leading-none">M | 12/05/1985 (39Y) | +91 91740 26589</span>
                                </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col ">
                        <span className="text-xs font-normal text-gray-400">Actions</span>
                        <div className="flex flex-col ">
                            <button className="flex items-center gap-1.5 p-1.5 hover:bg-gray-50 rounded-lg text-left group transition-colors w-full">
                                <UserPlus className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">Add new Patient</span>
                            </button>
                            <button className="flex items-center gap-1.5 p-1.5 hover:bg-gray-50 rounded-lg text-left group transition-colors w-full">
                                <Calendar className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">Add Walking Appointment</span>
                            </button>
                            <button className="flex items-center gap-1.5 p-1.5 hover:bg-gray-50 rounded-lg text-left group transition-colors w-full">
                                <Clock className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900">Update Consultation Timing</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GlobalSearch;
