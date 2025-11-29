import axios from 'axios'

const api = axios.create({
    baseURL: '',
})

// 모든 요청에 Authorization 자동 추가
api.interceptors.request.use((config) => {
    const stored = localStorage.getItem('accessToken')

    if (stored) {
        // Bearer  형태면 그대로, 아니면 앞에 Bearer 붙이기
        config.headers.Authorization = stored.startsWith('Bearer ')
            ? stored
            : `Bearer ${stored}`
    }

    return config
})

export default api