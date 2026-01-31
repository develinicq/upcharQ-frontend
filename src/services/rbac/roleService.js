import axios from '../../lib/axios'

// Fetch all roles for a given clinic
export const fetchAllRoles = async (params) => {
  // params can be { clinicId: '...' } or { hospitalId: '...' }
  const res = await axios.get('/rbac/all-roles', { params })
  return res?.data
}

export const createRole = async (payload) => {
  const res = await axios.post('/rbac/create-role', payload)
  return res.data
}
