import React from 'react';
import { Mail, Phone, MessageCircle, FileText } from 'lucide-react';

const HelpSupport = () => {
    return (
        <div className="p-6 bg-secondary-grey50 min-h-full">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">Help & Support</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact Support Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Contact Support</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 p-2 rounded-full">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700">Phone Support</h3>
                                    <p className="text-sm text-gray-500 mt-1">Mon-Fri from 9am to 6pm</p>
                                    <a href="tel:+919876543210" className="text-blue-600 text-sm font-medium mt-1 block hover:underline">
                                        +91 98765 43210
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-blue-50 p-2 rounded-full">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700">Email Support</h3>
                                    <p className="text-sm text-gray-500 mt-1">Get response within 24 hours</p>
                                    <a href="mailto:support@upcharq.com" className="text-blue-600 text-sm font-medium mt-1 block hover:underline">
                                        support@upcharq.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links Section */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Links</h2>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-100 group">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">User Guide</span>
                                </div>
                                <MessageCircle className="w-4 h-4 text-gray-400" />
                            </button>

                            <button className="w-full flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-100 group">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">FAQs</span>
                                </div>
                                <MessageCircle className="w-4 h-4 text-gray-400" />
                            </button>

                            <button className="w-full flex items-center justify-between p-3 rounded-md hover:bg-gray-50 transition-colors border border-gray-100 group">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900">Terms & Conditions</span>
                                </div>
                                <MessageCircle className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-medium text-gray-800 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <details className="group border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-700 hover:text-blue-600">
                                <span>How do I add a new doctor?</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <p className="text-gray-500 mt-3 text-sm leading-relaxed group-open:animate-fadeIn">
                                To add a new doctor, go to the Doctors tab in the sidebar and click on the "Add New" button in the top right corner. Fill in the required details and click Save.
                            </p>
                        </details>
                        <details className="group border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-700 hover:text-blue-600">
                                <span>Can I export patient data?</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <p className="text-gray-500 mt-3 text-sm leading-relaxed group-open:animate-fadeIn">
                                Yes, you can export patient data. Navigate to the Patients section and look for the "Export" button above the table. You can export data in CSV or Excel format.
                            </p>
                        </details>
                        <details className="group border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                            <summary className="flex justify-between items-center font-medium cursor-pointer list-none text-gray-700 hover:text-blue-600">
                                <span>How do I change my password?</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <p className="text-gray-500 mt-3 text-sm leading-relaxed group-open:animate-fadeIn">
                                Go to specific Settings page, then click on 'Account Security'. You will find the option to change your password there.
                            </p>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpSupport;
