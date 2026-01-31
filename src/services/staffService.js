import axios from '../lib/axios'

// Fetch staff members by clinicId
export const fetchClinicStaff = async (clinicId) => {
  if (!clinicId) throw new Error('clinicId is required to fetch staff')
  const res = await axios.get(`/staff/clinic/${clinicId}`)
  return res?.data
}

export const fetchHospitalStaff = async (hospitalId) => {
  if (!hospitalId) throw new Error('hospitalId is required to fetch staff')
  const res = await axios.get(`/staff/hospital/${hospitalId}`)
  return res?.data
}
