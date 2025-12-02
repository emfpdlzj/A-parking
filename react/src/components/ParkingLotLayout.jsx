import React, {useState, useEffect, useRef} from 'react'
import {TransformWrapper, TransformComponent} from 'react-zoom-pan-pinch'

const SLOT_WIDTH = 80
const SLOT_HEIGHT = 50

const PARKING_LAYOUTS = {
    paldal: {
        name: '팔달관',
        buildingRect: {left: '5%', top: '80%', width: '70%', height: '8%'},
        entranceRect: {left: '34%', top: '18%', width: '6.5%', height: '6%'},
        clusters: [
            {id: 'paldal-cctv', left: '6%', top: '18%', rows: 2, cols: 8,startId: 1},
            {id: 'paldal-top-right', left: '42%', top: '18%', rows: 2, cols: 8,startId: 17},
            {id: 'paldal-mid-left', left: '6%', top: '50%', rows: 2, cols: 8,startId: 33},
            {id: 'paldal-mid-center', left: '42%', top: '50%', rows: 2, cols:8, startId: 49},
            {id: 'paldal-mid-right', left: '72%', top: '50%', rows: 2, cols: 3, startId: 65 },
        ],
    },

    library: {
        name: '도서관',
        buildingRect: {left: '6%', top: '18%', width: '8%', height: '70%'},
        entranceRect: {left: '47%', top: '74%', width: '6.5%', height: '6%'},
        // 위쪽 왼쪽/오른쪽, 아래쪽 왼쪽/오른쪽 - 4개 블록
        clusters: [
            // 위 왼쪽
            {id: 'lib-top-left', left: '19%', top: '18%', rows: 2, cols: 8, startId:1},
            // 위 오른쪽
            {id: 'lib-top-right', left: '55%', top: '18%', rows: 2, cols: 8, startId:17},
            {id: 'lib-top-right2', left: '85%', top: '18%', rows: 2, cols: 3, startId:33},
            // 아래 왼쪽
            {id: 'lib-bottom-left', left: '19%', top: '52%', rows: 2, cols: 8,startId:39},
            // 아래 오른쪽
            {id: 'lib-bottom-right', left: '55%', top: '52%', rows: 2, cols: 8, startId:55  },
        ],
    },

    yulgok: {
        name: '율곡관',
        // 아래쪽 건물 바 두께 축소
        buildingRect: {left: '10%', top: '70%', width: '40%', height: '8%'},
        // 건물 오른쪽 끝 입구 박스 축소
        entranceRect: {left: '52%', top: '70%', width: '6.5%', height: '6%'},
        clusters: [
            {id: 'yulgok-col-1', left: '10%', top: '18%', rows: 8, cols: 1, startId:1},
            {id: 'yulgok-col-2', left: '21%', top: '18%', rows: 8, cols: 1, startId:9},
            {id: 'yulgok-col-3', left: '26.5%', top: '18%', rows: 8, cols: 1, startId:17},
            {id: 'yulgok-col-4', left: '37.5%', top: '18%', rows: 8, cols: 1, startId:25},
            {id: 'yulgok-col-5', left: '43%', top: '18%', rows: 8, cols: 1, startId:33},
            {id: 'yulgok-col-6', left: '62%', top: '18%', rows: 10, cols: 1, startId:41},
            {id: 'yulgok-col-7', left: '73%', top: '18%', rows: 10, cols:1 , startId:51},
            {id: 'yulgok-col-8', left: '78.5%', top: '18%', rows: 10, cols: 1, startId:61},
        ],
    },

    yeonam: {
        name: '연암관',
        // 위쪽 얇은 건물 바
        buildingRect: {left: '10%', top: '12%', width: '50%', height: '8%'},
        // 오른쪽 아래 입구 박스 축소
        entranceRect: {left: '76.3%', top: '71.4%', width: '6.5%', height: '6%'},
        clusters: [
            {id: 'yeonam-col-1', left: '10%', top: '30%', rows: 8, cols: 1, startId:1},
            {id: 'yeonam-col-2', left: '21%', top: '30%', rows: 8, cols: 1, startId:9},
            {id: 'yeonam-col-3', left: '26.5%', top: '30%', rows: 8, cols: 1, startId:17},
            {id: 'yeonam-col-4', left: '37.5%', top: '30%', rows: 8, cols: 1, startId:25},
            {id: 'yeonam-col-5', left: '43%', top: '30%', rows: 8, cols: 1, startId:33},
            {id: 'yeonam-col-6', left: '54%', top: '30%', rows: 8, cols: 1, startId:41},
            {id: 'yeonam-col-7', left: '59.5%', top: '30%', rows: 8   , cols: 1, startId:49},
            {id: 'yeonam-col-8', left: '70.5%', top: '30%', rows: 8   , cols: 1, startId:57},
            {id: 'yeonam-col-9', left: '76%', top: '30%', rows: 6   , cols: 1, startId:65},
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
    const isVerticalSlot = currentId === 'paldal' || currentId === 'library'
    const cellWidth = isVerticalSlot ? SLOT_HEIGHT : SLOT_WIDTH
    const cellHeight = isVerticalSlot ? SLOT_WIDTH : SLOT_HEIGHT

    const [zoomPercent, setZoomPercent] = useState(70)
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

        let currentSlotNumber = cluster.startId || 1;
        for (let r = 0; r < cluster.rows; r += 1) {
            for (let c = 0; c < cluster.cols; c += 1) {
                const slotId = currentSlotNumber
                currentSlotNumber += 1

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
                            'rounded-[4px] border flex items-center justify-center text-[14px] select-none transition ' +
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
            minScale={0.5}
            maxScale={1.5}
            initialScale={0.7}
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
                            className="relative w-full h-[600px] rounded-2xl border border-slate-300 bg-[#E4E9FD] bg-[#f9fafb] overflow-x-scroll overflow-y-scroll"
                            style={{
                                scrollbarGutter: 'stable both-edges',
                            }}
                        >
                            <TransformComponent>
                                <div className="relative w-[1600px] h-[900px] bg-white rounded-xl overflow-hidden">
                                    {/* 건물 (반투명) */}
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
