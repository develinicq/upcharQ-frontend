import React, { useEffect, useState } from 'react';
import GeneralDrawer from '../../../../components/GeneralDrawer/GeneralDrawer';
import { Checkbox } from '../../../../components/ui/checkbox';
import useHospitalAuthStore from '../../../../store/useHospitalAuthStore';
import { getMedicalSpecialtiesForAdmin, updateHospitalSpecialtiesForAdmin } from '../../../../services/hospitalService';
import useToastStore from '../../../../store/useToastStore';
import UniversalLoader from '../../../../components/UniversalLoader';

export default function MedicalSpecialtiesDrawer({ open, onClose, selectedItems = [], onSave }) {
    const { hospitalId } = useHospitalAuthStore();
    const addToast = useToastStore(state => state.addToast);

    const [availableSpecialties, setAvailableSpecialties] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (open) {
            setSelected(selectedItems || []);
            fetchSpecialties();
        }
    }, [open, selectedItems, hospitalId]);

    const fetchSpecialties = async () => {
        if (!hospitalId) return;
        setFetching(true);
        try {
            const res = await getMedicalSpecialtiesForAdmin(hospitalId);
            if (res.success && res.data?.specialties) {
                // Store full objects: { id, name }
                setAvailableSpecialties(res.data.specialties);
            }
        } catch (error) {
            console.error("Failed to fetch specialties:", error);
        } finally {
            setFetching(false);
        }
    };

    const toggleItem = (name) => setSelected((sel) => sel.includes(name) ? sel.filter(i => i !== name) : [...sel, name]);

    const handleSave = async () => {
        if (!hospitalId) return;
        setLoading(true);
        try {
            // Map selected names back to IDs
            const ids = selected.map(name => {
                const found = availableSpecialties.find(s => s.name === name);
                return found ? found.id : null;
            }).filter(Boolean);

            const res = await updateHospitalSpecialtiesForAdmin(hospitalId, ids);
            if (res.success) {
                addToast({ title: "Success", message: "Specialties updated successfully", type: "success" });
                onSave?.(selected);
                onClose?.();
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            console.error("Failed to update specialties:", error);
            addToast({ title: "Error", message: error?.response?.data?.message || "Failed to update specialties", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    // calculate changes
    const isDirty = JSON.stringify((selectedItems || []).sort()) !== JSON.stringify(selected.sort());

    const selectedList = availableSpecialties.filter(s => selected.includes(s.name));
    const unselectedList = availableSpecialties.filter(s => !selected.includes(s.name));

    return (
        <GeneralDrawer
            isOpen={open}
            onClose={onClose}
            title="Add Medical Specialties"
            primaryActionLabel={loading ? (
                <div className="flex items-center gap-2">
                    <UniversalLoader size={16} />
                    <span>Updating...</span>
                </div>
            ) : "Update"}
            onPrimaryAction={handleSave}
            primaryActionDisabled={!isDirty || loading}
        >
            {fetching ? (
                <div className="flex items-center justify-center p-8">
                    <UniversalLoader size={24} />
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {selectedList.length > 0 && (
                        <div className='flex flex-col gap-[9px]'>
                            <div className="text-secondary-grey300 text-sm">Selected</div>
                            <div className="flex flex-col gap-2">
                                {selectedList.map((item) => (
                                    <div key={item.id} className="flex items-center gap-2">
                                        <Checkbox id={`spec-${item.id}`} checked onCheckedChange={() => toggleItem(item.name)} />
                                        <label htmlFor={`spec-${item.id}`} className="text-xs text-secondary-grey300">{item.name}</label>
                                    </div>
                                ))}
                            </div>
                            <div className="border-b-[0.5px] border-secondary-grey100/50 my-1"></div>
                        </div>
                    )}
                    <div className="flex flex-col gap-2">
                        {unselectedList.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                                <Checkbox id={`spec-${item.id}`} checked={false} onCheckedChange={() => toggleItem(item.name)} />
                                <label htmlFor={`spec-${item.id}`} className="text-xs text-secondary-grey300">{item.name}</label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </GeneralDrawer>
    );
}
