// 즐겨찾기 주차 슬롯 저장소
const KEY = 'favoriteSlots'

function loadRaw() {
    try {
        const raw = localStorage.getItem(KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

function saveRaw(arr) {
    localStorage.setItem(KEY, JSON.stringify(arr))
}

// ex:"paldal:23", ID 생성
export function makeFavId(buildingId, slotId) {
    return `${buildingId}:${slotId}`
}

// 전체 즐겨찾기 목록 로드
export function loadFavs() {
    return loadRaw()
}

// 즐겨찾기 저장
export function saveFavs(list) {
    saveRaw(list)
}

// 즐겨찾기 토글
export function toggleFav(buildingId, slotId) {
    const id = makeFavId(buildingId, slotId)
    const list = loadRaw()
    const idx = list.indexOf(id)

    if (idx >= 0) {
        list.splice(idx, 1)
    } else {
        list.push(id)
    }

    saveRaw(list)
    return list
}

// 즐겨찾기 여부 확인
export function isFav(buildingId, slotId) {
    const id = makeFavId(buildingId, slotId)
    return loadRaw().includes(id)
}

// 특정 건물 즐겨찾기만 필터
export function getFavsByBuilding(buildingId) {
    return loadRaw()
        .filter((id) => id.startsWith(`${buildingId}:`))
        .map((id) => {
            const [, slot] = id.split(':')
            return Number(slot)
        })
}