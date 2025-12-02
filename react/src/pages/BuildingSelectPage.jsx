import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import ParkingUsagePanel from '../components/ParkingUsagePanel'
import FavoriteSlotsPanel from '../components/FavoriteSlotsPanel'
import ProfilePanel from '../components/ProfilePanel'
import OccupancyChartPanel from '../components/OccupancyChartPanel'
import { getParkingSummary } from '../api/parking'
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

    // 프로필 편집 관련
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

    // 주차장 요약 정보 주기적 갱신
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

    const handleSelectBuilding = (buildingId) => {
        navigate(`/parking/${buildingId}`)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fb]">
            <Header />

            <main className="flex-1 px-10 py-6">
                <div className="flex gap-6">
                    {/* 왼쪽 영역 */}
                    <section className="flex-[2] flex flex-col gap-6">
                        {/* 건물 선택 카드 리스트 */}
                        <div>
                                <h2 className="text-sm font-semibold text-slate-800">
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

                        {/* 과거 점유율 차트 패널 */}
                        <OccupancyChartPanel buildings={BUILDINGS} />
                    </section>

                    {/* 오른쪽 패널 */}
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

                        {/* 주차 요금/상태 패널 (내부에서 API 호출) */}
                        <ParkingUsagePanel
                            profileCarNumber={profile.carNumber}
                        />

                        {/* 내 선호 자리 패널 */}
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