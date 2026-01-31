import React from "react";
import Button from "../Button";

export default function InfoBox({ title, description, steps, buttonText, buttonVariant, onClick }) {
  return (
    <div className="bg-white border-[0.5px] border-[#D6D6D6] rounded-lg ">
        <div className="bg-[#F9F9F9] p-[16px] rounded-t-lg border-[#D6D6D6] border-b-[0.5px]">
            <h2 className="text-base font-semibold text-[#424242]">{title}</h2>
            <p className="text-xs text-[#626060] font-normal">{description}</p>
        </div>
      

        <div className="p-4 pb-0 flex flex-col gap-2">
            {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-2">
                <div className={`flex items-center justify-center min-w-[32px] min-h-[32px] h-full border-[0.5px] rounded-full font-normal text-sm
                    ${
                        buttonVariant === "primary"
                        ? " border-[#96BFFF] text-[#2372EC] bg-[#F8FAFF]"
                        : "border-[#D6D6D6] bg-[#F9F9F9] text-[#424242]"
                    }}`}>
                    {index + 1}
                </div>

                <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#424242]">{step.heading}</span>
                    <p className="text-xs font-normal text-[#626060]">{step.text}</p>
                </div>
                </div>
            ))}
            </div>


        <div className="pt-0 p-4">
            <Button buttonText={buttonText} buttonVariant={buttonVariant} onClick={onClick} />
        </div>


        
        </div>
  );
}
