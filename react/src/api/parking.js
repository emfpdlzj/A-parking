import api from './axiosInstance'

// 건물별 전체 슬롯 상태 조회
export async function getParking(buildingId) {
    const res = await api.get(`/api/parking-lot/${buildingId}`)
    return res.data
}

// 건물별 혼잡도  데이터 조회
export async function getAnalysis(buildingId) {
    const res = await api.get(`/api/parking-lot/analysis/${buildingId}`)
    return res.data
}

// 전체 건물별 요약 점유율 조회
export async function getParkingSummary() {
    const res = await api.get('/api/parking-lot/summary')
    return res.data
}

// 입차 처리 요청
export async function enterParking() {
    const res = await api.post('/api/parking/enter')
    return res.data
}

// 예상 요금 조회
export async function previewParkingFee() {
    const res = await api.get('/api/parking/fee/preview')
    return res.data
}

// 최종 정산 처리
export async function settleParkingFee() {
    const res = await api.post('/api/parking/fee/settle')
    return res.data
}