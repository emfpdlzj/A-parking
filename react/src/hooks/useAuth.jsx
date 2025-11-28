import React, { createContext, useContext, useState } from 'react'
const AuthContext = createContext(null)// 컨텍스트 생성

export function AuthProvider({ children }) { // 인증 프로바이더
    // 액세스 토큰 상태
    const [accessToken, setAccessToken] = useState(
        () => localStorage.getItem('accessToken') || null,
    )

    // 사용자 정보 상태
    const [member, setMember] = useState(() => {
        try {
            const raw = localStorage.getItem('member') // 로컬스토리지 사용자 정보 조회
            return raw ? JSON.parse(raw) : null
        } catch {
            return null // 파싱 실패 시 널 반환
        }
    })

    // 로그인 함수
    const login = (newAccessToken, memberData) => {
        localStorage.setItem('accessToken', newAccessToken) // 액세스 토큰 저장
        localStorage.setItem('member', JSON.stringify(memberData)) // 사용자 정보 저장
        setAccessToken(newAccessToken) // 액세스 토큰 상태 갱신
        setMember(memberData) // 사용자 정보 상태 갱신
    }

    // 로그아웃 함수
    const logout = () => {
        localStorage.removeItem('accessToken') // 액세스 토큰 삭제
        localStorage.removeItem('member') // 사용자 정보 삭제
        setAccessToken(null) // 액세스 토큰 상태 초기화
        setMember(null) // 사용자 정보 상태 초기화
    }

    // 컨텍스트 값 객체
    const value = {
        accessToken, // 액세스 토큰 값
        member, // 사용자 정보 객체
        login, // 로그인 함수 참조
        logout, // 로그아웃 함수 참조
        isAuthenticated: !!accessToken, // 로그인 여부 플래그
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 인증 컨텍스트 사용 훅
export const useAuth = () => useContext(AuthContext)