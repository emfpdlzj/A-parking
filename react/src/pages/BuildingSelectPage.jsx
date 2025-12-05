// 건물선택 페이지 - 건물선택, 과거 혼잡도, 프로필, 주차요금, 선호자리
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'
import ParkingUsagePanel from '../components/ParkingUsagePanel.jsx'
import FavoriteSlotsPanel from '../components/FavoriteSlotsPanel.jsx'
import ProfilePanel from '../components/ProfilePanel/ProfilePanel.jsx'
import OccupancyChartPanel from '../components/OccupancyChartPanel.jsx'
import { getParkingSummary } from '../api/parking.js'
import { loadFavs } from '../utils/favStorage.js'
import { BUILDINGS } from '../constants/buildings.js'
import { loadProfile, saveProfile } from '../utils/profileStorage.js'

export default function BuildingSelectPage() {
    const [summary, setSummary] = useState({})         // 빌딩별 요약 점유율
    const [summaryError, setSummaryError] = useState('')
    const [favorites] = useState(() => loadFavs())    // 즐겨찾기 목록
    const navigate = useNavigate()                    // 페이지 이동에 사용

    const [profile, setProfile] = useState(() => loadProfile())//profile util들
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [editProfile, setEditProfile] = useState(profile)

    // 프로필 편집
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
        saveProfile(editProfile)   // 공용 util로 저장
    }

    const handleCancelProfile = () => {
        setIsEditingProfile(false)
        setEditProfile(profile)    // 수정 중이던 내용 버림
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
            } catch (err) {
                console.error('주차장 요약 조회 오류', err)
                setSummaryError('주차장 요약 정보를 불러올 수 없음')
            }
        }

        fetchSummary()                     // 페이지 들어올 때 한 번 호출
        timerId = setInterval(fetchSummary, 10000) // 10초마다 갱신

        return () => {
            if (timerId) clearInterval(timerId)
        }
    }, [])

    const handleSelectBuilding = (buildingId) => {
        navigate(`/parking/${buildingId}`)
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fb]">
            <Header />

            <main className="flex-1 px-4 py-4 md:px-8 lg:px-10 md:py-6">
                <div className="max-w-6xl mx-auto w-full">
                    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                        {/* 왼쪽 영역 */}
                        <section className="flex-[2] flex flex-col gap-6 min-w-0 w-full">
                            {/* 건물 선택 카드 리스트 */}
                            <div>
                                <h2 className="text-sm font-semibold text-slate-800">
                                    건물 선택
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition text-left overflow-hidden w-full"
                                            >
                                                <div className="flex flex-col sm:flex-row">
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
                                                    <div className="w-[70%] h-24 mx-auto my-3 rounded-xl overflow-hidden sm:w-40 sm:h-28 sm:mx-0 sm:my-4 sm:mr-4">
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

                            {/* 과거 점유율 차트 패널 */}
                            <OccupancyChartPanel buildings={BUILDINGS} />
                        </section>

                        {/* 오른쪽 패널 */}
                        <aside className="w-full lg:w-[340px] shrink-0 flex flex-col gap-4 mt-6 lg:mt-0">
                            <ProfilePanel
                                profile={profile}
                                isEditing={isEditingProfile}
                                editProfile={editProfile}
                                onStartEdit={handleStartEditProfile}
                                onChangeField={handleChangeProfileField}
                                onSave={handleSaveProfile}
                                onCancel={handleCancelProfile}
                                onChangeImage={handleChangeProfileImage}
                                onClearImage={handleClearProfileImage}
                            />

                            {/* 주차 요금/상태 패널 */}
                            <ParkingUsagePanel profileCarNumber={profile.carNumber} />

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
                </div>
            </main>
        </div>
    )
}