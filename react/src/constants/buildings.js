// 사용하는 상수들
// 이미지
import paldalImg from '../assets/buildings/paldal.svg'
import libraryImg from '../assets/buildings/library.svg'
import yulgokImg from '../assets/buildings/yulgok.svg'
import yeonamImg from '../assets/buildings/yeonam.svg'

// 건물 목록 -SelectPage에서 사용
export const BUILDINGS = [
    { id: 'paldal', name: '팔달관', image: paldalImg },
    { id: 'library', name: '도서관', image: libraryImg },
    { id: 'yulgok', name: '율곡관', image: yulgokImg },
    { id: 'yeonam', name: '연암관', image: yeonamImg },
]

// id → 이름 매핑 -ProfilePanel, ParkingStatusPage에서 사용
export const BUILDING_NAMES = BUILDINGS.reduce((acc, b) => {
    acc[b.id] = b.name
    return acc
}, {})

// 건물별 슬롯 개수 -ParkingStatusPage에서
export const TOTAL_SLOTS_BY_BUILDING = {
    paldal: 70,
    library: 70,
    yulgok: 70,
    yeonam: 70,
}

// id->name
export function getBuildingName(buildingId) {
    return BUILDING_NAMES[buildingId] ?? buildingId
}