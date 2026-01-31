import React, { useState, useEffect } from 'react'
import GeneralDrawer from '../../../../../../components/GeneralDrawer/GeneralDrawer'
import InputWithMeta from '../../../../../../components/GeneralDrawer/InputWithMeta'
import { updateHospitalSurgeryForSuperAdmin } from '../../../../../../services/hospitalService'
import useToastStore from '../../../../../../store/useToastStore'
import UniversalLoader from '../../../../../../components/UniversalLoader'

export default function EditSurgeryDrawer({ open, onClose, onSuccess, hospitalId, surgery }) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const addToast = useToastStore(state => state.addToast)

    useEffect(() => {
        if (surgery && open) {
            setName(surgery.name || '')
            setDescription(surgery.description || '')
        }
    }, [surgery, open])

    const isDirty = name.trim() !== (surgery?.name || '') || description.trim() !== (surgery?.description || '')

    const handleSave = async () => {
        if (!name.trim() || !description.trim() || !hospitalId || !surgery?.id || !isDirty) return;

        setLoading(true)
        try {
            const payload = {}
            if (name.trim() !== (surgery?.name || '')) payload.name = name.trim()
            if (description.trim() !== (surgery?.description || '')) payload.description = description.trim()

            const res = await updateHospitalSurgeryForSuperAdmin(hospitalId, surgery.id, payload)
            if (res.success) {
                addToast({
                    title: 'Success',
                    message: 'Surgery updated successfully',
                    type: 'success'
                })
                onSuccess && onSuccess()
                onClose()
            }
        } catch (error) {
            console.error("Failed to update surgery:", error)
            addToast({
                title: 'Error',
                message: error?.response?.data?.message || 'Failed to update surgery',
                type: 'error'
            })
        } finally {
            setLoading(false)
        }
    }

    const isButtonDisabled = !name.trim() || !description.trim() || loading || !isDirty

    return (
        <GeneralDrawer
            isOpen={open}
            onClose={onClose}
            title="Edit Surgery"
            primaryActionLabel={loading ? (
                <div className="flex items-center gap-2">
                    <UniversalLoader size={16} />
                    <span>Updating...</span>
                </div>
            ) : "Save"}
            width={600}
            onPrimaryAction={handleSave}
            primaryActionDisabled={isButtonDisabled}
            primaryActionLoading={loading}
        >
            <div className="flex flex-col gap-5">
                <InputWithMeta
                    label="Surgery Name"
                    requiredDot={true}
                    value={name}
                    onChange={setName}
                    placeholder="Enter surgery name"
                    inputRightMeta={
                        <div className='text-secondary-grey150 text-[12px]'>
                            {name.length}/250
                        </div>
                    }
                />

                <InputWithMeta
                    label="Description"
                    showInput={false}
                    requiredDot={true}
                >
                    <div className="relative w-full rounded-sm border-[0.5px] border-secondary-grey200 focus-within:border-blue-primary150 focus-within:border-[2px]">
                        <textarea
                            className="w-full p-3 h-32 text-sm text-secondary-grey400 focus:outline-none placeholder:text-secondary-grey100 resize-none border-none rounded-sm"
                            placeholder="Describe the surgery"
                            value={description}
                            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-secondary-grey150 bg-white/80 px-1">
                            {description.length}/500
                        </div>
                    </div>
                </InputWithMeta>
            </div>
        </GeneralDrawer>
    )
}
