// ParkingStatusPage.jsx
import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { useParkingSocket } from '../hooks/useParkingSocket'
import { getFavsByBuilding, toggleFav } from '../utils/favStorage'
import ParkingLotLayout from '../components/ParkingLotLayout'
import ParkingUsagePanel from '../components/ParkingUsagePanel'
import FavoriteSlotsPanel from '../components/FavoriteSlotsPanel'
import cloudOn from '../assets/icons/cloud_on.svg'
import cloudOff from '../assets/icons/cloud_off.svg'

const BUILDING_NAMES = {
    paldal: '팔달관',
    library: '도서관',
    yulgok: '율곡관',
    yeonam: '연암관',
}

// 건물별 슬롯 개수
const TOTAL_SLOTS_BY_BUILDING = {
    paldal: 70,
    library: 70,
    yulgok: 70,
    yeonam: 70,
}

export default function ParkingStatusPage() {
    const { buildingId } = useParams()
    const navigate = useNavigate()
    const { slots, connected, error, closeSocket } = useParkingSocket(buildingId)

    const [selectedSlot, setSelectedSlot] = useState(null)
    const [favorites, setFavorites] = useState(
        () => getFavsByBuilding(buildingId) || [],
    )
    const [favError, setFavError] = useState('')

    const handleToggleFavoriteForSelected = () => {
        if (!selectedSlot) return
        const isAlreadyFav = favorites.includes(selectedSlot)
        // 새로 추가하려는 경우에만 개수 체크 (최대 5개)
        if (!isAlreadyFav && favorites.length >= 5) {
            setFavError('선호 자리는 건물당 최대 5개까지 등록할 수 있습니다.')
            return
        }

        // 정상 추가/해제 시 에러 메시지 초기화
        setFavError('')
        toggleFav(buildingId, selectedSlot)
        setFavorites(getFavsByBuilding(buildingId))
    }

    const totalSlots = TOTAL_SLOTS_BY_BUILDING[buildingId] ?? 70

    // WebSocket에서 받은 { slotId: 0|1 } → { slotId: { id, occupied } } 로 변환
    const slotsMap = useMemo(() => {
        const map = {}
        for (let i = 1; i <= totalSlots; i += 1) {
            const occ = slots[i]
            map[i] = { id: i, occupied: occ === 1 }
        }
        return map
    }, [slots, totalSlots])

    const { occupiedCount, rate } = useMemo(() => {
        const values = Object.values(slots)
        const occupied = values.filter((v) => v === 1).length
        const r =
            totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0
        return { occupiedCount: occupied, rate: r }
    }, [slots, totalSlots])

    const buildingName = BUILDING_NAMES[buildingId] ?? buildingId

    const getSlotStateText = (slotId) => {
        const occ = slots[slotId]
        if (occ === 1) return '주차 중'
        if (occ === 0) return '이용 가능'
        return '정보 없음'
    }

    // 프로필(차량 번호만 필요)
    const [profile] = useState(() => {
        try {
            const raw = localStorage.getItem('profile')
            if (raw) return JSON.parse(raw)
        } catch {
            //
        }
        return { carNumber: '12가3456' }
    })

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fb]">
            <Header />

            <main className="px-10 py-6">
                {/* 상단 제목 영역 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                // 뒤로가기 전에 해당 건물 채널 무조건 !WebSocket 확실히 정리
                                closeSocket()
                                navigate(-1)
                            }}
                            className="px-3 py-1.5 text-xs rounded-lg bg-white shadow-sm hover:bg-[#f3f4f6] transition"
                        >
                            ← 뒤로가기
                        </button>
                        <h2 className="text-sm font-semibold text-slate-800">
                            {buildingName} 주차장
                        </h2>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <img
                            src={connected ? cloudOn : cloudOff}
                            alt={connected ? '실시간 연결됨' : '연결 대기 중'}
                            className="w-4 h-4"
                        />
                        <span>
        {connected ? '실시간 연결됨' : '연결 대기 중'}
    </span>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_320px] gap-6">
                    <section className="space-y-4">
                        {/* 상단 점유율 바 */}
                        <section className="bg-white rounded-2xl shadow-md p-4">
                            <p className="text-xs text-slate-600 mb-1">
                                {buildingName} 주차장 현황
                            </p>
                            <div className="h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                                <div
                                    className="h-full bg-[#174ea6]"
                                    style={{ width: `${rate}%` }}
                                />
                            </div>
                            <p className="mt-2 text-xs text-slate-600">
                                {occupiedCount} / {totalSlots} 사용 중 · 점유율 {rate}%
                            </p>
                            {error && (
                                <p className="mt-1 text-xs text-red-500">
                                    {error}
                                </p>
                            )}
                        </section>

                        {/* 주차칸 배치도 */}
                        <section className="bg-white rounded-2xl shadow-md p-4">
                            <ParkingLotLayout
                                buildingId={buildingId}
                                slotsMap={slotsMap}
                                favorites={favorites}
                                selectedSlot={selectedSlot}
                                onSlotClick={(slotId) => {
                                    setSelectedSlot((prev) => (prev === slotId ? null : slotId))
                                }}
                            />
                        </section>
                    </section>

                    {/* 오른쪽 패널 */}
                    <aside className="flex flex-col gap-4">
                        {/* 내 주차 현황 (주차 요금 로직 포함 컴포넌트) */}
                        <ParkingUsagePanel
                            profileCarNumber={profile.carNumber}
                        />

                        {/* 선택한 자리 정보 */}
                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <h3 className="text-sm font-semibold text-slate-800 mb-2">
                                선택한 자리
                            </h3>
                            {selectedSlot ? (
                                <>
                                    <div className="space-y-1 text-sm text-slate-700">
                                        <div className="flex justify-between">
                                            <span>자리 번호</span>
                                            <span>{selectedSlot}번</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>상태</span>
                                            <span>
                                                {getSlotStateText(selectedSlot)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={
                                            handleToggleFavoriteForSelected
                                        }
                                        className="mt-3 w-full rounded-lg bg-[#f3f4f6] py-2 text-xs text-slate-700 hover:bg-[#e5e7eb] transition"
                                    >
                                        {favorites.includes(selectedSlot)
                                            ? '즐겨찾기 해제'
                                            : '즐겨찾기 추가'}
                                    </button>
                                    {favError && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {favError}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    자리를 선택해 주세요
                                </p>
                            )}
                        </div>

                        {/* 내 선호 자리 (분리된 컴포넌트) */}
                        <FavoriteSlotsPanel
                            buildingName={buildingName}
                            favorites={favorites}
                            slots={slots}
                        />
                    </aside>
                </div>
            </main>
        </div>
    )
}