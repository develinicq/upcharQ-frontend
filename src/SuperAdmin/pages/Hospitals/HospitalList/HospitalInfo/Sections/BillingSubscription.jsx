import React, { useState } from 'react';
import { Download, Eye, Check, CreditCard, Plane } from 'lucide-react';
import GeneralDrawer from '@/components/GeneralDrawer/GeneralDrawer';
import { plans } from '@/SuperAdmin/pages/Dashboard/Doctor_registration/Step6';


// Helper to get badge color based on status
const StatusBadge = ({ status }) => {
    const s = (status || '').toLowerCase();
    if (s === 'paid' || s === 'active') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Paid
            </span>
        );
    }
    if (s === 'pending') {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-500 border border-red-100">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Pending
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100">
            {status || '-'}
        </span>
    );
};

const BillingSubscription = ({ hospital }) => {
    const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
    const [selectedUpgradePlan, setSelectedUpgradePlan] = useState(null);

    const planName = hospital?.subscriptionName || hospital?.activePackage || hospital?.subscription?.planName || 'Trial Pack';
    const isTrial = planName === 'Trial Pack' || planName === '-';

    const subscription = {
        planName: planName === '-' ? 'Trial Pack' : (planName.includes('Upchar-Q') ? planName : `Upchar-Q ${planName}`),
        status: 'Active',
        billingCycle: isTrial ? '60 Days' : 'Half-Yearly',
        monthlyAmount: isTrial ? 'Free' : '₹32,444/- (Inc. Tax)',
        nextBilling: isTrial ? 'N/A' : '05/02/2026 (31 Days Remaining)',
        addOnsDoctor: '-',
        addOnsStaff: isTrial ? '-' : 'x1 - @412 (inc. tax)',
    };

    const invoices = isTrial ? [] : [];

    const handleSelectPlan = (plan) => {
        setSelectedUpgradePlan(plan.id);
    };

    return (
        <div className="p-4 bg-secondary-grey50 min-h-[500px]">
            {/* Current Subscription Card */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
                {/* Header row */}
                <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                        {/* Plan icon */}
                        <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center shrink-0">
                            <Plane className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-0.5">Current Subscription</p>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-blue-600">{subscription.planName}</h2>
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    {subscription.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsUpgradeOpen(true)}
                        className="flex items-center gap-1.5 h-8 px-3 bg-white border border-gray-200 text-gray-700 text-sm rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-blue-600">↑</span>
                        <span>Upgrade Plan</span>
                    </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-5 gap-6 pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Billing Cycle</p>
                        <p className="text-sm font-medium text-gray-900">{subscription.billingCycle}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Monthly Amount</p>
                        <p className="text-sm font-medium text-gray-900">{subscription.monthlyAmount}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Next Billing</p>
                        <p className="text-sm font-medium text-gray-900">{subscription.nextBilling}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Active Add-ons of Doctor</p>
                        <p className="text-sm font-medium text-gray-900">{subscription.addOnsDoctor}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Active Add-ons of Staff</p>
                        <p className="text-sm font-medium text-gray-900">{subscription.addOnsStaff}</p>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900">Invoices</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                            <tr className="h-10">
                                <th className="px-5 py-0 font-medium whitespace-nowrap">
                                    Invoice Number <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-0 font-medium whitespace-nowrap">
                                    Due Date <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-0 font-medium whitespace-nowrap">
                                    Plan <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-0 font-medium">Status</th>
                                <th className="px-4 py-0 font-medium whitespace-nowrap">
                                    Seats <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-4 py-0 font-medium whitespace-nowrap">
                                    Bill Amount <span className="text-gray-400">↕</span>
                                </th>
                                <th className="px-5 py-0 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-8 text-center text-gray-400 text-sm">
                                        No invoices found.
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors h-[52px]">
                                        <td className="px-5 py-0 font-medium text-gray-900">{invoice.id}</td>
                                        <td className="px-4 py-0 text-gray-600">{invoice.dueDate}</td>
                                        <td className="px-4 py-0 text-gray-600">{invoice.plan}</td>
                                        <td className="px-4 py-0">
                                            <StatusBadge status={invoice.status} />
                                        </td>
                                        <td className="px-4 py-0 text-gray-600 whitespace-nowrap">{invoice.seats}</td>
                                        <td className="px-4 py-0 text-gray-900 font-medium">{invoice.amount}</td>
                                        <td className="px-5 py-0">
                                            <div className="flex items-center justify-end gap-2">
                                                {invoice.status === 'Pending' && (
                                                    <button className="flex items-center gap-1.5 h-7 px-3 bg-[#194FA2] hover:bg-blue-700 text-white text-xs rounded transition-colors">
                                                        <CreditCard className="w-3 h-3" />
                                                        Make Payment
                                                    </button>
                                                )}
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors">
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
            </div >

            {/* Upgrade Plan Drawer */}
            < GeneralDrawer
                isOpen={isUpgradeOpen}
                onClose={() => setIsUpgradeOpen(false)}
                title="Select a Plan"
                width={800}
                showPrimaryAction={true}
                primaryActionLabel="Proceed to Pay"
                onPrimaryAction={() => alert('Proceeding to payment...')}
                primaryActionDisabled={!selectedUpgradePlan}
            >
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.map((plan) => (
                        plan.id !== 'trial' && (
                            <div
                                key={plan.id}
                                className={`border rounded-lg p-5 relative cursor-pointer transition-all ${selectedUpgradePlan === plan.id
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                    : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                onClick={() => handleSelectPlan(plan)}
                            >
                                {selectedUpgradePlan === plan.id && (
                                    <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 flex shrink-0 items-center justify-center overflow-hidden">
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">{plan.name}</h3>
                                        <p className="text-sm font-bold text-blue-600">
                                            {plan.price}{' '}
                                            <span className="text-xs font-normal text-gray-500">{plan.period}</span>
                                        </p>
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
            </GeneralDrawer >
        </div >
    );
};

export default BillingSubscription;
