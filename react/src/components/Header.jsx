import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom' // 라우팅 관련
import { useAuth } from '../hooks/useAuth'
import parkingicon from '../assets/icons/parking_black.png'
import logoutIcon from '../assets/icons/logout.svg'

export default function Header() {
    const { accessToken, member, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const isLoginPage = location.pathname === '/login'

    // 로그아웃 버튼 클릭 핸들러
    const handleLogout = async () => {
        logout()
        navigate('/login')
    }

    return (
        <header className="w-full bg-white shadow-sm">
            <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-10 py-3 md:py-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div
                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition"
                        onClick={() => navigate('/BuildingSelectPage')}
                    >
                        <img
                            src={parkingicon}
                            alt="주차 아이콘"
                            className="w-6 h-6 object-contain"
                        />
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                            AJOU UNIV. 주차 관리 시스템 | A Parking
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                    {accessToken && !isLoginPage ? (
                        <>
                            <span className="text-xs sm:text-sm text-slate-700">
                                {member?.name ? `${member.name} 님` : '로그인됨'}
                            </span>
                            <button
                                type="button"
                                className="px-3 py-1.5 text-xs sm:text-sm font-medium border border-[#0b57d0] text-white bg-[#0b57d0] hover:bg-[#174ea6] rounded-lg transition flex items-center gap-2"
                                onClick={handleLogout}
                            >
                                <img
                                    src={logoutIcon}
                                    alt="로그아웃 아이콘"
                                    className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
                                />
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium border border-[#0b57d0] text-white bg-[#0b57d0] hover:bg-[#174ea6] rounded-lg transition"
                        >
                            로그인
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}