import React, { useState, useEffect } from 'react'
import Toggle from '../../../../../../components/FormItems/Toggle'
import TimeInput from '../../../../../../components/FormItems/TimeInput'
import { Checkbox } from '../../../../../../components/ui/checkbox'
import { Trash2 } from 'lucide-react'
import { getHospitalGeneralTimingsForSuperAdmin } from '../../../../../../services/hospitalService'
import UniversalLoader from '@/components/UniversalLoader'

// Simple module-level cache to avoid re-fetching on tab switches
const __timingsCache = {}

export default function Timing({ hospital }) {
    const dayList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    // Initialize schedule from hospital data if available, otherwise defaults
    // Assuming hospital.timingConfig or similar structure matches. 
    // If not, we fallback to default structure for UI demonstration.
    const [schedule, setSchedule] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // If hospital data updates later
    useEffect(() => {
        let ignore = false
        const fetchTimings = async () => {
            setLoading(true)
            setError(null)
            try {
                // Prefer backend UUID from list state (`temp`), fallback to id
                const hospitalId = hospital?.temp || hospital?.id
                if (!hospitalId) throw new Error('Missing hospitalId')
                // Use cached if available
                if (__timingsCache[hospitalId]) {
                    if (!ignore) setSchedule(__timingsCache[hospitalId])
                } else {
                    const resp = await getHospitalGeneralTimingsForSuperAdmin(hospitalId)
                    const apiSchedule = resp?.data?.schedule || []
                    // Normalize to local structure used by UI
                    const norm = apiSchedule.map(item => ({
                        day: item.dayOfWeek.charAt(0) + item.dayOfWeek.slice(1).toLowerCase(), // e.g., SUNDAY -> Sunday
                        available: !!item.isAvailable,
                        is24Hours: !!item.is24Hours,
                        sessions: (item.timeRanges || []).map(r => ({ startTime: r.startTime?.slice(0,5) || '00:00', endTime: r.endTime?.slice(0,5) || '00:00' }))
                    }))
                    __timingsCache[hospitalId] = norm
                    if (!ignore) setSchedule(norm)
                }
            } catch (e) {
                if (!ignore) setError(e?.response?.data?.message || e.message || 'Failed to load timings')
            } finally {
                if (!ignore) setLoading(false)
            }
        }
        fetchTimings()
        return () => { ignore = true }
    }, [hospital?.temp, hospital?.id])

    const updateDay = (dayName, updates) => {
        setSchedule(prev => prev.map(d => d.day === dayName ? { ...d, ...updates } : d))
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4">
            {loading && (
                <div className="w-full flex items-center justify-center h-40">
                    <UniversalLoader size={28} className="" />
                </div>
            )}
            {!loading && error && (
                <div className="w-full p-4 text-red-600 bg-red-50 border border-red-200 rounded">{String(error)}</div>
            )}
            {!loading && !error && schedule.length === 0 && (
                <div className="w-full p-4 text-gray-500 bg-gray-50 border border-gray-200 rounded">No schedule found.</div>
            )}
            {!loading && !error && schedule.length > 0 && (
                <>
                    <div className="flex-1 space-y-6">
                        {schedule.filter((_, i) => i % 2 === 0).map((dayData) => {
                            const { day, available, is24Hours, sessions } = dayData
                            const handleUpdate = (updates) => updateDay(day, updates)
                            return (
                                <div key={day} className="border h-auto min-h-[46px] rounded-lg border-gray-200 p-3 bg-white transition-all duration-200 self-start">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">{day}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Available</span>
                                            <Toggle checked={available} onChange={(e) => handleUpdate({ available: e.target.checked })} />
                                        </div>
                                    </div>
                                    {available && (
                                        <div className="mt-3 border-t border-secondary-grey100 pt-4 space-y-3">
                                            {!is24Hours && sessions && (
                                                <div className="space-y-4">
                                                    {sessions.map((session, sIdx) => (
                                                        <div key={sIdx} className="flex items-center justify-between min-w-0 mb-3 last:mb-0">
                                                            <div className='flex items-center gap-2 min-w-0'>
                                                                <span className="text-sm whitespace-nowrap text-secondary-grey300">Availability Time:</span>
                                                                <TimeInput value={session.startTime} onChange={(e) => {
                                                                    const newSessions = [...sessions]
                                                                    newSessions[sIdx] = { ...newSessions[sIdx], startTime: e.target.value }
                                                                    handleUpdate({ sessions: newSessions })
                                                                }} />
                                                                <span className="text-sm text-gray-400">-</span>
                                                                <TimeInput value={session.endTime} onChange={(e) => {
                                                                    const newSessions = [...sessions]
                                                                    newSessions[sIdx] = { ...newSessions[sIdx], endTime: e.target.value }
                                                                    handleUpdate({ sessions: newSessions })
                                                                }} />
                                                            </div>
                                                            <div className="flex items-center gap-2 ml-2">
                                                                {sessions.length > 1 && sIdx !== sessions.length - 1 && (
                                                                    <button type="button" onClick={() => {
                                                                        const newSessions = sessions.filter((_, i) => i !== sIdx)
                                                                        handleUpdate({ sessions: newSessions })
                                                                    }} className="text-gray-400 hover:text-red-500 transition-colors">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                                {sIdx === sessions.length - 1 && (
                                                                    <button type="button" onClick={() => {
                                                                        if (sessions.length >= 6) { alert("Maximum 6 slots allowed"); return }
                                                                        const newSessions = [...sessions, { startTime: '09:00', endTime: '18:00' }]
                                                                        handleUpdate({ sessions: newSessions })
                                                                    }} className="text-sm text-blue-600 hover:bg-blue-50 p-1 rounded-md ml-2 whitespace-nowrap">+ Add More</button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Checkbox id={`24h-${day}`} checked={is24Hours} onCheckedChange={(checked) => handleUpdate({ is24Hours: !!checked })} className="w-4 h-4 rounded-[4px] border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                                <label htmlFor={`24h-${day}`} className="text-xs text-gray-500 cursor-pointer select-none">Available 24 Hours</label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                    <div className="flex-1 space-y-6">
                        {schedule.filter((_, i) => i % 2 === 1).map((dayData) => {
                            const { day, available, is24Hours, sessions } = dayData
                            const handleUpdate = (updates) => updateDay(day, updates)
                            return (
                                <div key={day} className="border h-auto min-h-[46px] rounded-lg border-gray-200 p-3 bg-white transition-all duration-200 self-start">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-700">{day}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500">Available</span>
                                            <Toggle checked={available} onChange={(e) => handleUpdate({ available: e.target.checked })} />
                                        </div>
                                    </div>
                                    {available && (
                                        <div className="mt-3 border-t border-secondary-grey100 pt-4 space-y-3">
                                            {!is24Hours && sessions && (
                                                <div className="space-y-4">
                                                    {sessions.map((session, sIdx) => (
                                                        <div key={sIdx} className="flex items-center justify-between min-w-0 mb-3 last:mb-0">
                                                            <div className='flex items-center gap-2 min-w-0'>
                                                                <span className="text-sm whitespace-nowrap text-secondary-grey300">Availability Time:</span>
                                                                <TimeInput value={session.startTime} onChange={(e) => {
                                                                    const newSessions = [...sessions]
                                                                    newSessions[sIdx] = { ...newSessions[sIdx], startTime: e.target.value }
                                                                    handleUpdate({ sessions: newSessions })
                                                                }} />
                                                                <span className="text-sm text-gray-400">-</span>
                                                                <TimeInput value={session.endTime} onChange={(e) => {
                                                                    const newSessions = [...sessions]
                                                                    newSessions[sIdx] = { ...newSessions[sIdx], endTime: e.target.value }
                                                                    handleUpdate({ sessions: newSessions })
                                                                }} />
                                                            </div>
                                                            <div className="flex items-center gap-2 ml-2">
                                                                {sessions.length > 1 && sIdx !== sessions.length - 1 && (
                                                                    <button type="button" onClick={() => {
                                                                        const newSessions = sessions.filter((_, i) => i !== sIdx)
                                                                        handleUpdate({ sessions: newSessions })
                                                                    }} className="text-gray-400 hover:text-red-500 transition-colors">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                )}
                                                                {sIdx === sessions.length - 1 && (
                                                                    <button type="button" onClick={() => {
                                                                        if (sessions.length >= 6) { alert("Maximum 6 slots allowed"); return }
                                                                        const newSessions = [...sessions, { startTime: '09:00', endTime: '18:00' }]
                                                                        handleUpdate({ sessions: newSessions })
                                                                    }} className="text-sm text-blue-600 hover:bg-blue-50 p-1 rounded-md ml-2 whitespace-nowrap">+ Add More</button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Checkbox id={`24h-${day}`} checked={is24Hours} onCheckedChange={(checked) => handleUpdate({ is24Hours: !!checked })} className="w-4 h-4 rounded-[4px] border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                                                <label htmlFor={`24h-${day}`} className="text-xs text-gray-500 cursor-pointer select-none">Available 24 Hours</label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </>
            )}
        </div>
    )
}
