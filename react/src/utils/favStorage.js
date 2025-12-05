// 즐겨찾기 주차 슬롯 저장소
const KEY = 'favoriteSlots' //로컬에 저장시 사용할 KEY

function loadRaw() { //로컬에 저장된 목록을 가져옴
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

// paldal:23같은 ID 생성
export function makeFavId(buildingId, slotId) {
    return `${buildingId}:${slotId}`
}

// 전체 즐겨찾기 목록 로드
export function loadFavs() {
    return loadRaw()
}

// 즐겨찾기 토글
export function toggleFav(buildingId, slotId) {
    const id = makeFavId(buildingId, slotId)
    const list = loadRaw()
    const idx = list.indexOf(id) //즐겨찾기목록에서 조회

    if (idx >= 0) { //이미 즐겨찾기목록이면 제거
        list.splice(idx, 1)
    } else { //아니면 추가 (토글)
        list.push(id)
    }

    saveRaw(list)
    return list //최신리스트 반영
}


// 특정 건물 즐겨찾기만 필터
export function getFavsByBuilding(buildingId) {
    return loadRaw()
        .filter((id) => id.startsWith(`${buildingId}:`)) //해당 건물 문자로 필터링
        .map((id) => { //slot id만 쪼갬
            const [, slot] = id.split(':')
            return Number(slot)
        })
}