import React, { useState } from 'react';
import GeneralDrawer from '../../../components/GeneralDrawer/GeneralDrawer';
import { Upload } from 'lucide-react';

const RaiseQueryDrawer = ({ isOpen, onClose }) => {
    const [queryType, setQueryType] = useState('query'); // 'query' or 'suggestion'

    return (
        <GeneralDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Raise & Suggest"
            width={400}
            showPrimaryAction={false}
            headerRight={
                <button
                    onClick={onClose}
                    className="px-3 py-1.5 text-xs font-normal text-gray-400 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                >
                    Submit
                </button>
            }
        >
            <div className="flex flex-col gap-6">

                {/* Radio Buttons */}
                <div className="flex gap-6 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            checked={queryType === 'query'}
                            onChange={() => setQueryType('query')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">Raise Query</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name="type"
                            checked={queryType === 'suggestion'}
                            onChange={() => setQueryType('suggestion')}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">Suggestion</span>
                    </label>
                </div>

                {/* Form Fields */}
                <div className="flex flex-col gap-4">
                    {/* Type of Query */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-normal text-gray-600">
                            Type of Query <span className="text-red-500">*</span>
                        </label>
                        <select className="w-full h-8 px-1 text-xs border border-gray-400 rounded-md outline-none focus:border-blue-500 text-gray-200 bg-white">
                            <option value="">Select Query</option>
                            <option value="technical">Technical Issue</option>
                            <option value="billing">Billing</option>
                            <option value="feature">Feature Request</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-600">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            placeholder="Describe Your Query"
                            className="w-full h-24 p-2 text-xs border border-gray-400 rounded-md outline-none focus:border-blue-500 text-gray-700 placeholder:text-gray-300 resize-none"
                        />
                    </div>

                    {/* Attachment */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-600">
                            Add Attachment
                        </label>
                        <div className="border border-dashed border-blue-400 rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-blue-50/30 cursor-pointer hover:bg-blue-50/50 transition-colors">
                            <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">

                                <Upload className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-[8px] text-blue-500">
                                Drag and Dop Screenshot or Attachment
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </GeneralDrawer>
    );
};

export default RaiseQueryDrawer;
