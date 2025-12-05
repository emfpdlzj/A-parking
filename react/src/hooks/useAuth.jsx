import React, { createContext, useContext, useState } from 'react'
const AuthContext = createContext(null)// 인증정보 전달용 컨텍스트 생성

export function AuthProvider({ children }) { // 하위 컴포넌트에게 제공
    // 액세스 토큰 상태
    const [accessToken, setAccessToken] = useState( //로컬에 있는 토큰가져옴
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
        localStorage.setItem('accessToken', newAccessToken) // 토큰 저장
        localStorage.setItem('member', JSON.stringify(memberData)) // 사용자 정보 저장
        setAccessToken(newAccessToken) // 토큰 상태 갱신
        setMember(memberData) // 사용자 정보 상태 갱신
    }

    // 로그아웃 함수
    const logout = () => {
        localStorage.removeItem('accessToken') // 액세스 토큰 삭제
        localStorage.removeItem('member') // 사용자 정보 삭제
        setAccessToken(null) // 액세스 토큰 상태 초기화
        setMember(null) // 사용자 정보 상태 초기화
    }

    // 전역으로 되는 상태 객체
    const value = {
        accessToken, // 액세스 토큰 값
        member, // 사용자 정보
        login, // 로그인 함수
        logout, // 로그아웃 함수
        isAuthenticated: !!accessToken, // 로그인 여부 플래그
    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 인증 컨텍스트 값 꺼내쓰기 용이
export const useAuth = () => useContext(AuthContext)