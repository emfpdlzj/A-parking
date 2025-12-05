import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import parkingicon from '../assets/icons/parking_black.png'
import logoutIcon from '../assets/icons/logout.svg'

const ROUTES = {
    BUILDING: '/BuildingSelectPage',
    LOGIN: '/login',
}

// 공통 버튼 : login, logout
function HeaderButton({ children, icon, onClick, to }) {
    const base =
        "px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium border border-[#0b57d0] text-white bg-[#0b57d0] hover:bg-[#174ea6] rounded-lg transition flex items-center gap-2"

    if (to) {
        return (
            <Link to={to} className={base}> //여기로 이동
                {icon}
                {children}
            </Link>
        )
    }

    return (
        <button type="button" onClick={onClick} className={base}>
            {icon}
            {children}
        </button>
    )
}

export default function Header() {
    const { accessToken, member, logout } = useAuth() //로그인 정보에서 가져온 값들
    const navigate = useNavigate() //페이지 이동
    const location = useLocation() //현재 url을 받아옴

    const isLoginPage = location.pathname === ROUTES.LOGIN //현재 페이지가 로그인 페이지면 true -> 조건에 따른 login버튼 표시
    const isLoggedIn = !!accessToken // 토큰에 따른 로그인 여부 .
    const showLogout = isLoggedIn && !isLoginPage

    const handleLogout = async () => {
        await logout()
        navigate(ROUTES.LOGIN, { replace: true })
    }

    return (
        <header className="w-full bg-white shadow-sm">
            <div className="max-w-6xl mx-auto px-4 md:px-8 lg:px-10 py-3 md:py-4 flex flex-wrap items-center justify-between gap-2">

                {/* 왼쪽 로고 */}
                <div
                    className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition"
                    onClick={() => navigate(ROUTES.BUILDING)}
                >
                    <img src={parkingicon} className="w-6 h-6" alt="" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">
                        AJOU UNIV. 주차 관리 시스템 | A Parking
                    </span>
                </div>

                {/* 오른쪽 버튼들 */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {showLogout ? (
                        <>
                            <span className="text-xs sm:text-sm text-slate-700">
                                {member?.name ? `${member.name} 님` : '로그인됨'}
                            </span>

                            <HeaderButton
                                onClick={handleLogout}
                                icon={
                                    <img
                                        src={logoutIcon}
                                        className="w-4 h-4 sm:w-5 sm:h-5"
                                        alt=""
                                    />
                                }
                            >
                                로그아웃
                            </HeaderButton>
                        </>
                    ) : (
                        <HeaderButton to={ROUTES.LOGIN}>
                            로그인
                        </HeaderButton>
                    )}
                </div>
            </div>
        </header>
    )
}