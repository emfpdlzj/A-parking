// 주차장 모습을 건물마다 다르게 렌더링 해서 보여줌
import React, { useState, useEffect, useRef } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import {
    SLOT_WIDTH,
    SLOT_HEIGHT,
    PARKING_LAYOUTS,
} from '../constants/parkingLayoutsConstants.js'

export default function ParkingLotLayout({
                                             buildingId,        // 보여줄 건물 Id
                                             slotsMap = {},     // slot별 정보. 항상 { occupied: 0 | 1 } 형태라고 가정
                                             favorites = [],    // 즐겨찾기 번호 배열
                                             onSlotClick,       // 슬롯 선택했을 때 콜백
                                             selectedSlot,      // 선택된 슬롯 번호
                                         }) {
    const currentId = buildingId || 'paldal' // 기본 id paldal
    const layout = PARKING_LAYOUTS[currentId] ?? PARKING_LAYOUTS.paldal // 해당 건물의 레이아웃
    const favoriteSet = new Set(favorites) // Set으로 바꿔서 즐겨찾기 여부 O(1) 체크
    const isVerticalSlot = currentId === 'paldal' || currentId === 'library' // 팔달, 도서관은 주차 방향 세로

    const cellWidth = isVerticalSlot ? SLOT_HEIGHT : SLOT_WIDTH
    const cellHeight = isVerticalSlot ? SLOT_WIDTH : SLOT_HEIGHT

    const [zoomPercent, setZoomPercent] = useState(70) // 기본 줌 70%

    // 스크롤바 중앙 정렬
    const scrollRef = useRef(null)

    // 마운트 시 한 번, 스크롤을 가로/세로 중앙으로 이동
    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
        el.scrollTop = (el.scrollHeight - el.clientHeight) / 2
    }, [])

    // cluster는 startId에서 시작해서 rows * cols만큼 슬롯 번호를 자동 부여
    const renderCluster = (cluster) => {
        const cells = []

        let currentSlotNumber = cluster.startId || 1;
        for (let r = 0; r < cluster.rows; r += 1) {
            for (let c = 0; c < cluster.cols; c += 1) {
                const slotId = currentSlotNumber
                currentSlotNumber += 1

                const slot = slotsMap[slotId]  // 0 또는 1
                const occupied = !!slot?.occupied// 1이면 점유 중
                const isFav = favoriteSet.has(slotId)// 즐겨찾기인지?
                const isSelected = selectedSlot === slotId; // 선택된 슬롯인지?

                let cls =  // 기본: 주차 가능(초록)
                    'bg-[#dcfce7] border-[#22c55e] text-[#166534]'
                if (occupied) {  // 점유 중(빨강)
                    cls = 'bg-[#fee2e2] border-[#ef4444] text-[#b91c1c]'
                }
                if (isFav) { // 선호 자리(노랑) - 점유 여부와 관계없이 우선 표시
                    cls = 'bg-[#fef9c3] border-[#facc15] text-[#854d0e]'
                }

                const selectedStyle = isSelected //선택된 경우 효과
                    ? 'border-4 !border-blue-600 z-50 scale-110 shadow-xl font-bold'
                    : 'hover:opacity-80';

                cells.push(
                    <button
                        key={slotId}
                        type="button"
                        onClick={() => onSlotClick && onSlotClick(slotId)}
                        className={
                            `relative rounded-[4px] border flex items-center justify-center text-[14px]
                                select-none transition-all duration-200 ease-in-out
                                ${cls} ${selectedStyle}`
                        }
                        style={{
                            width: `${cellWidth}px`,
                            height: `${cellHeight}px`,
                        }}
                    >
                        {slotId}
                    </button>,
                )
            }
        }

        return (
            <div
                key={cluster.id}
                className="absolute"
                style={{
                    left: cluster.left,
                    top: cluster.top,
                }}
            >
                <div
                    className="grid gap-[4px]"
                    style={{
                        gridTemplateColumns: `repeat(${cluster.cols}, ${cellWidth}px)`,
                        gridAutoRows: `${cellHeight}px`,
                    }}
                >
                    {cells}
                </div>
            </div>
        )
    }


    return (
        <TransformWrapper
            minScale={0.3}
            maxScale={1.5}
            initialScale={0.7}
            // 마우스/터치 줌 막기
            wheel={{ disabled: true }}
            pinch={{ disabled: true }}
            doubleClick={{ disabled: true }}
            panning={{ disabled: false, velocityDisabled: true }}
            onTransformed={(ref) => {
                const scale = ref?.state?.scale ?? 1 // 현재 scale 값을 받아서 퍼센트 갱신
                setZoomPercent(Math.round(scale * 100))
            }}
        >
            {(utils) => {
                const { zoomIn, zoomOut, resetTransform } = utils || {}

                return (
                    <div className="w-full">
                        {/* 상단 제목 줌 */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                            <h2 className="text-sm font-semibold text-slate-800">
                                {layout.name} 주차장 배치
                            </h2>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <span className="flex items-center gap-1">
                                        <span
                                            className="inline-block w-4 h-3 rounded-[3px] bg-[#dcfce7] border border-[#22c55e]"
                                        />
                                        <span className="whitespace-nowrap">
                                            주차 가능
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span
                                            className="inline-block w-4 h-3 rounded-[3px] bg-[#fee2e2] border border-[#ef4444]"
                                        />
                                        <span className="whitespace-nowrap">
                                            점유 중
                                        </span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span
                                            className="inline-block w-4 h-3 rounded-[3px] bg-[#fef9c3] border border-[#facc15]"
                                        />
                                        <span className="whitespace-nowrap">
                                            선호 자리
                                        </span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[12px] text-slate-500 w-10 text-right">
                                        {zoomPercent}%
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => zoomOut && zoomOut()}
                                            className="px-2 py-1 rounded-md border border-slate-300 bg-white text-[11px] hover:bg-[#f3f4f6]"
                                        >
                                            -
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => zoomIn && zoomIn()}
                                            className="px-2 py-1 rounded-md border border-slate-300 bg-white text-[11px] hover:bg-[#f3f4f6]"
                                        >
                                            +
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => resetTransform && resetTransform()}
                                            className="px-2 py-1 rounded-md border border-slate-300 bg-white text-[11px] hover:bg-[#f3f4f6]"
                                        >
                                            초기화
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 스크롤 + 줌 가능한 캔버스 */}
                        <div
                            ref={scrollRef}
                            className="relative w-full h-[380px] sm:h-[480px] lg:h-[600px] rounded-2xl border border-slate-300 bg-[#f9fafb] overflow-x-scroll overflow-y-scroll"
                            style={{
                                scrollbarGutter: 'stable both-edges',
                            }}
                        >
                            <TransformComponent>
                                <div className="relative w-[1600px] h-[900px] bg-white rounded-xl overflow-hidden">
                                    {/* 건물 */}
                                    <div
                                        className="absolute flex items-center justify-center text-L text-white bg-[#0f4c75]/50 rounded-md"
                                        style={{
                                            left: layout.buildingRect.left,
                                            top: layout.buildingRect.top,
                                            width: layout.buildingRect.width,
                                            height: layout.buildingRect.height,
                                        }}
                                    >
                                        건물
                                    </div>

                                    {/* 입구 */}
                                    <div
                                        className="absolute flex items-center justify-center text-L text-white bg-[#f97316]/60 rounded-md"
                                        style={{
                                            left: layout.entranceRect.left,
                                            top: layout.entranceRect.top,
                                            width: layout.entranceRect.width,
                                            height: layout.entranceRect.height,
                                        }}
                                    >
                                        입구
                                    </div>

                                    {/* 실제 슬롯 */}
                                    {layout.clusters.map(renderCluster)}
                                </div>
                            </TransformComponent>
                        </div>
                    </div>
                )
            }}
        </TransformWrapper>
    )
}