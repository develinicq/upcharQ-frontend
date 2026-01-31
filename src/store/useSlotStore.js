import { create } from 'zustand'
import { findPatientSlots, getAppointmentsForSlot } from '../services/authService'

// Central slot store
export const useSlotStore = create((set, get) => ({
  slots: [],
  slotsLoading: false,
  slotsError: '',
  selectedSlotId: null,
  slotAppointments: null,
  slotAppointmentsLoading: false,
  slotAppointmentsError: '',

  loadSlots: async ({ doctorId, date, clinicId, hospitalId }) => {
    // Validate required inputs to prevent bad requests
    if (!doctorId || (!clinicId && !hospitalId) || !date) {
      set({ slots: [], selectedSlotId: null, slotAppointments: null, slotsError: '' })
      return
    }
    // Normalize date to 'yyyy-mm-dd' to avoid timezone and invalid Date on server
    let normalizedDate = ''
    try {
      if (date instanceof Date && !isNaN(date)) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        normalizedDate = `${y}-${m}-${d}`
      } else if (typeof date === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          normalizedDate = date
        } else if (/^\d{4}-\d{2}-\d{2}T/.test(date)) {
          normalizedDate = date.slice(0, 10)
        }
      }
    } catch (_) { /* ignore */ }
    if (!normalizedDate) {
      set({ slots: [], selectedSlotId: null, slotAppointments: null, slotsError: '' })
      return
    }
    set({ slotsLoading: true, slotsError: '' })
    try {
      const resp = await findPatientSlots({
        doctorId,
        date: normalizedDate,
        ...(clinicId ? { clinicId } : (hospitalId ? { hospitalId } : {}))
      })
      const arr = Array.isArray(resp)
        ? resp
        : (Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.slots) ? resp.slots : []))
      set({ slots: arr, slotsLoading: false })
      // Auto-select first slot on load (e.g. when landing or changing date)
      if (arr.length) {
        const first = arr[0] || {}
        const autoId = first.id || first.slotId || first._id || null
        get().selectSlot(autoId)
      } else {
        get().selectSlot(null)
        set({ slotAppointments: null })
      }
    } catch (e) {
      set({ slotsError: e?.response?.data?.message || e.message || 'Failed to load slots', slotsLoading: false })
    }
  },

  selectSlot: (slotId) => set({ selectedSlotId: slotId }),

  loadAppointmentsForSelectedSlot: async () => {
    const slotId = get().selectedSlotId
    if (!slotId) return
    set({ slotAppointmentsLoading: true, slotAppointmentsError: '' })
    try {
      const resp = await getAppointmentsForSlot(slotId)
      if (import.meta.env.VITE_DEBUG_QUEUE) {
        console.debug('[queue] GET /appointments/slot/:id resp', resp)
      }
      // Store directly the 'data' payload if present, else object
      set({ slotAppointments: resp?.data || resp || null, slotAppointmentsLoading: false })
    } catch (e) {
      set({ slotAppointmentsError: e?.response?.data?.message || e.message || 'Failed to load appointments', slotAppointmentsLoading: false })
    }
  },
}))

export default useSlotStore
