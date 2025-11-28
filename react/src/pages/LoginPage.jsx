import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginApi } from '../api/auth' // 로그인 API 함수
import { useAuth } from '../hooks/useAuth' // 인증
import parkingIcon from '../assets/icons/parking.svg' //icon image

const DEMO_ID = 'user' // 데모 계정 정보 상수
const DEMO_PW = 'pass'

export default function LoginPage() {
    const [id, setId] = useState('')
    const [pw, setPw] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login, isAuthenticated } = useAuth() //인증 훅
    const navigate = useNavigate() //페이지 이동 훅

    // 이미 로그인된 경우 리다이렉트 처리
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/') // 메인 페이지로 이동
        }
    }, [isAuthenticated, navigate])

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault() // 기본 폼 제출 동작 방지
        setError('') // 기존 에러 메시지 초기화
        setLoading(true) // 로딩 상태 활성화

        try {
            const data = await loginApi(id, pw) // 로그인 API 호출
            login(data.accessToken, data.member) // 인증 컨텍스트 로그인 처리
            navigate('/') // 로그인 성공 후 메인 페이지로 이동
        } catch (err) {
            // 에러 응답 객체 확인
            if (err.response && err.response.status === 401) {
                setError('아이디 또는 비밀번호가 올바르지 않음') // 인증 실패 에러 메시지 설정
            } else {
                setError('로그인 중 오류 발생') // 일반 에러 메시지 설정
            }
        } finally {
            setLoading(false) // 로딩 상태 비활성화
        }
    }


    const handleFillDemo = () => {     // 데모 계정 버튼
        setId(DEMO_ID) // ID 입력값을 데모 계정 ID로 설정
        setPw(DEMO_PW) // 비밀번호 입력값을 데모 계정 비밀번호로 설정
        setError('') // 에러 메시지 초기화
    }

    //css
    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fb]">
            <header className="w-full flex items-center justify-between px-10 py-4 bg-white shadow-sm">
                <div className="flex items-center gap-2">
                    <img
                        src={parkingIcon}
                        alt="주차 아이콘"
                        className="w-6 h-6 object-contain"
                    />
                    <span className="text-sm font-semibold text-slate-800">
            주차관리
          </span>
                </div>
                <button
                    type="button"
                    className="px-4 py-1.5 text-sm font-medium border border-[#174ea6] text-white bg-[#174ea6] hover:bg-[#1450c8] rounded-lg transition"
                >
                    로그인
                </button>
            </header>

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

                            <button
                                type="button"
                                className="w-full rounded-md bg-[#f3f4f6] text-slate-700 text-sm font-medium py-2.5 hover:bg-[#e5e7eb] transition"
                                onClick={handleFillDemo}
                            >
                                데모 계정
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    )
}