import React, { useEffect, useState, useRef } from 'react';
import GeneralDrawer from '@/components/GeneralDrawer/GeneralDrawer';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
const trash = '/trash_red.png'

const defaultServices = [
    "24x7 Pharmacy", "Ambulance Service", "Blood Bank", "Cafeteria", "CT Scan", "Diagnostic Lab", "Emergency Room", "ICU", "MRI Scan", "NICU", "Operation Theater", "Parking", "Physiotherapy", "Private Rooms", "Ultrasound", "Ventilator", "Waiting Area", "Wheelchair Access", "X-Ray", "WiFi"
];

export default function HospitalServicesDrawer({ open, onClose, selectedItems = [], onSave }) {
    const [selected, setSelected] = useState([]);
    const [customServices, setCustomServices] = useState([]);
    const [isAddingString, setIsAddingString] = useState(false);
    const [newItemValue, setNewItemValue] = useState("");
    const inputRef = useRef(null);
    useEffect(() => {
        if (open) {
            setSelected(selectedItems || []);
            const unknownItems = (selectedItems || []).filter(s => !defaultServices.includes(s));
            setCustomServices(prev => Array.from(new Set([...prev, ...unknownItems])));
            setIsAddingString(false); setNewItemValue("");
        }
    }, [open, selectedItems]);
    useEffect(() => { if (isAddingString && inputRef.current) inputRef.current.focus(); }, [isAddingString]);
    const toggleItem = (item) => setSelected(sel => sel.includes(item) ? sel.filter(i => i !== item) : [...sel, item]);
    const handleSave = () => { onSave?.(selected); onClose?.(); };
    const handleSaveNewItem = () => { const val = newItemValue.trim(); if (!val) return; if (!defaultServices.includes(val) && !customServices.includes(val)) setCustomServices([...customServices, val]); setNewItemValue(""); setIsAddingString(false); };
    const handleKeyDown = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleSaveNewItem(); } };
    const allAvailable = [...defaultServices, ...customServices];
    const selectedList = allAvailable.filter(s => selected.includes(s));
    const unselectedList = allAvailable.filter(s => !selected.includes(s));
    return (
        <GeneralDrawer isOpen={open} onClose={onClose} title="Hospital Services & Facilities" primaryActionLabel="Update" onPrimaryAction={handleSave}>
            <div className="flex flex-col gap-2">
                {selectedList.length > 0 && (
                    <div className='flex flex-col gap-2.5'>
                        <div className="text-secondary-grey300 text-sm ">Selected</div>
                        <div className="flex flex-col gap-2">
                            {selectedList.map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <Checkbox id={`serv-${item}`} checked onCheckedChange={() => toggleItem(item)} />
                                    <label htmlFor={`serv-${item}`} className="text-xs text-secondary-grey300">{item}</label>
                                </div>
                            ))}
                        </div>
                        <div className="border-b-[0.5px] border-secondary-grey100/50 my-1"></div>
                    </div>
                )}
                {!isAddingString ? (
                    <button onClick={() => setIsAddingString(true)} className="flex items-center gap-1 text-sm text-blue-primary250 hover:underline w-fit mb-0.5">
                        <Plus className="w-4 h-4" /> Add New
                    </button>
                ) : (
                    <div className="mb-0.5">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="relative w-full">
                                <input ref={inputRef} type="text" value={newItemValue} onChange={(e) => setNewItemValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Enter Service or Facility Name" maxLength={50} className="w-full h-8 text-sm p-2 pr-12 border border-secondary-grey300/50 rounded-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-300" />
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-1">
                                    <button onClick={handleSaveNewItem} className="border border-blue-primary150/60 bg-blue-primary100 hover:border-blue-primary250/70 text-blue-primary250 text-xs font-medium px-[6px] py-0.5 rounded-sm">Save</button>
                                    <span className="text-xs text-secondary-grey300">{newItemValue.length}/50</span>
                                </div>
                            </div>
                            <button onClick={() => { setIsAddingString(false); setNewItemValue(""); }} className="text-red-400 hover:bg-red-50 rounded-sm p-1 "><img src={trash} alt="" className='w-3.5' /></button>
                        </div>
                        <div className="text-xs text-secondary-grey200">Press Ctrl+ENTER to Save</div>
                    </div>
                )}
                <div className="flex flex-col gap-2">
                    {unselectedList.map((item) => (
                        <div key={item} className="flex items-center gap-2">
                            <Checkbox id={`serv-${item}`} checked={false} onCheckedChange={() => toggleItem(item)} />
                            <label htmlFor={`serv-${item}`} className="text-xs text-secondary-grey300">{item}</label>
                        </div>
                    ))}
                </div>
            </div>
        </GeneralDrawer>
    );
}
