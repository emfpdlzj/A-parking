//사용되는 빌딩 상수 따로 정리
export const BUILDINGS = [
    { id: 'paldal', name: '팔달관' },
    { id: 'library', name: '도서관' },
    { id: 'yulgok', name: '율곡관' },
    { id: 'yeonam', name: '연암관' },
]

export function getBuildingName(id) {
    const found = BUILDINGS.find((b) => b.id === id)
    return found ? found.name : id //빌딩 아이디 반환
}