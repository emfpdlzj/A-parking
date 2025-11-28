import React from 'react'
import { Link, useNavigate } from 'react-router-dom' //라우팅 관련
import { useAuth } from '../hooks/useAuth'
import parkingicon from '../assets/icons/parking.svg'

export default function Header() {
    const { accessToken, member, logout } = useAuth()
    const navigate = useNavigate()

    // 로그아웃 버튼 클릭 핸들러
    const handleLogout = () => {
        logout() // 인증 정보 초기화
        navigate('/login') // 로그인 페이지로 이동
    }

    return (
        <header className="w-full flex items-center justify-between px-10 py-4 bg-white shadow-sm">
            <div className="flex items-center gap-2">
                <img
                    src={parkingicon}
                    alt="주차 아이콘"
                    className="w-6 h-6 object-contain"
                />
                <span className="text-sm font-semibold text-slate-800">
          AJOU UNIV. 주차 관리 시스템
        </span>
            </div>

            <div className="flex items-center gap-4">
                {accessToken ? (
                    // 로그인된 상태 표시
                    <>
            <span className="text-sm text-slate-700">
              {member?.name ? `${member.name} 님` : '로그인됨'}
            </span>
                        <button
                            type="button"
                            className="px-4 py-1.5 text-sm font-medium border border-[#0b57d0] text-white bg-[#0b57d0] hover:bg-[#174ea6] rounded-lg transition"
                            onClick={handleLogout}
                        >
                            로그아웃
                        </button>
                    </>
                ) : (
                    // 비로그인 상태 표시
                    <Link
                        to="/login"
                        className="px-4 py-1.5 text-sm font-medium rounded-full border border-[#0b57d0] text-[#0b57d0] bg-white hover:bg-[#e5efff] transition"
                    >
                        로그인
                    </Link>
                )}
            </div>
        </header>
    )
}