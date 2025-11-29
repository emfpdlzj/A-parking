// 슬롯 점유 상태 저장
const KEY = 'slotStatus'

function loadRaw() {
    try {
        const raw = localStorage.getItem(KEY)
        return raw ? JSON.parse(raw) : {}
    } catch {
        return {}
    }
}

function saveRaw(obj) {
    localStorage.setItem(KEY, JSON.stringify(obj))
}

// 단일 슬롯 상태 조회
// true = 사용 중, false = 비어 있음, null = 정보 없음
export function getSlotStatus(buildingId, slotId) {
    const all = loadRaw()
    const key = `${buildingId}:${slotId}`
    if (!(key in all)) return null
    return all[key]
}

// 특정 건물의 슬롯 상태 갱신
export function updateSlotStatus(buildingId, slotMap) {
    const all = loadRaw()
    Object.keys(slotMap).forEach((slot) => {
        const key = `${buildingId}:${slot}`
        all[key] = !!slotMap[slot]
    })
    saveRaw(all)
}