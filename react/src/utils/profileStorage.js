//page에서 프로필 패널 로딩에 사용
export const DEFAULT_PROFILE = {
    name: '홍길동',
    studentId: '202012345',
    favoriteBuilding: 'paldal',
    carNumber: '12가3456',
    profileImage: null,
}

export function loadProfile() {
    try {
        const raw = localStorage.getItem('profile')// 로컬스토리지에서 프로필 불러오기
        if (!raw) return DEFAULT_PROFILE //없으면 기본값
        const parsed = JSON.parse(raw)

        return { //기본값에 저장된 값 합침
            ...DEFAULT_PROFILE,
            ...parsed,
        }
    } catch {
        return DEFAULT_PROFILE
    }
}

// 로컬스토리지에 프로필 저장
export function saveProfile(profile) {
    try {
        localStorage.setItem('profile', JSON.stringify(profile))
    } catch {
    }
}