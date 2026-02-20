import React, { useState, useEffect } from 'react';
import { useRegistration } from '../../../context/RegistrationContext';
import { RegistrationHeader, ActionButton } from '../../../../components/FormItems';
import { Check, Minus, Plus } from 'lucide-react';
import useHospitalRegistrationStore from '../../../../store/useHospitalRegistrationStore';
import { activateHospital } from '../../../../services/hospitalService';
import { activateDoctor } from '../../../../services/doctorService';
import useHospitalDoctorDetailsStore from '../../../../store/useHospitalDoctorDetailsStore';
import useHospitalStep1Store from '../../../../store/useHospitalStep1Store';
import useToastStore from '../../../../store/useToastStore';

const PLANS = [
    {
        id: "trial",
        name: "Upchar-Q Trial",
        price: "60 Days Free",
        monthlyPrice: 0,
        isPrice: false,
        isTrial: true,
        features: [
            "1 Doctor + 1 Staff (No Extra Add-ons)",
            "Unlimited Online Appointments",
            "Max 25 Walk-in Appointments Daily",
            "Queue Management System",
            "Front Desk Access",
            "Hospital Social Profile",
            "Doctor Profile",
            "Role Base Access"
        ],
        defaultDoctors: 1,
        defaultStaff: 1
    },
    {
        id: "basic",
        name: "Upchar-Q Basic",
        price: "₹3,499",
        monthlyPrice: 3499,
        period: "/Mo",
        taxNote: "+ taxes",
        features: [
            "2 Doctor + 2 Staff",
            "Unlimited Online and Walk-ins Appts",
            "Queue Management System",
            "Front Desk Access",
            "Hospital Social Profile",
            "Doctor Profile",
            "Role Based Access",
            "Hospital Based Access"
        ],
        defaultDoctors: 2,
        defaultStaff: 2
    },
    {
        id: "plus",
        name: "Upchar-Q Plus",
        price: "₹5,499",
        monthlyPrice: 5499,
        period: "/Mo",
        taxNote: "+ taxes",
        features: [
            "2 Doctor + 2 Staff",
            "Unlimited Online and Walk-ins Appts",
            "Personalized Dashboard",
            "Hospital Dashboard",
            "Queue Management System",
            "Front Desk Access",
            "Patient Listing",
            "Personal Calendar",
            "Hospital Social Profile",
            "Doctor Social Profile",
            "Role Based Access"
        ],
        defaultDoctors: 2,
        defaultStaff: 2
    },
    {
        id: "pro",
        name: "Upchar-Q Pro",
        price: "₹6,999",
        monthlyPrice: 6999,
        period: "/Mo",
        taxNote: "+ taxes",
        features: [
            "4 Doctor + 5 Staff",
            "Unlimited Online and Walk-ins Appts",
            "Personalized Dashboard",
            "Hospital Dashboard",
            "Queue Management System",
            "Front Desk Access",
            "Patient Listing",
            "Personal Calendar",
            "Clinic Social Profile",
            "Doctor Social Profile",
            "Role Based Access"
        ],
        defaultDoctors: 4,
        defaultStaff: 5
    },
    {
        id: "max",
        name: "Upchar-Q Max",
        price: "₹8,999",
        monthlyPrice: 8999,
        period: "/Mo",
        taxNote: "+ taxes",
        features: [
            "6 Doctor + 8 Staff",
            "Unlimited Online and Walk-ins Appts",
            "Personalized Dashboard",
            "Hospital Dashboard",
            "Queue Management System",
            "Front Desk Access",
            "Patient Listing",
            "Personal Calendar",
            "Hospital Social Profile",
            "Doctor Social Profile",
            "Role Based Access",
            "Priority Support"
        ],
        defaultDoctors: 6,
        defaultStaff: 8
    },
    {
        id: "enterprise",
        name: "Enterprise",
        price: "₹2,499",
        monthlyPrice: 2499,
        period: "/Mo",
        taxNote: "+ taxes",
        features: [
            "8 Minimum Doctors Requires",
            "8 Minimum Staffs Requires",
            "Unlimited Online and Walk-ins Appts",
            "Personalized Dashboard",
            "Hospital Dashboard",
            "Queue Management System",
            "Front Desk Access",
            "Patient Listing",
            "Personal Calendar",
            "Clinic Social Profile",
            "Doctor Social Profile",
            "Role Based Access",
            "Priority Support"
        ],
        defaultDoctors: 8,
        defaultStaff: 8,
        isEnterprise: true
    }
];

