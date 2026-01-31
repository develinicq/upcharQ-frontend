import React, { useState } from 'react';
import { useRegistration } from '../../../context/RegistrationContext';
import { RegistrationHeader, ActionButton } from '../../../../components/FormItems';
import { Check, ArrowRight, Plane, TreePine, Moon, Star } from 'lucide-react';
const check = '/check.png';

const Hos_6 = () => {
    const { formData, updateFormData, nextStep, prevStep } = useRegistration();
    const [selectedPlan, setSelectedPlan] = useState(formData.selectedPlan || 'tier1');

    const handleSelect = (id) => {
        setSelectedPlan(id);
        updateFormData({ selectedPlan: id });
    };

    const handlePayment = () => {
        // Logic to send payment link or navigate
        console.log("Sending payment link for:", selectedPlan);
        // nextStep(); // Or whatever logic is needed
    };

    const plans = [
        {
            id: 'tier1',
            name: 'Tire 1',
            price: '3K',
            period: 'per month',
            features: [
                'Minimum 3 Users Can Invited',
                'Daily Queue limit 20',
                'Can Access Complete System'
            ],
            Icon: Moon, // Using Moon as placeholder for the night scene
        },
        {
            id: 'tier2',
            name: 'Tire 2',
            price: '5K',
            period: 'per month',
            features: [
                'Minimum 5 Users Can Invited',
                'Daily Queue limit 20 - 50',
                'Can Access Complete System'
            ],
            Icon: TreePine,
        },
        {
            id: 'tier3',
            name: 'Tire 3',
            price: '3K',
            period: 'per month',
            features: [
                'Minimum 3 Users Can Invited',
                'Personalized Dashboards',
                'Can Access Complete System'
            ],
            Icon: Plane,
        },
        {
            id: 'tier4',
            name: 'Tire 4',
            price: '3K',
            period: 'per month',
            features: [
                'Minimum 3 Users Can Invited',
                'Personalized Dashboards',
                'Can Access Complete System'
            ],
            Icon: TreePine,
        }
    ];
    // Reusable Plan Card
    const PlanCard = ({ data, isSelected, onSelect }) => {
        const { name, price, period, features, Icon } = data;

        return (
            <div
                onClick={onSelect}
                className={`
                relative w-[330px]   p-4 rounded-lg border flex flex-col justify-between cursor-pointer transition-all duration-200 gap-3
                ${isSelected
                        ? 'bg-blue-primary250 border-blue-primary400/50 text-white shadow-[5px_4px_4.9px_0px_rgba(35,114,236,0.3)]'
                        : 'bg-white border-blue-primary400/50'
                    }
            `}
            >
                {/* Header Content */}
                <div className="flex gap-[15px] items-start ">
                    {/* Icon Box */}
                    <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isSelected ? 'bg-white/20 text-white' : 'bg-[#1B72FE]/10 text-[#1B72FE]'}
                `}>
                        <Icon />
                    </div>

                    <div>
                        <h3 className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-secondary-grey400'}`}>
                            {name}
                        </h3>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-[20px] font-semibold ${isSelected ? 'text-white' : 'text-secondary-grey400'}`}>
                                ₹{price}
                            </span>
                            <span className={`text-[18px] ${isSelected ? 'text-white/80' : 'text-secondary-grey200'}`}>
                                {period}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Features List */}
                <div className="flex flex-col gap-2">
                    <span className={`text-sm block ${isSelected ? 'text-white/80' : 'text-secondary-grey200'}`}>
                        Access To:
                    </span>
                    <div className="flex flex-col gap-2">
                        {features.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <img src={check} alt="" className='w-4 h-4' />
                                <span className={`text-sm ${isSelected ? 'text-white' : 'text-secondary-grey300'}`}>
                                    {item}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`border-t border-secondary-grey200/50 mb-1 mt-1 ${isSelected ? 'border-white/50' : ''}`}></div>

                {/* Selection Button */}
                <button
                    className={`
                    w-full  h-8 rounded-md text-sm font-medium transition-colors mt-auto
                    ${isSelected
                            ? 'border border-secondary-grey200/50 bg-white text-secondary-grey400'
                            : 'bg-blue-primary250 text-white hover:bg-blue-600'
                        }
                `}
                >
                    {isSelected ? 'Selected Plan' : 'Choose'}
                </button>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-md  overflow-hidden">
            <RegistrationHeader
                title="Package & Payment"
                subtitle="Select the suitable package and make the payment to activate the account."
            />

            <div className="flex-1 overflow-y-auto p-6 md:p-8 ">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-1 max-w-[700px] mx-auto">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            data={plan}
                            isSelected={selectedPlan === plan.id}
                            onSelect={() => handleSelect(plan.id)}
                        />
                    ))}
                </div>
            </div>


        </div>
    );
};



export default Hos_6;
