import React, { useEffect, useState } from 'react';
import GeneralDrawer from '@/components/GeneralDrawer/GeneralDrawer';
import { Checkbox } from '@/components/ui/checkbox';

const allSpecialties = [
    "Anesthesiology", "Cardiology", "Dermatology", "Endocrinology", "Gastroenterology", "Hematology", "Infectious Diseases", "Internal Medicine", "Nephrology", "Neurology", "Obstetrics & Gynecology", "Oncology", "Ophthalmology", "Orthopedics", "Pediatrics", "Plastic Surgery", "Psychiatry", "Pulmonology", "Radiology", "Rheumatology", "Surgery", "Urology"
];

export default function MedicalSpecialtiesDrawer({ open, onClose, selectedItems = [], onSave }) {
    const [selected, setSelected] = useState([]);
    useEffect(() => { if (open) setSelected(selectedItems || []); }, [open, selectedItems]);
    const toggleItem = (item) => setSelected((sel) => sel.includes(item) ? sel.filter(i => i !== item) : [...sel, item]);
    const handleSave = () => { onSave?.(selected); onClose?.(); };
    const selectedList = allSpecialties.filter(s => selected.includes(s));
    const unselectedList = allSpecialties.filter(s => !selected.includes(s));
    return (
        <GeneralDrawer isOpen={open} onClose={onClose} title="Add Medical Specialties" primaryActionLabel="Update" onPrimaryAction={handleSave}>
            <div className="flex flex-col gap-2">
                {selectedList.length > 0 && (
                    <div className='flex flex-col gap-[9px]'>
                        <div className="text-secondary-grey300 text-sm">Selected</div>
                        <div className="flex flex-col gap-2">
                            {selectedList.map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <Checkbox id={`spec-${item}`} checked onCheckedChange={() => toggleItem(item)} />
                                    <label htmlFor={`spec-${item}`} className="text-xs text-secondary-grey300">{item}</label>
                                </div>
                            ))}
                        </div>
                        <div className="border-b-[0.5px] border-secondary-grey100/50 my-1"></div>
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    {unselectedList.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                            <Checkbox id={`spec-${item}`} checked={false} onCheckedChange={() => toggleItem(item)} />
                            <label htmlFor={`spec-${item}`} className="text-xs text-secondary-grey300">{item}</label>
                        </div>
                    ))}
                </div>
            </div>
        </GeneralDrawer>
    );
}
