import React, { useState, useEffect, useRef } from 'react'
import {TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch'

const SLOT_WIDTH = 60
const SLOT_HEIGHT = 40

const PARKING_LAYOUTS = {
    paldal: {
        name: '팔달관',
        buildingRect: {left: '10%', top: '70%', width: '70%', height: '18%'},
        entranceRect: {left: '34%', top: '24%', width: '8%', height: '18%'},
        clusters: [
            {id: 'paldal-cctv', left: '6%', top: '18%', rows: 2, cols: 8},
            {id: 'paldal-top-right', left: '42%', top: '18%', rows: 2, cols: 8},
            {id: 'paldal-mid-left', left: '6%', top: '50%', rows: 2, cols: 8},
            {id: 'paldal-mid-center', left: '42%', top: '50%', rows: 2, cols: 8},
            {id: 'paldal-mid-right', left: '84%', top: '50%', rows: 2, cols: 3},
        ],
    },

    library: {
        name: '도서관',
        buildingRect: {left: '6%', top: '12%', width: '12%', height: '68%'},
        entranceRect: {left: '46%', top: '65%', width: '8%', height: '18%'},
        clusters: [
            {id: 'lib-top-left', left: '26%', top: '18%', rows: 2, cols: 8},
            {id: 'lib-top-right', left: '60%', top: '18%', rows: 2, cols: 8},
            {id: 'lib-bottom-left', left: '26%', top: '52%', rows: 2, cols: 8},
            {id: 'lib-bottom-right', left: '60%', top: '52%', rows: 2, cols: 8},
            {id: 'lib-small-right', left: '84%', top: '52%', rows: 2, cols: 3},
        ],
    },

    yeonam: {
        name: '연암관',
        buildingRect: {left: '10%', top: '10%', width: '70%', height: '15%'},
        entranceRect: {left: '80%', top: '68%', width: '8%', height: '18%'},
        clusters: [
            {id: 'yeonam-col-1', left: '10%', top: '30%', rows: 10, cols: 1},
            {id: 'yeonam-col-2', left: '22%', top: '30%', rows: 10, cols: 1},
            {id: 'yeonam-col-3', left: '34%', top: '30%', rows: 10, cols: 1},
            {id: 'yeonam-col-4', left: '46%', top: '30%', rows: 10, cols: 1},
            {id: 'yeonam-col-5', left: '58%', top: '30%', rows: 10, cols: 1},
            {id: 'yeonam-col-6', left: '70%', top: '30%', rows: 10, cols: 1},
            {id: 'yeonam-col-7', left: '82%', top: '30%', rows: 10, cols: 1},
        ],
    },

    yulgok: {
        name: '율곡관',
        buildingRect: {left: '10%', top: '70%', width: '60%', height: '16%'},
        entranceRect: {left: '74%', top: '70%', width: '8%', height: '16%'},
        clusters: [
            {id: 'yulgok-col-1', left: '10%', top: '18%', rows: 10, cols: 1},
            {id: 'yulgok-col-2', left: '22%', top: '18%', rows: 10, cols: 1},
            {id: 'yulgok-col-3', left: '34%', top: '18%', rows: 10, cols: 1},
            {id: 'yulgok-col-4', left: '46%', top: '18%', rows: 10, cols: 1},
            {id: 'yulgok-col-5', left: '58%', top: '18%', rows: 10, cols: 1},
            {id: 'yulgok-col-6', left: '70%', top: '18%', rows: 10, cols: 1},
            {id: 'yulgok-col-7', left: '82%', top: '18%', rows: 10, cols: 1},
        ],
    },
}

export default function ParkingLotLayout({
                                             buildingId,
                                             slotsMap = {},
                                             favorites = [],
                                             onSlotClick,
                                         }) {
    const currentId = buildingId || 'paldal'
    const layout = PARKING_LAYOUTS[currentId] ?? PARKING_LAYOUTS.paldal
    const favoriteSet = new Set(favorites)
    let nextSlotId = 1
    const isVerticalSlot = currentId === 'paldal' || currentId === 'library'
    const cellWidth = isVerticalSlot ? SLOT_HEIGHT : SLOT_WIDTH
    const cellHeight = isVerticalSlot ? SLOT_WIDTH : SLOT_HEIGHT

    const [zoomPercent, setZoomPercent] = useState(60)
    // 스크롤바 중앙 정렬용
    const scrollRef = useRef(null)
    // 마운트 시 한 번, 스크롤을 가로/세로 중앙으로 이동
    useEffect(() => {
        const el = scrollRef.current
        if (!el) return

        el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
        el.scrollTop = (el.scrollHeight - el.clientHeight) / 2
    }, [])
    const renderCluster = (cluster) => {
        const cells = []

        for (let r = 0; r < cluster.rows; r += 1) {
            for (let c = 0; c < cluster.cols; c += 1) {
                const slotId = nextSlotId
                nextSlotId += 1

                const slot = slotsMap[slotId]
                const occupied = !!slot?.occupied
                const isFav = favoriteSet.has(slotId)

                let cls =
                    'bg-[#dcfce7] border-[#22c55e] text-[#166534]'
                if (occupied) {
                    cls = 'bg-[#fee2e2] border-[#ef4444] text-[#b91c1c]'
                }
                if (isFav) {
                    cls = 'bg-[#fef9c3] border-[#facc15] text-[#854d0e]'
                }

                cells.push(
                    <button
                        key={slotId}
                        type="button"
                        onClick={() => onSlotClick && onSlotClick(slotId)}
                        className={
                            'rounded-[4px] border flex items-center justify-center text-[10px] select-none transition ' +
                            cls
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
            minScale={0.6}
            maxScale={1.5}
            initialScale={0.6}
            // 마우스/터치 줌 막기
            wheel={{disabled: true}}
            pinch={{disabled: true}}
            doubleClick={{disabled: true}}
            panning={{disabled: false, velocityDisabled: true}}
            onTransformed={(ref) => {
                const scale = ref?.state?.scale ?? 1
                setZoomPercent(Math.round(scale * 100))
            }}
        >
            {(utils) => {
                const {zoomIn, zoomOut, resetTransform} = utils || {}

                return (
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-sm font-semibold text-slate-800">
                                {layout.name} 주차장 배치
                            </h2>

                            <div className="flex items-center gap-4 text-[11px] text-slate-600">
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <span
                                            className="inline-block w-5 h-3 rounded-[3px] bg-[#dcfce7] border border-[#22c55e]"/>
                                        주차 가능
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span
                                            className="inline-block w-5 h-3 rounded-[3px] bg-[#fee2e2] border border-[#ef4444]"/>
                                        점유 중
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <span
                                            className="inline-block w-5 h-3 rounded-[3px] bg-[#fef9c3] border border-[#facc15]"/>
                                        선호 자리
                                    </span>
                                </div>
                                <span className="ml-1 text-[14px] text-slate-500 w-10 text-right">
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

                        <div
                            ref={scrollRef}
                            className="relative w-full h-[600px] rounded-2xl border border-slate-300 bg-[#f9fafb] overflow-x-scroll overflow-y-scroll"
                            style={{
                                scrollbarGutter: 'stable both-edges',
                            }}
                        >
                            <TransformComponent>
                                <div className="relative w-[1600px] h-[900px] bg-white rounded-xl overflow-hidden">
                                    {/* 건물 (반투명) */}
                                    <div
                                        className="absolute flex items-center justify-center text-xs text-white bg-[#0f4c75]/50 rounded-md"
                                        style={{
                                            left: layout.buildingRect.left,
                                            top: layout.buildingRect.top,
                                            width: layout.buildingRect.width,
                                            height: layout.buildingRect.height,
                                        }}
                                    >
                                        건물
                                    </div>

                                    <div
                                        className="absolute flex items-center justify-center text-xs text-white bg-[#f97316]/60 rounded-md"
                                        style={{
                                            left: layout.entranceRect.left,
                                            top: layout.entranceRect.top,
                                            width: layout.entranceRect.width,
                                            height: layout.entranceRect.height,
                                        }}
                                    >
                                        입구
                                    </div>

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
