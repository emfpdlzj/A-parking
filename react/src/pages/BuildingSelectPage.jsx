import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ParkingUsagePanel from '../components/ParkingUsagePanel'
import FavoriteSlotsPanel from '../components/FavoriteSlotsPanel'
import ProfilePanel from '../components/ProfilePanel'
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
import { loadFavs } from '../utils/favStorage'

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
    const [analysisRangeText, setAnalysisRangeText] = useState('')

    const [favorites, setFavorites] = useState(() => loadFavs())

    const navigate = useNavigate()

    const [profile, setProfile] = useState(() => {
        try {
            const raw = localStorage.getItem('profile')
            if (raw) return JSON.parse(raw)
        } catch {
        }
        return {
            name: '홍길동',
            studentId: '202012345',
            favoriteBuilding: 'paldal',
            carNumber: '12가3456',
            profileImage: null,
        }
    })
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [editProfile, setEditProfile] = useState(profile)

    const handleStartEditProfile = () => {
        setEditProfile(profile)
        setIsEditingProfile(true)
    }

    const handleChangeProfileField = (field, value) => {
        setEditProfile((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleSaveProfile = () => {
        setProfile(editProfile)
        setIsEditingProfile(false)
        try {
            localStorage.setItem('profile', JSON.stringify(editProfile))
        } catch {
        }
    }

    const handleCancelProfile = () => {
        setIsEditingProfile(false)
        setEditProfile(profile)
    }

    const handleChangeProfileImage = (file) => {
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => {
            setEditProfile((prev) => ({
                ...prev,
                profileImage: reader.result,
            }))
        }
        reader.readAsDataURL(file)
    }

    const handleClearProfileImage = () => {
        setEditProfile((prev) => ({
            ...prev,
            profileImage: null,
        }))
    }

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
                const raw = res.status ?? []

                const last24 = raw.slice(-24)
                const now = new Date()

                const chartData =
                    last24.map((item, idx) => {
                        const hoursAgo = last24.length - 1 - idx
                        const ts = new Date(
                            now.getTime() - hoursAgo * 60 * 60 * 1000,
                        )
                        const hour = ts.getHours()
                        const year = ts.getFullYear()
                        const month = ts.getMonth() + 1
                        const day = ts.getDate()

                        return {
                            index: idx,
                            hour,
                            dateLabel: `${year}년 ${month}월 ${day}일`,
                            timeLabel: `${String(hour).padStart(2, '0')}:00`,
                            percent: Math.round(item.avg_congestion_rate * 100),
                        }
                    }) ?? []

                setAnalysisData(chartData)
                if (last24.length > 0) {
                    const startTs = new Date(
                        now.getTime() - (last24.length - 1) * 60 * 60 * 1000,
                    )
                    const endTs = now

                    const fmt = (d) => {
                        const y = d.getFullYear()
                        const m = d.getMonth() + 1
                        const day = d.getDate()
                        const h = String(d.getHours()).padStart(2, '0')
                        return `${m}월 ${String(day).padStart(2, '0')}일 ${h}시`
                    }

                    setAnalysisRangeText(
                        `${fmt(startTs)} ~ ${fmt(endTs)} 기준`,
                    )
                } else {
                    setAnalysisRangeText('')
                }

                setAnalysisError('')
            } catch {
                setAnalysisError('점유율 데이터를 불러올 수 없음')
                setAnalysisRangeText('')
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
                    <section className="flex-[2] flex flex-col gap-6">
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
                                            onClick={() =>
                                                handleSelectBuilding(b.id)
                                            }
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
                                                        style={{
                                                            width: `${rate}%`,
                                                        }}
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

                        <section className="bg-white rounded-2xl shadow-md p-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-800">
                                        과거 점유율
                                    </h3>
                                    {analysisRangeText && (
                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                            {analysisRangeText}
                                        </p>
                                    )}
                                </div>
                                <select
                                    className="border border-slate-300 rounded-md text-xs px-2 py-1 bg-white"
                                    value={analysisBuilding}
                                    onChange={(e) =>
                                        setAnalysisBuilding(e.target.value)
                                    }
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
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <LineChart
                                            data={analysisData}
                                            margin={{ left: -20 }}
                                        >
                                            <CartesianGrid
                                                stroke="#e5e7eb"
                                                strokeDasharray="3 3"
                                            />
                                            <XAxis
                                                dataKey="index"
                                                type="number"
                                                domain={[
                                                    0,
                                                    Math.max(
                                                        analysisData.length - 1,
                                                        0,
                                                    ),
                                                ]}
                                                allowDecimals={false}
                                                tickLine={false}
                                                tick={{ fontSize: 10 }}
                                                ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].filter(
                                                    (v) =>
                                                        v <
                                                        analysisData.length,
                                                )}
                                                tickFormatter={(value) => {
                                                    const item =
                                                        analysisData[value]
                                                    return item
                                                        ? item.timeLabel
                                                        : ''
                                                }}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 10 }}
                                                tickLine={false}
                                                domain={[0, 100]}
                                                unit="%"
                                            />
                                            <Tooltip
                                                content={({
                                                              active,
                                                              payload,
                                                          }) => {
                                                    if (
                                                        !active ||
                                                        !payload ||
                                                        !payload.length
                                                    )
                                                        return null
                                                    const point =
                                                        payload[0].payload
                                                    return (
                                                        <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-800">
                                                            <div>
                                                                {
                                                                    point.dateLabel
                                                                }
                                                            </div>
                                                            <div>
                                                                {
                                                                    point.timeLabel
                                                                }
                                                            </div>
                                                            <div className="mt-1 text-[#2563eb] font-semibold">
                                                                점유율{' '}
                                                                {
                                                                    point.percent
                                                                }{' '}
                                                                %
                                                            </div>
                                                        </div>
                                                    )
                                                }}
                                            />
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

                    <aside className="w-[340px] shrink-0 flex flex-col gap-4">
                        <ProfilePanel
                            profile={profile}
                            isEditing={isEditingProfile}
                            editProfile={editProfile}
                            buildings={BUILDINGS}
                            onStartEdit={handleStartEditProfile}
                            onChangeField={handleChangeProfileField}
                            onSave={handleSaveProfile}
                            onCancel={handleCancelProfile}
                            onChangeImage={handleChangeProfileImage}
                            onClearImage={handleClearProfileImage}
                        />

                        <ParkingUsagePanel
                            profileCarNumber={profile.carNumber}
                        />

                        <FavoriteSlotsPanel
                            mode="global"
                            favorites={favorites}
                            buildings={BUILDINGS}
                            profileFavoriteBuilding={profile.favoriteBuilding}
                            onNavigateToBuilding={(bId) =>
                                navigate(`/parking/${bId}`)
                            }
                        />
                    </aside>
                </div>
            </main>
        </div>
    )
}