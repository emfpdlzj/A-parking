import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginApi } from '../api/auth'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'

export default function LoginPage() {
    const [id, setId] = useState('')
    const [pw, setPw] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, isAuthenticated } = useAuth()
    const navigate = useNavigate()

    // 이미 로그인된 경우 리다이렉트 처리
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = await loginApi(id, pw)
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
            {/* 공통 헤더 */}
            <Header />

            <main className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <section className="bg-white rounded-2xl shadow-lg px-12 py-10">
                        <h2 className="text-sm font-semibold text-[#174ea6] text-center tracking-wide mb-8">
                            AJOU UNIV. 주차 관리 시스템
                        </h2>

                        <form className="space-y-5" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="block text-sm text-slate-700">
                                    사용자 ID
                                </label>
                                <input
                                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#174ea6] focus:border-[#174ea6]"
                                    placeholder="아이디를 입력하세요"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm text-slate-700">
                                    비밀번호
                                </label>
                                <input
                                    className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#174ea6] focus:border-[#174ea6]"
                                    placeholder="비밀번호를 입력하세요"
                                    type="password"
                                    value={pw}
                                    onChange={(e) => setPw(e.target.value)}
                                />
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