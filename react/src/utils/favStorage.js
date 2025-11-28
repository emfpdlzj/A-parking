const KEY = 'ajou_parking_favs_v1'

// 전체 즐겨찾기 불러옴
export function loadFavorites() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]')
    } catch {
        return []
    }
}

// 전체 즐겨찾기 저장
export function saveFavorites(list) {
    localStorage.setItem(KEY, JSON.stringify(list))
}

// 건물 + 좌석이 같은지 비교
function sameSlot(a, buildingId, slotId) {
    return a.buildingId === buildingId && a.slotId === slotId
}

// 즐겨찾기 토글
export function toggleFavorite(buildingId, slotId, occupied = null) {
    const list = loadFavorites()
    const idx = list.findIndex((f) => sameSlot(f, buildingId, slotId))

    if (idx >= 0) {
        list.splice(idx, 1)
    } else {
        list.push({
            buildingId,
            slotId,
            lastOccupied: occupied,
        })
    }

    saveFavorites(list)
    return list
}

// 즐겨찾기 여부 확인
export function isFavorite(buildingId, slotId) {
    const list = loadFavorites()
    return list.some((f) => sameSlot(f, buildingId, slotId))
}

// 특정 건물 즐겨찾기만 가져오기
export function getFavoritesByBuilding(buildingId) {
    return loadFavorites().filter((f) => f.buildingId === buildingId)
}