import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { useParkingSocket } from '../hooks/useParkingSocket'
import { getFavsByBuilding, toggleFav } from '../utils/favStorage'
import ParkingLotLayout from '../components/ParkingLotLayout'

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
    const { slots, connected, error } = useParkingSocket(buildingId)

    const [selectedSlot, setSelectedSlot] = useState(null)
    const [favorites, setFavorites] = useState(
        () => getFavsByBuilding(buildingId) || [],
    )

    const handleToggleFavoriteForSelected = () => {
        if (!selectedSlot) return
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
            totalSlots > 0
                ? Math.round((occupied / totalSlots) * 100)
                : 0
        return { occupiedCount: occupied, rate: r }
    }, [slots, totalSlots])

    const buildingName = BUILDING_NAMES[buildingId] ?? buildingId

    const getSlotStateText = (slotId) => {
        const occ = slots[slotId]
        if (occ === 1) return '주차 중'
        if (occ === 0) return '이용 가능'
        return '정보 없음'
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fb]">
            <Header />

            <main className="px-10 py-6">
                {/* 상단 제목 영역 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-3 py-1.5 text-xs rounded-full bg-white shadow-sm hover:bg-[#f3f4f6] transition"
                        >
                            ← 뒤로가기
                        </button>
                        <h2 className="text-sm font-semibold text-slate-800">
                            {buildingName} 주차장
                        </h2>
                    </div>
                    <span className="text-xs text-slate-500">
                        {connected ? '실시간 연결됨' : '연결 대기 중'}
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-[minmax(0,1fr)_320px] gap-6">
                    <section className="space-y-4">
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

                        <section className="bg-white rounded-2xl shadow-md p-4">
                            <ParkingLotLayout
                                buildingId={buildingId}
                                slotsMap={slotsMap}
                                favorites={favorites}
                                selectedSlot={selectedSlot}
                                onSlotClick={setSelectedSlot}
                            />
                        </section>
                    </section>

                    <aside className="flex flex-col gap-4">
                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <h3 className="text-sm font-semibold text-slate-800 mb-2">
                                현재 내 주차 이용현황
                            </h3>
                            <p className="text-xs text-slate-500">
                                실제 요금 계산 로직과 연동은 이후 단계에서 구현 예정입니다.
                            </p>
                        </div>

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
                                            <span>{getSlotStateText(selectedSlot)}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleToggleFavoriteForSelected}
                                        className="mt-3 w-full rounded-lg bg-[#f3f4f6] py-2 text-xs text-slate-700 hover:bg-[#e5e7eb] transition"
                                    >
                                        {favorites.includes(selectedSlot)
                                            ? '즐겨찾기 해제'
                                            : '즐겨찾기 추가'}
                                    </button>
                                </>
                            ) : (
                                <p className="text-sm text-slate-500">
                                    자리를 선택해 주세요
                                </p>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <h3 className="text-sm font-semibold text-slate-800 mb-2">
                                내 선호 자리
                            </h3>
                            {favorites.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    즐겨찾기한 자리가 없음
                                </p>
                            ) : (
                                <div className="space-y-2 text-sm">
                                    {favorites.map((slotId) => {
                                        const occ = slots[slotId]
                                        const isOccupied = occ === 1

                                        return (
                                            <div
                                                key={slotId}
                                                className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-3 py-2"
                                            >
                                                <span>
                                                    {buildingName} {slotId}번
                                                </span>
                                                <span
                                                    className={[
                                                        'text-xs px-2 py-0.5 rounded-full',
                                                        isOccupied
                                                            ? 'bg-[#fce8e6] text-[#c5221f]'
                                                            : 'bg-[#e6f4ea] text-[#137333]',
                                                    ].join(' ')}
                                                >
                                                    {isOccupied ? '사용 중' : '비어있음'}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}