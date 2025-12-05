// 주차 상태 보여주는 페이지
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

import {
    BUILDING_NAMES,
    TOTAL_SLOTS_BY_BUILDING,
} from '../constants/buildings.js'
import { loadProfile } from '../utils/profileStorage.js'

export default function ParkingStatusPage() {
    const { buildingId } = useParams() //url에서 buildingid 사용
    const navigate = useNavigate()
    const { slots, connected, error, closeSocket } = useParkingSocket(buildingId) //websocket 관련

    const [selectedSlot, setSelectedSlot] = useState(null) //선택된 자리 관리
    const [favorites, setFavorites] = useState( //즐겨찾기 자리
        () => getFavsByBuilding(buildingId) || [],
    )
    const [favError, setFavError] = useState('')

    const handleToggleFavoriteForSelected = () => { //선택된 자리 즐겨찾기 토글 로직
        if (!selectedSlot) return
        const isAlreadyFav = favorites.includes(selectedSlot) //이미 즐겨찾기인지 확인

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

    const totalSlots = TOTAL_SLOTS_BY_BUILDING[buildingId]  //건물별 전체 주차칸 개수 상수에서 꺼냄

    // WebSocket에서 받은 0,1  변환
    const slotsMap = useMemo(() => { //useMemo:  slots나 totalSlots가 바뀔 때만 다시 계산
        const map = {}
        for (let i = 1; i <= totalSlots; i += 1) {
            const occ = slots[i]
            map[i] = { id: i, occupied: occ === 1 }
        }
        return map
    }, [slots, totalSlots])

    const { occupiedCount, rate } = useMemo(() => { //상단 점유율 바 값 계산
        const values = Object.values(slots)
        const occupied = values.filter((v) => v === 1).length //slots 값들꺼내서 1인거만 계산
        const r = totalSlots > 0 ? Math.round((occupied / totalSlots) * 100) : 0 //반올림
        return { occupiedCount: occupied, rate: r }
    }, [slots, totalSlots])

    const buildingName = BUILDING_NAMES[buildingId] ?? buildingId //빌딩이름 매핑

    const getSlotStateText = (slotId) => { //선택한 자리 정보 보여줄 때 사용
        const occ = slots[slotId]
        if (occ === 1) return '주차 중'
        if (occ === 0) return '이용 가능'
        return '정보 없음'
    }

    // 프로필 로딩
    const [profile] = useState(() => {
        const loaded = loadProfile()
        if (!loaded || !loaded.carNumber) { //혹시라도 망가진 값이 있으면 default 반환 처리
            return { carNumber: '12가3456' }
        }
        return loaded
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
                                // 뒤로가기 전에 WebSocket 정리
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

    <div className="mt-4 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 lg:gap-6">
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
                        setSelectedSlot((prev) =>
                            prev === slotId ? null : slotId,
                        )
                    }}
                />
            </section>
        </section>

        {/* 오른쪽 패널 */}
        <aside className="flex flex-col gap-4">
            {/* 내 주차 현황 */}
            <ParkingUsagePanel profileCarNumber={profile.carNumber} />

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
                            onClick={handleToggleFavoriteForSelected}
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

            {/* 내 선호 자리 */}
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