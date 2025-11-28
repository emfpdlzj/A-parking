// 기존 토큰 읽어오던 로직 변경
import axios from 'axios'

// 기본 Axios 인스턴스 생성
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || '/', // 백엔드 기본 URL 설정
    timeout: 10000, // 요청 타임아웃 설정
})

// 요청 인터셉터 설정
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken') // 로컬스토리지에서 액세스 토큰 조회
    if (token) {
        config.headers.Authorization = `Bearer ${token}` // Authorization 헤더에 토큰 추가
    }
    return config // 수정된 설정 객체 반환
})

// 응답 인터셉터 설정
api.interceptors.response.use(
    (response) => response, // 정상 응답은 그대로 반환
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('accessToken') // 인증 실패 시 액세스 토큰 제거
            localStorage.removeItem('member') // 인증 실패 시 사용자 정보 제거
            window.location.href = '/login' // 로그인 페이지로 이동
        }
        return Promise.reject(error) // 에러를 호출부로 다시 전달
    },
)

export default api // 구성된 Axios 인스턴스 내보내기