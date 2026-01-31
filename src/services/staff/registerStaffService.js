import axios from '../../lib/axios'

export const registerStaff = async (payload) => {
  const res = await axios.post('/staff/register', payload)
  return res?.data
}
