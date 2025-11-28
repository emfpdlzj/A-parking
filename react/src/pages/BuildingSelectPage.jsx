// 건물 선택 페이지
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { getParkingSummary, getAnalysis } from '../api/parking'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

import paldalImg from '../assets/buildings/paldal.svg'
import libraryImg from '../assets/buildings/library.svg'
import yulgokImg from '../assets/buildings/yulgok.svg'
import yeonamImg from '../assets/buildings/yeonam.svg'

const BUILDINGS = [
    { id: 'paldal', name: '팔달관', image: paldalImg },
    { id: 'library', name: '도서관', image: libraryImg },
    { id: 'yulgok', name: '율곡관', image: yulgokImg },
    { id: 'yeonam', name: '연암관', image: yeonamImg },
]

export default function BuildingSelectPage() {
    const [summary, setSummary] = useState({})
    const [summaryError, setSummaryError] = useState('')
    const [analysisBuilding, setAnalysisBuilding] = useState('paldal')
    const [analysisData, setAnalysisData] = useState([])
    const [analysisError, setAnalysisError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        let timerId

        const fetchSummary = async () => {
            try {
                const data = await getParkingSummary()
                const map = {}
                data.forEach((item) => {
                    map[item.buildingId] = item
                })
                setSummary(map)
                setSummaryError('')
            } catch {
                setSummaryError('주차장 요약 정보를 불러올 수 없음')
            }
        }

        fetchSummary()
        timerId = setInterval(fetchSummary, 10000)

        return () => clearInterval(timerId)
    }, [])

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const res = await getAnalysis(analysisBuilding)
                const chartData =
                    res.status?.map((item) => ({
                        hourLabel: `${String(item.hour).padStart(2, '0')}:00`,
                        percent: Math.round(item.avg_congestion_rate * 100),
                    })) ?? []
                setAnalysisData(chartData)
                setAnalysisError('')
            } catch {
                setAnalysisError('혼잡도 데이터를 불러올 수 없음')
            }
        }

        fetchAnalysis()
    }, [analysisBuilding])

    const handleSelectBuilding = (buildingId) => {
        navigate(`/parking/${buildingId}`)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fb]">
            <Header />

            <main className="flex-1 px-10 py-6">
                <div className="flex gap-6">
                    {/* 왼쪽 */}
                    <section className="flex-[2] flex flex-col gap-6">
                        {/* 건물 선택 카드 */}
                        <div>
                            <h2 className="text-sm font-semibold text-slate-800 mb-3">
                                건물 선택
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {BUILDINGS.map((b) => {
                                    const info = summary[b.id]
                                    const rate = info
                                        ? Math.round(info.occupancy_rate * 100)
                                        : 0

                                    return (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => handleSelectBuilding(b.id)}
                                            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition text-left overflow-hidden"
                                        >
                                            <div className="flex">
                                                <div className="flex-1 px-5 py-4 flex flex-col gap-1">
                                                    <h3 className="text-base font-semibold text-slate-800">
                                                        {b.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        주차장
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        선택하여 주차장 현황 확인
                                                    </p>
                                                    <p className="mt-3 text-xs text-slate-600">
                                                        {info
                                                            ? `현재 ${info.occupied}/${info.total}`
                                                            : '현재 데이터 없음'}
                                                    </p>
                                                    {info && (
                                                        <p className="text-xs text-[#174ea6] font-semibold mt-1">
                                                            {rate}% 사용 중
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="w-40 h-28 my-4 mr-4 rounded-xl overflow-hidden">
                                                    <img
                                                        src={b.image}
                                                        alt={b.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <div className="px-5 pb-4 pt-1">
                                                <div className="h-1.5 rounded-full bg-[#e5e7eb] overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#174ea6]"
                                                        style={{ width: `${rate}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                            {summaryError && (
                                <p className="mt-2 text-xs text-red-500">
                                    {summaryError}
                                </p>
                            )}
                        </div>

                        {/* 혼잡도 그래프 */}
                        <section className="bg-white rounded-2xl shadow-md p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-slate-800">
                                    과거 혼잡도
                                </h3>
                                <select
                                    className="border border-slate-300 rounded-md text-xs px-2 py-1 bg-white"
                                    value={analysisBuilding}
                                    onChange={(e) => setAnalysisBuilding(e.target.value)}
                                >
                                    {BUILDINGS.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {analysisError ? (
                                <p className="text-xs text-red-500">
                                    {analysisError}
                                </p>
                            ) : (
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={analysisData} margin={{ left: -20 }}>
                                            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="hourLabel"
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                                domain={[0, 100]}
                                                unit="%"
                                            />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="percent"
                                                stroke="#174ea6"
                                                strokeWidth={2}
                                                dot={{ r: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </section>
                    </section>

                    {/* 오른쪽 패널 */}
                    <aside className="w-[340px] shrink-0 flex flex-col gap-4">
                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-800">
                                    내 정보
                                </h3>
                            </div>
                            <div className="space-y-1 text-sm text-slate-700">
                                <div className="flex justify-between">
                                    <span>이름</span>
                                    <span>홍길동</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>학번</span>
                                    <span>202012345</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>차량 번호</span>
                                    <span>12가3456</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>즐겨찾는 건물</span>
                                    <span>팔달관</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="mt-4 w-full rounded-lg bg-[#f3f4f6] py-2 text-sm text-slate-700 hover:bg-[#e5e7eb] transition"
                            >
                                수정
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-slate-800">
                                    내 주차 현황
                                </h3>
                                <span className="text-xs text-[#174ea6]">
                  주차 중
                </span>
                            </div>
                            <div className="space-y-1 text-sm text-slate-700">
                                <div className="flex justify-between">
                                    <span>차량 번호</span>
                                    <span>12가3456</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>주차 시간</span>
                                    <span>2시간 30분</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>예상 요금</span>
                                    <span>2,500원</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="mt-4 w-full rounded-lg bg-[#174ea6] py-2 text-sm text-white hover:bg-[#1450c8] transition"
                            >
                                출차하기
                            </button>
                            <button
                                type="button"
                                className="mt-2 w-full rounded-lg bg-[#f3f4f6] py-2 text-sm text-slate-700 hover:bg-[#e5e7eb] transition"
                            >
                                새로고침
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">
                                내 선호 자리
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-3 py-2">
                                    <span>팔달관 23번</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333]">
                    비어있음
                  </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-3 py-2">
                                    <span>도서관 45번</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#fce8e6] text-[#c5221f]">
                    사용 중
                  </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="mt-3 w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:bg-[#f9fafb] transition"
                            >
                                자리 추가하기
                            </button>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}