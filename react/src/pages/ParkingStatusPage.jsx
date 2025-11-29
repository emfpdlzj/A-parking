// 건물별 주차장 상태 페이지
import React, { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { useParkingSocket } from '../hooks/useParkingSocket'
import { getFavsByBuilding, toggleFav } from '../utils/favStorage'

const BUILDING_NAMES = {
    paldal: '팔달관',
    library: '도서관',
    yulgok: '율곡관',
    yeonam: '연암관',
}

// 건물별 슬롯 개수 (기본 70개)
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
    const totalSlots =
        TOTAL_SLOTS_BY_BUILDING[buildingId] ?? 70

    const { occupiedCount, rate } = useMemo(() => {
        const values = Object.values(slots)
        const occupied = values.filter((v) => v === 1).length
        const r =
            totalSlots > 0
                ? Math.round((occupied / totalSlots) * 100)
                : 0
        return { occupiedCount: occupied, rate: r }
    }, [slots, totalSlots])
    const handleBack = () => {
        navigate(-1)
    }

    const handleSelectSlot = (slotId) => {
        setSelectedSlot(slotId)
    }

    const buildingName =
        BUILDING_NAMES[buildingId] ?? buildingId

    const getSlotStateText = (slotId) => {
        const occ = slots[slotId]
        if (occ === 1) return '주차 중'
        if (occ === 0) return '이용 가능'
        return '정보 없음'
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f7fb]">
            <Header />

            <main className="flex-1 px-10 py-6 space-y-4">
                {/* 상단 제목 영역 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleBack}
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

                {/* 상단 요약 바 */}
                <section className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between gap-6">
                    <div className="flex-1">
                        <p className="text-xs text-slate-600 mb-1">
                            {buildingName} 주차장 배치도
                        </p>
                        <div className="h-2 rounded-full bg-[#e5e7eb] overflow-hidden">
                            <div
                                className="h-full bg-[#174ea6]"
                                style={{ width: `${rate}%` }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-slate-600">
                            {`${occupiedCount} / ${totalSlots} 사용 중 · 점유율 ${rate}%`}
                        </p>
                        {error && (
                            <p className="mt-1 text-xs text-red-500">
                                {error}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col text-xs text-slate-600 gap-1">
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-sm bg-[#174ea6]" />
                            <span>이용 가능</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block w-3 h-3 rounded-sm bg-[#9ca3af]" />
                            <span>주차 중</span>
                        </div>
                    </div>
                </section>

                {/* 메인 */}
                <section className="flex gap-6">
                    {/* 좌측*/}
                    <div className="flex-[2] min-w-0 bg-white rounded-2xl shadow-md p-4">
                        <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-700">
                          입구 ↓
                        </span>
                        <span className="text-[11px] text-slate-400">
                          *실시간 CCTV 분석 기준
                        </span>
                        </div>
                        {/* 주차장 칸*/}
                        <div className="mt-1 h-[320px] w-full overflow-auto border border-slate-100 rounded-xl">
                            <div className="inline-flex gap-2 p-3">
                                {Array.from({ length: totalSlots }, (_, i) => {
                                    const slotId = i + 1
                                    const occ = slots[slotId]
                                    const isOccupied = occ === 1
                                    const isSelected = selectedSlot === slotId

                                    return (
                                        <button
                                            key={slotId}
                                            type="button"
                                            onClick={() => handleSelectSlot(slotId)}
                                            className={[
                                                'w-12 h-12 rounded-lg text-xs font-semibold flex items-center justify-center border transition',
                                                isOccupied
                                                    ? 'bg-[#9ca3af] text-white border-[#9ca3af]'
                                                    : 'bg-[#174ea6] text-white border-[#174ea6]',
                                                isSelected
                                                    ? 'ring-2 ring-offset-2 ring-[#2563eb] ring-offset-[#f5f7fb]'
                                                    : '',
                                            ]
                                                .filter(Boolean)
                                                .join(' ')}
                                        >
                                            {slotId}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                        </div>

                    {/* 우측 */}
                    <aside className="w-[320px] shrink-0 flex flex-col gap-4">
                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <h3 className="text-sm font-semibold text-slate-800 mb-2">
                                현재 내 좌석 이용현황
                            </h3>
                            <p className="text-xs text-slate-500">
                                실제 요금 계산 로직과 연동은 이후 단계에서 구현
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <h3 className="text-sm font-semibold text-slate-800 mb-2">
                                선택한 좌석
                            </h3>
                            {selectedSlot ? (
                                <>
                                    <div className="space-y-1 text-sm text-slate-700">
                                        <div className="flex justify-between">
                                            <span>좌석 번호</span>
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
                                    좌석을 선택해 주세요
                                </p>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-md p-4">
                            <h3 className="text-sm font-semibold text-slate-800 mb-2">
                                내 선호 자리
                            </h3>
                            {favorites.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    즐겨찾기한 좌석이 없음
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
                </section>
            </main>
        </div>
    )
}