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
        <header className="w-full flex items-center justify-between px-10 py-4 bg-white shadow-sm">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded transition"
                    onClick={()=>navigate('/BuildingSelectPage')}>
                <img
                    src={parkingicon}
                    alt="주차 아이콘"
                    className="w-6 h-6 object-contain"
                />
                <span className="text-sm font-semibold text-slate-800">
                    AJOU UNIV. 주차 관리 시스템  |  A Parking
                </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {accessToken && !isLoginPage ? (
                    <>
                        <span className="text-sm text-slate-700">
                            {member?.name ? `${member.name} 님` : '로그인됨'}
                        </span>
                        <button
                            type="button"
                            className="px-4 py-1.5 text-sm font-medium border border-[#0b57d0] text-white bg-[#0b57d0] hover:bg-[#174ea6] rounded-lg transition flex items-center gap-2"
                            onClick={handleLogout}
                        >
                            <img
                                src={logoutIcon}
                                alt="로그아웃 아이콘"
                                className="w-5 h-5 object-contain"
                            />
                            로그아웃
                        </button>
                    </>
                ) : (
                    <Link
                        to="/login"
                        className="px-4 py-1.5 text-sm font-medium border border-[#0b57d0] text-white bg-[#0b57d0] hover:bg-[#174ea6] rounded-lg transition"
                    >
                        로그인
                    </Link>
                )}
            </div>
        </header>
    )
}