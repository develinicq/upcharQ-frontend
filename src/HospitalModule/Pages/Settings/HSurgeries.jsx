import React, { useState, useEffect } from 'react'
import { ChevronsUpDown } from 'lucide-react'
import { pencil } from '../../../../public/index.js'
import { Checkbox } from '../../../components/ui/checkbox'
import AddSurgeryDrawer from './Drawers/AddSurgeryDrawer'
import useHospitalAuthStore from '../../../store/useHospitalAuthStore'
import { getHospitalSurgeriesForAdmin, deleteHospitalSurgeryForAdmin } from '../../../services/hospitalService'
import UniversalLoader from '../../../components/UniversalLoader'
import useToastStore from '../../../store/useToastStore'

export default function HSurgeries() {
  const { hospitalId } = useHospitalAuthStore()
  const addToast = useToastStore(state => state.addToast)

  const [surgeries, setSurgeries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Drawer states
  const [isAddDrawerOpen, setAddDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState('add') // 'add' | 'edit'
  const [drawerData, setDrawerData] = useState(null)

  const [selected, setSelected] = useState(() => new Set())

  useEffect(() => {
    let ignore = false
    const fetchSurgeries = async () => {
      if (!hospitalId) { setLoading(false); return }
      setLoading(true)
      try {
        const res = await getHospitalSurgeriesForAdmin(hospitalId)
        if (!ignore && res?.success) {
          const fetchedData = Array.isArray(res.data) ? res.data : (res.data?.surgeries || [])
          setSurgeries(fetchedData)
        }
      } catch (e) {
        if (!ignore) setError(e?.response?.data?.message || "Failed to load surgeries")
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchSurgeries()
    return () => { ignore = true }
  }, [hospitalId, refreshTrigger])

  const allSelected = surgeries.length > 0 && selected.size === surgeries.length

  const toggleAll = () => {
    setSelected((sel) => (sel.size === surgeries.length ? new Set() : new Set(surgeries.map((s) => s.id))))
  }

  const toggleOne = (id) => setSelected((sel) => { const n = new Set(sel); n.has(id) ? n.delete(id) : n.add(id); return n })

  const onDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this surgery?")) return
    try {
      const res = await deleteHospitalSurgeryForAdmin(hospitalId, id)
      if (res.success) {
        addToast({ title: "Success", message: "Surgery deleted", type: "success" })
        setRefreshTrigger(prev => prev + 1)
      }
    } catch (e) {
      addToast({ title: "Error", message: "Failed to delete surgery", type: "error" })
    }
  }

  const handleEdit = (surgery) => {
    setDrawerData(surgery)
    setDrawerMode('edit')
    setAddDrawerOpen(true)
  }

  const handleAddNew = () => {
    setDrawerData(null)
    setDrawerMode('add')
    setAddDrawerOpen(true)
  }

  if (loading) return <div className="flex justify-center p-10"><UniversalLoader size={30} /></div>
  if (error) return <div className="text-red-500 p-4 bg-red-50 rounded border border-red-100">{error}</div>

  return (
    <div className="">
      {/* Header bar with action link to avoid overlap */}
      <div className="flex items-center justify-end px-4 mb-2">
        <button type="button" onClick={handleAddNew} className="text-blue-primary250 text-sm hover:underline">+ New Surgery</button>
      </div>
      <div className="overflow-x-auto border border-secondary-grey100 rounded-lg">
        <table className="min-w-full table-fixed text-sm text-left ">
          <colgroup>
            <col className="w-[44px]" />
            <col className="w-[320px]" />
            <col />
            <col className="w-[120px]" />
          </colgroup>
          <thead className="bg-white  border-b">
            <tr className="h-[30px] text-sm text-secondary-grey400">
              <th className="pl-3 pr-2 py-0 align-center">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="pr-4 py-0  align-middle font-medium">
                <span className="inline-flex items-center gap-1 cursor-pointer select-none group">
                  Surgery Name
                  <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
                </span>
              </th>
              <th className="px-4 py-0  align-middle font-medium">
                <span className="inline-flex items-center gap-1 cursor-pointer select-none group">
                  Surgery Description
                  <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-600" />
                </span>
              </th>
              <th className="px-4 py-0  align-middle text-right font-medium pr-5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {surgeries.map((s) => (
              <tr key={s.id} className="h-[54px] border-b border-gray-200 hover:bg-gray-50 bg-white text-sm">
                <td className="pl-3 pr-2 py-2 align-center">
                  <Checkbox
                    checked={selected.has(s.id)}
                    onCheckedChange={() => toggleOne(s.id)}
                    aria-label={`Select ${s.name}`}
                  />
                </td>
                <td className="pr-4  font-medium text-secondary-grey400  align-center ">{s.name}</td>
                <td className="px-4   text-secondary-grey300 align-center ">{s.description}</td>
                <td className="px-2  align-center pr-5">
                  <div className="flex items-center justify-end gap-3">
                    <button className="p-1 rounded hover:bg-gray-100 transition-colors" aria-label="Edit" title="Edit" onClick={() => handleEdit(s)}>
                      <img src={pencil} alt="Edit" className="w-7" />
                    </button>
                    <div className="h-5 w-[1px] bg-gray-200" aria-hidden="true" />
                    <button className="p-1 rounded hover:bg-red-50 transition-colors" aria-label="Delete" title="Delete" onClick={() => onDelete(s.id)}>
                      <img src="/Doctor_module/settings/dustbin.png" alt="Delete" className="w-4 h-4 object-contain opacity-80 hover:opacity-100" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {surgeries.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-gray-500">No surgeries added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddSurgeryDrawer
        open={isAddDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        onSave={() => setRefreshTrigger(prev => prev + 1)}
        mode={drawerMode}
        initial={drawerData || {}}
      />
    </div>
  )
}
