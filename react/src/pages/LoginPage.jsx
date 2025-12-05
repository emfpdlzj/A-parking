import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginApi } from '../api/auth.js'
import { useAuth } from '../hooks/useAuth.jsx'
import Header from '../components/Header.jsx'
import userIcon from '../assets/icons/loginid.svg'
import lockIcon from '../assets/icons/loginpwd.svg'
import parkingicon from '../assets/icons/parking_blue.png'

export default function LoginPage() {
    const [id, setId] = useState('') //id관리
    const [pw, setPw] = useState('') //pw 관리
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false) //loading 화면 관리

    const { login, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated) { //이미 로그인된 상태면 로그인 페이지에서 내보내기
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    const handleSubmit = async (e) => { //로그인 버튼 눌렀을 때
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = await loginApi(id, pw) //login api 호출
            login(data.accessToken, data.member)
            navigate('/')
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('아이디 또는 비밀번호가 올바르지 않음')
            } else {
                setError('로그인 중 오류 발생')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fb]">
            {/* 상단 공통 헤더 */}
            <Header />

            {/* 가운데 카드 */}
            <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-8">
                <div className="w-full max-w-md">
                    <section className="bg-white rounded-2xl shadow-lg px-6 py-8 sm:px-10 sm:py-9 md:px-12 md:py-10">
                        {/* 로고 + 타이틀 영역 */}
                        <div className="flex flex-col items-center mb-8">
                            <h1 className="text-2xl sm:text-3xl font-semibold text-[#174ea6] mb-4">
                                A Parking
                            </h1>
                            <img
                                src={parkingicon}
                                alt="parking icon"
                                className="w-16 h-16 sm:w-20 sm:h-20 mb-4"
                            />
                            <p className="text-xs sm:text-sm font-semibold text-[#174ea6] tracking-wide text-center">
                                AJOU UNIV. 주차 관리 시스템
                            </p>
                        </div>

                        {/* 로그인 폼 */}
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {/* 사용자 ID */}
                            <div className="space-y-2">
                                <label className="block text-xs sm:text-sm text-slate-700">
                                    사용자 ID
                                </label>
                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <img
                                        src={userIcon}
                                        alt="user icon"
                                        className="w-5 h-5 opacity-60"
                                    />
                                    <input
                                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
                                        placeholder="사용자 ID를 입력해주세요"
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* 비밀번호 */}
                            <div className="space-y-2">
                                <label className="block text-xs sm:text-sm text-slate-700">
                                    비밀번호
                                </label>
                                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <img
                                        src={lockIcon}
                                        alt="lock icon"
                                        className="w-5 h-5 opacity-60"
                                    />
                                    <input
                                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
                                        placeholder="비밀번호를 입력해주세요"
                                        type="password"
                                        value={pw}
                                        onChange={(e) => setPw(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full mt-2 rounded-md bg-[#174ea6] text-white text-sm font-medium py-2.5 hover:bg-[#1450c8] disabled:bg-slate-400 transition"
                                disabled={loading}
                            >
                                {loading ? '로그인 처리 중' : '로그인'}
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    )
}