// Placeholder for Plan Icon
const PlanIcon = ({ id }) => {
    const colors = {
        trial: "bg-teal-500",
        basic: "bg-blue-600",
        plus: "bg-blue-700",
        pro: "bg-indigo-600",
        max: "bg-purple-600",
        enterprise: "bg-slate-800"
    };
    return (
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl ${colors[id] || "bg-blue-500"}`}>
            {id.charAt(0).toUpperCase()}
        </div>
    );
};

const Hos_6 = () => {
    const { formData, updateFormData, nextStep, prevStep } = useRegistration();

    // Initialize state from formData or defaults
    const [billingCycle, setBillingCycle] = useState(formData.billingCycle || 'monthly');
    const [selectedPlanId, setSelectedPlanId] = useState(formData.selectedPlanId || 'trial');
    const [numDoctors, setNumDoctors] = useState(formData.numDoctors || 1);
    const [numStaffs, setNumStaffs] = useState(formData.numStaffs || 1);
    const [loading, setLoading] = useState(false);

    const selectedPlan = PLANS.find(p => p.id === selectedPlanId) || PLANS[0];

    // Update numbers when plan changes
    useEffect(() => {
        if (selectedPlan) {
            setNumDoctors(prev => Math.max(prev, selectedPlan.defaultDoctors || 1));
            setNumStaffs(prev => Math.max(prev, selectedPlan.defaultStaff || 1));
        }
    }, [selectedPlanId, selectedPlan]);

    const handleSelectPlan = (id) => {
        setSelectedPlanId(id);
        const plan = PLANS.find(p => p.id === id);
        if (plan) {
            setNumDoctors(plan.defaultDoctors);
            setNumStaffs(plan.defaultStaff);
        }
        updateFormData({ selectedPlanId: id });
    };

    // Calculate pricing based on billing cycle
    const calculateTotal = () => {
        if (selectedPlanId === 'trial') return 0;

        let base = selectedPlan.monthlyPrice;

        // Enterprise Calculation Logic (Assumption: price per doctor)
        if (selectedPlan.isEnterprise) {
            base = selectedPlan.monthlyPrice * numDoctors;
        }

        // Total Amount for the selected period
        if (billingCycle === 'half-yearly') {
            return base * 6 * 0.90; // 10% discount for 6 months
        } else if (billingCycle === 'annually') {
            return base * 12 * 0.80; // 20% discount for 1 year
        }

        return base; // Monthly
    };

    const invoiceAmount = calculateTotal();
    const displayAmount = selectedPlanId === 'trial' ? '00' : Math.round(invoiceAmount).toLocaleString('en-IN');

    // Dynamic period label based on selection
    let periodLabel = '/Month';
    if (billingCycle === 'half-yearly') periodLabel = '/6 Months';
    if (billingCycle === 'annually') periodLabel = '/Year';

    const store = useHospitalRegistrationStore();

    const handlePurchase = async () => {
        setLoading(true);

        // Update local form data first
        updateFormData({
            billingCycle,
            selectedPlanId,
            numDoctors,
            numStaffs,
            planPrice: invoiceAmount
        });

        try {
            // 1. Get initial IDs from stores or formData
            const adminId = useHospitalStep1Store.getState().adminId ||
                useHospitalRegistrationStore.getState().adminId ||
                formData.adminId;

            // 2. If Owner is a Doctor, save their professional details first
            if (formData.isDoctor === 'yes') {
                if (!adminId) {
                    console.error("Admin ID not found in any store:", {
                        step1: useHospitalStep1Store.getState().adminId,
                        registration: useHospitalRegistrationStore.getState().adminId,
                        formData: formData.adminId
                    });
                    throw new Error("Admin ID not found. Please go back to Step 1 and complete the account creation.");
                }

                // Ensure userId is set for doctor details
                useHospitalDoctorDetailsStore.getState().setField('userId', adminId);

                const doctorOk = await useHospitalDoctorDetailsStore.getState().submit();
                if (!doctorOk) {
                    const error = useHospitalDoctorDetailsStore.getState().error;
                    throw new Error(error || "Failed to save doctor details");
                }
            }

            // 3. ALWAYS Save Hospital Details (Address, Services, Timing, etc. from Step 3, 4, 5)
            // Even if they are not a doctor owner, we must save the hospital part
            if (adminId && !store.adminId) {
                store.setField('adminId', adminId);
            }

            const hosOk = await store.submit();
            if (!hosOk) throw new Error("Failed to save hospital details");

            // 4. Get the latest hospitalId (might have been updated by submit)
            const finalHid = useHospitalRegistrationStore.getState().hospitalId ||
                useHospitalStep1Store.getState().hospitalId ||
                formData.hospitalId;

            if (!finalHid) {
                throw new Error("Hospital ID not found after saving details");
            }

            // 5. Final Activation
            const res = await activateHospital(finalHid);
            if (res && res.success) {
                // If the user is also a doctor, activate their doctor profile
                if (formData.isDoctor === 'yes') {
                    const finalAdminId = useHospitalStep1Store.getState().adminId ||
                        useHospitalRegistrationStore.getState().adminId ||
                        formData.adminId;

                    if (finalAdminId) {
                        try {
                            await activateDoctor(finalAdminId);
                        } catch (docError) {
                            console.error("Failed to activate doctor profile automatically:", docError);
                            // Continue without failing the whole process, as hospital is activated
                        }
                    }
                }

                useToastStore.getState().addToast({
                    title: 'Success',
                    message: 'Account activated successfully!',
                    type: 'success'
                });
                nextStep();
            } else {
                throw new Error(res?.message || "Activation failed");
            }

        } catch (error) {
            console.error("Purchase error:", error);

            // DEV MODE: Allow bypass if token is missing/unauthorized during testing
            const isAuthError = error.message?.includes('Token missing') ||
                error.message?.includes('Unauthorized') ||
                error.response?.status === 401;

            if (isAuthError) {
                useToastStore.getState().addToast({
                    title: 'Dev Mode: Activation Skipped',
                    message: 'Proceeding without backend activation (Auth missing).',
                    type: 'warning',
                    duration: 3000
                });
                nextStep();
                return;
            }

            useToastStore.getState().addToast({
                title: 'Error',
                message: error.message || 'Failed to process request',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const Tab = ({ id, label }) => (
        <button
            onClick={() => setBillingCycle(id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${billingCycle === id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-transparent text-gray-500 hover:text-gray-900'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-white rounded-md shadow-sm overflow-hidden">
            <RegistrationHeader
                title="Package & Payment"
                subtitle="Select the suitable package and make the payment to activate the account."
            >
                <div className="mt-4 flex justify-center">
                    <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                        <Tab id="monthly" label="Billed Monthly" />
                        <Tab id="half-yearly" label="Billed Half-Yearly" />
                        <Tab id="annually" label="Billed Annually" />
                    </div>
                </div>
            </RegistrationHeader>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
                    {PLANS.map((plan) => {
                        const isSelected = selectedPlanId === plan.id;
                        let dynamicPrice = plan.price;
                        let dynamicPeriod = plan.period;

                        if (!plan.isTrial) {
                            if (billingCycle === 'half-yearly') {
                                const val = Math.round(plan.monthlyPrice * 6 * 0.90);
                                dynamicPrice = `₹${val.toLocaleString('en-IN')}`;
                                dynamicPeriod = '/6 Mo';
                            } else if (billingCycle === 'annually') {
                                const val = Math.round(plan.monthlyPrice * 12 * 0.80);
                                dynamicPrice = `₹${val.toLocaleString('en-IN')}`;
                                dynamicPeriod = '/Yr';
                            }
                        }

                        return (
                            <div
                                key={plan.id}
                                onClick={() => handleSelectPlan(plan.id)}
                                className={`
                   relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex flex-col gap-3 bg-white
                   ${isSelected
                                        ? 'border-blue-600 shadow-md ring-1 ring-blue-600'
                                        : 'border-transparent hover:border-blue-200 shadow-sm'
                                    }
                 `}
                            >
                                <div className="flex items-center gap-3">
                                    <PlanIcon id={plan.id} />
                                    <div className='flex-1'>
                                        <h3 className="font-bold text-gray-700 text-base">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-blue-600">{dynamicPrice}</span>
                                            {dynamicPeriod && <span className="text-xs text-gray-400">{dynamicPeriod}</span>}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                </div>

                                <div className="w-full h-px bg-gray-100"></div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Access To:</p>
                                    <ul className="space-y-1">
                                        {plan.features.slice(0, 6).map((feat, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                                                <Check size={12} className="text-blue-500 mt-0.5" />
                                                <span className="leading-tight">{feat}</span>
                                            </li>
                                        ))}
                                        {plan.features.length > 6 && (
                                            <li className="text-[10px] text-gray-400 pl-5">+ {plan.features.length - 6} more</li>
                                        )}
                                    </ul>
                                </div>

                                <button
                                    className={`w-full mt-auto py-2 rounded-lg text-sm font-medium transition-colors ${isSelected ? 'bg-blue-50 text-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {isSelected ? 'Selected' : 'Choose'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Invoice Section - Fixed at bottom */}
            <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">

                    <div className="flex items-center gap-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Doctors</label>
                            <div className="flex items-center gap-2">
                                <button
                                    className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                    onClick={() => setNumDoctors(prev => Math.max(prev - 1, 1))}
                                    disabled={numDoctors <= (selectedPlan.defaultDoctors || 1)}
                                >
                                    <Minus size={12} />
                                </button>
                                <div className="w-8 h-6 border rounded flex items-center justify-center bg-white text-xs font-bold">
                                    {numDoctors}
                                </div>
                                <button
                                    className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-50"
                                    onClick={() => setNumDoctors(prev => prev + 1)}
                                >
                                    <Plus size={12} />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Staffs</label>
                            <div className="flex items-center gap-2">
                                <button
                                    className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                                    onClick={() => setNumStaffs(prev => Math.max(prev - 1, 1))}
                                    disabled={numStaffs <= (selectedPlan.defaultStaff || 1)}
                                >
                                    <Minus size={12} />
                                </button>
                                <div className="w-8 h-6 border rounded flex items-center justify-center bg-white text-xs font-bold">
                                    {numStaffs}
                                </div>
                                <button
                                    className="w-6 h-6 rounded border flex items-center justify-center hover:bg-gray-50"
                                    onClick={() => setNumStaffs(prev => prev + 1)}
                                >
                                    <Plus size={12} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs text-gray-400">Estimate:</span>
                            <span className="text-sm font-medium text-gray-600">{selectedPlan.name}</span>
                            {selectedPlan.isTrial && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">Free Trial</span>}
                        </div>
                        <div className="text-xl font-bold text-blue-600 flex items-baseline">
                            ₹{displayAmount}<span className="text-xs font-normal text-gray-400 ml-1">{periodLabel}</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => prevStep && prevStep()}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 text-sm"
                        >
                            Previous
                        </button>
                        <button
                            onClick={handlePurchase}
                            disabled={loading}
                            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-70 text-sm shadow-sm min-w-[140px]"
                        >
                            {loading ? 'Processing...' : selectedPlan.isTrial ? 'Activate Trial' : 'Confirm Purchase'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Hos_6;
