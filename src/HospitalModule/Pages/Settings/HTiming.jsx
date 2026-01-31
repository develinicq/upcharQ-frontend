// HTiming.jsx
import React, { useState, useEffect } from 'react'
import Toggle from '../../../components/FormItems/Toggle'
import TimeInput from '../../../components/FormItems/TimeInput'
import { Checkbox } from '../../../components/ui/checkbox'
import { Trash2 } from 'lucide-react'
import { getHospitalTimingsForAdmin } from '../../../services/hospitalService'
import useHospitalAuthStore from '../../../store/useHospitalAuthStore'
import UniversalLoader from '../../../components/UniversalLoader'

export default function HTiming() {
  const { hospitalId } = useHospitalAuthStore();

  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    const fetchTimings = async () => {
      if (!hospitalId) {
        setLoading(false);
        return;
      }

      setLoading(true)
      setError(null)
      try {
        const resp = await getHospitalTimingsForAdmin(hospitalId)
        const apiSchedule = resp?.data?.schedule || []

        // Normalize to local structure
        const norm = apiSchedule.map(item => ({
          day: item.dayOfWeek.charAt(0) + item.dayOfWeek.slice(1).toLowerCase(), // e.g., SUNDAY -> Sunday
          available: !!item.isAvailable,
          is24Hours: !!item.is24Hours,
          sessions: (item.timeRanges || []).map(r => ({
            startTime: r.startTime?.slice(0, 5) || '00:00',
            endTime: r.endTime?.slice(0, 5) || '00:00'
          }))
        }))

        if (!ignore) setSchedule(norm)
      } catch (e) {
        console.error("Failed to fetch timings:", e);
        if (!ignore) setError(e?.response?.data?.message || e.message || 'Failed to load timings')
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchTimings()

    return () => { ignore = true }
  }, [hospitalId])

  const updateDay = (dayName, updates) => {
    setSchedule(prev => prev.map(d => d.day === dayName ? { ...d, ...updates } : d))
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-12">
        <UniversalLoader size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-error-500 bg-error-50 border border-error-100 rounded-lg">
        {error}
      </div>
    );
  }

  if (!schedule || schedule.length === 0) {
    return <div className="p-6 text-gray-500 text-center">No schedule available.</div>;
  }

  const renderDayCard = (dayData) => {
    const { day, available, is24Hours, sessions } = dayData
    const handleUpdate = (updates) => updateDay(day, updates)

    return (
      <div key={day} className="border h-auto min-h-[46px] rounded-lg border-gray-200 p-3 bg-white transition-all duration-200 w-full">
        {/* Header Row: Day Name + Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">{day}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Available</span>
            <Toggle
              checked={available}
              onChange={(e) => handleUpdate({ available: e.target.checked })}
            />
          </div>
        </div>

        {/* Expanded Content */}
        {available && (
          <div className="mt-3 border-t border-secondary-grey100 pt-4 space-y-3">
            {/* 24 Hours Toggle Row */}
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                id={`24h-${day}`}
                checked={is24Hours}
                onCheckedChange={(checked) => handleUpdate({ is24Hours: !!checked })}
                className="w-4 h-4 rounded-[4px] border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label htmlFor={`24h-${day}`} className="text-xs text-secondary-grey400 cursor-pointer select-none">
                Available 24 Hours
              </label>
            </div>

            {/* Sessions List (only if not 24 hours) */}
            {!is24Hours && sessions && (
              <div className="space-y-4">
                {sessions.map((session, sIdx) => (
                  <div key={sIdx} className="flex items-center justify-between min-w-0 mb-3 last:mb-0">
                    <div className='flex items-center gap-2 min-w-0'>
                      <span className="text-sm whitespace-nowrap text-secondary-grey300">Time:</span>
                      <TimeInput
                        value={session.startTime}
                        onChange={(e) => {
                          const newSessions = [...sessions]
                          newSessions[sIdx] = { ...newSessions[sIdx], startTime: e.target.value }
                          handleUpdate({ sessions: newSessions })
                        }}
                        className=""
                      />
                      <span className="text-sm text-gray-400">-</span>
                      <TimeInput
                        value={session.endTime}
                        onChange={(e) => {
                          const newSessions = [...sessions]
                          newSessions[sIdx] = { ...newSessions[sIdx], endTime: e.target.value }
                          handleUpdate({ sessions: newSessions })
                        }}
                        className=""
                      />
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                      {/* Delete Button (only if > 1 session) */}
                      {sessions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newSessions = sessions.filter((_, i) => i !== sIdx)
                            handleUpdate({ sessions: newSessions })
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      {/* Add More Button (only on last item) */}
                      {sIdx === sessions.length - 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (sessions.length >= 6) {
                              alert("Maximum 6 slots allowed")
                              return
                            }
                            const newSessions = [...sessions, { startTime: '09:00', endTime: '18:00' }]
                            handleUpdate({ sessions: newSessions })
                          }}
                          className="text-sm text-blue-600 hover:bg-blue-50 p-1 rounded-md ml-2 whitespace-nowrap"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {/* If 0 sessions (edge case), show add button */}
                {sessions.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newSessions = [{ startTime: '09:00', endTime: '18:00' }]
                      handleUpdate({ sessions: newSessions })
                    }}
                    className="text-sm text-blue-600 hover:bg-blue-50 p-1 rounded-md whitespace-nowrap"
                  >
                    + Add Slot
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-6">
        {schedule.filter((_, i) => i % 2 === 0).map(renderDayCard)}
      </div>
      <div className="flex-1 flex flex-col gap-6">
        {schedule.filter((_, i) => i % 2 === 1).map(renderDayCard)}
      </div>
    </div>
  )
}
