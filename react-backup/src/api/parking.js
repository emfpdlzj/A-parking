import api from './axiosInstance'

export async function getParking(buildingId) {
  const res = await api.get(`/api/parking-lot/${buildingId}`)
  return res.data
}

export async function getAnalysis(buildingId) {
  const res = await api.get(`/api/parking-lot/analysis/${buildingId}`)
  return res.data
}
