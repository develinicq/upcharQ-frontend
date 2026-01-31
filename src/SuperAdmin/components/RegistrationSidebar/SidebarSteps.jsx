import React from "react";

import { Check, FileText, User, Building2, ClipboardList, CreditCard, Stethoscope, CheckCircle, Package, ArrowLeft } from "lucide-react";
import { useRegistration } from "../../context/RegistrationContext.jsx";
import { useNavigate } from "react-router-dom";

import {
  accountBlue,
  stethoscopeBlue,
  documentBlue,
  reviewBlue,
  packageBlue,
  hospitalIcon,
  checkCircle,
  ChevronRight

} from "../../../../public/index.js";

// ... (keep steps arrays as is)

const doctorSteps = [
  {
    id: 1,
    title: "Account Creation",
    icon: (isCompleted, isCurrent) => (
      <img
        src={accountBlue}
        className={`w-7 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Account"
      />
    )
  },
  {
    id: 2,
    title: "Professional Details",
    icon: (isCompleted, isCurrent) => (
      <img
        src={stethoscopeBlue}
        className={`w-7 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Stethoscope"
      />
    )
  },
  {
    id: 3,
    title: "Documents Verification",
    icon: (isCompleted, isCurrent) => (
      <img
        src={documentBlue}
        className={`w-7 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Document"
      />
    )
  },
  {
    id: 4,
    title: "Review & Create",
    icon: (isCompleted, isCurrent) => (
      <img
        src={reviewBlue}
        className={`w-8 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Review"
      />
    )
  },
  {
    id: 5,
    title: "Package & Payment",
    icon: (isCompleted, isCurrent) => (
      <img
        src={packageBlue}
        className={`w-7 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Package"
      />
    )
  },
  {
    id: 6, title: "Registration Complete",
    icon: (isCompleted, isCurrent) => (
      <img
        src={checkCircle}
        className={`w-7 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Package"
      />
    )
  },
];

const hospitalSteps = [
  {
    id: 1,
    title: "Account Creation",
    icon: (isCompleted, isCurrent) => (
      <img
        src={accountBlue}
        className={`w-7 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Account"
      />
    )
  },
  {
    id: 2,
    title: "Doctor Registration",
    icon: (isCompleted, isCurrent) => (
      <img
        src={stethoscopeBlue}
        className={`w-7 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Stethoscope"
      />
    )
  },
  {
    id: 3,
    title: "Hospital Details",
    icon: (isCompleted, isCurrent) => (
      <img
        src={hospitalIcon}
        className={`w-7 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Hospital"
      />
    )
  },
  {
    id: 4,
    title: "Documents Verification",
    icon: (isCompleted, isCurrent) => (
      <img
        src={documentBlue}
        className={`w-7 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Document"
      />
    )
  },
  {
    id: 5,
    title: "Review & Create",
    icon: (isCompleted, isCurrent) => (
      <img
        src={reviewBlue}
        className={`w-8 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Review"
      />
    )
  },
  {
    id: 6,
    title: "Package & Payment",
    icon: (isCompleted, isCurrent) => (
      <img
        src={packageBlue}
        className={`w-7 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="Package"
      />
    )
  },
  {
    id: 7, title: "Registration Complete",
    icon: (isCompleted, isCurrent) => (
      <img
        src={checkCircle}
        className={`w-7 ${!isCompleted && !isCurrent ? 'grayscale opacity-50' : ''}`}
        alt="checkCircle"
      />
    )
  },
];

export default function SidebarSteps({ currentStep }) {
  const { registrationType, formData } = useRegistration();
  const navigate = useNavigate();

  // For hospital registration, conditionally show steps based on isDoctor selection
  let steps;
  if (registrationType === 'doctor') {
    steps = doctorSteps;
  } else if (registrationType === 'hospital') {
    // If user is not a doctor, hide the Doctor Registration step (step 2)
    if (formData.isDoctor === 'no') {
      steps = hospitalSteps.filter(step => step.id !== 2);
    } else {
      steps = hospitalSteps;
    }
  } else {
    steps = hospitalSteps;
  }

  const title = registrationType === 'doctor' ? 'Doctor Registration Form' : 'Hospital Registration Form';

  // Helper function to render icon
  const renderIcon = (step, isCompleted, isCurrent) => {
    if (typeof step.icon === 'function') {
      return step.icon(isCompleted, isCurrent);
    }
    return step.icon;
  };

  return (
    <div className="h-full px-6 pb-9 pt-6 gap-6 bg-white w-[307px] flex flex-col">
      {/* Header with Discard Button */}
      <div className="flex flex-col gap-2 ">
        <button
          onClick={() => navigate('/dashboard')}
          className="
  w-fit
    group flex items-center gap-1
    text-secondary-grey400
    border-b border-transparent
    transition-all
    hover:border-[#2372EC]
  "
        >
          <ArrowLeft
            size={16}
            className="stroke-[1.5] transition-colors group-hover:text-[#2372EC]"
          />
          <span className="text-sm font-normal transition-colors group-hover:text-[#2372EC]">
            Discard
          </span>
        </button>


        <h2 className="text-sm font-semibold text-secondary-grey400">
          {title}
        </h2>
      </div>

      {/* Steps */}
      <div className="w-[259px] flex flex-col relative">
        {/* Vertical connecting line */}
        <div className="absolute left-[26px] top-[26px] bottom-[26px] w-[1px] bg-[#E8E8E8]"></div>

        <div className="space-y-6">
          {steps.map((step, index) => {
            // For hospital registration when step 2 is hidden, adjust step numbers
            let adjustedStepNumber = step.id;
            if (registrationType === 'hospital' && formData.isDoctor === 'no' && step.id > 2) {
              adjustedStepNumber = step.id - 1;
            }

            const isCompleted = adjustedStepNumber < currentStep;
            const isCurrent = adjustedStepNumber === currentStep;
            const isUpcoming = adjustedStepNumber > currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className={`flex items-start group cursor-pointer ${isLast ? 'mt-[6px]' : ''}`}>
                {/* Icon Circle */}
                <div className="flex-shrink-0 relative z-10 w-[52px] flex justify-center">
                  <div
                    className={`rounded-full flex items-center justify-center transition-all duration-200
                    ${isLast ? "w-6 h-6" : "w-[52px] h-[52px] border-[0.5px]"}
                    ${!isLast && isCompleted ? "bg-[#F2FFF3] border-[#6DDB724D]" : ""}
                    ${!isLast && isCurrent ? "bg-[#F8FAFF] border-[#E4EFFF]" : ""}
                    ${!isLast && isUpcoming ? "border-[#D6D6D680] bg-[#F9F9F9]" : ""}
                  `}
                  >

                    {isCompleted ? (
                      <div className="w-6 h-6 border-[1.5px] border-[#2E7D32] rounded-full flex items-center justify-center bg-[#6DDB72]">
                        <Check size={14} className="text-[#2E7D32]" />
                      </div>
                    ) : (
                      <div
                        className={`
                        ${isCurrent ? "text-blue-500 " : ""}
                        ${isUpcoming ? "text-gray-400" : ""}
                      `}
                      >
                        {renderIcon(step, isCompleted, isCurrent)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content - Hidden for last step */}
                {!isLast && (
                  <div className="ml-[9px] flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-normal text-[#626060] ">
                          Step {adjustedStepNumber}
                        </p>
                        <p
                          className={`text-sm font-medium
                          ${isCompleted ? "text-[#424242]" : ""}
                          ${isCurrent ? "text-[#0D47A1]" : ""}
                          ${isUpcoming ? "text-[#424242]" : ""}
                        `}
                        >
                          {step.title}
                        </p>
                        {isCompleted && (
                          <p className="text-xs text-[#3EAF3F]">
                            Completed
                          </p>
                        )}
                        {isCurrent && (
                          <div className="mt-1">
                            <div className="w-8 h-1.5 border-[0.5px] border-[#8E8E8E] rounded-full">
                              <div className="w-1/2 h-full bg-[#6DDB72] rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Arrow for current step */}
                      {isCurrent && (
                        <img
                          src={ChevronRight}
                          alt="chevron-right"
                          className="w-[20px] h-[20px]"
                        />

                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
