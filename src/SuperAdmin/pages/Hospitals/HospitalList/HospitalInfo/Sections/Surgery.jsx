import React, { useState, useEffect, useCallback } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { pencil } from '../../../../../../../public/index.js'
import { Checkbox } from '../../../../../../components/ui/checkbox'
import AddSurgeryDrawer from '../Drawers/AddSurgeryDrawer.jsx'
import EditSurgeryDrawer from '../Drawers/EditSurgeryDrawer.jsx'
import { getHospitalSurgeriesForSuperAdmin, deleteHospitalSurgeryForSuperAdmin } from '../../../../../../services/hospitalService'
import UniversalLoader from '../../../../../../components/UniversalLoader'
import useToastStore from '../../../../../../store/useToastStore'

export default function Surgery({ hospital }) {
    const hospitalId = hospital?.temp || hospital?.id
    const [surgeries, setSurgeries] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAddDrawerOpen, setAddDrawerOpen] = useState(false)
    const [isEditDrawerOpen, setEditDrawerOpen] = useState(false)
    const [selectedSurgery, setSelectedSurgery] = useState(null)
    const [selected, setSelected] = useState(new Set())
    const addToast = useToastStore(state => state.addToast)

    const fetchSurgeries = useCallback(async () => {
        if (!hospitalId) {
            setLoading(false)
            return
        }
        setLoading(true)
        try {
            const res = await getHospitalSurgeriesForSuperAdmin(hospitalId)
            if (res.success) {
                setSurgeries(res.data?.surgeries || [])
            }
        } catch (error) {
            console.error("Failed to fetch surgeries:", error)
        } finally {
            setLoading(false)
        }
    }, [hospitalId])

    useEffect(() => {
        fetchSurgeries()
    }, [fetchSurgeries])

    const allSelected = surgeries.length > 0 && selected.size === surgeries.length

    const toggleAll = () => {
        setSelected((sel) => (sel.size === surgeries.length ? new Set() : new Set(surgeries.map((s) => s.id))))
    }

    const toggleOne = (id) => setSelected((sel) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); return n })

    const handleEdit = (surgery) => {
        setSelectedSurgery(surgery)
        setEditDrawerOpen(true)
    }

    const handleDelete = async (surgeryId) => {
        if (!window.confirm('Are you sure you want to delete this surgery?')) return;

        try {
            const res = await deleteHospitalSurgeryForSuperAdmin(hospitalId, surgeryId)
            if (res.success) {
                addToast({
                    title: 'Success',
                    message: 'Surgery deleted successfully',
                    type: 'success'
                })
                fetchSurgeries()
            }
        } catch (error) {
            console.error("Failed to delete surgery:", error)
            addToast({
                title: 'Error',
                message: error?.response?.data?.message || 'Failed to delete surgery',
                type: 'error'
            })
        }
    }

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <UniversalLoader size={28} />
            </div>
        )
    }

    return (
        <div className="p-4">
            {/* Header bar with action link */}
            <div className="flex items-center justify-end mb-2">
                <button type="button" onClick={() => setAddDrawerOpen(true)} className="text-blue-primary250 text-sm hover:underline font-medium">+ New Surgery</button>
            </div>

            {surgeries.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center rounded-lg bg-white">
                    <p className="text-secondary-grey300 text-sm">No surgeries added yet.</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-secondary-grey100 rounded-lg">
                    <table className="min-w-full table-fixed text-sm text-left ">
                        <colgroup>
                            <col className="w-[44px]" />
                            <col className="w-[320px]" />
                            <col />
                            <col className="w-[120px]" />
                        </colgroup>
                        <thead className="bg-[#F9FAFB] border-b border-secondary-grey100">
                            <tr className="h-[40px] text-xs text-secondary-grey400 uppercase tracking-wider">
                                <th className="pl-3 pr-2 py-0 align-center">
                                    <Checkbox
                                        checked={allSelected}
                                        onCheckedChange={toggleAll}
                                        aria-label="Select all"
                                    />
                                </th>
                                <th className="pr-4 py-0 align-middle font-medium">
                                    <span className="inline-flex items-center gap-1 cursor-pointer select-none group">
                                        Surgery Name
                                        <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
                                    </span>
                                </th>
                                <th className="px-4 py-0 align-middle font-medium">
                                    <span className="inline-flex items-center gap-1 cursor-pointer select-none group">
                                        Surgery Description
                                        <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
                                    </span>
                                </th>
                                <th className="px-4 py-0 align-middle text-right font-medium pr-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {surgeries.map((s) => (
                                <tr key={s.id} className="h-[54px] border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                                    <td className="pl-3 pr-2 py-3 align-center">
                                        <Checkbox
                                            checked={selected.has(s.id)}
                                            onCheckedChange={() => toggleOne(s.id)}
                                            aria-label={`Select ${s.name}`}
                                        />
                                    </td>
                                    <td className="pr-4 font-medium text-secondary-grey400 align-middle truncate">{s.name}</td>
                                    <td className="px-4 text-secondary-grey300 align-middle line-clamp-1 py-4 block">{s.description}</td>
                                    <td className="px-2 align-middle pr-5">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                                                aria-label="Edit"
                                                title="Edit"
                                                onClick={() => handleEdit(s)}
                                            >
                                                <img src={pencil} alt="Edit" className="w-6 h-6" />
                                            </button>
                                            <div className="h-4 w-[1px] bg-gray-200" aria-hidden="true" />
                                            <button
                                                className="p-1 rounded hover:bg-red-50 transition-colors"
                                                aria-label="Delete"
                                                title="Delete"
                                                onClick={() => handleDelete(s.id)}
                                            >
                                                <img src="/Doctor_module/settings/dustbin.png" alt="Delete" className="w-3.5 h-3.5 object-contain opacity-50 hover:opacity-100" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <AddSurgeryDrawer
                open={isAddDrawerOpen}
                onClose={() => setAddDrawerOpen(false)}
                onSuccess={fetchSurgeries}
                hospitalId={hospitalId}
            />

            <EditSurgeryDrawer
                open={isEditDrawerOpen}
                onClose={() => {
                    setEditDrawerOpen(false)
                    setSelectedSurgery(null)
                }}
                onSuccess={fetchSurgeries}
                hospitalId={hospitalId}
                surgery={selectedSurgery}
            />
        </div>
    )
}
