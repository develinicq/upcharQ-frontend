import React, { useState } from 'react';
import GeneralDrawer from '../../../components/GeneralDrawer/GeneralDrawer';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQDrawer = ({ isOpen, onClose }) => {
    const [selectedFeature, setSelectedFeature] = useState('General');
    const [openQuestionIndex, setOpenQuestionIndex] = useState(null);

    const features = [
        "General",
        "Queue Management",
        "Login and Signup",
        "Patients",
        "Calendar",
        "Settings",
        "Dashboard & Analytics"
    ];

    // Placeholder data repeated as per user request/screenshot
    const faqs = Array(5).fill({
        question: "What Can I Do On Upchar-Q App?",
        answer: "The Benefits Of Becoming A Part Of Bajaj Finserv Health Are Endless. You Get To Create Your Own Digital Clinic And Expand Your Reach By Giving Online Medical Consultations. Our Intelligent Workflows Allow Smart Scheduling And Secure Digital Databases. We Also Provide A New And Improved Way Of Prescribing Medicines That Gives You Automated And Personalized Recommendations Based On The Diagnosis. Remote Patient Consultations Help You Earn More And Increase Patient Engagement Via Video Or In-Clinic Consultation."
    });

    const toggleQuestion = (index) => {
        setOpenQuestionIndex(openQuestionIndex === index ? null : index);
    };

    return (
        <GeneralDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="FAQ's"
            width={450}
            showPrimaryAction={false}
        >
            <div className="flex flex-col gap-4">
                {/* Feature Dropdown */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-normal text-gray-500">
                        Feature
                    </label>
                    <div className="relative">
                        <select
                            value={selectedFeature}
                            onChange={(e) => setSelectedFeature(e.target.value)}
                            className="w-full h-9 px-2 text-xs border border-gray-300 rounded-md outline-none focus:border-blue-500 text-gray-700 bg-white appearance-none cursor-pointer"
                        >
                            {features.map((feature) => (
                                <option key={feature} value={feature}>
                                    {feature}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* FAQ List */}
                <div className="flex flex-col gap-2">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border border-gray-300 rounded-lg overflow-hidden transition-all ${openQuestionIndex === index ? 'shadow-sm ring-1 ring-blue-100' : ''
                                }`}
                        >
                            <button
                                onClick={() => toggleQuestion(index)}
                                className="w-full flex items-center justify-between p-3 bg-white text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="text-xs font-normal text-gray-700">
                                    {faq.question}
                                </span>
                                {openQuestionIndex === index ? (
                                    <ChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                            </button>

                            {openQuestionIndex === index && (
                                <div className="px-4 pb-4 bg-white text-[10px] mr-4 text-gray-800 font-normal">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </GeneralDrawer>
    );
};

export default FAQDrawer;
