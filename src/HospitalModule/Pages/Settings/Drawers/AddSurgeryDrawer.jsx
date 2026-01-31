import React, { useEffect, useState, useMemo } from 'react';
import GeneralDrawer from '../../../../components/GeneralDrawer/GeneralDrawer';
import InputWithMeta from '../../../../components/GeneralDrawer/InputWithMeta';
import { addHospitalSurgeryForAdmin, updateHospitalSurgeryForAdmin } from '../../../../services/hospitalService';
import useToastStore from '../../../../store/useToastStore';
import useHospitalAuthStore from '../../../../store/useHospitalAuthStore';
import UniversalLoader from '../../../../components/UniversalLoader';

export default function AddSurgeryDrawer({ open, onClose, onSave, mode = 'add', initial = {} }) {
    const { hospitalId } = useHospitalAuthStore();
    const addToast = useToastStore(state => state.addToast);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        setName(initial.name || '');
        setDescription(initial.description || '');
    }, [open, initial]);

    const isDirty = useMemo(() => {
        const norm = (v) => v || "";
        return (
            norm(name) !== norm(initial.name) ||
            norm(description) !== norm(initial.description)
        );
    }, [name, description, initial]);

    const handleSave = async () => {
        if (!hospitalId) return;
        if (!name.trim()) return;
        if (!isDirty && mode === 'edit') return;

        setLoading(true);
        try {
            const payload = { name, description };
            let res;
            if (mode === 'add') {
                res = await addHospitalSurgeryForAdmin(hospitalId, payload);
            } else {
                res = await updateHospitalSurgeryForAdmin(hospitalId, initial.id, payload);
            }

            if (res.success) {
                addToast({ title: "Success", message: mode === 'add' ? "Surgery added successfully" : "Surgery updated successfully", type: "success" });
                onSave?.(); // Refresh
                onClose?.();
            } else {
                throw new Error("Operation failed");
            }
        } catch (error) {
            console.error("Failed to save surgery:", error);
            addToast({ title: "Error", message: error?.response?.data?.message || "Failed to save surgery", type: "error" });
        } finally {
            setLoading(false);
        }
    }

    return (
        <GeneralDrawer
            isOpen={open}
            onClose={onClose}
            title={mode === 'add' ? "Create New Surgery" : "Edit Surgery"}
            primaryActionLabel={loading ? (
                <div className="flex items-center gap-2">
                    <UniversalLoader size={16} />
                    <span>Saving...</span>
                </div>
            ) : (mode === 'add' ? "Create" : "Update")}
            width={600}
            onPrimaryAction={handleSave}
            primaryActionDisabled={!name.trim() || (!isDirty && mode === 'edit') || loading}
        >
            <div className="flex flex-col gap-5">
                <InputWithMeta
                    label="Surgery Name"
                    requiredDot={true}
                    value={name}
                    onChange={setName}
                    placeholder="Enter surgery name"
                    inputRightMeta={
                        <div className='text-secondary-grey150'>
                            {name.length}/250
                        </div>
                    }
                />

                <InputWithMeta
                    label="Description"
                    showInput={false}
                >
                    <textarea
                        className="w-full rounded-sm border-[0.5px] border-secondary-grey200 p-2 h-32 text-sm text-secondary-grey400 focus:outline-none focus:ring-0 focus:border-blue-primary150 focus:border-[2px] placeholder:text-secondary-grey100 resize-none"
                        placeholder="Describe the surgery"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </InputWithMeta>
            </div>
        </GeneralDrawer>
    )
}
