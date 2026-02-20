import React, { useState } from 'react';
import { Download, Eye, Plane, Check } from 'lucide-react';
import Badge from '../../../../../../components/Badge';
import Button from '../../../../../../components/Button';
import GeneralDrawer from '../../../../../../components/GeneralDrawer/GeneralDrawer';
import { plans } from '../../../../Dashboard/Doctor_registration/Step6';

const Billing = ({ doctor }) => {
    // Mock data based on screenshot, but use doctor prop for plan name if available
    // Default to 'Trial Pack' if no active package or plan is found
    const planName = doctor?.activePackage || doctor?.plan || 'Trial Pack';
    const isTrial = planName === 'Trial Pack';

    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
    const [selectedUpgradePlan, setSelectedUpgradePlan] = useState(null);

    const subscription = {
        planName: planName,
        status: 'Active',
        billingCycle: isTrial ? '14 Days' : 'Half-Yearly',
        amount: isTrial ? 'Free' : '₹13,564/- (Inc. Tax)',
        nextBilling: isTrial ? 'N/A' : '05/02/2026 (31 Days Remaing)',
        addOnsDoctor: '-',
        addOnsStaff: isTrial ? '-' : 'x1 - @412 (inc. tax)',
    };

    const invoices = isTrial ? [] : [
        {
            id: 'INV-2025-02',
            dueDate: '02/12/2025',
            plan: 'Plus (Half Yearly)',
            status: 'Pending',
            seats: '1 Doctor | 2 Staff',
            amount: '₹13,564',
        },
        // ... (historical data)
    ];

    const handleSelectPlan = (plan) => {
        setSelectedUpgradePlan(plan.id);
    };

    return (
        <div className="p-6 bg-white min-h-[calc(100vh-200px)]">
            {/* Subscription Card */}
            <div className="border border-gray-200 rounded-lg p-6 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                            <Plane className="text-white w-6 h-6" /> {/* Placeholder for the plane icon */}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Current Subscription</p>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-blue-600">{subscription.planName}</h2>
                                <Badge color="success" size="s" className="ml-2">
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        {subscription.status}
                                    </span>
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 flex items-center gap-2"
                        onClick={() => setIsUpgradeOpen(true)}
                    >
                        <span>↑</span> Upgrade Plan
                    </Button>
                </div>

                <div className="grid grid-cols-5 gap-8 border-t border-gray-100 pt-6">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Billing Cycle</p>
                        <p className="font-medium text-gray-900">{subscription.billingCycle}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Monthly Amount</p>
                        <p className="font-medium text-gray-900">{subscription.amount}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Next Billing</p>
                        <p className="font-medium text-gray-900">{subscription.nextBilling}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Active Add-ons of Doctor</p>
                        <p className="font-medium text-gray-900">{subscription.addOnsDoctor}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Active Add-ons of Staff</p>
                        <p className="font-medium text-gray-900">{subscription.addOnsStaff}</p>
                    </div>
                </div>
            </div>

            {/* Invoices Section */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Invoices</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">Invoice Number <span className="text-gray-400">↕</span></th>
                                <th className="px-6 py-3 font-medium">Due Date <span className="text-gray-400">↕</span></th>
                                <th className="px-6 py-3 font-medium">Plan <span className="text-gray-400">↕</span></th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Seats <span className="text-gray-400">↕</span></th>
                                <th className="px-6 py-3 font-medium">Bill Amount <span className="text-gray-400">↕</span></th>
                                <th className="px-6 py-3 font-medium text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500 text-sm">
                                        No invoices found for {planName}
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{invoice.id}</td>
                                        <td className="px-6 py-4 text-gray-500">{invoice.dueDate}</td>
                                        <td className="px-6 py-4 text-gray-500">{invoice.plan}</td>
                                        <td className="px-6 py-4">
                                            {invoice.status === 'Pending' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-50 text-red-500 border border-red-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                                                    Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                                                    Paid
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{invoice.seats}</td>
                                        <td className="px-6 py-4 text-gray-900">{invoice.amount}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                {invoice.status === 'Pending' && (
                                                    <Button size="xs" className="bg-[#194FA2] hover:bg-blue-800 text-white flex items-center gap-1 !py-1 !px-3 !rounded">
                                                        <span className="text-xs">💳 Make Payment</span>
                                                    </Button>
                                                )}
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="text-gray-400 hover:text-gray-600">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Upgrade Drawer */}
            <GeneralDrawer
                isOpen={isUpgradeOpen}
                onClose={() => setIsUpgradeOpen(false)}
                title="Select a Plan"
                width={800} // Wider to fit plan cards
                showPrimaryAction={true}
                primaryActionLabel="Proceed to Pay"
                onPrimaryAction={() => alert('Proceeding to payment...')}
                primaryActionDisabled={!selectedUpgradePlan}
            >
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.map((plan) => (
                        plan.id !== 'trial' && ( // Don't show trial plan for upgrade
                            <div
                                key={plan.id}
                                className={`
                                    border rounded-lg p-4 relative cursor-pointer transition-all
                                    ${selectedUpgradePlan === plan.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}
                                `}
                                onClick={() => handleSelectPlan(plan)}
                            >
                                {selectedUpgradePlan === plan.id && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10">
                                        {/* Render the icon if possible, straightforward since it's JSX in the array */}
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                                        <p className="text-sm font-bold text-blue-600">{plan.price} <span className="text-xs font-normal text-gray-500">{plan.period}</span></p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {plan.features.slice(0, 5).map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </GeneralDrawer>
        </div>
    );
};

export default Billing;
