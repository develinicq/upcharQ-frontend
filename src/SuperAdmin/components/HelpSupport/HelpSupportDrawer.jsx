import React, { useState } from 'react';
import GeneralDrawer from '../../../components/GeneralDrawer/GeneralDrawer';
import { Headphones, Mail, Presentation, Calendar as CalendarIcon, Check, Loader2 } from 'lucide-react';

const HelpSupportDrawer = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('quickActions');
    const [isCallRequested, setIsCallRequested] = useState(false);

    return (
        <GeneralDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Help & Support"
            width={500}
            showPrimaryAction={false}
        >
            <div className="flex flex-col gap-6">
                {/* Tabs */}
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('quickActions')}
                        className={`pb-2 text-xs font-normal  transition-colors ${activeTab === 'quickActions'
                            ? 'text-blue-500 border-b-2 border-blue-500'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Quick Actions
                    </button>
                    <button
                        onClick={() => setActiveTab('historyLog')}
                        className={`pb-2 text-xs font-normal  transition-colors ${activeTab === 'historyLog'
                            ? 'text-blue-500 border-b-2 border-blue-500'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        History Log
                    </button>
                </div>

                {activeTab === 'quickActions' ? (
                    <div className="flex flex-col gap-3">
                        {/* Call Back Card */}
                        {/* Call Back Card */}
                        <div className={`p-2 border border-gray-300 rounded-lg flex flex-col gap-2 shadow-sm bg-white transition-all`}>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Headphones className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xs font-medium text-gray-900">Request a Call Back</h3>
                                    <p className="text-xs text-gray-700 mt-0.5">Upchar Saathi will connect with you</p>
                                </div>
                                <button
                                    onClick={() => setIsCallRequested(true)}
                                    disabled={isCallRequested}
                                    className={`px-1 py-1.5 border text-xs font-medium rounded transition-colors ${isCallRequested
                                        ? 'bg-gray-50 text-gray-200 border-gray-100 cursor-not-allowed'
                                        : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    Send Request
                                </button>
                            </div>

                            {isCallRequested && (
                                <div className="mt-1 bg-green-50 rounded-md p-1.5 flex items-center justify-between">
                                    <style>{`
                                        @keyframes blink {
                                            0%, 100% { opacity: 1; }
                                            50% { opacity: 0; }
                                        }
                                    `}</style>
                                    <div className="flex items-center gap-5">
                                        <div className="ml-1 w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0" style={{ animation: 'blink 1s infinite' }}>
                                            <Check className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-700">Your Request has been raised</h4>
                                            <p className="text-[10px] text-gray-600 mt-0.5">Our Saathi will reach you out soon!</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] text-gray-700 block mb-0.5">Ticket Number</span>
                                        <span className="text-[10px] font-light  text-gray-900 bg-white px-1 rounded border border-gray-200 block">S124567894</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Email Card */}
                        <div className="p-2 border border-gray-300 rounded-lg flex items-center gap-4 shadow-sm bg-white">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xs font-medium text-gray-900">Email Us</h3>
                                <p className="text-xs text-gray-600 mt-0.5">support@upchar.com</p>
                            </div>
                            <button className="px-2 py-1.5 border border-blue-200 text-blue-600 text-xs font-medium rounded hover:bg-blue-50 transition-colors">
                                Send eMail
                            </button>
                        </div>

                        {/* Demo Meeting Card */}
                        <div className="p-2 border border-gray-300 rounded-lg flex flex-col  shadow-sm bg-white">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <Presentation className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xs font-medium text-gray-900">Request a Demo Meeting</h3>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pl-[56px]">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter Name"
                                        className="flex-1 min-w-0 h-7 px-1 text-xs border border-gray-400 rounded-md outline-none focus:border-blue-500 text-gray-700 placeholder:text-gray-200"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Enter Email"
                                        className="flex-1 min-w-0 h-7 px-1 text-xs border border-gray-400 rounded-md outline-none focus:border-blue-500 text-gray-700 placeholder:text-gray-200"
                                    />
                                    <div className="flex-1 min-w-0 relative">
                                        <input
                                            type="text"
                                            placeholder="Select Date"
                                            className="w-full h-7 px-1 text-xs border border-gray-400 rounded-md outline-none focus:border-blue-500 text-gray-700 placeholder:text-gray-200 pr-8"
                                        />
                                        <CalendarIcon className="w-4 h-4 text-gray-400 absolute right-2.5 top-2 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <button className="px-4 py-1.5 bg-gray-50 text-gray-200 text-xs font-medium rounded border border-gray-100 hover:bg-gray-100 transition-colors">
                                        Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <p className="text-sm">No history available</p>
                    </div>
                )}
            </div>
        </GeneralDrawer>
    );
};

export default HelpSupportDrawer;
