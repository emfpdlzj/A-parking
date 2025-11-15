import api from './axiosInstance'

export async function loginApi(id, password) {
  const res = await api.post('/api/auth/login', { id, password })
  return res.data
}
