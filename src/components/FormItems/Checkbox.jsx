import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = ({ label, checked, onChange, disabled = false, className = "" }) => {
    return (
        <label
            className={`flex items-center gap-2 cursor-pointer select-none group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            <div className="relative flex items-center justify-center w-5 h-5">
                <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border border-secondary-grey200 rounded-[4px] checked:bg-blue-primary250 checked:border-blue-primary250 transition-colors cursor-pointer"
                    checked={checked}
                    onChange={(e) => onChange && onChange(e.target.checked)}
                    disabled={disabled}
                />
                <Check
                    size={14}
                    className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none stroke-[3]"
                />
            </div>
            {label && <span className="text-sm text-secondary-grey400 group-hover:text-secondary-grey500 transition-colors">{label}</span>}
        </label>
    );
};

export default Checkbox;
